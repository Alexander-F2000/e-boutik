// ============================================================
// ⚠️ SÉCURITÉ — AUDIT 2026-08-01
// Un token GitHub (PAT) réel a été détecté ici et exposé
// publiquement via GitHub Pages. Il a été REMPLACÉ par un
// placeholder.
//
// RÈGLE ABSOLUE : ne mettez JAMAIS de secret (token, clé API,
// mot de passe) dans un fichier JS servi par GitHub Pages —
// même encodé en base64 ou en char codes : c'est trivialement
// lisible par n'importe qui (les données proviennent du
// navigateur de l'utilisateur).
//
// Ce fichier est désormais ignoré par git (voir .gitignore).
// Pour un usage LOCAL : copiez js/config.example.js vers
// js/config.js et renseignez votre propre token. Ne le
// committez jamais.
// ============================================================

// TODO SÉCURITÉ : migrer l'accès GitHub vers une solution
// côté serveur (proxy, GitHub Actions, variables d'environnement)
// — un token dans le JS client est TOUJOURS récupérable.
window.GH_TOKEN = 'REMPLACEZ_PAR_VOTRE_TOKEN';

const GITHUB_CONFIG = {
    OWNER: 'Alexander-F2000',
    REPO: 'e-boutik',
    TOKEN: window.GH_TOKEN
};
