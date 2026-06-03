const PLACEHOLDER = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNTAwIiB2aWV3Qm94PSIwIDAgNDAwIDUwMCI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSI1MDAiIGZpbGw9IiNmMGYwZjAiLz48cmVjdCB4PSIxNjAiIHk9IjIwMCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iOCIgZmlsbD0iI2QwZDBkMCIvPjx0ZXh0IHg9IjIwMCIgeT0iMzIwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iR2VvcmdpYSwgc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiPmUtYm91dGlrPC90ZXh0Pjwvc3ZnPg==";

function fallbackImage(img) {
    img.onerror = null;
    img.src = PLACEHOLDER;
}

const defaultProducts = [
    { id: 1, name: 'Chemise en lin blanc', price: 49.99, category: 'Hommes', sizes: 'S, M, L, XL', image: PLACEHOLDER },
    { id: 2, name: 'Robe fleurie été', price: 59.99, category: 'Femmes', sizes: 'XS, S, M, L', image: PLACEHOLDER },
    { id: 3, name: 'Sac en cuir noir', price: 89.99, category: 'Accessoires', sizes: 'Unique', image: PLACEHOLDER },
    { id: 4, name: 'Blazer oversize', price: 79.99, category: 'Femmes', sizes: 'S, M, L', image: PLACEHOLDER },
    { id: 5, name: 'Jean brut slim', price: 69.99, category: 'Hommes', sizes: '30, 32, 34, 36', image: PLACEHOLDER },
    { id: 6, name: 'Montre minimaliste', price: 129.99, category: 'Accessoires', sizes: 'Unique', image: PLACEHOLDER },
    { id: 7, name: 'Pantalon large beige', price: 54.99, category: 'Femmes', sizes: 'XS, S, M, L', image: PLACEHOLDER },
    { id: 8, name: 'T-shirt coton bio', price: 29.99, category: 'Hommes', sizes: 'S, M, L, XL, XXL', image: PLACEHOLDER },
    { id: 9, name: 'Ceinture tressée', price: 39.99, category: 'Accessoires', sizes: '90, 100, 110', image: PLACEHOLDER },
    { id: 10, name: 'Veste en jean', price: 94.99, category: 'Femmes', sizes: 'S, M, L', image: PLACEHOLDER },
    { id: 11, name: 'Mocassins cuir', price: 109.99, category: 'Hommes', sizes: '39, 40, 41, 42, 43', image: PLACEHOLDER },
    { id: 12, name: 'Écharpe cachemire', price: 69.99, category: 'Accessoires', sizes: 'Unique', image: PLACEHOLDER }
];

const defaultCategoryNames = ['Hommes', 'Femmes', 'Accessoires'];

function getProducts() {
    try {
        let products = JSON.parse(localStorage.getItem('eboutik_products'));
        if (!products || !products.length) {
            products = defaultProducts;
            localStorage.setItem('eboutik_products', JSON.stringify(products));
        }
        return products;
    } catch { return defaultProducts; }
}

function getCategories() {
    try {
        let cats = JSON.parse(localStorage.getItem('eboutik_categories'));
        if (!cats || !cats.length) {
            cats = defaultCategoryNames.map((n, i) => ({ id: i + 1, name: n }));
            localStorage.setItem('eboutik_categories', JSON.stringify(cats));
        }
        return cats;
    } catch { return defaultCategoryNames.map((n, i) => ({ id: i + 1, name: n })); }
}
function saveProducts(products) {
    localStorage.setItem('eboutik_products', JSON.stringify(products));
}
function saveCategories(categories) {
    localStorage.setItem('eboutik_categories', JSON.stringify(categories));
}
function getOrders() {
    try { return JSON.parse(localStorage.getItem('eboutik_orders')) || []; }
    catch { return []; }
}
function saveOrders(orders) {
    localStorage.setItem('eboutik_orders', JSON.stringify(orders));
}

function showNotification(message) {
    const existing = document.querySelector('.notification-toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = 'notification-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

function showSizePicker(product) {
    const sizes = product.sizes ? product.sizes.split(',').map(s => s.trim()).filter(s => s) : [];
    const isUnique = sizes.length === 1 && sizes[0].toLowerCase() === 'unique';
    if (!sizes.length || isUnique) {
        addToCart(product, '');
        showNotification(product.name + ' ajoute nan demann!');
        return;
    }

    const existing = document.querySelector('.size-picker-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    let pickerImg = product.image || PLACEHOLDER;
    if (pickerImg.startsWith('http://')) pickerImg = pickerImg.replace('http://', 'https://');
    overlay.className = 'size-picker-overlay';
    overlay.innerHTML = `
        <div class="size-picker-modal">
            <button class="size-picker-close" aria-label="Fèmen">&times;</button>
            <div class="size-picker-layout">
                <img src="${pickerImg}" alt="${product.name}"
                     onerror="if(this.src.startsWith('http://')){this.src=this.src.replace('http://','https://')}else{fallbackImage(this)}">
                <div class="size-picker-info">
                    <div class="size-picker-category">${product.category || ''}</div>
                    <div class="size-picker-name">${product.name}</div>
                    <div class="size-picker-price">${Number(product.price).toFixed(2)} G</div>
                    <p>Chwazi yon gwosè:</p>
                    <div class="size-options">
                        ${sizes.map(s => `<button class="size-option" data-size="${s}">${s}</button>`).join('')}
                    </div>
                    <button class="btn btn-primary add-cart-confirm" disabled>Ajoute nan demann</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    let selectedSize = '';
    overlay.querySelectorAll('.size-option').forEach(btn => {
        btn.addEventListener('click', () => {
            overlay.querySelectorAll('.size-option').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedSize = btn.dataset.size;
            overlay.querySelector('.add-cart-confirm').disabled = false;
        });
    });
    overlay.querySelector('.add-cart-confirm').addEventListener('click', () => {
        if (selectedSize) {
            addToCart(product, selectedSize);
            showNotification(product.name + ' (' + selectedSize + ') ajoute nan demann!');
            overlay.remove();
        }
    });
    overlay.querySelector('.size-picker-close').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
}

function renderProductCard(p) {
    const sizes = p.sizes ? p.sizes.split(',').map(s => s.trim()).join(', ') : '';
    let imgSrc = p.image || PLACEHOLDER;
    if (imgSrc.startsWith('http://')) imgSrc = imgSrc.replace('http://', 'https://');
    const prodJson = JSON.stringify(p).replace(/'/g, "&#39;");
    return `
        <div class="product-card" tabindex="0" role="button" aria-label="${p.name}">
            <div class="product-image-wrap">
                <img class="product-image" src="${imgSrc}" alt="${p.name}" loading="lazy" onerror="if(this.src.startsWith('http://')){this.src=this.src.replace('http://','https://')}else{fallbackImage(this)}">
                <div class="product-overlay">
                    <button class="add-cart-btn" onclick="event.stopPropagation();showSizePicker(${prodJson})">Ajoute nan demann</button>
                </div>
            </div>
            <div class="product-info">
                <div class="product-category">${p.category || ''}</div>
                <div class="product-name">${p.name}</div>
                <div class="product-price">${Number(p.price).toFixed(2)} G</div>
                ${sizes ? `<div class="product-sizes">${sizes}</div>` : ''}
            </div>
        </div>
    `;
}

function getCart() {
    try {
        return JSON.parse(localStorage.getItem('eboutik_cart')) || [];
    } catch {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem('eboutik_cart', JSON.stringify(cart));
}

function updateCartBadge() {
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll('#cart-count').forEach(el => { el.textContent = count; });
}

function addToCart(product, size) {
    let cart = getCart();
    const key = product.id + '-' + (size || '');
    const existing = cart.find(item => item.key === key);

    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            key: key,
            product_id: product.id,
            name: product.name,
            price: parseFloat(product.price),
            image: product.image || '',
            size: size || '',
            quantity: 1
        });
    }

    saveCart(cart);
    updateCartBadge();
}

function updateCartItem(key, delta) {
    let cart = getCart();
    const item = cart.find(i => i.key === key);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            cart = cart.filter(i => i.key !== key);
        }
    }
    saveCart(cart);
    updateCartBadge();
    renderCart();
}

function removeCartItem(key) {
    let cart = getCart().filter(i => i.key !== key);
    saveCart(cart);
    updateCartBadge();
    renderCart();
}

function renderCart() {
    const content = document.getElementById('cart-content');
    const cart = getCart();

    if (!cart.length) {
        content.innerHTML = `
            <div class="cart-empty">
                <div class="cart-empty-icon" aria-hidden="true">🛍️</div>
                <h2>Demann ou vid</h2>
                <p>Eksplore katalòg nou an epi jwenn pwochen atik ou renmen an.</p>
                <button class="btn btn-primary" onclick="window.location.href='catalog.html'">Dekouvri katalòg la</button>
            </div>
        `;
        return;
    }

    let html = '<ul class="cart-items">';
    let total = 0;

    cart.forEach(item => {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        let imgSrc = item.image || PLACEHOLDER;
        if (imgSrc.startsWith('http://')) imgSrc = imgSrc.replace('http://', 'https://');
        html += `
            <li class="cart-item">
                <img src="${imgSrc}" alt="${item.name}"
                     onerror="if(this.src.startsWith('http://')){this.src=this.src.replace('http://','https://')}else{fallbackImage(this)}">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    ${item.size ? `<div class="cart-item-detail">Gwosè: ${item.size}</div>` : ''}
                    <div class="cart-item-price">${item.price.toFixed(2)} G</div>
                </div>
                <div class="cart-qty">
                    <button onclick="updateCartItem('${item.key}', -1)" aria-label="Diminye kantite">−</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateCartItem('${item.key}', 1)" aria-label="Ogmantye kantite">+</button>
                </div>
                <div style="min-width:70px;text-align:right;font-weight:500;">${subtotal.toFixed(2)} G</div>
                <button class="cart-remove" onclick="removeCartItem('${item.key}')" aria-label="Retire atik sa a">✕</button>
            </li>
        `;
    });

    html += '</ul>';
    html += `
        <div class="cart-total-bar">
            <span class="cart-total-label">Total</span>
            <span class="cart-total-amount">${total.toFixed(2)} G</span>
        </div>
        <div class="checkout-section" id="checkout-section">
            <h2>Pase kòmand la</h2>
            <form id="checkout-form" novalidate>
                <div class="form-group">
                    <label for="customer-name">Non konplè</label>
                    <input type="text" id="customer-name" required placeholder="Jan Dupont">
                </div>
                <div class="form-group">
                    <label for="customer-phone">Telefòn</label>
                    <input type="tel" id="customer-phone" required placeholder="+509 12 34 56 78">
                </div>
                <div class="form-group">
                    <label for="customer-address">Adrès</label>
                    <textarea id="customer-address" required placeholder="..."></textarea>
                </div>
                <div class="form-group">
                    <label for="customer-notes">Nòt</label>
                    <textarea id="customer-notes" placeholder="..."></textarea>
                </div>
                <button type="submit" class="btn btn-primary">Kòmande</button>
                <p id="order-message" style="margin-top:1rem;"></p>
            </form>
        </div>
    `;

    content.innerHTML = html;

    const form = document.getElementById('checkout-form');
    const msg = document.getElementById('order-message');
    if (form) {
        form.onsubmit = (e) => {
            e.preventDefault();
            const name = document.getElementById('customer-name').value.trim();
            const phone = document.getElementById('customer-phone').value.trim();
            const address = document.getElementById('customer-address').value.trim();
            const notes = document.getElementById('customer-notes').value.trim();

            if (!name) { msg.className = 'error'; msg.textContent = 'Tanpri antre non ou.'; return; }
            if (!phone) { msg.className = 'error'; msg.textContent = 'Tanpri antre nimewo telefòn ou.'; return; }
            if (!address) { msg.className = 'error'; msg.textContent = 'Tanpri antre adrès ou.'; return; }

            const orderId = Date.now();
            const orders = getOrders();
            orders.push({
                id: orderId,
                customer_name: name,
                customer_phone: phone,
                customer_address: address,
                customer_notes: notes,
                total: total,
                status: 'Ap tann',
                created_at: new Date().toLocaleString('fr-FR'),
                items: cart.map(i => ({ product_id: i.product_id, name: i.name, price: i.price, size: i.size, quantity: i.quantity }))
            });
            saveOrders(orders);
            localStorage.removeItem('eboutik_cart');
            updateCartBadge();

            content.innerHTML = `
                <div class="cart-empty" style="max-width:500px;margin:0 auto;">
                    <h2 style="font-size:1.6rem;">Mèsi ${name}!</h2>
                    <p>Kòmand ou an te byen konfime. N ap kontakte ou byento.</p>
                    <div class="order-confirm-details">
                        <p><strong>N° kòmand:</strong> ${orderId}</p>
                        <p><strong>Total:</strong> ${total.toFixed(2)} G</p>
                        <p><strong>Telefòn:</strong> ${phone}</p>
                        <p><strong>Adrès:</strong> ${address}</p>
                    </div>
                    <button class="btn btn-primary" onclick="window.location.href='catalog.html'">Kontinye fè makèt</button>
                </div>
            `;
        };
    }
}
