// Register Service Worker for offline support
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
        .catch(function(err) { console.warn('SW registration failed:', err); });
}

document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('menu-toggle');
    const links = document.getElementById('nav-links');
    const overlay = document.getElementById('mobile-overlay');

    if (!toggle || !links) return;

    function closeMenu() {
        toggle.classList.remove('open');
        links.classList.remove('open');
        if (overlay) overlay.classList.remove('show');
        toggle.setAttribute('aria-expanded', 'false');
    }

    function openMenu() {
        toggle.classList.add('open');
        links.classList.add('open');
        if (overlay) overlay.classList.add('show');
        toggle.setAttribute('aria-expanded', 'true');
    }

    toggle.addEventListener('click', () => {
        if (links.classList.contains('open')) closeMenu();
        else openMenu();
    });

    toggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (links.classList.contains('open')) closeMenu();
            else openMenu();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && links.classList.contains('open')) {
            closeMenu();
            toggle.focus();
        }
    });

    if (overlay) overlay.addEventListener('click', closeMenu);

    links.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

    // Show/hide Admin link based on admin session
    const adminLink = document.querySelector('a[href="admin.html"]');
    if (adminLink) {
        const adminUser = sessionStorage.getItem('eboutik_admin');
        let isAdmin = false;
        if (adminUser) {
            try {
                const creds = JSON.parse(localStorage.getItem('eboutik_admin_creds')) || [];
                isAdmin = creds.some(function(c) { return c.username === adminUser; });
            } catch(e) { /* ignore parse errors */ }
        }
        if (!isAdmin) adminLink.style.display = 'none';
    }
});