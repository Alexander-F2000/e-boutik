function escapeHTML(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

const PLACEHOLDER = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNTAwIiB2aWV3Qm94PSIwIDAgNDAwIDUwMCI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSI1MDAiIGZpbGw9IiNmMGYwZjAiLz48cmVjdCB4PSIxNjAiIHk9IjIwMCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iOCIgZmlsbD0iI2QwZDBkMCIvPjx0ZXh0IHg9IjIwMCIgeT0iMzIwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iR2VvcmdpYSwgc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiPmUtYm91dGlrPC90ZXh0Pjwvc3ZnPg==";

function fallbackImage(img) {
    img.onerror = null;
    img.src = PLACEHOLDER;
}

const IMG_BASE = 'https://images.unsplash.com';
const defaultProducts = [
    { id: 1, name: 'Chemise en lin blanc', price: 49.99, category: 'Hommes', sizes: 'S, M, L, XL', brand: 'LinStyle', material: 'Lin', color: 'Blan', image: IMG_BASE + '/photo-1596755094514-f87e34085b2c?w=400&h=500&fit=crop', image_hover: IMG_BASE + '/photo-1598033129183-c4f50c736c10?w=400&h=500&fit=crop', costPrice: 25, wholesalePrice: 42.49, batchQuantity: 0, batchPrice: 0, alertThreshold: 5 },
    { id: 2, name: 'Robe fleurie été', price: 59.99, category: 'Femmes', sizes: 'XS, S, M, L', brand: 'Floraison', material: 'Koton', color: 'Imprime', image: IMG_BASE + '/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop', image_hover: IMG_BASE + '/photo-1572804013309-59a88b7e92f1?w=400&h=500&fit=crop', costPrice: 30, wholesalePrice: 50.99, batchQuantity: 0, batchPrice: 0, alertThreshold: 5 },
    { id: 3, name: 'Sac en cuir noir', price: 89.99, category: 'Accessoires', sizes: 'Unique', brand: 'Cuiré', material: 'Kwiv', color: 'Nwa', image: IMG_BASE + '/photo-1566150905458-1bf1fc113f0d?w=400&h=500&fit=crop', image_hover: IMG_BASE + '/photo-1590874103328-eac38a683ce7?w=400&h=500&fit=crop', costPrice: 45, wholesalePrice: 76.49, batchQuantity: 0, batchPrice: 0, alertThreshold: 3 },
    { id: 4, name: 'Blazer oversize', price: 79.99, category: 'Femmes', sizes: 'S, M, L', brand: 'Moderne', material: 'Polyèst', color: 'Bej', image: IMG_BASE + '/photo-1593030761757-71fae45fa0e7?w=400&h=500&fit=crop', image_hover: IMG_BASE + '/photo-1544022613-e87ca75a784a?w=400&h=500&fit=crop', costPrice: 40, wholesalePrice: 67.99, batchQuantity: 0, batchPrice: 0, alertThreshold: 5 },
    { id: 5, name: 'Jean brut slim', price: 69.99, category: 'Hommes', sizes: '30, 32, 34, 36', brand: 'DenimCo', material: 'Denim', color: 'Blue', image: IMG_BASE + '/photo-1542272454315-4c01d7abdf4a?w=400&h=500&fit=crop', image_hover: IMG_BASE + '/photo-1555689512-40e0e8b08e79?w=400&h=500&fit=crop', costPrice: 35, wholesalePrice: 59.49, batchQuantity: 0, batchPrice: 0, alertThreshold: 5 },
    { id: 6, name: 'Montre minimaliste', price: 129.99, category: 'Accessoires', sizes: 'Unique', brand: 'TempsPur', material: 'Metal', color: 'Ajan', image: IMG_BASE + '/photo-1524592094714-0f0654e20314?w=400&h=500&fit=crop', image_hover: IMG_BASE + '/photo-1523170335258-f5ed11844a49?w=400&h=500&fit=crop', costPrice: 65, wholesalePrice: 110.49, batchQuantity: 0, batchPrice: 0, alertThreshold: 3 },
    { id: 7, name: 'Pantalon large beige', price: 54.99, category: 'Femmes', sizes: 'XS, S, M, L', brand: 'Aisé', material: 'Koton', color: 'Bej', image: IMG_BASE + '/photo-1594633312681-425c7b97ccd1?w=400&h=500&fit=crop', image_hover: IMG_BASE + '/photo-1551854662-d53da5b82c6f?w=400&h=500&fit=crop', costPrice: 27, wholesalePrice: 46.74, batchQuantity: 0, batchPrice: 0, alertThreshold: 5 },
    { id: 8, name: 'T-shirt coton bio', price: 29.99, category: 'Hommes', sizes: 'S, M, L, XL, XXL', brand: 'BioCoton', material: 'Koton bio', color: 'Blan', image: IMG_BASE + '/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop', image_hover: IMG_BASE + '/photo-1583743814966-8936f5b7be1a?w=400&h=500&fit=crop', costPrice: 15, wholesalePrice: 25.49, batchQuantity: 0, batchPrice: 0, alertThreshold: 10 },
    { id: 9, name: 'Ceinture tressée', price: 39.99, category: 'Accessoires', sizes: '90, 100, 110', brand: 'Tressé', material: 'Kwiv', color: 'Mawon', image: IMG_BASE + '/photo-1594226801341-41427b4e6c0d?w=400&h=500&fit=crop', image_hover: IMG_BASE + '/photo-1584601079118-0c1c00e6b604?w=400&h=500&fit=crop', costPrice: 20, wholesalePrice: 33.99, batchQuantity: 0, batchPrice: 0, alertThreshold: 5 },
    { id: 10, name: 'Veste en jean', price: 94.99, category: 'Femmes', sizes: 'S, M, L', brand: 'DenimCo', material: 'Denim', color: 'Blue', image: IMG_BASE + '/photo-1544923246-77307dd270b1?w=400&h=500&fit=crop', image_hover: IMG_BASE + '/photo-1527011046414-4781f1f94c6c?w=400&h=500&fit=crop', costPrice: 47, wholesalePrice: 80.74, batchQuantity: 0, batchPrice: 0, alertThreshold: 5 },
    { id: 11, name: 'Mocassins cuir', price: 109.99, category: 'Hommes', sizes: '39, 40, 41, 42, 43', brand: 'Paso', material: 'Kwiv', color: 'Mawon', image: IMG_BASE + '/photo-1608256246200-53e635b5b65f?w=400&h=500&fit=crop', image_hover: IMG_BASE + '/photo-1603808033192-082d6919d3e1?w=400&h=500&fit=crop', costPrice: 55, wholesalePrice: 93.49, batchQuantity: 0, batchPrice: 0, alertThreshold: 5 },
    { id: 12, name: 'Écharpe cachemire', price: 69.99, category: 'Accessoires', sizes: 'Unique', brand: 'Cachemire', material: 'Kachmir', color: 'Gri', image: IMG_BASE + '/photo-1601925260368-ae2f83cf8b7f?w=400&h=500&fit=crop', image_hover: IMG_BASE + '/photo-1520903920243-00d872a2d2c9?w=400&h=500&fit=crop', costPrice: 35, wholesalePrice: 59.49, batchQuantity: 0, batchPrice: 0, alertThreshold: 3 }
];

const defaultCategoryNames = ['Hommes', 'Femmes', 'Accessoires'];

function normalizeProduct(p) {
    return {
        ...p,
        costPrice: p.costPrice || 0,
        wholesalePrice: p.wholesalePrice || 0,
        batchQuantity: p.batchQuantity || 0,
        batchPrice: p.batchPrice || 0,
        alertThreshold: p.alertThreshold != null ? p.alertThreshold : 5
    };
}

function getProducts() {
    try {
        let products = JSON.parse(localStorage.getItem('eboutik_products'));
        if (!products || !products.length) {
            products = defaultProducts;
            localStorage.setItem('eboutik_products', JSON.stringify(products));
        }
        return products.map(normalizeProduct);
    } catch { return defaultProducts.map(normalizeProduct); }
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
    syncToSupabase();
}
function saveCategories(categories) {
    localStorage.setItem('eboutik_categories', JSON.stringify(categories));
    syncToSupabase();
}
function getOrders() {
    try { return JSON.parse(localStorage.getItem('eboutik_orders')) || []; }
    catch { return []; }
}
function saveOrders(orders) {
    localStorage.setItem('eboutik_orders', JSON.stringify(orders));
    syncToSupabase();
}

function getTransactions() {
    try { return JSON.parse(localStorage.getItem('eboutik_transactions')) || []; }
    catch { return []; }
}
function saveTransactions(txns) {
    localStorage.setItem('eboutik_transactions', JSON.stringify(txns));
    syncToSupabase();
}

function addPurchase(productId, qty, unitCost, note) {
    const products = getProducts();
    const p = products.find(x => x.id == productId);
    if (!p) return;
    const oldQty = p.stock || 0;
    const oldCost = p.costPrice || 0;
    const newCost = oldQty > 0
        ? ((oldCost * oldQty) + (unitCost * qty)) / (oldQty + qty)
        : unitCost;
    p.costPrice = Math.round(newCost * 100) / 100;
    p.stock = (p.stock || 0) + qty;
    p.sellingPrice = p.price;
    saveProducts(products);
    const txns = getTransactions();
    txns.push({
        id: Date.now(),
        type: 'ACHAT',
        saleType: null,
        productId: p.id,
        productName: p.name,
        quantity: qty,
        unitPrice: unitCost,
        totalPrice: Math.round(unitCost * qty * 100) / 100,
        costPrice: p.costPrice,
        profit: 0,
        note: note || 'Reaprovisionne',
        createdAt: new Date().toLocaleString('fr-FR')
    });
    saveTransactions(txns);
    showNotification(p.name + ': ' + qty + ' inite ajoute nan stok!');
}

function sellProduct(productId, qty, saleType) {
    const products = getProducts();
    const p = products.find(x => x.id == productId);
    if (!p) return { error: 'Pwodui pa jwenn' };
    const stock = p.stock || 0;
    if (qty > stock) return { error: 'Stok ensifizan. Stok: ' + stock + ', ou vle: ' + qty };
    let unitPrice = 0, totalPrice = 0, discountPercent = 0;
    let batchUsed = 0, batchQty = 0, remainder = 0, remainderPrice = 0;
    if (saleType === 'EN_GROS') {
        unitPrice = p.wholesalePrice || p.price;
        totalPrice = Math.round(unitPrice * qty * 100) / 100;
    } else if (saleType === 'BATCH' && p.batchQuantity > 0) {
        batchQty = p.batchQuantity;
        const batchP = p.batchPrice || 0;
        const normalUnitPrice = p.price;
        const fullBatches = Math.floor(qty / batchQty);
        remainder = qty % batchQty;
        const batchTotal = fullBatches * batchP;
        const remainderTotal = remainder * normalUnitPrice;
        totalPrice = Math.round((batchTotal + remainderTotal) * 100) / 100;
        batchUsed = fullBatches;
        const normalBatchPrice = batchQty * normalUnitPrice;
        if (normalBatchPrice > 0) {
            discountPercent = Math.round(((normalBatchPrice - batchP) / normalBatchPrice) * 100);
        }
        unitPrice = totalPrice / qty;
    } else {
        unitPrice = p.price;
        totalPrice = Math.round(unitPrice * qty * 100) / 100;
    }
    const profit = Math.round((unitPrice - (p.costPrice || 0)) * qty * 100) / 100;
    p.stock = stock - qty;
    p.price = unitPrice;
    saveProducts(products);
    const txns = getTransactions();
    txns.push({
        id: Date.now(),
        type: 'VENTE',
        saleType: saleType,
        productId: p.id,
        productName: p.name,
        quantity: qty,
        unitPrice: Math.round(unitPrice * 100) / 100,
        totalPrice: totalPrice,
        costPrice: p.costPrice || 0,
        profit: profit,
        batchInfo: saleType === 'BATCH' ? {
            batchQty: batchQty,
            batchPrice: p.batchPrice,
            fullBatches: batchUsed,
            remainder: remainder,
            remainderPrice: remainderPrice,
            discountPercent: discountPercent
        } : null,
        note: 'Vant ' + saleType,
        createdAt: new Date().toLocaleString('fr-FR')
    });
    saveTransactions(txns);
    return { success: true, totalPrice, profit, saleType, batchInfo: saleType === 'BATCH' ? { batchQty, batchPrice: p.batchPrice, fullBatches: batchUsed, remainder, discountPercent } : null };
}

function deleteTransaction(id) {
    const txns = getTransactions();
    const txn = txns.find(x => x.id == id);
    if (!txn) return;
    const products = getProducts();
    const p = products.find(x => x.id == txn.productId);
    if (p) {
        if (txn.type === 'ACHAT') {
            p.stock = (p.stock || 0) - txn.quantity;
        } else if (txn.type === 'VENTE') {
            p.stock = (p.stock || 0) + txn.quantity;
        }
        if (p.stock < 0) p.stock = 0;
        saveProducts(products);
    }
    saveTransactions(txns.filter(x => x.id != id));
    showNotification('Tranzaksyon an siprime!');
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
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Chwazi gwosè pou ' + escapeHTML(product.name));
    const safeName = escapeHTML(product.name);
    const safeCategory = escapeHTML(product.category || '');
    const safePrice = Number(product.price).toFixed(2);
    overlay.innerHTML = '<div class="size-picker-modal">'
        + '<button class="size-picker-close" aria-label="Fèmen">&times;</button>'
        + '<div class="size-picker-layout">'
        + '<img src="' + escapeHTML(pickerImg) + '" alt="' + safeName + '"'
        + ' onerror="if(this.src.startsWith(\'http://\')){this.src=this.src.replace(\'http://\',\'https://\')}else{fallbackImage(this)}">'
        + '<div class="size-picker-info">'
        + '<div class="size-picker-category">' + safeCategory + '</div>'
        + '<div class="size-picker-name">' + safeName + '</div>'
        + '<div class="size-picker-price">' + safePrice + ' G</div>'
        + '<p>Chwazi yon gwosè:</p>'
        + '<div class="size-options">'
        + sizes.map(function(s) { return '<button class="size-option" data-size="' + escapeHTML(s) + '">' + escapeHTML(s) + '</button>'; }).join('')
        + '</div>'
        + '<button class="btn btn-primary add-cart-confirm" disabled>Ajoute nan demann</button>'
        + '</div></div></div>';
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
            showNotification(escapeHTML(product.name) + ' (' + selectedSize + ') ajoute nan demann!');
            overlay.remove();
            document.body.focus();
        }
    });
    overlay.querySelector('.size-picker-close').addEventListener('click', () => { overlay.remove(); document.body.focus(); });
    overlay.addEventListener('click', (e) => { if (e.target === overlay) { overlay.remove(); document.body.focus(); } });
    overlay.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { overlay.remove(); document.body.focus(); return; }
        if (e.key === 'Tab') {
            const focusable = overlay.querySelectorAll('button, [tabindex]:not([tabindex="-1"]), input, select, textarea');
            if (focusable.length === 0) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
            else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
    });
    requestAnimationFrame(() => { const btn = overlay.querySelector('.size-option, .add-cart-confirm, .size-picker-close'); if (btn) btn.focus(); });
}

function renderProductCard(p) {
    const sizes = p.sizes ? p.sizes.split(',').map(s => s.trim()).join(', ') : '';
    let imgSrc = p.image || PLACEHOLDER;
    if (imgSrc.startsWith('http://')) imgSrc = imgSrc.replace('http://', 'https://');
    let imgHov = p.image_hover || '';
    if (imgHov.startsWith('http://')) imgHov = imgHov.replace('http://', 'https://');
    const safeName = escapeHTML(p.name);
    const safeCategory = escapeHTML(p.category || '');
    const safeBrand = escapeHTML(p.brand || '');
    const safeSizes = escapeHTML(sizes);
    const prodForJs = JSON.stringify(p).replace(/'/g, "&#39;").replace(/</g, '\\u003C').replace(/>/g, '\\u003E');
    const wrapStyle = imgHov ? 'style="background-image:url(\'' + escapeHTML(imgHov) + '\');background-size:cover;background-position:center;"' : '';
    return '<div class="product-card" tabindex="0" role="button" aria-label="' + safeName + '" onclick="window.location.href=\'product.html?id=' + escapeHTML(String(p.id)) + '\'>'
        + '<div class="product-image-wrap" ' + wrapStyle + '>'
        + '<img class="product-image' + (imgHov ? ' has-hover' : '') + '" src="' + escapeHTML(imgSrc) + '" alt="' + safeName + '" loading="lazy" onerror="if(this.src.startsWith(\'http://\')){this.src=this.src.replace(\'http://\',\'https://\')}else{fallbackImage(this)}">'
        + '<div class="product-actions">'
        + '<button class="add-cart-btn" onclick="event.stopPropagation();showSizePicker(' + prodForJs + ')">Ajoute</button>'
        + '</div></div>'
        + '<div class="product-info">'
        + '<div class="product-category">' + safeCategory + '</div>'
        + '<div class="product-brand' + (p.brand ? '' : ' empty') + '">' + (p.brand ? safeBrand : '\u00A0') + '</div>'
        + '<div class="product-name">' + safeName + '</div>'
        + '<div class="product-price">' + Number(p.price).toFixed(2) + ' G</div>'
        + '<div class="product-sizes' + (sizes ? '' : ' empty') + '">' + (sizes ? safeSizes : '\u00A0') + '</div>'
        + '</div></div>';
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
        content.innerHTML = '<div class="cart-empty">'
            + '<h2>Demann ou vid</h2>'
            + '<p>Eksplore katalòg nou an epi jwenn pwochen atik ou renmen an.</p>'
            + '<button class="btn btn-primary" onclick="window.location.href=\'catalog.html\'">Dekouvri katalòg la</button>'
            + '</div>';
        return;
    }

    let html = '<ul class="cart-items">';
    let total = 0;

    const client = (function() { try { return JSON.parse(sessionStorage.getItem('eboutik_client')); } catch { return null; } })();

    cart.forEach(item => {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        let imgSrc = item.image || PLACEHOLDER;
        if (imgSrc.startsWith('http://')) imgSrc = imgSrc.replace('http://', 'https://');
        const safeName = escapeHTML(item.name);
        const safeSize = escapeHTML(item.size || '');
        const safeKey = escapeHTML(item.key);
        html += '<li class="cart-item">'
            + '<img src="' + escapeHTML(imgSrc) + '" alt="' + safeName + '"'
            + ' onerror="if(this.src.startsWith(\'http://\')){this.src=this.src.replace(\'http://\',\'https://\')}else{fallbackImage(this)}">'
            + '<div class="cart-item-info">'
            + '<div class="cart-item-name">' + safeName + '</div>'
            + (item.size ? '<div class="cart-item-detail">Gwose: ' + safeSize + '</div>' : '')
            + '<div class="cart-item-price">' + item.price.toFixed(2) + ' G</div>'
            + '</div>'
            + '<div class="cart-qty">'
            + '<button onclick="updateCartItem(\'' + safeKey + '\', -1)" aria-label="Diminye kantite">\u2212</button>'
            + '<span>' + item.quantity + '</span>'
            + '<button onclick="updateCartItem(\'' + safeKey + '\', 1)" aria-label="Ogmantye kantite">+</button>'
            + '</div>'
            + '<div style="min-width:70px;text-align:right;font-weight:500;">' + subtotal.toFixed(2) + ' G</div>'
            + '<button class="cart-remove" onclick="removeCartItem(\'' + safeKey + '\')" aria-label="Retire atik sa a">X</button>'
            + '</li>';
    });

    html += '</ul>';
    html += '<div class="cart-total-bar">'
        + '<span class="cart-total-label">Total</span>'
        + '<span class="cart-total-amount">' + total.toFixed(2) + ' G</span>'
        + '</div>'
        + '<div class="checkout-section" id="checkout-section">'
        + '<h2>Pase kòmand la</h2>'
        + (client ? '<p style="font-size:.78rem;color:var(--text-secondary);margin-bottom:.8rem;">Konekte kòm ' + escapeHTML(client.name) + ' &mdash; ' + escapeHTML(client.email) + '</p>' : '<p style="font-size:.78rem;color:var(--text-secondary);margin-bottom:.8rem;">Ou pa konekte. <a href="account.html" style="color:var(--accent);">Konekte oswa kreye yon kont</a> pou swiv kòmand ou.</p>')
        + '<form id="checkout-form" novalidate>'
        + '<div class="form-group"><label for="customer-name">Non konplè</label><input type="text" id="customer-name" required placeholder="Jan Dupont" value="' + (client ? escapeHTML(client.name) : '') + '"></div>'
        + '<div class="form-group"><label for="customer-phone">Telefòn</label><input type="tel" id="customer-phone" required placeholder="+509 12 34 56 78"></div>'
        + '<div class="form-group"><label for="customer-address">Adrès</label><textarea id="customer-address" required placeholder="..."></textarea></div>'
        + '<div class="form-group"><label for="customer-notes">Nòt</label><textarea id="customer-notes" placeholder="..."></textarea></div>'
        + '<button type="submit" class="btn btn-primary">Kòmande</button>'
        + '<p id="order-message" style="margin-top:1rem;"></p>'
        + '</form></div>';

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
                customer_email: client ? client.email : '',
                total: total,
                status: 'Ap tann',
                created_at: new Date().toLocaleString('fr-FR'),
                items: cart.map(i => ({ product_id: i.product_id, name: i.name, price: i.price, size: i.size, quantity: i.quantity }))
            });
            saveOrders(orders);
            localStorage.removeItem('eboutik_cart');
            updateCartBadge();

            content.innerHTML = '<div class="cart-empty" style="max-width:500px;margin:0 auto;">'
                + '<h2 style="font-size:1.6rem;">Mesci ' + escapeHTML(name) + '!</h2>'
                + '<p>Kòmand ou an te byen konfime. N ap kontakte ou byento.</p>'
                + '<div class="order-confirm-details">'
                + '<p><strong>N° kòmand:</strong> ' + orderId + '</p>'
                + '<p><strong>Total:</strong> ' + total.toFixed(2) + ' G</p>'
                + '<p><strong>Telefòn:</strong> ' + escapeHTML(phone) + '</p>'
                + '<p><strong>Adrès:</strong> ' + escapeHTML(address) + '</p>'
                + '</div>'
                + '<button class="btn btn-primary" onclick="window.location.href=\'catalog.html\'">Kontinye fè makèt</button>'
                + '</div>';
        };
    }
}
