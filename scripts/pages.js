// Adresses du site et fichiers qu'elles servent : partagé par le serveur local (serve.js)
// et la construction pour Cloudflare Pages (build-pages.js).
const map = {
  "/": "site/index.html",
  "/data.json": "data/ifrap.json", "/officiel.json": "data/officiel.json", "/partis.json": "data/partis.json",
  "/llms.txt": "site/llms.txt", "/README.md": "site/llms.txt", "/llms-full.txt": "site/llms-full.txt",
  "/conditions.html": "site/conditions.html", "/robots.txt": "site/robots.txt", "/favicon.svg": "site/favicon.svg",
};
const types = { ".html": "text/html; charset=utf-8", ".json": "application/json; charset=utf-8", ".txt": "text/plain; charset=utf-8", ".md": "text/plain; charset=utf-8", ".svg": "image/svg+xml" };
// Icône de l'onglet : « [P] » jaune en majuscule, même dessin que les apps d'elie.place (à garder ici :
// le site est servi par Cloudflare Pages, le portail elie.place ne peut pas la poser).
const icone = '<link rel="icon" type="image/svg+xml" href="/favicon.svg">';
// site/index.html ne contient que le corps de la page.
const envelopper = body => `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${icone}</head><body>${body}</body></html>`;
module.exports = { map, types, envelopper };
