# « Atik vedette » Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer la section factice « Endikezab yo » (qui affichait `products.slice(0, 4)`) par une vraie section « Atik vedette » : l'admin choisit les produits (checkbox + étoile dans le tableau), l'accueil affiche max 4 produits `featured` avec un badge `★ Vedette`.

**Architecture:** Champ booléen `featured` sur chaque produit (localStorage + table Supabase `products.featured`). L'admin le bascule via checkbox dans le formulaire et/ou bouton étoile au tableau. `renderProductCard()` affiche le badge si `featured`. L'accueil filtre `products.filter(p => p.featured).slice(0, 4)` avec fallback (masqué visiteur / message+bouton admin).

**Tech Stack:** Vanilla JS (pas de framework, pas de runner de tests — vérifications via Playwright/navigateur), Supabase REST (POSTGREST), GitHub Pages.

## Global Constraints

- Ne pas modifier `product.html` (pas de badge sur la page produit — décision 1A).
- Garder la grille actuelle de l'accueil (4 colonnes, classes existantes).
- Tous les messages UI en kreyòl (règle site déjà appliquée).
- Ne pas créer de table `featured_products` séparée (décision #2 → approche 3 : booléen simple).
- Aucun produit n'est vedette par défaut (décision #4).
- `featured` manquant dans données existantes → `normalizeProduct` met `false`.
- Ne jamais exposer de secret (clé anon Supabase déjà publique/OK côté client).

---

### Task 1: Migration Supabase — colonne `featured`

**Files:**
- Modify: table `products` (Supabase, via migration)

**Interfaces:**
- Consumes: rien
- Produces: colonne `products.featured boolean NOT NULL DEFAULT false` (consommée par Task 3/4 via `supabaseUpsert`)

- [ ] **Step 1: Appliquer la migration**

```sql
ALTER TABLE products ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false;
```

Run: `supabase_apply_migration(name="add_products_featured", query=...)`

- [ ] **Step 2: Vérifier que la colonne existe**

Run: `supabase_list_tables(verbose=true)` → attendre `featured` dans les colonnes de `products`.

- [ ] **Step 3: Commit (rien dans le repo pour cette tâche — la migration est côté Supabase)** — valider simplement le statut : ✓ colonne présente.

---

### Task 2: `js/app.js` — normalization + badge sur les cartes + CSS

**Files:**
- Modify: `js/app.js:36-45` (`normalizeProduct`), `js/app.js:292-317` (`renderProductCard`)
- Modify: `css/style.css` (fin de la section `.product-card …`, après ligne ~336)

**Interfaces:**
- Consumes: Task 1 (champ `featured` possible dans les données syncées)
- Produces: `p.featured` toujours booléen sur tout produit lu (`getProducts()`), badge HTML conditionnel `★ Vedette` dans `renderProductCard(p)` — consommé par Task 5 (accueil) et déjà utilisé par le catalogue.

- [ ] **Step 1: Ajouter `featured` à `normalizeProduct`**

```js
function normalizeProduct(p) {
    return {
        ...p,
        featured: !!p.featured,
        costPrice: p.costPrice || 0,
        wholesalePrice: p.wholesalePrice || 0,
        batchQuantity: p.batchQuantity || 0,
        batchPrice: p.batchPrice || 0,
        alertThreshold: p.alertThreshold != null ? p.alertThreshold : 5
    };
}
```

- [ ] **Step 2: Ajouter le badge dans `renderProductCard`**

Après l'ouverture de `<div class="product-image-wrap" …>` (ligne 305) et AVANT le `<img>`, insérer le badge conditionnel :

```js
        + (p.featured ? '<span class="product-badge-featured">★ Vedette</span>' : '')
```

Le bloc devient :

```js
        + '<div class="product-image-wrap" ' + wrapStyle + '>'
        + (p.featured ? '<span class="product-badge-featured">★ Vedette</span>' : '')
        + '<img class="product-image' + (imgHov ? ' has-hover' : '') + '" src="' + escapeHTML(imgSrc) + '" alt="' + safeName + '" loading="lazy" onerror="if(this.src.startsWith(\'http://\')){this.src=this.src.replace(\'http://\',\'https://\')}else{fallbackImage(this)}">'
```

- [ ] **Step 3: Ajouter le CSS du badge** (à la suite des règles `.product-image-wrap`, vers ligne 336 dans `css/style.css`)

```css
.product-card .product-badge-featured {
  position: absolute;
  top: 0.6rem;
  left: 0.6rem;
  z-index: 2;
  background: var(--accent);
  color: #fff;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  padding: 0.28rem 0.65rem;
  border-radius: 999px;
  pointer-events: none;
  box-shadow: var(--shadow-sm);
}
```

- [ ] **Step 4: Vérifier** — ouvrir `index.html` (Playwright), injecter dans localStorage un produit avec `featured: true`, recharger, confirmer que le badge `★ Vedette` s'affiche sur sa carte.

- [ ] **Step 5: Commit**

```bash
git add js/app.js css/style.css
git commit -m "Feat: badge '★ Vedette' sur les cartes produits (featured) + normalize featured"
```

---

### Task 3: Admin — case à cocher « Atik vedette » dans le formulaire

**Files:**
- Modify: `admin.html` (formulaire produit, dans la zone Kategori/Stòk, après ligne ~176)
- Modify: `js/admin.js:318-341` (handler submit), `js/admin.js:480-518` (`editProduct`)

**Interfaces:**
- Consumes: `p.featured` (Task 2, toujours booléen)
- Produces: `data.featured` (booléen lu depuis `#product-featured`) écrit dans chaque produit sauvegardé — consommé par Task 4 (tableau) et Task 5 (accueil).

- [ ] **Step 1: Ajouter la checkbox dans `admin.html`**

Juste après le `.admin-form-row` contenant Kategori + Stòk (lignes 167-176) :

```html
                        <div class="admin-form-row">
                            <div class="form-group">
                                <label style="font-weight:500;display:flex;align-items:center;gap:.5rem;">
                                    <input type="checkbox" id="product-featured" style="width:auto;margin:0;">
                                    Atik vedette
                                </label>
                            </div>
                        </div>
```

- [ ] **Step 2: Lire la case dans le handler submit** (`js/admin.js`, objet `data`, après `image_hover:` ligne 340)

```js
                featured: document.getElementById('product-featured').checked
```

- [ ] **Step 3: Pré-remplir dans `editProduct`** (après `product-color` ligne 501)

```js
        document.getElementById('product-featured').checked = !!p.featured;
```

- [ ] **Step 4: Vérifier** — Playwright : ouvrir `admin.html`, cliquer « + Ajoute yon pwodui », cocher « Atik vedette », remplir nom+prix, soumettre → confirmer `featured: true` dans le localStorage (`eboutik_products`). Puis cliquer « Modifye » sur le produit → la case est cochée.

- [ ] **Step 5: Commit**

```bash
git add admin.html js/admin.js
git commit -m "Feat: checkbox 'Atik vedette' dans le formulaire produit admin"
```

---

### Task 4: Admin — bouton étoile dans le tableau produits

**Files:**
- Modify: `js/admin.js:413-425` (`loadProducts`)

**Interfaces:**
- Consumes: `p.featured` (Task 2), `saveProducts` (app.js)
- Produces: fonction `toggleFeatured(id)` qui bascule `featured` et recharge le tableau — consommée par aucun autre module (autonome), mais le même champ `featured` est utilisé par Task 5.

- [ ] **Step 1: Ajouter la colonne « Vedette » et le bouton étoile**

Dans `loadProducts`, insérer une cellule `Vedette` AVANT la colonne Aksyon ; `colspan` du message vide passe de `6` à `7` :

```js
function loadProducts() {
    const tbody = document.getElementById('products-table-body');
    const products = getProducts();
    tbody.innerHTML = products.map(function(p) {
        return '<tr><td>' + escapeHTML(String(p.id)) + '</td>'
            + '<td>' + escapeHTML(p.name) + '</td>'
            + '<td>' + parseFloat(p.price).toFixed(2) + ' G</td>'
            + '<td>' + escapeHTML(p.category || '\u2014') + '</td>'
            + '<td>' + (p.stock || 0) + '</td>'
            + '<td style="text-align:center;"><button class="btn btn-sm ' + (p.featured ? 'btn-primary' : 'btn-outline') + '" title="Atik vedette" onclick="toggleFeatured(' + p.id + ')">' + (p.featured ? '\u2605' : '\u2606') + '</button></td>'
            + '<td><button class="btn btn-primary btn-sm" onclick="editProduct(' + p.id + ')">Modifye</button> '
            + '<button class="btn btn-danger btn-sm" onclick="deleteProduct(' + p.id + ')">Siprime</button></td></tr>';
    }).join('') || '<tr><td colspan="7" style="text-align:center;color:var(--text-light);padding:2rem;">Pa gen pwodui</td></tr>';
}
```

- [ ] **Step 2: Ajouter l'en-tête « Vedette »** dans `admin.html` (table des produits, ligne ~249, entre `<th>Stòk</th>` et `<th>Aksyon</th>`)

```html
                                    <th>Vedette</th>
```

- [ ] **Step 3: Définir `toggleFeatured`** (à côté de `deleteProduct`, ~ligne 520)

```js
function toggleFeatured(id) {
    let products = getProducts();
    const idx = products.findIndex(p => p.id == id);
    if (idx !== -1) {
        products[idx] = { ...products[idx], featured: !products[idx].featured };
        saveProducts(products);
        loadProducts();
    }
}
```

- [ ] **Step 4: Vérifier** — Playwright : ouvrir `admin.html`, cliquer l'étoile ☆ → devient ★, `featured: true` dans `eboutik_products`, table `products` Supabase mise à jour (sync). Re-cliquer → retour ☆.

- [ ] **Step 5: Commit**

```bash
git add admin.html js/admin.js
git commit -m "Feat: bouton étoile ⭐ pour basculer 'Atik vedette' dans le tableau admin"
```

---

### Task 5: Accueil — section « Atik vedette » avec fallback

**Files:**
- Modify: `index.html:101-122` (script DOMContentLoaded), `index.html:60-61` (title + grille)

**Interfaces:**
- Consumes: `getProducts()` avec `featured` booléen (Task 2), `renderProductCard(p)` (Task 2 — badge déjà géré), session admin via `sessionStorage.getItem('eboutik_admin')`
- Produces: rendu final de la section accueil (aucun consommateur)

- [ ] **Step 1: Ajouter des ids au titre et à la grille** dans `index.html`

```html
        <h2 class="section-title fade-in" id="featured-title">Atik vedette</h2>
        <div class="product-grid fade-in" id="featured-products"></div>
```

- [ ] **Step 2: Remplacer le bloc `featured-products`** dans le script (lignes 106-108)

```js
            const products = getProducts();
            const grid = document.getElementById('featured-products');
            const title = document.getElementById('featured-title');
            const featured = products.filter(p => p.featured).slice(0, 4);

            if (featured.length === 0) {
                const isAdmin = !!sessionStorage.getItem('eboutik_admin');
                if (isAdmin) {
                    grid.innerHTML = '<p style="text-align:center;color:var(--text-light);padding:2rem 0;">Pa gen atik vedette ankò.</p>'
                        + '<div style="text-align:center;margin-bottom:1rem;"><a class="btn btn-primary" href="admin.html">Deziyen atik vedette</a></div>';
                } else {
                    title.style.display = 'none';
                    grid.style.display = 'none';
                }
            } else {
                grid.innerHTML = featured.map(p => renderProductCard(p)).join('');
            }
```

- [ ] **Step 3: Vérifier — scénario A (visiteur, aucun vedette)** : Playwright, localStorage sans produit `featured` → titre + grille masqués.
- [ ] **Step 4: Vérifier — scénario B (admin, aucun vedette)** : Playwright, injecter `sessionStorage.setItem('eboutik_admin', 'admin')`, recharger → message « Pa gen atik vedette ankò. » + bouton `Deziyen atik vedette` → `admin.html`.
- [ ] **Step 5: Vérifier — scénario C (avec vedettes)** : Playwright, injecter 5 produits dont 4 `featured: true` → 4 cartes affichées avec badge `★ Vedette` ; le 5e vedette n'apparaît pas.
- [ ] **Step 6: Commit**

```bash
git add index.html
git commit -m "Feat: section accueil 'Atik vedette' (max 4, fallback visiteur/admin)"
```

---

### Task 6: Vérification de bout en bout + push

**Files:**
- Aucun (vérification globale)

- [ ] **Step 1: Vérifier la sync Supabase complète** — après une bascule étoile + sauvegarde, `products.featured` présent dans la table Supabase (consulter via `supabase_list_tables`/SELECT).
- [ ] **Step 2: Vérifier le catalogue** : les cartes des produits `featured` dans `catalog.html` montrent le badge `★ Vedette` (même `renderProductCard`).
- [ ] **Step 3: Vérifier que `product.html` n'a PAS de badge** (décision 1A — rien à modifier, `detail-image` non touché).
- [ ] **Step 4: Push**

```bash
git push origin main
```

- [ ] **Step 5: Vérifier le live GitHub Pages** après ~1-2 min (https://Alexander-F2000.github.io/e-boutik/).