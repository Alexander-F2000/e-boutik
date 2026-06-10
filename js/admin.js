const ALLOWED_ADMINS = ['admin', 'admin2'];

async function hashPassword(password) {
    const enc = new TextEncoder().encode(password);
    const buf = await crypto.subtle.digest('SHA-256', enc);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function getAdminCreds() {
    try { return JSON.parse(localStorage.getItem('eboutik_admin_creds')) || []; }
    catch { return []; }
}

function saveAdminCreds(creds) {
    localStorage.setItem('eboutik_admin_creds', JSON.stringify(creds));
}

function getAdminCred(username) {
    return getAdminCreds().find(c => c.username === username) || null;
}

document.addEventListener('DOMContentLoaded', async () => {
    await syncFromGitHub();

    document.getElementById('login-section').style.display = 'block';
    document.getElementById('register-section').style.display = 'none';

    if (sessionStorage.getItem('eboutik_admin')) {
        showDashboard();
    }

    document.getElementById('show-register-link')?.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('register-section').style.display = 'block';
        document.getElementById('register-error').textContent = '';
    });

    document.getElementById('show-login-link')?.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('register-section').style.display = 'none';
        document.getElementById('login-section').style.display = 'block';
        document.getElementById('login-error').textContent = '';
    });

    document.getElementById('register-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = document.getElementById('reg-user').value.trim();
        const pass = document.getElementById('reg-pass').value;
        const confirm = document.getElementById('reg-pass-confirm').value;
        const error = document.getElementById('register-error');

        if (!user || user.length < 3) { error.textContent = 'Erè: non itilizatè dwe gen 3 karaktè minimòm.'; return; }
        if (!ALLOWED_ADMINS.includes(user)) { error.textContent = 'Erè: non itilizatè pa otorize. Kontakte administratè a.'; return; }
        if (pass.length < 8) { error.textContent = 'Erè: modpas dwe gen 8 karaktè minimòm.'; return; }
        if (pass !== confirm) { error.textContent = 'Erè: modpas yo pa konfime.'; return; }

        const existing = getAdminCreds();
        if (getAdminCred(user)) { error.textContent = 'Erè: admin sa a deja gen yon modpas. Kontakte lòt admin an.'; return; }

        const hash = await hashPassword(pass);
        existing.push({ username: user, password: hash });
        saveAdminCreds(existing);
        sessionStorage.setItem('eboutik_admin', 'true');
        document.getElementById('register-error').textContent = '';
        document.getElementById('register-section').style.display = 'none';
        document.getElementById('login-section').style.display = 'none';
        showDashboard();
        document.getElementById('admin-user-display').textContent = 'Konekte kòm: ' + user;
        showNotification('Byenvini ' + user);
    });

    document.getElementById('login-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = document.getElementById('login-user').value.trim();
        const pass = document.getElementById('login-pass').value;
        const error = document.getElementById('login-error');
        const cred = getAdminCred(user);

        if (!cred) {
            error.textContent = 'Erè: kont admin "' + user + '" pa egziste. Kreye yon kont an premye.';
            return;
        }

        const hash = await hashPassword(pass);
        if (hash === cred.password) {
            error.textContent = '';
            sessionStorage.setItem('eboutik_admin', user);
            document.getElementById('login-section').style.display = 'none';
            showDashboard();
            document.getElementById('admin-user-display').textContent = 'Konekte kòm: ' + user;
            showNotification('Byenvini ' + user);
        } else {
            error.textContent = 'Erè: modpas pa kòrèk pou "' + user + '".';
        }
    });

    document.getElementById('logout-btn')?.addEventListener('click', () => {
        sessionStorage.removeItem('eboutik_admin');
        document.getElementById('dashboard-section').style.display = 'none';
        document.getElementById('login-section').style.display = 'block';
        document.getElementById('register-section').style.display = 'none';
    });

    document.querySelectorAll('[data-tab]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-tab]').forEach(b => {
                b.classList.remove('active');
            });
            btn.classList.add('active');
            document.querySelectorAll('.admin-tab-content').forEach(el => el.style.display = 'none');
            document.getElementById('tab-' + btn.dataset.tab).style.display = 'block';
            if (btn.dataset.tab === 'stock') { loadStockTab(); loadSaleProducts(); }
            if (btn.dataset.tab === 'sales') { loadSaleProducts(); updateSaleCalc(); }
            if (btn.dataset.tab === 'reports') loadReportsTab();
        });
    });

    document.getElementById('show-purchase-btn')?.addEventListener('click', () => {
        document.getElementById('purchase-form').style.display = 'block';
        document.getElementById('purchase-product').innerHTML = '';
        const products = getProducts();
        document.getElementById('purchase-product').innerHTML = products.map(p =>
            `<option value="${p.id}">${p.name} (Stòk: ${p.stock || 0})</option>`
        ).join('');
        document.getElementById('purchase-qty').value = 10;
        document.getElementById('purchase-cost').value = 0;
        document.getElementById('purchase-note').value = '';
        document.getElementById('purchase-calc').textContent = '';
    });

    document.getElementById('purchase-qty')?.addEventListener('input', () => {
        const qty = parseInt(document.getElementById('purchase-qty').value) || 0;
        const cost = parseFloat(document.getElementById('purchase-cost').value) || 0;
        document.getElementById('purchase-calc').textContent = qty > 0 && cost > 0
            ? 'Total: ' + (qty * cost).toFixed(2) + ' G'
            : '';
    });
    document.getElementById('purchase-cost')?.addEventListener('input', () => {
        const qty = parseInt(document.getElementById('purchase-qty').value) || 0;
        const cost = parseFloat(document.getElementById('purchase-cost').value) || 0;
        document.getElementById('purchase-calc').textContent = qty > 0 && cost > 0
            ? 'Total: ' + (qty * cost).toFixed(2) + ' G'
            : '';
    });

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

    document.getElementById('purchase-cancel')?.addEventListener('click', () => {
        document.getElementById('purchase-form').style.display = 'none';
    });

    document.getElementById('purchase-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const pid = parseInt(document.getElementById('purchase-product').value);
        const qty = parseInt(document.getElementById('purchase-qty').value) || 0;
        const cost = parseFloat(document.getElementById('purchase-cost').value) || 0;
        const note = document.getElementById('purchase-note').value.trim();
        if (!pid || qty <= 0 || cost <= 0) { alert('Ranpli tout chan yo.'); return; }
        addPurchase(pid, qty, cost, note);
        document.getElementById('purchase-form').style.display = 'none';
        loadStockTab();
    });

    document.getElementById('sale-qty')?.addEventListener('input', updateSaleCalc);
    document.getElementById('sale-type')?.addEventListener('change', updateSaleCalc);
    document.getElementById('sale-product')?.addEventListener('change', updateSaleCalc);

    document.getElementById('sale-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const pid = parseInt(document.getElementById('sale-product').value);
        const qty = parseInt(document.getElementById('sale-qty').value) || 0;
        const type = document.getElementById('sale-type').value;
        const msg = document.getElementById('sale-message');
        if (!pid || qty <= 0) { msg.className = 'error'; msg.textContent = 'Chwazi yon pwodui ak yon kantite.'; return; }
        const result = sellProduct(pid, qty, type);
        if (result.error) { msg.className = 'error'; msg.textContent = result.error; return; }
        msg.className = 'success';
        msg.textContent = 'Vant konfime! Total: ' + result.totalPrice.toFixed(2) + ' G, Bénéfis: ' + result.profit.toFixed(2) + ' G';
        document.getElementById('sale-qty').value = 1;
        updateSaleCalc();
        loadStockTab();
        if (document.getElementById('tab-reports').style.display !== 'none') loadReportsTab();
    });

    document.getElementById('product-image')?.addEventListener('change', (e) => {
        let url = e.target.value.trim();
        if (!url) return;
        if (url.startsWith('http://')) {
            url = url.replace('http://', 'https://');
            e.target.value = url;
        }
        showPreview(url);
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

    async function uploadImage(file) {
        const formData = new FormData();
        formData.append('image', file);
        try {
            const resp = await fetch('/api/upload.php', { method: 'POST', body: formData });
            if (resp.ok) {
                const data = await resp.json();
                return window.location.origin + '/' + data.url;
            }
        } catch {}
        return null;
    }

    document.getElementById('product-image-file')?.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const url = await uploadImage(file);
        if (url) {
            document.getElementById('product-image').value = url;
            showPreview(url);
        } else {
            compressImage(file, 800, 0.7, (compressed) => {
                document.getElementById('product-image').value = compressed;
                showPreview(compressed);
            });
        }
    });

    document.getElementById('product-image-hover')?.addEventListener('change', (e) => {
        const url = e.target.value.trim();
        if (url) showPreviewHover(url);
    });

    document.getElementById('product-image-hover-file')?.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const url = await uploadImage(file);
        if (url) {
            document.getElementById('product-image-hover').value = url;
            showPreviewHover(url);
        } else {
            compressImage(file, 800, 0.7, (compressed) => {
                document.getElementById('product-image-hover').value = compressed;
                showPreviewHover(compressed);
            });
        }
    });

    document.getElementById('product-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        try {
            const id = document.getElementById('product-id').value;
            const products = getProducts();

            const data = {
                name: document.getElementById('product-name').value.trim(),
                price: parseFloat(document.getElementById('product-price').value) || 0,
                costPrice: parseFloat(document.getElementById('product-costprice').value) || 0,
                wholesalePrice: parseFloat(document.getElementById('product-wholesaleprice').value) || 0,
                batchQuantity: parseInt(document.getElementById('product-batchquantity').value) || 0,
                batchPrice: parseFloat(document.getElementById('product-batchprice').value) || 0,
                alertThreshold: parseInt(document.getElementById('product-alertthreshold').value) || 5,
                description: document.getElementById('product-description').value.trim(),
                category: document.getElementById('product-category').value,
                sizes: document.getElementById('product-sizes').value.trim(),
                stock: parseInt(document.getElementById('product-stock').value) || 0,
                brand: document.getElementById('product-brand').value.trim(),
                material: document.getElementById('product-material').value.trim(),
                color: document.getElementById('product-color').value.trim(),
                image: document.getElementById('product-image').value || '',
                image_hover: document.getElementById('product-image-hover').value || ''
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
            loadStockTab();
        } catch(e) {
            console.error('Form submit erè:', e);
            alert('Yon erè rive lè sove pwodui a.');
        }
    });

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
    document.getElementById('register-section').style.display = 'none';
    document.getElementById('dashboard-section').style.display = 'block';
    loadProducts();
    loadOrders();
    loadCategories();
    loadStockTab();
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

const PLACEHOLDER_DATA = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNTAwIiB2aWV3Qm94PSIwIDAgNDAwIDUwMCI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSI1MDAiIGZpbGw9IiNmMGYwZjAiLz48cmVjdCB4PSIxNjAiIHk9IjIwMCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iOCIgZmlsbD0iI2QwZDBkMCIvPjx0ZXh0IHg9IjIwMCIgeT0iMzIwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iR2VvcmdpYSwgc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiPmUtYm91dGlrPC90ZXh0Pjwvc3ZnPg==";

function adminFallback(img) {
    img.onerror = null;
    img.src = PLACEHOLDER_DATA;
}

function showPreview(src) {
    const preview = document.getElementById('image-preview');
    if (!preview) return;
    const img = preview.querySelector('img');
    if (img) {
        let errMsg = preview.querySelector('.preview-error');
        if (!errMsg) {
            errMsg = document.createElement('p');
            errMsg.className = 'preview-error';
            errMsg.style.cssText = 'color:#b91c1c;font-size:.75rem;margin-top:.35rem;display:none;';
            preview.appendChild(errMsg);
        }
        img.onload = function() { errMsg.style.display = 'none'; };
        img.onerror = function() {
            adminFallback(this);
            errMsg.textContent = 'Imaj la pa ka chaje. Verifye URL la oswa eseye yon lòt imaj.';
            errMsg.style.display = 'block';
        };
        img.src = src;
    }
    preview.style.display = 'block';
}

function showPreviewHover(src) {
    const preview = document.getElementById('image-preview-hover');
    if (!preview) return;
    const img = preview.querySelector('img');
    if (img) {
        let errMsg = preview.querySelector('.preview-error');
        if (!errMsg) {
            errMsg = document.createElement('p');
            errMsg.className = 'preview-error';
            errMsg.style.cssText = 'color:#b91c1c;font-size:.75rem;margin-top:.35rem;display:none;';
            preview.appendChild(errMsg);
        }
        img.onload = function() { errMsg.style.display = 'none'; };
        img.onerror = function() {
            adminFallback(this);
            errMsg.textContent = 'Imaj la pa ka chaje. Verifye URL la oswa eseye yon lòt imaj.';
            errMsg.style.display = 'block';
        };
        img.src = src;
    }
    preview.style.display = 'block';
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
        document.getElementById('product-costprice').value = p.costPrice || 0;
        document.getElementById('product-wholesaleprice').value = p.wholesalePrice || 0;
        document.getElementById('product-batchquantity').value = p.batchQuantity || 0;
        document.getElementById('product-batchprice').value = p.batchPrice || 0;
        document.getElementById('product-alertthreshold').value = p.alertThreshold || 5;
        document.getElementById('product-description').value = p.description || '';
        document.getElementById('product-category').value = p.category || '';
        document.getElementById('product-sizes').value = p.sizes || '';
        document.getElementById('product-stock').value = p.stock || 0;
        document.getElementById('product-brand').value = p.brand || '';
        document.getElementById('product-material').value = p.material || '';
        document.getElementById('product-color').value = p.color || '';
        let imgVal = p.image || '';
        if (imgVal.startsWith('http://')) imgVal = imgVal.replace('http://', 'https://');
        document.getElementById('product-image').value = imgVal;
        document.getElementById('image-preview').style.display = 'none';
        if (imgVal) showPreview(imgVal);
        let imgHov = p.image_hover || '';
        if (imgHov.startsWith('http://')) imgHov = imgHov.replace('http://', 'https://');
        document.getElementById('product-image-hover').value = imgHov;
        document.getElementById('image-preview-hover').style.display = 'none';
        if (imgHov) showPreviewHover(imgHov);
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

function loadStockTab() {
    const tbody = document.getElementById('stock-table-body');
    const products = getProducts();
    const alerts = document.getElementById('stock-alerts');
    if (!tbody) return;
    const lowStock = products.filter(p => (p.stock || 0) <= p.alertThreshold);
    if (lowStock.length > 0) {
        alerts.innerHTML = '<div style="background:#fff3e0;border-radius:var(--radius-sm);padding:.8rem 1rem;font-size:.82rem;border-left:3px solid #ff9800;">\u26A0\uFE0F ' + lowStock.length + ' pwodui gen stòk ki ba: '
            + lowStock.map(p => '<strong>' + p.name + '</strong> (' + (p.stock || 0) + ' / ' + p.alertThreshold + ')').join(', ')
            + '</div>';
    } else {
        alerts.innerHTML = '<div style="background:#e8f5e9;border-radius:var(--radius-sm);padding:.5rem 1rem;font-size:.82rem;color:#2e7d32;">\u2705 Tout pwodui gen ase stòk</div>';
    }
    tbody.innerHTML = products.map(p => {
        const st = p.stock || 0;
        const warn = st <= p.alertThreshold;
        return '<tr' + (warn ? ' style="background:#fff8e1;"' : '') + '>'
            + '<td>' + p.name + '</td>'
            + '<td' + (warn ? ' style="color:#d32f2f;font-weight:600;"' : '') + '>' + st + '</td>'
            + '<td>' + (p.costPrice || 0).toFixed(2) + ' G</td>'
            + '<td>' + parseFloat(p.price).toFixed(2) + ' G</td>'
            + '<td>' + p.alertThreshold + '</td>'
            + '<td>' + (warn ? '<span style="color:#d32f2f;font-size:1.1rem;">\u26A0\uFE0F</span>' : '<span style="color:#2e7d32;">\u2713</span>') + '</td>'
            + '</tr>';
    }).join('') || '<tr><td colspan="6" style="text-align:center;color:var(--text-light);padding:2rem;">Pa gen pwodui</td></tr>';
}

function loadSaleProducts() {
    const select = document.getElementById('sale-product');
    if (!select) return;
    const products = getProducts();
    select.innerHTML = products.map(p =>
        '<option value="' + p.id + '">' + p.name + ' (Stòk: ' + (p.stock || 0) + ')</option>'
    ).join('');
}

function updateSaleCalc() {
    const pid = parseInt(document.getElementById('sale-product')?.value);
    const qty = parseInt(document.getElementById('sale-qty')?.value) || 0;
    const type = document.getElementById('sale-type')?.value;
    if (!pid || qty <= 0) {
        document.getElementById('sale-unit-price-display').textContent = '0.00 G';
        document.getElementById('sale-total-display').textContent = '0.00 G';
        document.getElementById('sale-profit-display').textContent = '';
        document.getElementById('sale-batch-detail').style.display = 'none';
        document.getElementById('sale-discount').style.display = 'none';
        return;
    }
    const products = getProducts();
    const p = products.find(x => x.id == pid);
    if (!p) return;
    let unitPrice = 0, totalPrice = 0, profit = 0;
    let batchDetail = '', discountText = '';
    if (type === 'EN_GROS') {
        unitPrice = p.wholesalePrice || p.price;
        totalPrice = Math.round(unitPrice * qty * 100) / 100;
    } else if (type === 'BATCH' && p.batchQuantity > 0) {
        const batchQty = p.batchQuantity;
        const batchP = p.batchPrice || 0;
        const normalUnitPrice = p.price;
        const fullBatches = Math.floor(qty / batchQty);
        const remainder = qty % batchQty;
        const batchTotal = fullBatches * batchP;
        const remainderTotal = remainder * normalUnitPrice;
        totalPrice = Math.round((batchTotal + remainderTotal) * 100) / 100;
        unitPrice = qty > 0 ? totalPrice / qty : 0;
        if (fullBatches > 0) {
            batchDetail = fullBatches + ' lot x ' + batchP.toFixed(2) + ' G = ' + batchTotal.toFixed(2) + ' G';
            if (remainder > 0) {
                batchDetail += ' + rès ' + remainder + ' inite x ' + normalUnitPrice.toFixed(2) + ' G = ' + remainderTotal.toFixed(2) + ' G';
            }
            const normalBatchPrice = batchQty * normalUnitPrice;
            if (normalBatchPrice > 0) {
                const disc = Math.round(((normalBatchPrice - batchP) / normalBatchPrice) * 100);
                discountText = 'Rabais: -' + disc + '%';
            }
        } else {
            unitPrice = normalUnitPrice;
            totalPrice = Math.round(unitPrice * qty * 100) / 100;
            batchDetail = 'Mwens ke yon lot. Pri inite nòmal aplike.';
        }
    } else {
        unitPrice = p.price;
        totalPrice = Math.round(unitPrice * qty * 100) / 100;
    }
    profit = Math.round((unitPrice - (p.costPrice || 0)) * qty * 100) / 100;
    document.getElementById('sale-unit-price-display').textContent = unitPrice.toFixed(2) + ' G';
    document.getElementById('sale-total-display').textContent = totalPrice.toFixed(2) + ' G';
    const profitEl = document.getElementById('sale-profit-display');
    if (profit >= 0) {
        profitEl.innerHTML = '\uD83D\uDCB0 Bénéfis estime: <strong style="color:#2e7d32;">' + profit.toFixed(2) + ' G</strong>';
    } else {
        profitEl.innerHTML = '\uD83D\uDCC9 Pèt estime: <strong style="color:#d32f2f;">' + Math.abs(profit).toFixed(2) + ' G</strong>';
    }
    const batchEl = document.getElementById('sale-batch-detail');
    if (batchDetail) {
        batchEl.style.display = 'block';
        batchEl.textContent = batchDetail;
    } else {
        batchEl.style.display = 'none';
    }
    const discEl = document.getElementById('sale-discount');
    if (discountText) {
        discEl.style.display = 'block';
        discEl.textContent = discountText;
    } else {
        discEl.style.display = 'none';
    }
}

function loadReportsTab() {
    const tbody = document.getElementById('transactions-table-body');
    if (!tbody) return;
    const txns = getTransactions();
    const sales = txns.filter(t => t.type === 'VENTE');
    const totalSales = sales.reduce((s, t) => s + t.totalPrice, 0);
    const totalProfit = sales.reduce((s, t) => s + t.profit, 0);
    const simpleSales = sales.filter(t => t.saleType === 'SIMPLE').reduce((s, t) => s + t.totalPrice, 0);
    const wholesaleSales = sales.filter(t => t.saleType === 'EN_GROS').reduce((s, t) => s + t.totalPrice, 0);
    document.getElementById('stat-total-sales').textContent = totalSales.toFixed(2) + ' G';
    document.getElementById('stat-total-profit').textContent = totalProfit.toFixed(2) + ' G';
    document.getElementById('stat-simple-sales').textContent = simpleSales.toFixed(2) + ' G';
    document.getElementById('stat-wholesale-sales').textContent = wholesaleSales.toFixed(2) + ' G';
    tbody.innerHTML = txns.slice().reverse().map(t => {
        const isSale = t.type === 'VENTE';
        return '<tr>'
            + '<td style="font-size:.75rem;">' + (t.createdAt || '—') + '</td>'
            + '<td><span style="padding:.15rem .5rem;border-radius:4px;font-size:.7rem;font-weight:500;'
            + (isSale ? 'background:#e8f5e9;color:#2e7d32;">VENTE' : 'background:#e3f2fd;color:#1565c0;">ACHAT')
            + (t.saleType && isSale ? ' (' + t.saleType + ')' : '') + '</span></td>'
            + '<td>' + (t.productName || '—') + '</td>'
            + '<td>' + t.quantity + '</td>'
            + '<td>' + (t.totalPrice || 0).toFixed(2) + ' G</td>'
            + '<td style="color:' + (isSale ? (t.profit >= 0 ? '#2e7d32' : '#d32f2f') : '#999') + ';">'
            + (isSale ? (t.profit || 0).toFixed(2) + ' G' : '—') + '</td>'
            + '<td><button class="btn btn-outline btn-sm" onclick="deleteTransaction(' + t.id + ');loadReportsTab();loadStockTab();">Siprime</button></td>'
            + '</tr>';
    }).join('') || '<tr><td colspan="7" style="text-align:center;color:var(--text-light);padding:2rem;">Pa gen tranzaksyon</td></tr>';
}
