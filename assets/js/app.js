const filePath = "assets/json/products.json";
const productsContainer = document.querySelector('.products-container');
const cartContainer = document.querySelector('.cart-container');
const modal = document.querySelector('.modal');

const SECTION_ORDER = ['Starters', 'Main Courses', 'Desserts', 'Drinks'];

let products = [];
let cart = JSON.parse(localStorage.getItem('lezzet-cart')) || [];
let favorites = JSON.parse(localStorage.getItem('lezzet-favorites')) || [];
let activeSection = 'All';
let searchQuery = '';

// --- localStorage ---

function saveCart() {
  localStorage.setItem('lezzet-cart', JSON.stringify(cart));
}

function saveFavorites() {
  localStorage.setItem('lezzet-favorites', JSON.stringify(favorites));
}



async function getProducts() {
  try {
    const response = await fetch(filePath);
    if (!response.ok) throw new Error("Failed to load data.");
    products = await response.json();
    renderSectionTabs();
    renderProducts();
    renderCart();
  } catch (error) {
    console.log(error);
  }
}



function getFilteredProducts() {
  return products.filter(p => {
    const matchesSection =
      activeSection === 'All' ||
      (activeSection === 'Favorites' && favorites.includes(p.id)) ||
      p.section === activeSection;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.section.toLowerCase().includes(q);
    return matchesSection && matchesSearch;
  });
}



function renderSectionTabs() {
  const tabsContainer = document.querySelector('.section-tabs');
  const tabs = ['All', 'Favorites', ...SECTION_ORDER];

  tabsContainer.innerHTML = tabs.map(section => `
    <button class="tab-btn ${section === activeSection ? 'active' : ''}" data-section="${section}">
      ${section}
      ${section === 'Favorites' && favorites.length > 0 ? `<span class="fav-count">${favorites.length}</span>` : ''}
    </button>
  `).join('');

  tabsContainer.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeSection = btn.dataset.section;
      renderSectionTabs();
      renderProducts();
    });
  });
}



function renderProducts() {
  const filtered = getFilteredProducts();
  productsContainer.innerHTML = '';

  if (filtered.length === 0) {
    productsContainer.innerHTML = '<p class="no-results">No products found.</p>';
    return;
  }

  filtered.forEach((product, index) => {
    const isInCart = cart.find(c => c.id === product.id);
    const isFavorite = favorites.includes(product.id);

    const div = document.createElement('div');
    div.className = 'product fade-in';
    div.style.animationDelay = `${index * 0.06}s`;

    div.innerHTML = `
      <div class="image-container">
        <img class="product-image" src="${product.image}" alt="${product.name}">
        <button class="favorite-btn ${isFavorite ? 'active' : ''}" data-id="${product.id}" title="Add to favorites">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </button>
        ${isInCart
          ? `<div class="added-cart-btn-container">
               <button class="minus-btn" data-id="${product.id}">
                 <img src="assets/images/icons/minus-icon.svg" />
               </button>
               <span>${isInCart.quantity}</span>
               <button class="plus-btn" data-id="${product.id}">
                 <img src="assets/images/icons/plus-icon.svg" />
               </button>
             </div>`
          : `<button class="add-to-cart-btn" data-id="${product.id}">
               <img src="assets/images/icons/add-to-cart.svg" alt="">Add to Cart
             </button>`
        }
      </div>
      <div class="name-container">
        <span class="category">${product.category}</span>
        <h3 class="name">${product.name}</h3>
        <p class="price">₺${product.price.toFixed(2)}</p>
      </div>
    `;

    productsContainer.appendChild(div);
  });

  document.querySelectorAll('.add-to-cart-btn').forEach(btn => btn.addEventListener('click', addToCart));
  document.querySelectorAll('.minus-btn').forEach(btn => btn.addEventListener('click', removeFromCart));
  document.querySelectorAll('.plus-btn').forEach(btn => btn.addEventListener('click', addToCart));
  document.querySelectorAll('.favorite-btn').forEach(btn => btn.addEventListener('click', toggleFavorite));
}



function toggleFavorite() {
  const id = parseInt(this.dataset.id);
  const index = favorites.indexOf(id);
  if (index === -1) {
    favorites.push(id);
  } else {
    favorites.splice(index, 1);
  }
  saveFavorites();
  this.classList.toggle('active');
  renderSectionTabs();
}



function addToCart() {
  const product = products.find(p => p.id == this.dataset.id);
  const existing = cart.find(c => c.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  saveCart();
  renderCart();
  renderProducts();
}

function removeFromCart() {
  const index = cart.findIndex(p => p.id == this.dataset.id);
  if (cart[index].quantity > 1) {
    cart[index].quantity -= 1;
  } else {
    cart.splice(index, 1);
  }
  saveCart();
  renderProducts();
  renderCart();
}

function deleteFromCart() {
  const index = cart.findIndex(p => p.id == this.dataset.id);
  cart.splice(index, 1);
  saveCart();
  renderCart();
  renderProducts();
}



function renderCart() {
  let totalQty = 0;
  let totalPrice = 0;
  cart.forEach(p => {
    totalQty += p.quantity;
    totalPrice += p.quantity * p.price;
  });

  if (cart.length > 0) {
    cartContainer.innerHTML = `
      <h1 class="heading cart-heading">Your Cart (${totalQty})</h1>
      <ul>
        ${cart.map(product => `
          <li>
            <div class="product">
              <h3>${product.name}</h3>
              <div>
                <span class="product-quantity">${product.quantity}x</span>
                <span class="product-price">@₺${product.price.toFixed(2)}</span>
                <span class="total-price">₺${(product.price * product.quantity).toFixed(2)}</span>
              </div>
            </div>
            <button class="delete-btn" data-id="${product.id}">
              <img src="assets/images/icons/delete-btn-icon.svg" alt="">
            </button>
          </li>
        `).join('')}
      </ul>
      <div class="order-total">
        <p class="order-total-text">Order Total</p>
        <p class="order-total-price">₺${totalPrice.toFixed(2)}</p>
      </div>
      <div class="info-container">
        <img src="assets/images/icons/carbon_tree.svg" alt="">
        <p>This is a <span class="highlighted-text">carbon-neutral</span> delivery</p>
      </div>
      <div class="confirm-btn-container">
        <button class="confirm-btn">Confirm Order</button>
      </div>
    `;
  } else {
    cartContainer.innerHTML = `
      <h1 class="heading cart-heading">Your Cart (0)</h1>
      <div class="empty-cart-container">
        <img src="assets/images/icons/empty-cart-icon.svg" alt="">
        <p>Your added items will appear here</p>
      </div>
    `;
  }

  document.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', deleteFromCart));
  const confirmBtn = document.querySelector('.confirm-btn');
  if (confirmBtn) confirmBtn.addEventListener('click', openConfirmModal);
}

// --- Confirm modal ---

function openConfirmModal() {
  let totalPrice = 0;
  cart.forEach(p => { totalPrice += p.quantity * p.price; });

  const productList = document.querySelector('.product-list');
  productList.innerHTML = `
    <ul>
      ${cart.map(c => `
        <li>
          <div class="product">
            <img src="${c.image}" alt="${c.name}">
            <div class="product-content">
              <h4 class="product-name">${c.name}</h4>
              <div>
                <span class="quantity">${c.quantity}x</span>
                <span class="price">@₺${c.price.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <span class="total-price">₺${(c.quantity * c.price).toFixed(2)}</span>
        </li>
      `).join('')}
    </ul>
    <div class="order-total">
      <p class="order-total-text">Order Total</p>
      <p class="order-total-price">₺${totalPrice.toFixed(2)}</p>
    </div>
  `;

  modal.showModal();
  document.querySelector('.start-order-btn').addEventListener('click', () => {
    modal.close();
    cart = [];
    saveCart();
    renderCart();
    renderProducts();
  });
}

// --- Dark mode ---

const themeToggle = document.querySelector('.theme-toggle');
const savedTheme = localStorage.getItem('lezzet-theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('lezzet-theme', next);
});

// --- Arama ---

const searchInput = document.querySelector('.search-input');
searchInput.addEventListener('input', e => {
  searchQuery = e.target.value;
  renderProducts();
});

// --- Init ---

getProducts();
