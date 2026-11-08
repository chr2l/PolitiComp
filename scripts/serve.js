// Serveur du site (aperçu local : node scripts/serve.js puis http://localhost:5177 ;
// en ligne : Cloudflare Pages, voir build-pages.js).
// Ne journalise rien et ne dépose aucun cookie (voir site/conditions.html).
const http = require("http"), fs = require("fs"), path = require("path");
const root = path.join(__dirname, "..");
const { map, types, envelopper } = require("./pages");
http.createServer((req, res) => {
  const f = map[req.url.split("?")[0]];
  if (!f) { res.writeHead(404); return res.end(); }
  let body;
  try { body = fs.readFileSync(path.join(root, f), "utf8"); } catch { res.writeHead(404); return res.end(); }
  if (f === "site/index.html") body = envelopper(body);
  // Données en lecture libre : une IA ou un outil d'un autre site peut les lire directement.
  res.writeHead(200, { "content-type": types[path.extname(f)], "access-control-allow-origin": "*", "referrer-policy": "no-referrer" });
  res.end(body);
}).listen(Number(process.env.PORT) || 5177);
