document.addEventListener('DOMContentLoaded', () => {
    if (sessionStorage.getItem('eboutik_admin') === 'true') {
        showDashboard();
    }

    document.getElementById('login-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = document.getElementById('login-user').value;
        const pass = document.getElementById('login-pass').value;
        const error = document.getElementById('login-error');

        if (user === 'admin' && pass === 'admin') {
            document.getElementById('login-error').textContent = '';
            sessionStorage.setItem('eboutik_admin', 'true');
            showDashboard();
        } else {
            error.textContent = 'Idantifyan yo pa kòrèk.';
        }
    });

    document.getElementById('logout-btn')?.addEventListener('click', () => {
        sessionStorage.removeItem('eboutik_admin');
        document.getElementById('dashboard-section').style.display = 'none';
        document.getElementById('login-section').style.display = 'block';
    });

    // Tabs
    document.querySelectorAll('[data-tab]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-tab]').forEach(b => {
                b.classList.remove('active');
            });
            btn.classList.add('active');
            document.querySelectorAll('.admin-tab-content').forEach(el => el.style.display = 'none');
            document.getElementById('tab-' + btn.dataset.tab).style.display = 'block';
        });
    });

    // Products
    document.getElementById('show-add-form-btn')?.addEventListener('click', () => {
        const form = document.getElementById('product-form');
        form.style.display = 'block';
        form.reset();
        document.getElementById('product-id').value = '';
        document.getElementById('product-form-submit').textContent = 'Ajoute';
        document.getElementById('product-form-cancel').style.display = 'none';
        document.getElementById('image-preview').style.display = 'none';
        loadCategorySelect();
    });

    document.getElementById('product-form-cancel')?.addEventListener('click', () => {
        document.getElementById('product-form').style.display = 'none';
        document.getElementById('image-preview').style.display = 'none';
    });

    document.getElementById('product-image')?.addEventListener('input', (e) => {
        let url = e.target.value;
        if (url && url.startsWith('http://')) {
            url = url.replace('http://', 'https://');
            e.target.value = url;
        }
        if (url) showPreview(url);
    });

    function compressImage(file, maxW, quality, cb) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let w = img.width, h = img.height;
                if (w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
                canvas.width = w; canvas.height = h;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, w, h);
                cb(canvas.toDataURL('image/jpeg', quality));
            };
            img.onerror = () => { alert('Imaj la pa ka chaje. Tcheke fichye a.'); };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    }

    document.getElementById('product-image-file')?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        compressImage(file, 800, 0.7, (compressed) => {
            document.getElementById('product-image').value = compressed;
            showPreview(compressed);
        });
    });

    document.getElementById('product-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        try {
            const id = document.getElementById('product-id').value;
            const products = getProducts();

            const data = {
                name: document.getElementById('product-name').value.trim(),
                price: parseFloat(document.getElementById('product-price').value) || 0,
                description: document.getElementById('product-description').value.trim(),
                category: document.getElementById('product-category').value,
                sizes: document.getElementById('product-sizes').value.trim(),
                stock: parseInt(document.getElementById('product-stock').value) || 0,
                image: document.getElementById('product-image').value || 'img/placeholder.svg'
            };

            if (!data.name) { alert('Tanpri antre non pwodui a.'); return; }
            if (!data.price) { alert('Tanpri antre pri a.'); return; }

            if (id) {
                const idx = products.findIndex(p => String(p.id) === String(id));
                if (idx !== -1) { products[idx] = { ...products[idx], ...data }; }
            } else {
                data.id = Date.now();
                products.push(data);
            }

            saveProducts(products);
            document.getElementById('product-form').style.display = 'none';
            loadProducts();
        } catch(e) {
            console.error('Form submit erè:', e);
            alert('Yon erè rive lè sove pwodui a.');
        }
    });

    // Categories
    document.getElementById('show-add-cat-btn')?.addEventListener('click', () => {
        const form = document.getElementById('category-form');
        form.style.display = 'block';
        form.reset();
        document.getElementById('category-id').value = '';
        document.getElementById('category-form-submit').textContent = 'Ajoute';
        document.getElementById('category-form-cancel').style.display = 'none';
    });

    document.getElementById('category-form-cancel')?.addEventListener('click', () => {
        document.getElementById('category-form').style.display = 'none';
    });

    document.getElementById('category-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('category-id').value;
        const name = document.getElementById('category-name').value.trim();
        if (!name) return;

        let categories = getCategories();

        if (id) {
            categories = categories.map(c => c.id == id ? { ...c, name } : c);
        } else {
            categories.push({ id: Date.now(), name });
        }

        saveCategories(categories);
        document.getElementById('category-form').style.display = 'none';
        loadCategories();
        loadCategorySelect();
    });
});

function showDashboard() {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('dashboard-section').style.display = 'block';
    loadProducts();
    loadOrders();
    loadCategories();
}

function loadProducts() {
    const tbody = document.getElementById('products-table-body');
    const products = getProducts();
    tbody.innerHTML = products.map(p => `
        <tr>
            <td>${p.id}</td>
            <td>${p.name}</td>
            <td>${parseFloat(p.price).toFixed(2)} G</td>
            <td>${p.category || '—'}</td>
            <td>${p.stock || 0}</td>
            <td>
                <button class="btn btn-primary btn-sm" onclick="editProduct(${p.id})">Modifye</button>
                <button class="btn btn-danger btn-sm" onclick="deleteProduct(${p.id})">Siprime</button>
            </td>
        </tr>
    `).join('') || '<tr><td colspan="6" style="text-align:center;color:var(--text-light);padding:2rem;">Pa gen pwodui</td></tr>';
}

function showPreview(src) {
    const preview = document.getElementById('image-preview');
    if (!preview) { console.error('showPreview: pa jwenn image-preview'); return; }
    const img = preview.querySelector('img');
    if (img) {
        img.onerror = function() { console.error('Imaj la pa ka chaje:', this.src.substring(0,100)); this.src = 'img/placeholder.svg'; this.onerror = null; };
        img.src = src;
        console.log('showPreview: mete imaj ->', src.substring(0,80));
    } else {
        console.error('showPreview: pa jwenn img anndan preview');
    }
    preview.style.display = 'block';
    console.log('showPreview: preview visible');
}

function editProduct(id) {
    try {
        const products = getProducts();
        const p = products.find(x => x.id == id);
        if (!p) { console.error('EditProduct: pa jwenn pwodui #', id); return; }
        document.getElementById('product-form').style.display = 'block';
        loadCategorySelect(p.category);
        document.getElementById('product-id').value = p.id;
        document.getElementById('product-name').value = p.name;
        document.getElementById('product-price').value = p.price;
        document.getElementById('product-description').value = p.description || '';
        document.getElementById('product-category').value = p.category || '';
        document.getElementById('product-sizes').value = p.sizes || '';
        document.getElementById('product-stock').value = p.stock || 0;
        let imgVal = p.image || '';
        if (imgVal.startsWith('http://')) imgVal = imgVal.replace('http://', 'https://');
        document.getElementById('product-image').value = imgVal;
        document.getElementById('image-preview').style.display = 'none';
        if (imgVal) showPreview(imgVal);
        document.getElementById('product-form-submit').textContent = 'Modifye';
        document.getElementById('product-form-cancel').style.display = 'inline-block';
    } catch(e) {
        console.error('EditProduct erè:', e);
        alert('Yon erè rive lè modifye pwodui a. Kontrole console a.');
    }
}

function deleteProduct(id) {
    if (!confirm('Siprime pwodui sa a?')) return;
    let products = getProducts().filter(p => p.id != id);
    saveProducts(products);
    loadProducts();
}

function loadCategories() {
    const tbody = document.getElementById('categories-table-body');
    const categories = getCategories();
    tbody.innerHTML = categories.map(c => `
        <tr>
            <td>${c.id}</td>
            <td>${c.name}</td>
            <td>
                <button class="btn btn-primary btn-sm" onclick="editCategory(${c.id})">Modifye</button>
                <button class="btn btn-danger btn-sm" onclick="deleteCategory(${c.id})">Siprime</button>
            </td>
        </tr>
    `).join('') || '<tr><td colspan="3" style="text-align:center;color:var(--text-light);padding:2rem;">Pa gen kategori</td></tr>';
}

function editCategory(id) {
    const categories = getCategories();
    const c = categories.find(x => x.id == id);
    if (!c) return;
    document.getElementById('category-id').value = c.id;
    document.getElementById('category-name').value = c.name;
    document.getElementById('category-form-submit').textContent = 'Modifye';
    document.getElementById('category-form-cancel').style.display = 'inline-block';
    document.getElementById('category-form').style.display = 'block';
}

function deleteCategory(id) {
    if (!confirm('Siprime kategori sa a?')) return;
    let categories = getCategories().filter(c => c.id != id);
    saveCategories(categories);
    loadCategories();
    loadCategorySelect();
}

function loadCategorySelect(selected) {
    const select = document.getElementById('product-category');
    const categories = getCategories();
    select.innerHTML = categories.map(c =>
        `<option value="${c.name}" ${c.name === selected ? 'selected' : ''}>${c.name}</option>`
    ).join('');
}

function loadOrders() {
    const tbody = document.getElementById('orders-table-body');
    const orders = getOrders();
    const statuses = ['Ap tann', 'Konfime', 'Anile'];
    tbody.innerHTML = orders.map(o => `
        <tr>
            <td>${o.id}</td>
            <td>${o.customer_name}</td>
            <td>${parseFloat(o.total).toFixed(2)} G</td>
            <td>
                <select class="order-status-select" data-order-id="${o.id}"
                    style="padding:.25rem .4rem;border:1px solid var(--border);border-radius:4px;font-family:var(--font-sans);font-size:.75rem;">
                    ${statuses.map(s => `<option value="${s}" ${o.status === s ? 'selected' : ''}>${s}</option>`).join('')}
                </select>
            </td>
            <td>${o.created_at || '—'}</td>
            <td><button class="btn btn-outline btn-sm" onclick="showOrderDetail(${o.id})">Detay</button></td>
        </tr>
    `).join('') || '<tr><td colspan="6" style="text-align:center;color:var(--text-light);padding:2rem;">Pa gen kòmand</td></tr>';

    tbody.querySelectorAll('.order-status-select').forEach(sel => {
        sel.addEventListener('change', () => {
            const all = getOrders();
            const order = all.find(o => o.id == sel.dataset.orderId);
            if (order) {
                order.status = sel.value;
                saveOrders(all);
            }
        });
    });
}

function showOrderDetail(id) {
    const orders = getOrders();
    const order = orders.find(o => o.id == id);
    if (!order) return;

    const existing = document.querySelector('.size-picker-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'size-picker-overlay';
    overlay.innerHTML = `
        <div class="size-picker-modal" style="max-width:500px;">
            <button class="size-picker-close" aria-label="Fèmen">&times;</button>
            <div style="padding:2rem;">
                <h3 style="margin-bottom:1rem;font-family:var(--font-serif);">Detay kòmand #${order.id}</h3>
                <div class="order-confirm-details">
                    <p><strong>Kliyan:</strong> ${order.customer_name}</p>
                    ${order.customer_phone ? `<p><strong>Telefòn:</strong> ${order.customer_phone}</p>` : ''}
                    ${order.customer_address ? `<p><strong>Adrès:</strong> ${order.customer_address}</p>` : ''}
                    <p><strong>Total:</strong> ${parseFloat(order.total).toFixed(2)} G</p>
                    <p><strong>Estati:</strong> ${order.status}</p>
                    <p><strong>Dat:</strong> ${order.created_at}</p>
                </div>
                <h4 style="margin:1rem 0 .5rem;font-size:.9rem;">Atik yo:</h4>
                <ul style="list-style:none;padding:0;">
                    ${(order.items || []).map(i => `
                        <li style="padding:.4rem 0;border-bottom:1px solid var(--border-light);font-size:.85rem;display:flex;justify-content:space-between;">
                            <span>${i.name} ${i.size ? '(' + i.size + ')' : ''} x${i.quantity}</span>
                            <span style="font-weight:500;">${(i.price * i.quantity).toFixed(2)} G</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    overlay.querySelector('.size-picker-close').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
}
