// Adresses du site et fichiers qu'elles servent : partagé par le serveur local (serve.js)
// et la construction pour Cloudflare Pages (build-pages.js).
const map = {
  "/": "site/index.html",
  "/data.json": "data/ifrap.json", "/officiel.json": "data/officiel.json", "/partis.json": "data/partis.json",
  "/llms.txt": "site/llms.txt", "/README.md": "site/llms.txt", "/llms-full.txt": "site/llms-full.txt",
  "/conditions.html": "site/conditions.html", "/robots.txt": "site/robots.txt",
};
const types = { ".html": "text/html; charset=utf-8", ".json": "application/json; charset=utf-8", ".txt": "text/plain; charset=utf-8", ".md": "text/plain; charset=utf-8" };
// site/index.html ne contient que le corps de la page.
const envelopper = body => `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>${body}</body></html>`;
module.exports = { map, types, envelopper };
