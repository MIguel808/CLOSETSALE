const users = [
  { username: "admin", password: "admin123", role: "admin" },
  { username: "usuario", password: "1234", role: "user" }
];

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

  document.getElementById("login-container").classList.add("hidden");

  if (found.role === "admin") {
    document.getElementById("admin-container").classList.remove("hidden");
    renderAdminProducts();
  } else {
    document.getElementById("shop-container").classList.remove("hidden");
    renderUserProducts();
  }
}

function logout() {
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

  products.forEach((p, index) => {
    const div = document.createElement("div");
    div.className = "product";
    const isNew = Date.now() - (p.addedAt || 0) < 30000;
    div.innerHTML = `
    <div class="image-wrapper">
      ${isNew ? '<span class="new-label">¡Nuevo!</span>' : ''}
      <img src="${p.image}" alt="${p.name}" onclick="showImageModal('${p.image}')">
    </div>
      <h4>${p.name}</h4>
      <p>${p.desc}</p>
      <p><strong>Precio:</strong> $${p.price}</p>
      <p><strong>Estado:</strong> ${p.sold ? "Agotado" : "Disponible"}</p>`;

    if (!p.sold) {
      const btn = document.createElement("button");
      btn.textContent = "Comprar";
      // Cambiar la acción del botón para redirigir a WhatsApp
      btn.onclick = () => redirigirWhatsApp(p.name, p.price);
      div.appendChild(btn);
    }

    container.appendChild(div);
  });
}
function showImageModal(imageSrc) {
  const modal = document.getElementById("product-modal");
  const modalImage = document.getElementById("modal-img");

  // Mostrar el modal con la imagen ampliada
  modal.style.display = "flex";
  modalImage.src = imageSrc;
}

function redirigirWhatsApp(nombreProducto, precioProducto) {
  // Crear el mensaje de WhatsApp
  const mensaje = `¡Hola! Estoy interesado en comprar el producto: ${nombreProducto}. Precio: ${precioProducto}.`;

  // URL para redirigir a WhatsApp con el mensaje
  const url = `https://wa.me/960850034?text=${encodeURIComponent(mensaje)}`; // Reemplaza 1234567890 con el número de WhatsApp

  // Redirigir al enlace de WhatsApp
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
  renderUserProducts(); // actualiza también la vista de usuarios
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
        filterProducts(); // Refresca la búsqueda actual
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
