/**
 * Tuscany Courtyard Islamabad - Gastronomic Cart & Direct Checkout Logic
 * Vanilla JavaScript implementation for interactive cart, Buy Now, and order management.
 */

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================================================
  // STATE MANAGEMENT
  // ==========================================================================
  let cart = [];

  // DOM Elements
  const cartCounter = document.getElementById('cart-counter');
  const cartDrawer = document.getElementById('cart-drawer');
  const cartOverlay = document.getElementById('cart-overlay');
  const openCartBtn = document.getElementById('open-cart-btn');
  const closeCartBtn = document.getElementById('close-cart-btn');
  const cartItemsContainer = document.getElementById('cart-items-container');
  const cartEmptyState = document.getElementById('cart-empty-state');
  const cartSubtotalEl = document.getElementById('cart-subtotal');
  const cartGrandTotalEl = document.getElementById('cart-grand-total');
  const cartCheckoutBtn = document.getElementById('cart-checkout-btn');

  // Checkout Modal Elements
  const checkoutModal = document.getElementById('checkout-modal');
  const checkoutOverlay = document.getElementById('checkout-modal-overlay');
  const closeCheckoutBtn = document.getElementById('close-checkout-btn');
  const checkoutItemsSummary = document.getElementById('checkout-items-summary');
  const modalTotalDisplay = document.getElementById('modal-total-display');
  const directOrderForm = document.getElementById('direct-order-form');
  const checkoutFormView = document.getElementById('checkout-form-view');
  const checkoutSuccessView = document.getElementById('checkout-success-view');
  const successOrderNumber = document.getElementById('success-order-number');
  const successDetailsCard = document.getElementById('success-details-card');
  const backToMenuBtn = document.getElementById('back-to-menu-btn');

  // Toast Notification
  const toastNotification = document.getElementById('toast-notification');
  const toastMessage = document.getElementById('toast-message');
  const toastViewCart = document.getElementById('toast-view-cart');
  let toastTimer = null;

  // Active Direct Buy Item (Used when "Buy Now" is clicked for immediate purchase)
  let activeDirectBuyItem = null;

  // Format PKR Currency
  const formatPKR = (amount) => {
    return 'PKR ' + Number(amount).toLocaleString('en-US');
  };

  // ==========================================================================
  // TOAST NOTIFICATIONS
  // ==========================================================================
  const showToast = (text) => {
    if (!toastNotification) return;
    toastMessage.textContent = text;
    toastNotification.classList.add('active');

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastNotification.classList.remove('active');
    }, 3800);
  };

  if (toastViewCart) {
    toastViewCart.addEventListener('click', () => {
      if (toastNotification) toastNotification.classList.remove('active');
      openDrawer();
    });
  }

  // ==========================================================================
  // CART DRAWER INTERACTIONS
  // ==========================================================================
  const openDrawer = () => {
    renderCart();
    cartDrawer.classList.add('open');
    cartOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    cartDrawer.classList.remove('open');
    cartOverlay.classList.remove('open');
    document.body.style.overflow = '';
  };

  if (openCartBtn) openCartBtn.addEventListener('click', openDrawer);
  if (closeCartBtn) closeCartBtn.addEventListener('click', closeDrawer);
  if (cartOverlay) cartOverlay.addEventListener('click', closeDrawer);

  // ==========================================================================
  // CART OPERATIONS (Add, Remove, Update)
  // ==========================================================================
  const addToCart = (item, shouldOpenDrawer = false) => {
    const existingIndex = cart.findIndex((i) => i.id === item.id);
    if (existingIndex > -1) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({ ...item, quantity: 1 });
    }

    updateCartBadge();
    renderCart();
    showToast(`Added ${item.name} to your selection`);

    if (shouldOpenDrawer) {
      openDrawer();
    }
  };

  const updateQuantity = (id, delta) => {
    const item = cart.find((i) => i.id === id);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      cart = cart.filter((i) => i.id !== id);
    }

    updateCartBadge();
    renderCart();
  };

  const removeFromCart = (id) => {
    cart = cart.filter((i) => i.id !== id);
    updateCartBadge();
    renderCart();
  };

  const updateCartBadge = () => {
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCounter) {
      cartCounter.textContent = totalCount;
      if (totalCount > 0) {
        cartCounter.classList.add('bump');
        setTimeout(() => cartCounter.classList.remove('bump'), 300);
      }
    }
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  // Render Cart DOM
  const renderCart = () => {
    if (!cartItemsContainer) return;

    // Check empty state
    if (cart.length === 0) {
      cartItemsContainer.innerHTML = `
        <div class="cart-empty-state">
          <div class="empty-icon-wrap">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#C0C0C0" stroke-width="1.5">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
          </div>
          <p class="empty-title">Your cart is currently empty</p>
          <p class="empty-subtitle">Explore our signature menu to add handcrafted Italian dishes.</p>
        </div>
      `;
      if (cartSubtotalEl) cartSubtotalEl.textContent = formatPKR(0);
      if (cartGrandTotalEl) cartGrandTotalEl.textContent = formatPKR(0);
      if (cartCheckoutBtn) cartCheckoutBtn.disabled = true;
      return;
    }

    if (cartCheckoutBtn) cartCheckoutBtn.disabled = false;

    let itemsHtml = '<div class="cart-items-list">';
    cart.forEach((item) => {
      const lineTotal = item.price * item.quantity;
      itemsHtml += `
        <div class="cart-item" data-id="${item.id}">
          <img src="${item.img}" alt="${item.name}" class="cart-item-img">
          <div class="cart-item-info">
            <h4 class="cart-item-title">${item.name}</h4>
            <span class="cart-item-unit-price">${formatPKR(item.price)} each</span>
            <div class="cart-qty-row">
              <div class="cart-qty-controls">
                <button type="button" class="cart-qty-btn btn-decrease" data-id="${item.id}" aria-label="Decrease quantity">&minus;</button>
                <span class="cart-qty-val">${item.quantity}</span>
                <button type="button" class="cart-qty-btn btn-increase" data-id="${item.id}" aria-label="Increase quantity">&plus;</button>
              </div>
              <span class="cart-line-total">${formatPKR(lineTotal)}</span>
            </div>
          </div>
          <button type="button" class="cart-item-remove-btn" data-id="${item.id}" aria-label="Remove item">&times;</button>
        </div>
      `;
    });
    itemsHtml += '</div>';

    cartItemsContainer.innerHTML = itemsHtml;

    // Attach listeners to items
    cartItemsContainer.querySelectorAll('.btn-decrease').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        updateQuantity(id, -1);
      });
    });

    cartItemsContainer.querySelectorAll('.btn-increase').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        updateQuantity(id, 1);
      });
    });

    cartItemsContainer.querySelectorAll('.cart-item-remove-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        removeFromCart(id);
      });
    });

    const subtotal = calculateSubtotal();
    if (cartSubtotalEl) cartSubtotalEl.textContent = formatPKR(subtotal);
    if (cartGrandTotalEl) cartGrandTotalEl.textContent = formatPKR(subtotal);
  };

  // ==========================================================================
  // CHECKOUT MODAL LOGIC (Supports both "Buy Now" and "Cart Checkout")
  // ==========================================================================
  const openCheckoutModal = (directItem = null) => {
    activeDirectBuyItem = directItem;

    // Reset views
    if (checkoutFormView) checkoutFormView.style.display = 'block';
    if (checkoutSuccessView) checkoutSuccessView.style.display = 'none';

    // Populate order summary inside modal
    let itemsToCheckout = [];
    if (directItem) {
      itemsToCheckout = [{ ...directItem, quantity: 1 }];
    } else {
      itemsToCheckout = [...cart];
    }

    if (itemsToCheckout.length === 0) {
      showToast('Your cart is empty. Please select a dish first.');
      return;
    }

    let summaryHtml = '<div class="checkout-items-card">';
    let totalPayable = 0;

    itemsToCheckout.forEach((item) => {
      const lineCost = item.price * item.quantity;
      totalPayable += lineCost;
      summaryHtml += `
        <div class="checkout-item-row">
          <div class="checkout-item-desc">
            <span class="checkout-item-qty">${item.quantity}x</span>
            <span class="checkout-item-name">${item.name}</span>
          </div>
          <span class="checkout-item-price">${formatPKR(lineCost)}</span>
        </div>
      `;
    });

    summaryHtml += `
      <div class="checkout-summary-subtotal">
        <span>Delivery (F-6/F-7/E-7 Islamabad)</span>
        <span class="free-text">Free Concierge</span>
      </div>
    </div>`;

    if (checkoutItemsSummary) checkoutItemsSummary.innerHTML = summaryHtml;
    if (modalTotalDisplay) modalTotalDisplay.textContent = formatPKR(totalPayable);

    // Open modal
    closeDrawer();
    checkoutModal.classList.add('open');
    checkoutOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const closeCheckoutModal = () => {
    checkoutModal.classList.remove('open');
    checkoutOverlay.classList.remove('open');
    document.body.style.overflow = '';
  };

  if (closeCheckoutBtn) closeCheckoutBtn.addEventListener('click', closeCheckoutModal);
  if (checkoutOverlay) checkoutOverlay.addEventListener('click', closeCheckoutModal);

  // Cart Drawer Checkout Button
  if (cartCheckoutBtn) {
    cartCheckoutBtn.addEventListener('click', () => {
      openCheckoutModal(null);
    });
  }

  // Handle Direct Order Form Submission
  if (directOrderForm) {
    directOrderForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const guestName = document.getElementById('order-name').value;
      const guestPhone = document.getElementById('order-phone').value;
      const guestAddress = document.getElementById('order-address').value;
      const orderType = document.getElementById('order-type').value;
      const paymentMethod = document.getElementById('payment-method').value;

      // Generate random realistic Order ID
      const orderNumber = '#TC-' + Math.floor(10000 + Math.random() * 90000);

      // Items purchased
      const purchasedItems = activeDirectBuyItem
        ? [{ ...activeDirectBuyItem, quantity: 1 }]
        : [...cart];

      const grandTotal = purchasedItems.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);

      // Build confirmation card
      let detailsHtml = `
        <div class="success-receipt">
          <div class="receipt-row"><span>Customer:</span><strong>${guestName}</strong></div>
          <div class="receipt-row"><span>Contact:</span><strong>${guestPhone}</strong></div>
          <div class="receipt-row"><span>Delivery Address:</span><strong>${guestAddress}</strong></div>
          <div class="receipt-row"><span>Service Type:</span><strong>${orderType === 'pickup' ? 'Courtyard Pickup' : 'Express Delivery'}</strong></div>
          <div class="receipt-row"><span>Payment:</span><strong>${paymentMethod.toUpperCase()}</strong></div>
          <div class="receipt-divider"></div>
          <div class="receipt-items-list">
      `;

      purchasedItems.forEach((item) => {
        detailsHtml += `
          <div class="receipt-item-line">
            <span>${item.quantity}x ${item.name}</span>
            <span>${formatPKR(item.price * item.quantity)}</span>
          </div>
        `;
      });

      detailsHtml += `
          </div>
          <div class="receipt-total-row">
            <span>Amount Paid / Due:</span>
            <strong>${formatPKR(grandTotal)}</strong>
          </div>
        </div>
      `;

      if (successOrderNumber) successOrderNumber.textContent = orderNumber;
      if (successDetailsCard) successDetailsCard.innerHTML = detailsHtml;

      // Transition to success screen
      if (checkoutFormView) checkoutFormView.style.display = 'none';
      if (checkoutSuccessView) checkoutSuccessView.style.display = 'block';

      // Clear cart
      cart = [];
      updateCartBadge();
      renderCart();
      directOrderForm.reset();
    });
  }

  if (backToMenuBtn) {
    backToMenuBtn.addEventListener('click', () => {
      closeCheckoutModal();
      const menuSection = document.getElementById('menu');
      if (menuSection) {
        menuSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // ==========================================================================
  // EVENT LISTENERS FOR "ADD TO CART" & "BUY NOW" BUTTONS ON FOOD CARDS
  // ==========================================================================
  // "Add to Cart" Buttons
  document.querySelectorAll('.btn-add-cart').forEach((button) => {
    button.addEventListener('click', (e) => {
      const btn = e.currentTarget;
      const item = {
        id: btn.getAttribute('data-id'),
        name: btn.getAttribute('data-name'),
        price: parseInt(btn.getAttribute('data-price'), 10),
        img: btn.getAttribute('data-img'),
      };
      addToCart(item, false);
    });
  });

  // "Buy Now" Buttons
  document.querySelectorAll('.buy-now-btn').forEach((button) => {
    button.addEventListener('click', (e) => {
      const btn = e.currentTarget;
      const item = {
        id: btn.getAttribute('data-id'),
        name: btn.getAttribute('data-name'),
        price: parseInt(btn.getAttribute('data-price'), 10),
        img: btn.getAttribute('data-img'),
      };
      // Immediately open direct checkout with this item!
      openCheckoutModal(item);
    });
  });
});
