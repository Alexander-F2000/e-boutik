# Design — Fiche produit en colonne (image en haut, infos en dessous)

**Date** : 2026-08-11
**Statut** : Approuvé par l'utilisateur
**Portée** : `product.html` uniquement — CSS pur, aucun changement HTML/JS/BDD.

## Objectif

Sur la **fiche produit** (`product.html`), afficher l'image en haut et les informations (catégorie, marque, nom, prix, description, tailles, quantité) **en dessous**, au lieu du layout actuel image-à-gauche / infos-à-droite (2 colonnes).

## Décisions validées (avec l'utilisateur)

| # | Décision |
|---|----------|
| 1 | **Fiche produit** : passer en 1 colonne → image en haut, infos en dessous (**APRÈS** de l'aperçu). |
| 2 | **Taille d'image** : conserver la **taille actuelle de l'image AVANT** (≈ moitié de la largeur, `max-width: 480px`, centrée) — PAS une image pleine page. |
| 3 | **Panier** (`cart.html`) : **AUCUN changement** — on garde le layout actuel (image à gauche, infos à droite). |
| 4 | **Cartes produits** (accueil/catalogue + section vedette) : **AUCUN changement** — déjà en colonne (image en haut, infos en dessous). |
| 5 | Badge **★ Vedette** : aucun impact (situé sur l'image, pas sur les infos). |

## État actuel (CSS `style.css`)

```css
/* Ligne 1302 — desktop */
.product-detail {
  display: grid;
  grid-template-columns: 1fr 1fr;   /* ← 2 colonnes : image | infos */
  gap: clamp(1.5rem, 4vw, 3rem);
  max-width: min(960px, 100%);
  margin: 0 auto;
}

.product-detail-image {              /* Ligne 1310 */
  border-radius: var(--radius);
  overflow: hidden;
  background: var(--surface);
}

/* Media query max-width: 768px (ligne 1826) — déjà en 1 colonne */
.product-detail { grid-template-columns: 1fr; gap: 1.5rem; }
```

Le mobile (≤768px) est **déjà** en 1 colonne. Seul le desktop (par défaut) passe en 2 colonnes → c'est la seule chose à corriger pour uniformiser.

## Changement proposé (CSS uniquement)

**Fichier modifié** : `css/style.css`

```css
/* Desktop (règle de base ligne 1302) : 2 colonnes → 1 colonne image au-dessus */
.product-detail {
  display: grid;
  grid-template-columns: 1fr;        /* ← CHANGÉ : 1 colonne */
  gap: clamp(1.5rem, 4vw, 3rem);
  max-width: min(960px, 100%);
  margin: 0 auto;
}

/* L'image garde la taille « AVANT » : limitée et centrée */
.product-detail-image {
  border-radius: var(--radius);
  overflow: hidden;
  background: var(--surface);
  max-width: 480px;                  /* ← AJOUTÉ : conserve la taille AVANT */
  margin: 0 auto;                    /* ← AJOUTÉ : centré */
  width: 100%;                       /* ← AJOUTÉ : responsive */
}
```

**Résultat attendu** :
- Desktop : image en haut (max 480px, centrée), infos en dessous sur toute la largeur disponible du conteneur (960px).
- Mobile (≤768px) : inchangé (déjà 1 colonne) — la règle existante `grid-template-columns: 1fr; gap: 1.5rem;` reste en place et fonctionne toujours (l'image sera à 100% du conteneur mobile, ce qui est ≤480px de toute façon).
- Aucun changement à `product.html`, `js/product.js`, `cart.html`, `index.html`, `catalog.html`, `admin.html`.

## Tests de vérification

1. **Desktop** (largeur ≥ 1024px) : ouvrir `product.html?id=1` → image en haut centrée (max ~480px), infos dessous (catégorie, marque, nom, prix, description, tailles, quantité).
2. **Mobile** (≤ 768px) : même page → image pleine largeur en haut, infos dessous (inchangé vs avant).
3. **Régression** : `cart.html` → toujours image à gauche / infos à droite ; accueil et catalogue → cartes inchangées ; badge ★ Vedette toujours sur l'image.

## Hors périmètre

- Panier (`cart.html`) : ne pas modifier.
- Cartes produits : ne pas modifier.
- Backend / base de données : aucune modification.