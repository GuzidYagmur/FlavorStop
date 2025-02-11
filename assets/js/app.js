const filePath = "assets/json/products.json";
const productsContainer = document.querySelector('.products-container');
const cartContainer = document.querySelector('.cart-container');
const modal = document.querySelector('.modal');

let products = [];
let cart = [];

async function getProducts(){
  try{
    const response = await fetch(filePath);
    if(!response.ok){
      throw new Error("Veri alınamadı.");
    }
    const data = await response.json();
    products = data;
    renderProducts();
  }
  catch(error){
    console.log(error);
  }
}


function renderProducts(){
  productsContainer.innerHTML = "";
  products.forEach(product => {
    const isProductExistInCart = cart.find(c => c.id == product.id);
    console.log(isProductExistInCart);
    productsContainer.innerHTML += `
      <div class="product">
        <div class="image-container">
          <img class="product-image" src="${product.image}" alt="">
          ${
            isProductExistInCart ? 
              `
                <div class="added-cart-btn-container">
                  <button class="minus-btn" data-id="${product.id}">
                    <img src="assets/images/icons/minus-icon.svg" />
                  </button>
                  <span>${isProductExistInCart.quantity}</span>
                  <button class="plus-btn" data-id="${product.id}">
                    <img src="assets/images/icons/plus-icon.svg" />
                  </button>
                </div>
              `
             : 
              `
              <button class="add-to-cart-btn" data-id="${product.id}"><img src="assets/images/icons/add-to-cart.svg" alt="">Add to Cart</button>
              `
          }
        </div>
        <div class="name-container">
          <span class="category">${product.category}</span>
          <h3 class="name">${product.name}</h3>
          <p class="price">$${product.price.toFixed(2)}</p>
        </div>
      </div>
    `
  });

  const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');
  addToCartBtns.forEach(btn => btn.addEventListener('click',addToCart));
  const minusBtns = document.querySelectorAll('.minus-btn');
  const plusBtns = document.querySelectorAll('.plus-btn');
  minusBtns.forEach(btn => btn.addEventListener('click',removeFromCart));
  plusBtns.forEach(btn => btn.addEventListener('click',addToCart));
}

function removeFromCart(){
  const productIndex = cart.findIndex(p => p.id == this.dataset.id);
  if(cart[productIndex].quantity > 1){
    cart[productIndex].quantity -= 1;
  }else{
    cart.splice(productIndex, 1);
  }
  renderProducts();
  renderCart();
}

function addToCart(){
  const product = products.find(p => p.id == this.dataset.id);
  const isProductExistInCart = cart.find(c => c.id == product.id); 
  // const isProductExistInCart = cart.findIndex(c => c.id == this.dataset.id);
  if(isProductExistInCart){
    isProductExistInCart.quantity += 1;
  }else{
    // Yöntem 1
    // product.quantity = 1;
    // cart.push(product);

    //Yöntem 2
    cart.push({...product, quantity: 1}); // Spread Operatörü
  }

  renderCart();
  renderProducts();
}


function renderCart(){
  let totalCartQuantity = 0;
  let orderTotalPrice = 0;

  cart.forEach(p => {
    totalCartQuantity += p.quantity;
    orderTotalPrice += p.quantity * p.price;
  })

  if(cart.length > 0){
    cartContainer.innerHTML = `
      <h1 class="heading cart-heading">Your Cart(${totalCartQuantity})</h1>
      <ul>
        ${
          cart.map(product => {
            return`
            <li>
              <div class="product">
                <h3>${product.name}</h3>
                <div>
                  <span class="product-quantity">${product.quantity}x</span>
                  <span class="product-price">@$${product.price.toFixed(2)}</span>
                  <span class="total-price">$${(product.price * product.quantity).toFixed(2)}</span>
                </div>
              </div>
              <button class="delete-btn" data-id="${product.id}">
                <img src="assets/images/icons/delete-btn-icon.svg" alt="">
              </button>
            </li>
            `
          }).join('')
        }
      </ul>
      <div class="order-total">
        <p class="order-total-text">Order Total</p>
        <p class="order-total-price">$${orderTotalPrice.toFixed(2)}</p>
      </div>
      <div class="info-container">
        <img src="assets/images/icons/carbon_tree.svg" alt="">
        <p>This is a <span class="highlighted-text">carbon-neutral</span> delivery</p>
      </div>
      <div class="confirm-btn-container">
        <button class="confirm-btn">Confirm Order</button>
      </div>
    `;
  } else{
    cartContainer.innerHTML = `
      <h1 class="heading cart-heading">Your Cart(0)</h1>
      <div class="empty-cart-container">
        <img src="assets/images/icons/empty-cart-icon.svg" alt="">
        <p>Your added items will appear here</p>
      </div>
    `
  }

  const deleteBtns = document.querySelectorAll('.delete-btn');
  deleteBtns.forEach(btn => btn.addEventListener('click',deleteFromCart))

  const confirmBtn = document.querySelector('.confirm-btn');

  if(confirmBtn){
    confirmBtn.addEventListener('click',openConfirmModal);
  }
}


function openConfirmModal(){
  let orderTotalPrice = 0;

  cart.forEach(p => {
    orderTotalPrice += p.quantity * p.price;
  })
  const productList = document.querySelector('.product-list');
  productList.innerHTML = `
    <ul>
      ${
        cart.map(c => {
          return`
            <li>
              <div class="product">
                <img src="${c.image}" alt="">
                <div class="product-content">
                  <h4 class="product-name">${c.name}</h4>
                  <div>
                    <span class="quantity">${c.quantity}x</span>
                    <span class="price">@$${c.price.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <span class="total-price">$${(c.quantity * c.price).toFixed(2)}</span>
            </li>
          `
        }).join('')
      }
    </ul>
    <div class="order-total">
      <p class="order-total-text">Order Total</p>
      <p class="order-total-price">$${orderTotalPrice.toFixed(2)}</p>
    </div>

  `
  modal.showModal();
  const newOrderBtn = document.querySelector('.start-order-btn');
  newOrderBtn.addEventListener('click',() => {
    modal.close();
    cart = [];
    renderCart();
    renderProducts();
  })
}

function deleteFromCart(){
  const productIndex = cart.findIndex(p => p.id == this.dataset.id);
  cart.splice(productIndex,1)
  renderCart();
  renderProducts();
}






getProducts();