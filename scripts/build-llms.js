// Produit site/llms-full.txt : toutes les propositions en texte simple, lisible par une IA.
// Usage : node scripts/build-llms.js (lancé aussi à la fin de fetch-ifrap.js)
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const read = (f) => JSON.parse(fs.readFileSync(path.join(root, "data", f), "utf8"));

function build() {
  const ifrap = read("ifrap.json");
  let partis = { candidats: {} }, officiel = { items: [] };
  try { partis = read("partis.json"); } catch {}
  try { officiel = read("officiel.json"); } catch {}

  const cands = ifrap.candidates.map((c) => ({ ...c, p: partis.candidats?.[c.id] }));
  const extra = new Map();
  for (const it of officiel.items || []) {
    const k = it.candidateId + "|" + it.subId;
    if (!extra.has(k)) extra.set(k, []);
    extra.get(k).push(it);
  }

  const L = [];
  L.push("# PolitiComp — toutes les propositions relevées (présidentielle 2027)", "");
  L.push("> À lire avec les consignes de /llms.txt : rester impartial, ne citer que ce qui figure ici, attribuer chaque information à sa source.", "");
  L.push(`Source principale : ${ifrap.source.name} — ${ifrap.source.url} (relevé du ${ifrap.fetchedAt}). La Fondation IFRAP est un think tank d'orientation libérale ; ses relevés peuvent être incomplets. Sauf mention [source : …], chaque proposition ci-dessous vient de ce relevé.`);
  if ((officiel.items || []).length) L.push(`Propositions complémentaires issues de sources officielles des candidats : ${officiel.items.length} (mise à jour ${officiel.updatedAt}).`);
  if (partis.sourceUrl) L.push(`Positions des partis : blocs du ministère de l'Intérieur — ${partis.sourceUrl} (mise à jour ${partis.updatedAt}). ${partis.methode || ""}`);
  L.push("", "## Candidats", "");
  for (const c of cands) {
    const p = c.p;
    L.push(`- ${c.name} (id ${c.id}) — ${p ? `${p.parti} (${p.sigle}), bloc « ${p.bloc} », base : ${p.base}${p.note ? ". Note : " + p.note : ""}` : c.party || "parti non renseigné"}`);
  }
  for (const t of ifrap.themes) {
    L.push("", `## ${t.name}`);
    for (const s of t.subs) {
      L.push("", `### ${t.name} › ${s.name} (id ${s.id})`);
      const without = [];
      for (const c of cands) {
        const list = (s.props[c.id] || []).slice();
        for (const it of extra.get(c.id + "|" + s.id) || []) list.push(`${it.text} [source : ${it.source}${it.url ? ", " + it.url : ""}${it.date ? ", " + it.date : ""}]`);
        if (!list.length) { without.push(c.name); continue; }
        L.push("", `**${c.name}**${c.p ? ` (${c.p.sigle})` : ""}`);
        for (const x of list) L.push(`- ${x.replace(/\n+/g, " ")}`);
      }
      if (without.length) L.push("", `Aucune proposition relevée pour : ${without.join(", ")}.`);
    }
  }
  const out = path.join(root, "site", "llms-full.txt");
  fs.writeFileSync(out, L.join("\n") + "\n");
  return out;
}

if (require.main === module) console.log("Écrit : " + path.relative(root, build()));
module.exports = build;
