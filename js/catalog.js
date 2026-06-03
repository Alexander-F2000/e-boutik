document.addEventListener('DOMContentLoaded', async () => {
    await syncFromGitHub();
    updateCartBadge();

    const grid = document.getElementById('product-grid');
    const filters = document.getElementById('filters');
    const searchInput = document.getElementById('search-input');
    const resultsCount = document.getElementById('results-count');
    let currentFilter = 'all';
    let searchQuery = '';

    const categories = getCategories();
    filters.innerHTML = '<button class="active" data-filter="all">Tout</button>' +
        categories.map(c => `<button data-filter="${c.name}">${c.name}</button>`).join('');

    filters.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
            filters.querySelectorAll('button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            render();
        });
    });

    searchInput.addEventListener('input', () => {
        searchQuery = searchInput.value.toLowerCase().trim();
        render();
    });

    function render() {
        const products = getProducts();
        const byCategory = currentFilter === 'all'
            ? products
            : products.filter(p => p.category === currentFilter);

        const filtered = searchQuery
            ? byCategory.filter(p =>
                (p.name && p.name.toLowerCase().includes(searchQuery)) ||
                (p.category && p.category.toLowerCase().includes(searchQuery)) ||
                (p.description && p.description.toLowerCase().includes(searchQuery))
              )
            : byCategory;

        if (resultsCount) {
            const total = filtered.length;
            resultsCount.textContent = total + ' rezilta' + (total > 1 ? ' yo' : '');
        }

        if (filtered.length === 0) {
            grid.innerHTML = '<p style="text-align:center;color:var(--text-light);padding:3rem 0;">Pa gen pwodui jwenn.</p>';
        } else {
            grid.innerHTML = filtered.map(p => renderProductCard(p)).join('');
        }
    }

    render();
});