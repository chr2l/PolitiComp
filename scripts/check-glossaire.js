// Vérifie data/glossaire.json et liste les termes des propositions qui n'y sont pas encore.
// Usage : node scripts/check-glossaire.js   (code de sortie 1 seulement si le glossaire est mal formé)
// Sert à la mise à jour de chaque semaine : les « candidats » listés sont à relire, puis à ajouter
// (ou à ignorer) dans le glossaire. Ce n'est qu'une aide : tout sigle n'est pas compliqué.
const fs = require("fs"), path = require("path");
const root = path.join(__dirname, "..");
const lire = (f) => JSON.parse(fs.readFileSync(path.join(root, f), "utf8"));
const g = lire("data/glossaire.json"), ifrap = lire("data/ifrap.json");
let officiel = { items: [] }; try { officiel = lire("data/officiel.json"); } catch {}

// 1. Format
const erreurs = [], ids = new Set(), motifs = new Map();
if (!/^\d{4}-\d{2}-\d{2}$/.test(g.maj || "")) erreurs.push("« maj » doit être une date AAAA-MM-JJ");
(g.termes || []).forEach((t, n) => {
  const ou = `terme n°${n + 1} (${t.id || "?"})`;
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(t.id || "")) erreurs.push(`${ou} : id en minuscules-avec-tirets attendu`);
  if (ids.has(t.id)) erreurs.push(`${ou} : id en double`); ids.add(t.id);
  if (!Array.isArray(t.motifs) || !t.motifs.length) erreurs.push(`${ou} : « motifs » vide`);
  for (const m of t.motifs || []) {
    const k = m.toLowerCase();
    if (motifs.has(k)) erreurs.push(`${ou} : motif « ${m} » déjà utilisé par ${motifs.get(k)}`); motifs.set(k, t.id);
  }
  for (const l of ["fr", "en"]) if (typeof t[l] !== "string" || !t[l].trim() || t[l].length > 400) erreurs.push(`${ou} : « ${l} » manquant ou trop long (400 car. max)`);
  if (t.wiki && !t.wiki.startsWith("https://fr.wikipedia.org/wiki/")) erreurs.push(`${ou} : « wiki » doit être un lien fr.wikipedia.org`);
});
if (erreurs.length) { console.error("Glossaire mal formé :\n- " + erreurs.join("\n- ")); process.exit(1); }

// 2. Termes des propositions absents du glossaire : sigles (2 à 6 majuscules) et mots-clés connus.
const textes = [];
for (const t of ifrap.themes) for (const s of t.subs) for (const l of Object.values(s.props)) textes.push(...l);
for (const it of officiel.items || []) textes.push(it.text);
const connus = [...motifs.keys()];
// Sigles courants, compris de tous : on ne les propose pas.
const ignores = new Set("UE IA SMIC RSA TVA PIB EDF SNCF ONU OTAN CNRS PME TPE ETI USA RN LFI PS LR AN".split(" "));
const vus = new Map();
for (const txt of textes) for (const m of txt.matchAll(/(?<![\p{L}\p{N}])[A-Z][A-Z0-9]{1,5}(?![\p{L}\p{N}])/gu)) {
  const w = m[0]; if (ignores.has(w) || connus.includes(w.toLowerCase()) || /^[IVX]+$/.test(w)) continue;
  if (!vus.has(w)) vus.set(w, txt.slice(Math.max(0, m.index - 50), m.index + 60).replace(/\s+/g, " "));
}
console.log(`Glossaire OK : ${g.termes.length} termes (mis à jour le ${g.maj}).`);
if (!vus.size) console.log("Aucun nouveau sigle repéré.");
else {
  console.log(`\n${vus.size} sigle(s) des propositions absent(s) du glossaire, à relire :`);
  for (const [w, ctx] of [...vus].sort()) console.log(`- ${w} : « …${ctx}… »`);
}
