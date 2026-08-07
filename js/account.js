// ============================================================
// SECURITE - audit 2026-08-01 - MIGRE vers Supabase Auth
// L'ancienne auth (hash SHA-256 cote client + localStorage) etait
// falsifiable : n'importe qui pouvait modifier localStorage ou
// recalculer un hash. Les mots de passe n'etaient jamais proteges.
//
// -> Supabase Auth : email/mot de passe verifies cote serveur
//    (bcrypt), sessions JWT, la colonne clients.password est
//    desormais obsolete (source: auth.users). Une ligne `clients`
//    est creee automatiquement par le trigger on_auth_user_created.
// ============================================================

// Client Supabase Auth (cle anon publique, ok cote client)
const SUPABASE = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

// Convenience (non-securitaire, pour le pre-remplissage du panier) :
// seuls name + email sont copies en sessionStorage. Le mot de passe
// n'y figure JAMAIS et aucune permission n'en depend (la vraie session
// reste la JWT de Supabase Auth, enforcee par RLS cote serveur).
function setCartClientMirror(user) {
    const name = (user && user.user_metadata && user.user_metadata.name) || '';
    sessionStorage.setItem('eboutik_client', JSON.stringify({ email: (user && user.email) || '', name }));
}

function clearCartClientMirror() {
    sessionStorage.removeItem('eboutik_client');
}

// Affiche le dashboard si une session valide existe
function showDashboard(user) {
    document.getElementById('account-login-section').style.display = 'none';
    document.getElementById('account-register-section').style.display = 'none';
    document.getElementById('account-dashboard').style.display = 'block';
    const name = (user && user.user_metadata && user.user_metadata.name) || user.email || '';
    document.getElementById('account-user-display').textContent = name + ' (' + (user.email || '') + ')';
    if (user && user.email) loadClientOrders(user.email);
    setCartClientMirror(user);
}

document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();

    // Restaure une session existante (localStorage de supabase-js)
    SUPABASE.auth.getSession().then(({ data }) => {
        if (data.session) {
            showDashboard(data.session.user);
        } else {
            document.getElementById('account-login-section').style.display = 'block';
        }
    });

    document.getElementById('account-login-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('account-login-email').value.trim();
        const pass = document.getElementById('account-login-pass').value;
        const error = document.getElementById('account-login-error');
        error.textContent = '';

        const { data, error: authError } = await SUPABASE.auth.signInWithPassword({
            email,
            password: pass
        });

        if (authError) {
            error.textContent = authError.message === 'Invalid login credentials'
                ? 'Erè: imèl oswa modpas pa kòrèk.'
                : 'Erè: ' + authError.message;
            return;
        }
        const user = data.user;
        showDashboard(user);
        showNotification('Byenvini ' + ((user.user_metadata && user.user_metadata.name) || email));
    });

    document.getElementById('account-register-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('account-reg-email').value.trim();
        const name = document.getElementById('account-reg-name').value.trim();
        const pass = document.getElementById('account-reg-pass').value;
        const error = document.getElementById('account-register-error');
        error.textContent = '';
        if (!email || !name || !pass) { error.textContent = 'Erè: ranpli tout chan yo.'; return; }
        if (pass.length < 8) { error.textContent = 'Erè: modpas dwe gen 8 karaktè minimòm.'; return; }

        const { data, error: err } = await SUPABASE.auth.signUp({
            email,
            password: pass,
            options: { data: { name } }
        });

        if (err) {
            error.textContent = err.message === 'User already registered'
                ? 'Erè: imèl ' + email + ' deja enskri.'
                : 'Erè: ' + err.message;
            return;
        }

        // Confirmation email active par defaut sur projet hebergé :
        // l'utilisateur doit confirmer avant de pouvoir se connecter.
        if (data.session) {
            showDashboard(data.user);
            showNotification('Byenvini ' + name);
        } else {
            document.getElementById('account-register-section').style.display = 'none';
            document.getElementById('account-login-section').style.display = 'block';
            document.getElementById('account-login-error').textContent =
                'Kont kreye! Tcheke ' + email + ' pou konfime imèl ou, epitou konekte.';
        }
    });

    document.getElementById('account-logout-btn')?.addEventListener('click', async () => {
        await SUPABASE.auth.signOut();
        clearCartClientMirror();
        document.getElementById('account-dashboard').style.display = 'none';
        document.getElementById('account-login-section').style.display = 'block';
    });
});