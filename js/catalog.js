document.addEventListener('DOMContentLoaded', async () => {
    await syncFromSupabase();
    updateCartBadge();

    const grid = document.getElementById('product-grid');
    const filters = document.getElementById('filters');
    const searchInput = document.getElementById('search-input');
    const resultsCount = document.getElementById('results-count');
    let currentFilter = 'all';
    let searchQuery = '';
    let currentPage = 1;
    const PER_PAGE = 12;

    const categories = getCategories();
    filters.innerHTML = '<button class="active" data-filter="all">Tout</button>' +
        categories.map(function(c) { return '<button data-filter="' + escapeHTML(c.name) + '">' + escapeHTML(c.name) + '</button>'; }).join('');

    filters.querySelectorAll('button').forEach(function(btn) {
        btn.addEventListener('click', function() {
            filters.querySelectorAll('button').forEach(function(b) { b.classList.remove('active'); });
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            currentPage = 1;
            render();
        });
    });

    searchInput.addEventListener('input', function() {
        searchQuery = searchInput.value.toLowerCase().trim();
        currentPage = 1;
        render();
    });

    function render() {
        var products = getProducts();
        var byCategory = currentFilter === 'all'
            ? products
            : products.filter(function(p) { return p.category === currentFilter; });

        var filtered = searchQuery
            ? byCategory.filter(function(p) {
                return (p.name && p.name.toLowerCase().includes(searchQuery)) ||
                       (p.category && p.category.toLowerCase().includes(searchQuery)) ||
                       (p.description && p.description.toLowerCase().includes(searchQuery));
              })
            : byCategory;

        var total = filtered.length;
        if (resultsCount) {
            resultsCount.textContent = total + ' rezilta' + (total > 1 ? ' yo' : '');
        }

        var totalPages = Math.ceil(total / PER_PAGE);
        if (currentPage > totalPages) currentPage = totalPages || 1;

        var start = (currentPage - 1) * PER_PAGE;
        var pageItems = filtered.slice(start, start + PER_PAGE);

        if (total === 0) {
            grid.innerHTML = '<p style="text-align:center;color:var(--text-light);padding:3rem 0;">Pa gen pwodui jwenn.</p>';
            return;
        }

        var html = pageItems.map(function(p) { return renderProductCard(p); }).join('');

        // Pagination controls
        if (totalPages > 1) {
            html += '<div class="pagination" style="display:flex;justify-content:center;gap:.5rem;margin-top:2rem;">';

            // Prev button
            html += '<button class="btn btn-outline btn-sm" onclick="window.paginate(' + (currentPage - 1) + ')"'
                + (currentPage <= 1 ? ' disabled style="opacity:0.4;cursor:not-allowed;"' : '') + '>Anvan</button>';

            // Page numbers (show max 5 pages)
            var pageStart = Math.max(1, currentPage - 2);
            var pageEnd = Math.min(totalPages, currentPage + 2);
            if (pageEnd - pageStart < 4) {
                if (pageStart === 1) pageEnd = Math.min(totalPages, pageStart + 4);
                else pageStart = Math.max(1, pageEnd - 4);
            }
            for (var i = pageStart; i <= pageEnd; i++) {
                html += '<button class="btn btn-sm ' + (i === currentPage ? 'btn-primary' : 'btn-outline') + '" onclick="window.paginate(' + i + ')">' + i + '</button>';
            }

            // Next button
            html += '<button class="btn btn-outline btn-sm" onclick="window.paginate(' + (currentPage + 1) + ')"'
                + (currentPage >= totalPages ? ' disabled style="opacity:0.4;cursor:not-allowed;"' : '') + '>Next</button>';

            html += '</div>';
        }

        grid.innerHTML = html;
    }

    // Global pagination function for onclick handlers
    window.paginate = function(page) {
        currentPage = page;
        render();
        window.scrollTo({ top: grid.offsetTop - 100, behavior: 'smooth' });
    };

    render();
});
