const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const contactForm = document.getElementById('contact-form');
const responseMessage = document.querySelector('.form-response');
const addButtons = document.querySelectorAll('.add-item');
const cartItemsContainer = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const subtotalElement = document.getElementById('cart-subtotal');
const taxElement = document.getElementById('cart-tax');
const totalElement = document.getElementById('cart-total');
const generateBillButton = document.getElementById('generate-bill');
const downloadBillButton = document.getElementById('download-bill');
const billPanel = document.getElementById('bill-panel');
const billDetails = document.getElementById('bill-details');
const billingPhoneInput = document.getElementById('billing-phone');
const paymentSmsMessage = document.getElementById('payment-sms-message');
const payNowButton = document.getElementById('pay-now');
const clearCartButton = document.getElementById('clear-cart');
const printBillButton = document.getElementById('print-bill');
const paymentPanel = document.getElementById('payment-panel');

const CART_KEY = 'aurumCart';

let cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];
let billingPhoneNumber = '';
let lastBillText = '';

const formatPrice = (value) => `₹${value.toFixed(2)}`;

const computeTotals = () => {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.1;
  return { subtotal, tax, total: subtotal + tax };
};

const saveState = () => {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
};

const renderCart = () => {
  cartItemsContainer.innerHTML = '';
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = `${itemCount} item${itemCount === 1 ? '' : 's'}`;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p class="empty-cart">Your cart is empty. Add a dish to begin.</p>';
  } else {
    cart.forEach((item) => {
      const cartItem = document.createElement('div');
      cartItem.className = 'cart-item';
      cartItem.innerHTML = `
        <div class="cart-item-details">
          <h4>${item.name}</h4>
          <span>${item.quantity} x ${formatPrice(item.price)}</span>
          <span>Total ${formatPrice(item.price * item.quantity)}</span>
        </div>
        <div class="cart-item-controls">
          <button type="button" data-action="decrease" data-id="${item.id}">-</button>
          <button type="button" data-action="increase" data-id="${item.id}">+</button>
          <button type="button" data-action="remove" data-id="${item.id}">Remove</button>
        </div>
      `;
      cartItemsContainer.appendChild(cartItem);
    });
  }

  const totals = computeTotals();
  subtotalElement.textContent = formatPrice(totals.subtotal);
  taxElement.textContent = formatPrice(totals.tax);
  totalElement.textContent = formatPrice(totals.total);
  saveState();
};

const findItem = (id) => cart.find((item) => item.id === Number(id));

const addItem = (data) => {
  const existing = findItem(data.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...data, quantity: 1 });
  }
  renderCart();
};

const removeItem = (id) => {
  cart = cart.filter((item) => item.id !== Number(id));
  renderCart();
};

const updateQuantity = (id, amount) => {
  const item = findItem(id);
  if (!item) return;
  item.quantity += amount;
  if (item.quantity < 1) {
    removeItem(id);
  } else {
    renderCart();
  }
};

const clearCart = () => {
  cart = [];
  paymentPanel.classList.add('hidden');
  renderCart();
};

const payNow = () => {
  const totals = computeTotals();
  if (totals.total <= 0) {
    alert('Add items to your cart before paying.');
    return;
  }
  const phone = billingPhoneInput?.value.trim();
  if (!phone) {
    alert('Please enter your phone number so we can send your bill.');
    billingPhoneInput?.focus();
    return;
  }
  billingPhoneNumber = phone;
  lastBillText = buildBillText(); // Save bill before clearing cart
  billDetails.textContent = lastBillText;
  billPanel.classList.remove('hidden');
  paymentPanel.classList.remove('hidden');
  paymentSmsMessage.textContent = `Bill sent successfully to ${billingPhoneNumber}.`;
  alert(`Payment processed. Bill sent successfully to ${billingPhoneNumber}.`);
  clearCart(); // Clear after generating bill
};

const buildBillText = () => {
  const totals = computeTotals();
  const now = new Date();
  const date = now.toLocaleDateString();
  const time = now.toLocaleTimeString();
  const day = now.toLocaleDateString(undefined, { weekday: 'long' });
  const billTo = billingPhoneNumber || 'Valued Customer';
  let billText = `Grand Aurum Hotel & Restaurant\nBill To: ${billTo}\nDate: ${date}\nDay: ${day}\nTime: ${time}\nPayment Method: QR Code\n\nItems:\n`;
  cart.forEach((item) => {
    billText += `${item.quantity} x ${item.name} @ ${formatPrice(item.price)} = ${formatPrice(item.price * item.quantity)}\n`;
  });
  billText += `\nSubtotal: ${formatPrice(totals.subtotal)}\nTax (10%): ${formatPrice(totals.tax)}\nTotal: ${formatPrice(totals.total)}\n\nThank you for your order!`;
  return billText;
};

const generateBill = () => {
  if (cart.length === 0 && !lastBillText) {
    alert('Add items to your cart before generating a bill.');
    return;
  }
  // Use last saved bill if available, otherwise generate from current cart
  const billText = lastBillText || (cart.length > 0 ? buildBillText() : null);
  if (!billText) {
    alert('No bill to generate.');
    return;
  }
  billDetails.textContent = billText;
  billPanel.classList.remove('hidden');
};

const downloadBill = () => {
  const billText = lastBillText || (cart.length > 0 ? buildBillText() : null);
  if (!billText) {
    alert('Add items to your cart or generate a bill before downloading.');
    return;
  }
  const blob = new Blob([billText], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `GrandAurum-Bill-${new Date().toISOString().slice(0, 10)}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const printBill = () => {
  const billText = lastBillText || (cart.length > 0 ? buildBillText() : null);
  if (!billText) {
    alert('Add items to your cart or generate a bill before printing.');
    return;
  }
  billDetails.textContent = billText;
  billPanel.classList.remove('hidden');
  window.print();
};

menuToggle?.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  menuToggle.textContent = navLinks.classList.contains('open') ? '✕' : '☰';
});

contactForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = contactForm.name.value.trim();
  const email = contactForm.email.value.trim();
  if (!name || !email) {
    responseMessage.textContent = 'Please enter your name and email.';
    return;
  }
  responseMessage.textContent = `Thanks, ${name}! We received your request and will contact you soon.`;
  contactForm.reset();
});

addButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const card = button.closest('.menu-card');
    if (!card) return;
    const id = Number(card.dataset.id);
    const name = card.dataset.name;
    const price = Number(card.dataset.price);
    addItem({ id, name, price });
  });
});

cartItemsContainer?.addEventListener('click', (event) => {
  const button = event.target;
  if (!(button instanceof HTMLElement)) return;
  const action = button.dataset.action;
  const id = button.dataset.id;
  if (!action || !id) return;
  if (action === 'decrease') updateQuantity(id, -1);
  if (action === 'increase') updateQuantity(id, 1);
  if (action === 'remove') removeItem(id);
});

payNowButton?.addEventListener('click', payNow);
clearCartButton?.addEventListener('click', clearCart);
printBillButton?.addEventListener('click', printBill);
generateBillButton?.addEventListener('click', generateBill);
downloadBillButton?.addEventListener('click', downloadBill);

renderCart();
