# Fiche Produit 1 Colonne Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sur `product.html`, afficher l'image en haut et les infos en dessous (1 colonne) en conservant la taille actuelle de l'image (~480px max, centrée), sans toucher au panier ni aux cartes produits.

**Architecture:** Changement purement CSS dans `css/style.css`. La règle de base `.product-detail` passe de `grid-template-columns: 1fr 1fr` (2 colonnes) à `1fr` (1 colonne), et `.product-detail-image` reçoit `max-width: 480px; margin: 0 auto; width: 100%` pour conserver la taille de l'image AVANT. Le media query mobile (≤768px, ligne 1826) reste inchangé et reste cohérent.

**Tech Stack:** CSS vanilla (site e-boutik, vanille HTML/CSS/JS + Supabase).

## Global Constraints

- **Aucun changement** à `product.html`, `js/product.js`, `cart.html`, `index.html`, `catalog.html`, `admin.html` — CSS seul.
- **Panier inchangé** : `cart.html` garde le layout image-à-gauche / infos-à-droite.
- **Cartes produits inchangées** : accueil/catalogue/section vedette gardent image-haut / infos-bas.
- **Badge ★ Vedette** : reste sur l'image, aucun impact.
- Taille image conservée : `max-width: 480px`, centrée (`margin: 0 auto`), responsive (`width: 100%`).
- Style de commit du repo : préfixe descriptif en anglais, ex. `style: ...`.

---

### Task 1: Passer la fiche produit en 1 colonne (CSS)

**Files:**
- Modify: `css/style.css:1302-1314` (règle `.product-detail` + `.product-detail-image`)

**Interfaces:**
- Consumes: rien (aucune dépendance à une tâche antérieure)
- Produces: `.product-detail` en 1 colonne + `.product-detail-image` limitée à 480px centrée — vérifiable visuellement sur `product.html?id=1`

- [ ] **Step 1: Lire l'état actuel des blocs à modifier**

Read: `css/style.css` lignes 1300-1320. Vérifier que `.product-detail` contient bien `grid-template-columns: 1fr 1fr;` et que `.product-detail-image` n'a pas encore de `max-width`.

- [ ] **Step 2: Modifier `.product-detail` (2 colonnes → 1 colonne)**

Dans `css/style.css`, remplacer :
```css
.product-detail {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(1.5rem, 4vw, 3rem);
  max-width: min(960px, 100%);
  margin: 0 auto;
}
```
par :
```css
.product-detail {
  display: grid;
  grid-template-columns: 1fr;
  gap: clamp(1.5rem, 4vw, 3rem);
  max-width: min(960px, 100%);
  margin: 0 auto;
}
```

- [ ] **Step 3: Limiter et centrer `.product-detail-image` (taille AVANT conservée)**

Dans `css/style.css`, remplacer :
```css
.product-detail-image {
  border-radius: var(--radius);
  overflow: hidden;
  background: var(--surface);
}
```
par :
```css
.product-detail-image {
  border-radius: var(--radius);
  overflow: hidden;
  background: var(--surface);
  max-width: 480px;
  margin: 0 auto;
  width: 100%;
}
```

- [ ] **Step 4: Vérifier les propriétés dans le CSS généré**

Run (depuis la racine du projet) :
`grep -n "grid-template-columns: 1fr;" css/style.css | head`
Expected : la règle de base `.product-detail` (ligne ~1304) montre `1fr` (plus AUCUN `1fr 1fr`).
Run : `grep -n "max-width: 480px" css/style.css`
Expected : une occurrence dans `.product-detail-image`.

- [ ] **Step 5: Vérifier visuellement desktop + mobile (Playwright)**

Assurer que le serveur local tourne : `curl -s -o /dev/null -w "%{http_code}" http://localhost:8123/product.html?id=1` → `200`. Puis dans un navigateur :
- Taille ≥1024px : ouvrir `http://localhost:8123/product.html?id=1` → l'image est en haut, centrée, largeur ≤ 480px ; les infos (catégorie, nom, prix, description, tailles, quantité) sont **en dessous**.
- Taille ≤768px (redimensionner la fenêtre ou utiliser le mode responsive) : même page → image pleine largeur en haut, infos dessous (inchangé).
- Vérifier par DOM : `document.querySelector('.product-detail').style.gridTemplateColumns` → `1fr` ; `getComputedStyle(document.querySelector('.product-detail-image')).maxWidth` → `480px`.

- [ ] **Step 6: Test de non-régression (panier + cartes)**

Playwright :
- Ouvrir `http://localhost:8123/cart.html` → le `.cart-item` garde `display:flex` horizontal (image à gauche, infos à droite) — inchangé.
- Ouvrir `http://localhost:8123/index.html` → `.product-card` toujours `flex-direction: column` (infos sous l'image) — inchangé ; le badge `★ Vedette` reste sur l'image si un produit est `featured`.

- [ ] **Step 7: Commit**

```bash
git add css/style.css
git commit -m "style: fiche produit en 1 colonne (image en haut, infos en dessous)"
```

---