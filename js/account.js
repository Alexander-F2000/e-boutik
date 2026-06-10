async function hashPassword(password) {
    const enc = new TextEncoder().encode(password);
    const buf = await crypto.subtle.digest('SHA-256', enc);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function getClientAccounts() {
    try { return JSON.parse(localStorage.getItem('eboutik_clients')) || []; }
    catch { return []; }
}

function saveClientAccounts(accounts) {
    localStorage.setItem('eboutik_clients', JSON.stringify(accounts));
}

function getLoggedInClient() {
    try { return JSON.parse(sessionStorage.getItem('eboutik_client')); }
    catch { return null; }
}

function showAccountLogin() {
    document.getElementById('account-register-section').style.display = 'none';
    document.getElementById('account-login-section').style.display = 'block';
}

function showAccountRegister() {
    document.getElementById('account-login-section').style.display = 'none';
    document.getElementById('account-register-section').style.display = 'block';
}

function loadClientOrders(email) {
    const container = document.getElementById('account-orders-list');
    const orders = getOrders().filter(o => o.customer_email === email);
    if (!orders.length) {
        container.innerHTML = '<div class="account-order" style="text-align:center;color:var(--text-light);padding:1.5rem;">Ou pa gen kòmand ankò.</div>';
        return;
    }
    container.innerHTML = orders.slice().reverse().map(o => {
        const statusClass = o.status === 'Ap tann' ? 'pending' : o.status === 'Konfime' ? 'confirmed' : '';
        return '<div class="account-order">'
            + '<div class="account-order-header">'
            + '<span class="account-order-id"># Kòmand ' + o.id + '</span>'
            + '<span class="account-order-status ' + statusClass + '">' + (o.status || 'Ap tann') + '</span>'
            + '</div>'
            + '<div class="account-order-date">' + (o.created_at || '') + '</div>'
            + '<div class="account-order-total">Total: ' + (o.total || 0).toFixed(2) + ' G</div>'
            + '</div>';
    }).join('');
}

document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
    const client = getLoggedInClient();
    if (client) {
        document.getElementById('account-login-section').style.display = 'none';
        document.getElementById('account-register-section').style.display = 'none';
        document.getElementById('account-dashboard').style.display = 'block';
        document.getElementById('account-user-display').textContent = client.name + ' (' + client.email + ')';
        loadClientOrders(client.email);
    } else {
        document.getElementById('account-login-section').style.display = 'block';
    }

    document.getElementById('account-login-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('account-login-email').value.trim();
        const pass = document.getElementById('account-login-pass').value;
        const error = document.getElementById('account-login-error');
        const accounts = getClientAccounts();
        const hash = await hashPassword(pass);
        const found = accounts.find(a => a.email === email && a.password === hash);
        if (found) {
            sessionStorage.setItem('eboutik_client', JSON.stringify(found));
            document.getElementById('account-login-section').style.display = 'none';
            document.getElementById('account-dashboard').style.display = 'block';
            document.getElementById('account-user-display').textContent = found.name + ' (' + found.email + ')';
            loadClientOrders(found.email);
            error.textContent = '';
            showNotification('Byenvini ' + found.name);
        } else {
            const exists = accounts.find(a => a.email === email);
            if (exists) {
                error.textContent = 'Erè: modpas pa kòrèk pou ' + email + '.';
            } else {
                error.textContent = 'Erè: kont ' + email + ' pa egziste. Kreye yon kont an premye.';
            }
        }
    });

    document.getElementById('account-register-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('account-reg-email').value.trim();
        const name = document.getElementById('account-reg-name').value.trim();
        const pass = document.getElementById('account-reg-pass').value;
        const error = document.getElementById('account-register-error');
        if (!email || !name || !pass) { error.textContent = 'Erè: ranpli tout chan yo.'; return; }
        if (pass.length < 8) { error.textContent = 'Erè: modpas dwe gen 8 karaktè minimòm.'; return; }
        let accounts = getClientAccounts();
        if (accounts.find(a => a.email === email)) {
            error.textContent = 'Erè: imèl ' + email + ' deja enskri.';
            return;
        }
        const hash = await hashPassword(pass);
        const newClient = { email, name, password: hash, createdAt: new Date().toISOString() };
        accounts.push(newClient);
        saveClientAccounts(accounts);
        sessionStorage.setItem('eboutik_client', JSON.stringify(newClient));
        document.getElementById('account-register-section').style.display = 'none';
        document.getElementById('account-dashboard').style.display = 'block';
        document.getElementById('account-user-display').textContent = newClient.name + ' (' + newClient.email + ')';
        loadClientOrders(newClient.email);
        error.textContent = '';
        showNotification('Byenvini ' + name);
    });

    document.getElementById('account-logout-btn')?.addEventListener('click', () => {
        sessionStorage.removeItem('eboutik_client');
        document.getElementById('account-dashboard').style.display = 'none';
        document.getElementById('account-login-section').style.display = 'block';
    });
});
