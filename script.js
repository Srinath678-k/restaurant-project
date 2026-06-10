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

const authToggle = document.getElementById('auth-toggle');
const authModal = document.getElementById('auth-modal');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const authTabs = document.querySelectorAll('.auth-tab');
const closeAuth = document.getElementById('close-auth');
const userStatus = document.getElementById('user-status');
const bookingForm = document.getElementById('booking-form');
const bookingMessage = document.getElementById('booking-message');
const themeToggle = document.getElementById('theme-toggle');

const CART_KEY = 'aurumCart';
const USERS_KEY = 'aurumUsers';
const AUTH_KEY = 'aurumAuth';
const BOOKINGS_KEY = 'aurumBookings';
const THEME_KEY = 'aurumTheme';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

const getStoredTheme = () => localStorage.getItem(THEME_KEY) || 'dark';
const applyTheme = (theme) => {
  const isLight = theme === 'light';
  document.body.classList.toggle('light-theme', isLight);
  if (themeToggle) {
    themeToggle.textContent = isLight ? 'Dark Mode' : 'Light Mode';
  }
  localStorage.setItem(THEME_KEY, theme);
};
const toggleTheme = () => applyTheme(document.body.classList.contains('light-theme') ? 'dark' : 'light');

// Loader and reveal animations
document.addEventListener('DOMContentLoaded', () => {
  // Add reveal class to sections and cards we want animated
  const selectors = ['.section-heading', '.room-card', '.menu-card', '.review-card', '.booking-card'];
  const elements = document.querySelectorAll(selectors.join(','));
  elements.forEach((el) => el.classList.add('reveal'));

  // IntersectionObserver to reveal elements
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        // optionally unobserve to improve performance
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  elements.forEach((el) => io.observe(el));
});

window.addEventListener('load', () => {
  const loader = document.getElementById('page-loader');
  if (!loader) return;
  loader.classList.add('fade-out');
  setTimeout(() => loader.remove(), 600);
});

const getStoredUsers = () => JSON.parse(localStorage.getItem(USERS_KEY)) || {};
const getCurrentUser = () => JSON.parse(localStorage.getItem(AUTH_KEY));
const saveCurrentUser = (user) => localStorage.setItem(AUTH_KEY, JSON.stringify(user));
const clearCurrentUser = () => localStorage.removeItem(AUTH_KEY);
const getBookings = () => JSON.parse(localStorage.getItem(BOOKINGS_KEY)) || [];
const saveBooking = (booking) => {
  const bookings = getBookings();
  bookings.push(booking);
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
};

const updateAuthUI = () => {
  const user = getCurrentUser();
  if (user) {
    authToggle.textContent = 'Logout';
    userStatus.textContent = `Hi, ${user.name}`;
    userStatus.classList.remove('hidden');
  } else {
    authToggle.textContent = 'Login/Register';
    userStatus.classList.add('hidden');
  }
};

const showAuthModal = () => {
  authModal.classList.remove('hidden');
  authModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
};

const hideAuthModal = () => {
  authModal.classList.add('hidden');
  authModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  loginForm.reset();
  registerForm.reset();
  document.getElementById('login-message').textContent = '';
  document.getElementById('register-message').textContent = '';
};

const switchAuthTab = (tabName) => {
  authTabs.forEach((tab) => {
    const targetForm = tab.dataset.tab === 'login' ? loginForm : registerForm;
    if (tab.dataset.tab === tabName) {
      tab.classList.add('active');
      targetForm.classList.remove('hidden');
    } else {
      tab.classList.remove('active');
      targetForm.classList.add('hidden');
    }
  });
};

const showAuthError = (message, form) => {
  const messageEl = form.querySelector('.form-response');
  if (messageEl) {
    messageEl.textContent = message;
  }
};

const handleRegister = (event) => {
  event.preventDefault();
  const name = registerForm.registerName.value.trim();
  const email = registerForm.registerEmail.value.trim().toLowerCase();
  const password = registerForm.registerPassword.value;
  const confirmPassword = registerForm.registerConfirm.value;
  const users = getStoredUsers();

  if (!name || !email || !password || !confirmPassword) {
    showAuthError('Please fill out all registration fields.', registerForm);
    return;
  }

  if (name.length < 3) {
    showAuthError('Name must be at least 3 characters.', registerForm);
    return;
  }

  if (!emailPattern.test(email)) {
    showAuthError('Enter a valid email address.', registerForm);
    return;
  }

  if (password.length < 6) {
    showAuthError('Password must be at least 6 characters.', registerForm);
    return;
  }

  if (password !== confirmPassword) {
    showAuthError('Passwords do not match.', registerForm);
    return;
  }

  if (users[email]) {
    showAuthError('An account with this email already exists.', registerForm);
    return;
  }

  users[email] = { name, email, password };
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  saveCurrentUser({ name, email });
  updateAuthUI();
  showAuthError('Registration successful! Logged in now.', registerForm);
  setTimeout(hideAuthModal, 800);
};

const handleLogin = (event) => {
  event.preventDefault();
  const email = loginForm.loginEmail.value.trim().toLowerCase();
  const password = loginForm.loginPassword.value;
  const users = getStoredUsers();
  const account = users[email];

  if (!email || !password) {
    showAuthError('Please enter both email and password.', loginForm);
    return;
  }

  if (!emailPattern.test(email)) {
    showAuthError('Enter a valid email address.', loginForm);
    return;
  }

  if (password.length < 6) {
    showAuthError('Password must be at least 6 characters.', loginForm);
    return;
  }

  if (!account || account.password !== password) {
    showAuthError('Email or password is incorrect.', loginForm);
    return;
  }

  saveCurrentUser({ name: account.name, email: account.email });
  updateAuthUI();
  showAuthError('Login successful! Welcome back.', loginForm);
  setTimeout(hideAuthModal, 800);
};

const handleBooking = (event) => {
  event.preventDefault();
  const currentUser = getCurrentUser();
  if (!currentUser) {
    alert('Please login before booking a room.');
    showAuthModal();
    switchAuthTab('login');
    return;
  }

  const name = bookingForm.bookingName.value.trim();
  const email = bookingForm.bookingEmail.value.trim();
  const roomType = bookingForm.bookingRoom.value;
  const checkIn = bookingForm.bookingDate.value;
  const nights = Number(bookingForm.bookingNights.value);
  const guests = Number(bookingForm.bookingGuests.value);

  if (!name || !email || !roomType || !checkIn || nights < 1 || guests < 1) {
    bookingMessage.textContent = 'Please complete all booking fields.';
    return;
  }

  const booking = {
    user: currentUser.email,
    name,
    email,
    roomType,
    checkIn,
    nights,
    guests,
    bookedAt: new Date().toISOString(),
  };

  saveBooking(booking);
  bookingMessage.textContent = `Thanks ${currentUser.name}! Your ${roomType} is booked for ${checkIn} for ${nights} night${nights === 1 ? '' : 's'}.`;
  bookingForm.reset();
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
  lastBillText = buildBillText();
  billDetails.textContent = lastBillText;
  billPanel.classList.remove('hidden');
  paymentPanel.classList.remove('hidden');
  paymentSmsMessage.textContent = `Bill sent successfully to ${billingPhoneNumber}.`;
  alert(`Payment processed. Bill sent successfully to ${billingPhoneNumber}.`);
  clearCart();
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

authToggle?.addEventListener('click', () => {
  const user = getCurrentUser();
  if (user) {
    clearCurrentUser();
    updateAuthUI();
    alert('You have been logged out.');
  } else {
    showAuthModal();
    switchAuthTab('login');
  }
});

authTabs.forEach((tab) => {
  tab.addEventListener('click', () => switchAuthTab(tab.dataset.tab));
});

themeToggle?.addEventListener('click', toggleTheme);

closeAuth?.addEventListener('click', hideAuthModal);
authModal?.addEventListener('click', (event) => {
  if (event.target === authModal) hideAuthModal();
});

loginForm?.addEventListener('submit', handleLogin);
registerForm?.addEventListener('submit', handleRegister);
bookingForm?.addEventListener('submit', handleBooking);

updateAuthUI();
renderCart();
applyTheme(getStoredTheme());
