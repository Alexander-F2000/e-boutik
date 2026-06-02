document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('menu-toggle');
    const links = document.getElementById('nav-links');
    const overlay = document.getElementById('mobile-overlay');

    if (!toggle || !links) return;

    function closeMenu() {
        toggle.classList.remove('open');
        links.classList.remove('open');
        if (overlay) overlay.classList.remove('show');
    }

    function openMenu() {
        toggle.classList.add('open');
        links.classList.add('open');
        if (overlay) overlay.classList.add('show');
    }

    toggle.addEventListener('click', () => {
        if (links.classList.contains('open')) closeMenu();
        else openMenu();
    });

    if (overlay) overlay.addEventListener('click', closeMenu);

    links.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
});