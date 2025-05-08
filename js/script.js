let users = JSON.parse(localStorage.getItem("users")) || [
  { username: "admin", password: "admin123", role: "admin" },
  { username: "usuario", password: "1234", role: "user" }
];

function saveUsers() {
  localStorage.setItem("users", JSON.stringify(users));
}


let products = JSON.parse(localStorage.getItem("products")) || [];

function saveProducts() {
  localStorage.setItem("products", JSON.stringify(products));
}

function login() {
  const user = document.getElementById("username").value;
  const pass = document.getElementById("password").value;
  const found = users.find(u => u.username === user && u.password === pass);

  if (!found) {
    document.getElementById("login-error").textContent = "Usuario o contraseña incorrectos.";
    return;
  }

  localStorage.setItem("loggedUser", JSON.stringify(found)); // <-- aquí

  document.getElementById("login-container").classList.add("hidden");

  if (found.role === "admin") {
    document.getElementById("admin-container").classList.remove("hidden");
    renderAdminProducts();
  } else {
    document.getElementById("shop-container").classList.remove("hidden");
    renderUserProducts();
    mostrarNombreUsuario(); // <-- muestra el nombre
  }
}

function getLoggedUser() {
  return JSON.parse(localStorage.getItem("currentUser"));
}

function logout() {
  localStorage.removeItem("loggedUser"); // Limpia el usuario guardado
  document.getElementById("login-container").classList.remove("hidden");
  document.getElementById("admin-container").classList.add("hidden");
  document.getElementById("shop-container").classList.add("hidden");
}

function addProduct() {
  const name = document.getElementById("new-product-name").value;
  const desc = document.getElementById("new-product-desc").value;
  const price = parseFloat(document.getElementById("new-product-price").value);
  const imageInput = document.getElementById("new-product-img");

  if (!name || !desc || !price || !imageInput.files[0]) {
    alert("Por favor, completa todos los campos.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const product = {
      name,
      desc,
      price,
      image: e.target.result,
      sold: false,
      addedAt: Date.now()
    };

    products.push(product);
    saveProducts();
    renderAdminProducts();

    document.getElementById("new-product-name").value = "";
    document.getElementById("new-product-desc").value = "";
    document.getElementById("new-product-price").value = "";
    document.getElementById("new-product-img").value = "";
  };

  reader.readAsDataURL(imageInput.files[0]);
}

function renderUserProducts() {
  const container = document.getElementById("product-list");
  container.innerHTML = "";

  const row = document.createElement("div");
  row.className = "row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4";

  products.forEach((p, index) => {
    const col = document.createElement("div");
    col.className = "col";

    const isNew = Date.now() - (p.addedAt || 0) < 30000;

    const card = document.createElement("div");
    card.className = "card shadow-sm h-100 animate__animated animate__fadeIn";

    card.innerHTML = `
      <div class="position-relative">
        ${isNew ? '<span class="badge bg-danger position-absolute top-0 start-0 m-2 animate__animated animate__bounceIn">¡Nuevo!</span>' : ''}
        <img src="${p.image}" class="card-img-top user-product-img" alt="${p.name}" onclick="showImageModal('${p.image}')">

      </div>
      <div class="card-body d-flex flex-column">
        <h5 class="card-title text-primary">${p.name}</h5>
        <p class="card-text">${p.desc}</p>
        <p><strong>Precio:</strong> $${p.price}</p>
        <p><strong>Estado:</strong> ${p.sold ? "Agotado" : "Disponible"}</p>
      </div>
    `;

    if (!p.sold) {
      const btn = document.createElement("button");
      btn.className = "btn btn-danger mt-auto fw-bold animate__animated animate__pulse";
      btn.textContent = "🛒 Comprar";
      btn.onclick = () => redirigirWhatsApp(p.name, p.price);
      card.querySelector(".card-body").appendChild(btn);
    }

    col.appendChild(card);
    row.appendChild(col);
  });

  container.appendChild(row);
}


// Función para mostrar el modal con la imagen ampliada
function showImageModal(imageSrc) {
  const modal = document.getElementById("product-modal");
  const modalImage = document.getElementById("modal-img");

  // Mostrar el modal con la imagen ampliada
  modal.style.display = "block";
  modalImage.src = imageSrc;
}

// Función para cerrar el modal
function closeImageModal() {
  const modal = document.getElementById("product-modal");
  modal.style.display = "none";
}


function redirigirWhatsApp(nombreProducto, precioProducto) {
  const usuario = JSON.parse(localStorage.getItem("loggedUser"));
  const nombreUsuario = usuario ? usuario.username : "Invitado";
  const mensaje = `¡Hola! Soy ${nombreUsuario} y estoy interesado en comprar el producto: ${nombreProducto}. Precio: ${precioProducto}.`;
  const url = `https://wa.me/960850034?text=${encodeURIComponent(mensaje)}`;
  window.open(url, '_blank');
}


function renderAdminProducts() {
  const container = document.getElementById("admin-product-list");
  container.innerHTML = "";

  products.forEach((p, index) => {
    const div = document.createElement("div");
    div.className = "admin-product";

    div.innerHTML = `
      <img src="${p.image}" alt="${p.name}">
      <div class="product-details">
        <input type="text" class="form-control mb-1 editable" value="${p.name}" disabled id="name-${index}">
        <textarea class="form-control mb-1 editable" disabled id="desc-${index}">${p.desc}</textarea>
        <input type="number" class="form-control mb-1 editable" value="${p.price}" disabled id="price-${index}">
        <p>Estado: ${p.sold ? "Agotado" : "En stock"}</p>
        <div class="admin-buttons">
          <button class="toggle-stock-btn" onclick="toggleStock(${index})">${p.sold ? "Marcar en stock" : "Marcar como agotado"}</button>
          <button class="edit-btn" onclick="enableEdit(${index})">Editar</button>
          <button class="save-btn" onclick="saveEdit(${index})">Guardar</button>
          <button class="delete-btn" onclick="deleteProduct(${index})">Eliminar</button>
        </div>
      </div>
    `;

    container.appendChild(div);
  });
}

function enableEdit(index) {
  document.getElementById(`name-${index}`).disabled = false;
  document.getElementById(`desc-${index}`).disabled = false;
  document.getElementById(`price-${index}`).disabled = false;
}

function saveEdit(index) {
  const newName = document.getElementById(`name-${index}`).value;
  const newDesc = document.getElementById(`desc-${index}`).value;
  const newPrice = parseFloat(document.getElementById(`price-${index}`).value);

  if (!newName || !newDesc || isNaN(newPrice)) {
    alert("Por favor completa todos los campos correctamente.");
    return;
  }

  products[index].name = newName;
  products[index].desc = newDesc;
  products[index].price = newPrice;

  saveProducts();
  renderAdminProducts();
  renderUserProducts();
}

function editField(index, field, value) {
  if (field === "price") value = parseFloat(value.replace('$', '')) || 0;
  products[index][field] = value;
  saveProducts();
}

function toggleStock(index) {
  products[index].sold = !products[index].sold;
  saveProducts();
  renderAdminProducts();
}

function deleteProduct(index) {
  if (confirm("¿Estás seguro de eliminar este producto?")) {
    products.splice(index, 1);
    saveProducts();
    renderAdminProducts();
  }
}

function filterProducts() {
  const keyword = document.getElementById("search-keyword").value.toLowerCase();
  const maxPrice = parseFloat(document.getElementById("search-price").value);
  const container = document.getElementById("product-list");
  container.innerHTML = "";

  const filtered = products.filter(p => {
    const matchesKeyword = p.name.toLowerCase().includes(keyword) || p.desc.toLowerCase().includes(keyword);
    const matchesPrice = isNaN(maxPrice) || p.price <= maxPrice;
    return matchesKeyword && matchesPrice;
  });

  if (filtered.length === 0) {
    container.innerHTML = "<p class='text-center'>No se encontraron productos.</p>";
    return;
  }

  filtered.forEach((p, index) => {
    const div = document.createElement("div");
    div.className = "product";
    div.innerHTML = `
      <img src="${p.image}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p>${p.desc}</p>
      <p>Precio: $${p.price}</p>
      <p>${p.sold ? "Agotado" : "Disponible"}</p>
    `;

    if (!p.sold) {
      const btn = document.createElement("button");
      btn.textContent = "Comprar";
      btn.onclick = () => {
        products[index].sold = true;
        saveProducts();
        filterProducts();
      };
      div.appendChild(btn);
    }

    container.appendChild(div);
  });
}

function refreshUserProducts() {
  products = JSON.parse(localStorage.getItem("products")) || [];
  renderUserProducts();
}
function register() {
  const newUser = document.getElementById("register-username").value;
  const newPass = document.getElementById("register-password").value;

  if (!newUser || !newPass) {
    document.getElementById("register-error").textContent = "Completa todos los campos.";
    return;
  }

  const existingUsers = JSON.parse(localStorage.getItem("users")) || [];

  if (existingUsers.find(u => u.username === newUser)) {
    document.getElementById("register-error").textContent = "El usuario ya existe.";
    return;
  }

  const userObj = { username: newUser, password: newPass, role: "user" };
  existingUsers.push(userObj);
  localStorage.setItem("users", JSON.stringify(existingUsers));

  // Logueo automático
  localStorage.setItem("loggedUser", JSON.stringify(userObj));

  // Mostrar la vista de productos directamente
  document.getElementById("register-form").classList.add("hidden");
  document.getElementById("shop-container").classList.remove("hidden");

  renderUserProducts();
  mostrarNombreUsuario();
}

function registerUser() {
  const user = document.getElementById("register-username").value;
  const pass = document.getElementById("register-password").value;

  if (!user || !pass) {
    document.getElementById("register-error").textContent = "Por favor completa todos los campos.";
    return;
  }

  const exists = users.find(u => u.username === user);
  if (exists) {
    document.getElementById("register-error").textContent = "El nombre de usuario ya existe.";
    return;
  }

  users.push({ username: user, password: pass, role: "user" });
  saveUsers(); // <--- guarda en localStorage

  document.getElementById("register-error").textContent = "Usuario registrado correctamente. Ahora puedes iniciar sesión.";

  setTimeout(() => {
    mostrarLogin();
    document.getElementById("login-error").textContent = "Registro exitoso. Inicia sesión.";
  }, 2000);
}


function mostrarRegistro() {
  document.getElementById("login-form").classList.add("hidden");
  document.getElementById("register-form").classList.remove("hidden");
}

function mostrarLogin() {
  document.getElementById("register-form").classList.add("hidden");
  document.getElementById("login-form").classList.remove("hidden");
  document.getElementById("register-error").textContent = "";
  document.getElementById("login-error").textContent = "";
}

function mostrarNombreUsuario() {
  const usuario = JSON.parse(localStorage.getItem("loggedUser"));
  if (usuario && usuario.role === "user") {
    const nombreDiv = document.getElementById("nombre-usuario");
    if (nombreDiv) {
      nombreDiv.innerHTML = `<p><strong>Bienvenido, ${usuario.username} 👋</strong></p>`;
    }
  }
}


window.onload = function () {
  const usuario = JSON.parse(localStorage.getItem("loggedUser"));

  if (usuario) {
    document.getElementById("login-container").classList.add("hidden");

    if (usuario.role === "admin") {
      document.getElementById("admin-container").classList.remove("hidden");
      renderAdminProducts();
    } else {
      document.getElementById("shop-container").classList.remove("hidden");
      renderUserProducts();
      mostrarNombreUsuario(); // mostrar nombre si es user
    }
  }
};
let lastCheckTimestamp = Date.now();

// Mostrar alerta de nuevo producto
function showNewProductAlert() {
  const alert = document.getElementById("new-product-alert");
  alert.style.display = "block";
  alert.classList.add("show");

  setTimeout(() => {
    closeNewProductAlert();
  }, 5000); // Desaparece en 5 segundos
}


// Cerrar la alerta
function closeNewProductAlert() {
  const alert = document.getElementById("new-product-alert");
  alert.style.display = "none";
  alert.classList.remove("show");
}

// Verifica nuevos productos cada 5 segundos
setInterval(() => {
  const shopVisible = !document.getElementById("shop-container").classList.contains("hidden");

  if (!shopVisible) return;

  const productosActuales = JSON.parse(localStorage.getItem("products")) || [];
  const hayNuevo = productosActuales.some(p => (p.addedAt || 0) > lastCheckTimestamp);

  if (hayNuevo) {
    showNewProductAlert();
    lastCheckTimestamp = Date.now();
    refreshUserProducts(); // refresca los productos automáticamente
  }
}, 5000); // cada 5 segundos
function mostrarSoloNuevos() {
  const container = document.getElementById("product-list");
  container.innerHTML = "";

  const ahora = Date.now();
  const nuevos = products.filter(p => ahora - (p.addedAt || 0) < 30000); // últimos 30 segundos

  if (nuevos.length === 0) {
    container.innerHTML = "<p class='text-center'>No hay productos nuevos en este momento.</p>";
    return;
  }

  nuevos.forEach((p, index) => {
    const div = document.createElement("div");
    div.className = "product animate__animated animate__fadeIn";
    div.innerHTML = `
      <div class="image-wrapper">
        <span class="new-label">¡Nuevo!</span>
        <img src="${p.image}" alt="${p.name}" onclick="showImageModal('${p.image}')">
      </div>
      <h4>${p.name}</h4>
      <p>${p.desc}</p>
      <p><strong>Precio:</strong> $${p.price}</p>
      <p><strong>Estado:</strong> ${p.sold ? "Agotado" : "Disponible"}</p>
    `;

    if (!p.sold) {
      const btn = document.createElement("button");
      btn.textContent = "Comprar";
      btn.onclick = () => redirigirWhatsApp(p.name, p.price);
      div.appendChild(btn);
    }

    container.appendChild(div);
  });

  closeNewProductAlert(); // Cierra la alerta luego de ver los productos nuevos
}
