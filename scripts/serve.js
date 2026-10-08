// Aperçu local : node scripts/serve.js puis http://localhost:5177
const http = require("http"), fs = require("fs"), path = require("path");
const root = path.join(__dirname, "..");
const map = { "/": "site/index.html", "/data.json": "data/ifrap.json", "/officiel.json": "data/officiel.json", "/partis.json": "data/partis.json" };
http.createServer((req, res) => {
  const f = map[req.url.split("?")[0]];
  if (!f) { res.writeHead(404); return res.end(); }
  let body = fs.readFileSync(path.join(root, f), "utf8");
  if (f.endsWith(".html")) body = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>${body}</body></html>`;
  res.writeHead(200, { "content-type": f.endsWith(".html") ? "text/html; charset=utf-8" : "application/json" });
  res.end(body);
}).listen(5177);
