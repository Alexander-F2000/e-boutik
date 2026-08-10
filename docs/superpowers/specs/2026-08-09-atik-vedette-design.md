# Design — Section « Atik vedette » (produits mis en vedette par l'admin)

**Date** : 2026-08-09
**Projet** : e-boutik (vanilla JS + Supabase, GitHub Pages)
**Statut** : Approuvé par l'utilisateur

## Objectif

Remplacer la section factice « Endikezab yo » de la page d'accueil (qui affichait simplement `products.slice(0, 4)`) par une **vraie section « Atik vedette »** : l'admin choisit les produits à mettre en avant, et l'accueil affiche ces produits (max 4) avec un badge visuel.

## Décisions validées par l'utilisateur

| # | Sujet | Décision |
|---|-------|----------|
| 1 | Mécanisme | **C** — case à cocher dans le formulaire produit **ET** bouton étoile ⭐ dans le tableau admin (même champ `featured`) |
| 2 | Nombre affiché | **4 produits max** sur l'accueil (grille actuelle inchangée) |
| 3 | Fallback si aucun coché | **B+C combiné** — visiteur public → section masquée ; admin connecté → message « Pa gen atik vedette ankò » + bouton vers admin |
| 4 | Migration | **A** — aucun produit vedette par défaut ; l'admin coche lui-même |
| 5 | Approche technique | **3** — booléen `featured` sur le produit + badge visuel sur les cartes |
| 6 | Portée du badge | **1A** — badge sur les cartes seulement (accueil + catalogue), pas sur la page produit |
| 7 | Texte du badge | **2B** — `★ Vedette` (court) |

## Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  admin.html │ ──► │  js/admin.js     │ ──► │  Supabase        │
│  formulaire │     │  checkbox + ⭐   │     │  products.featured│
│  + tableau  │     │  (p.featured)    │     │  (boolean)       │
└─────────────┘     └────────┬─────────┘     └────────┬─────────┘
                             │ localStorage           │
                             ▼                        ▼
┌─────────────┐     ┌──────────────────┐
│  index.html │ ◄── │  js/app.js       │
│  section    │     │  filter(featured)│
│  Atik vedette│    │  + badge ★ Vedette│
└─────────────┘     └──────────────────┘
```

## Sections du design

### 1. Base de données (Supabase)

```sql
ALTER TABLE products ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false;
```

- Migration à exécuter via SQL Editor Supabase (ou MCP).
- Aucun produit existant n'est coché (décision #4).
- Le champ sera synchronisé automatiquement par `supabaseUpsert` (envoie déjà tous les champs).

### 2. Données côté site (`js/app.js`)

- **`normalizeProduct()`** : ajouter `featured: !!p.featured` → chaque produit lu a toujours un booléen net (défaut `false`).
- **`defaultProducts`** : aucun changement → tous `false` au premier chargement.
- **`renderProductCard()`** : si `p.featured === true`, afficher un badge `★ Vedette` dans le coin de l'image (décisions #6, #7).

### 3. Admin — case à cocher (`admin.html` + `js/admin.js`)

- Ajouter une case à cocher **« Atik vedette »** dans le formulaire produit (à côté de Kategori / Stòk).
- `editProduct(id)` : pré-remplit la case selon `p.featured`.
- Soumission du formulaire : lire le checkbox et l'écrire dans `data.featured`.

### 4. Admin — bouton étoile dans le tableau (`js/admin.js`)

- Ajouter un bouton `★` / `☆` par ligne de produit dans une **nouvelle colonne dédiée « Vedette »** (insérée avant la colonne Aksyon), pour éviter de surcharger les boutons Modifier/Supprimer.
- Clic → bascule `p.featured = !p.featured` → `saveProducts(products)` (sauvegarde + sync Supabase).
- Même champ `featured` que la case à cocher (décision #1).

### 5. Accueil — section « Atik vedette » (`index.html`)

- Titre : `Atik vedette` (remplace `Endikezab yo`).
- Grille : `products.filter(p => p.featured).slice(0, 4)` (remplace `products.slice(0, 4)`).
- Fallback (décision #3) :
  - Si aucun produit `featured` ET visiteur non-admin → **masquer** titre + grille.
  - Si aucun produit `featured` ET admin connecté (`sessionStorage.getItem('eboutik_admin')`) → afficher message « Pa gen atik vedette ankò » + bouton vers `admin.html`.

### 6. Badge sur les cartes (`js/app.js` — `renderProductCard`)

- Badge `★ Vedette` en surimpression sur l'image (coin haut gauche), visible sur les cartes de l'accueil **et** du catalogue (partout où `renderProductCard` est utilisé).
- Pas de badge sur la page produit `product.html` (décision #6).

## Erreurs et cas limites

| Cas | Comportement |
|-----|--------------|
| Aucun produit vedette coché | Masqué pour visiteurs ; message + bouton pour admin connecté |
| Plus de 4 produits cochés | Les 4 premiers cochés de la liste actuelle sont affichés |
| Produit vedette supprimé | Disparaît de la section ; si plus aucun reste → fallback ci-dessus |
| `featured` manquant dans données existantes | `normalizeProduct` met `false` automatiquement |

## Test

1. **Migration** : la colonne `featured` existe avec `DEFAULT false`.
2. **Admin** : cocher la case → produit sauvegardé avec `featured: true` ; cliquer l'étoile → bascule ; les deux restent synchronisés.
3. **Accueil (visiteur)** : avec des vedettes → 4 cartes + badge ; sans vedettes → section masquée.
4. **Accueil (admin connecté)** : sans vedettes → message « Pa gen atik vedette ankò » + bouton.
5. **Sync Supabase** : après sauvegarde admin, `featured` présent dans la table `products`.
6. **Catalogue** : les cartes des produits vedette montrent le badge `★ Vedette`.

## Fichiers à modifier

- `index.html` — titre section + filtre + fallback (script DOMContentLoaded)
- `js/app.js` — `normalizeProduct` + `renderProductCard` (badge)
- `js/admin.js` — toggle étoile + lecture/écriture checkbox dans formulaire
- `admin.html` — case à cocher « Atik vedette » dans le formulaire

## Hors périmètre (YAGNI)

- Table `featured_products` séparée avec positions (approche 2 rejetée).
- Badge sur la page produit `product.html` (décision 1A).
- Révision plus large du créole (sujet séparé, en cours par ailleurs).