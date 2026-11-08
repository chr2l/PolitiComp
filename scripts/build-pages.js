// Construit le site pour Cloudflare Pages dans dist/ (commande de build du projet Pages « politicomp »,
// lancée à chaque commit sur main). Mêmes adresses que le serveur local (pages.js).
const fs = require("fs"), path = require("path");
const { map, envelopper } = require("./pages");
const root = path.join(__dirname, ".."), dist = path.join(root, "dist");
fs.rmSync(dist, { recursive: true, force: true });
for (const [url, f] of Object.entries(map)) {
  let body = fs.readFileSync(path.join(root, f));
  if (f === "site/index.html") body = envelopper(body.toString("utf8"));
  const dest = path.join(dist, url === "/" ? "index.html" : url.slice(1));
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, body);
}
// En-têtes : données en lecture libre (une IA ou un autre site peut les lire), pas de référent envoyé.
fs.writeFileSync(path.join(dist, "_headers"), `/*\n  Access-Control-Allow-Origin: *\n  Referrer-Policy: no-referrer\n  X-Content-Type-Options: nosniff\n/README.md\n  Content-Type: text/plain; charset=utf-8\n`);
console.log("dist/ prêt :", fs.readdirSync(dist).join(", "));
