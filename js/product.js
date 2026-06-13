document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
    const params = new URLSearchParams(window.location.search);
    const productId = parseInt(params.get('id'));
    if (!productId) {
        document.getElementById('product-detail').innerHTML = '<p style="text-align:center;padding:3rem 0;color:var(--text-light);">Pa gen id pwodui.</p>';
        return;
    }
    const products = getProducts();
    const p = products.find(x => x.id == productId);
    if (!p) {
        document.getElementById('product-detail').innerHTML = '<p style="text-align:center;padding:3rem 0;color:var(--text-light);">Pwodui pa jwenn.</p>';
        return;
    }

    let imgSrc = p.image || PLACEHOLDER;
    if (imgSrc.startsWith('http://')) imgSrc = imgSrc.replace('http://', 'https://');
    let imgHov = p.image_hover || '';
    if (imgHov.startsWith('http://')) imgHov = imgHov.replace('http://', 'https://');

    const detailImg = document.getElementById('detail-image');
    detailImg.src = imgSrc;
    detailImg.onerror = function() { if (this.src.startsWith('http://')) { this.src = this.src.replace('http://', 'https://'); } else { fallbackImage(this); } };
    const imgWrap = document.getElementById('detail-image-wrap');
    if (imgHov) {
        document.getElementById('detail-image').classList.add('main-img', 'hover-available');
        const hov = document.createElement('img');
        hov.src = imgHov;
        hov.className = 'hover-img';
        hov.alt = p.name + ' hover';
        hov.onerror = function() { this.style.display = 'none'; };
        imgWrap.appendChild(hov);
    }
    document.title = 'e-boutik — ' + p.name;
    document.getElementById('detail-category').textContent = p.category || '';
    document.getElementById('detail-name').textContent = p.name;
    document.getElementById('detail-brand').textContent = p.brand || '';
    const priceEl = document.getElementById('detail-price');
    priceEl.textContent = parseFloat(p.price).toFixed(2) + ' G';
    const wsEl = document.getElementById('detail-wholesale');
    if (p.wholesalePrice && p.wholesalePrice > 0) {
        wsEl.textContent = 'Pri an gwo: ' + p.wholesalePrice.toFixed(2) + ' G';
    }
    document.getElementById('detail-desc').textContent = p.description || '';
    const meta = document.getElementById('detail-meta');
    const metaItems = [];
    if (p.material) metaItems.push('<div><strong>Matiè</strong> ' + escapeHTML(p.material) + '</div>');
    if (p.color) metaItems.push('<div><strong>Koulè</strong> ' + escapeHTML(p.color) + '</div>');
    if (p.stock != null) metaItems.push('<div><strong>Stòk</strong> ' + Number(p.stock) + ' inite</div>');
    meta.innerHTML = metaItems.join('');

    const sizes = p.sizes ? p.sizes.split(',').map(s => s.trim()).filter(s => s) : [];
    const sizesContainer = document.getElementById('detail-sizes');
    let selectedSize = '';
    if (sizes.length && !(sizes.length === 1 && sizes[0].toLowerCase() === 'unique')) {
        sizesContainer.innerHTML = sizes.map(function(s) { return '<button class="size-btn" data-size="' + escapeHTML(s) + '">' + escapeHTML(s) + '</button>'; }).join('');
        sizesContainer.querySelectorAll('.size-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                sizesContainer.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                selectedSize = btn.dataset.size;
            });
        });
    } else {
        sizesContainer.style.display = 'none';
        const label = document.querySelector('.product-detail-info p');
        if (label) label.style.display = 'none';
    }

    let qty = 1;
    const qtySpan = document.getElementById('detail-qty');
    document.getElementById('detail-qty-minus').addEventListener('click', () => { if (qty > 1) { qty--; qtySpan.textContent = qty; } });
    document.getElementById('detail-qty-plus').addEventListener('click', () => { qty++; qtySpan.textContent = qty; });

    document.getElementById('detail-add-cart').addEventListener('click', () => {
        if (sizes.length && !(sizes.length === 1 && sizes[0].toLowerCase() === 'unique') && !selectedSize) {
            document.getElementById('detail-message').className = 'error';
            document.getElementById('detail-message').textContent = 'Tanpri chwazi yon gwosè.';
            return;
        }
        for (let i = 0; i < qty; i++) {
            addToCart(p, selectedSize);
        }
        document.getElementById('detail-message').className = 'success';
        document.getElementById('detail-message').textContent = qty + ' ' + p.name + (selectedSize ? ' (' + selectedSize + ')' : '') + ' ajoute nan demann!';
        updateCartBadge();
    });
});
