// Serveur du site (aperçu local : node scripts/serve.js puis http://localhost:5177 ;
// en ligne : conteneur politicomp du dépôt chr2l/serveur, port 8082).
// Ne journalise rien et ne dépose aucun cookie (voir site/conditions.html).
const http = require("http"), fs = require("fs"), path = require("path");
const root = path.join(__dirname, "..");
const map = {
  "/": "site/index.html",
  "/data.json": "data/ifrap.json", "/officiel.json": "data/officiel.json", "/partis.json": "data/partis.json",
  "/llms.txt": "site/llms.txt", "/README.md": "site/llms.txt", "/llms-full.txt": "site/llms-full.txt",
  "/conditions.html": "site/conditions.html", "/robots.txt": "site/robots.txt",
};
const types = { ".html": "text/html; charset=utf-8", ".json": "application/json; charset=utf-8", ".txt": "text/plain; charset=utf-8", ".md": "text/plain; charset=utf-8" };
http.createServer((req, res) => {
  const f = map[req.url.split("?")[0]];
  if (!f) { res.writeHead(404); return res.end(); }
  let body;
  try { body = fs.readFileSync(path.join(root, f), "utf8"); } catch { res.writeHead(404); return res.end(); }
  if (f === "site/index.html") body = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>${body}</body></html>`;
  // Données en lecture libre : une IA ou un outil d'un autre site peut les lire directement.
  res.writeHead(200, { "content-type": types[path.extname(f)], "access-control-allow-origin": "*", "referrer-policy": "no-referrer" });
  res.end(body);
}).listen(Number(process.env.PORT) || 5177);
