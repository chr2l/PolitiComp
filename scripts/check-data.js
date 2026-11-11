// Vérifie les trois fichiers de données (lancé par la mise à jour automatique, utilisable à la main).
// Usage : node scripts/check-data.js            → vérifie tout
//         node scripts/check-data.js officiel   → vérifie seulement data/officiel.json (+ cohérence avec ifrap.json)
//         node scripts/check-data.js partis     → idem pour data/partis.json
// Sort avec le code 1 et la liste des problèmes si quelque chose ne va pas.
const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "..", "data");
const only = process.argv[2];
const errors = [];
const load = (f) => {
  try { return JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")); }
  catch (e) { errors.push(`${f} : JSON illisible (${e.message})`); return null; }
};
const isDate = (s) => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s));

const ifrap = load("ifrap.json");
const candIds = new Set((ifrap?.candidates || []).map((c) => String(c.id)));
const subIds = new Set((ifrap?.themes || []).flatMap((t) => (t.subs || []).map((s) => String(s.id))));
if (ifrap && (!candIds.size || !subIds.size)) errors.push("ifrap.json : aucun candidat ou aucun sous-thème");

if (!only || only === "officiel") {
  const o = load("officiel.json");
  if (o) {
    if (!isDate(o.updatedAt)) errors.push("officiel.json : updatedAt doit être une date AAAA-MM-JJ");
    if (!Array.isArray(o.items)) errors.push("officiel.json : items doit être une liste");
    const seen = new Set();
    (o.items || []).forEach((it, n) => {
      const at = `officiel.json, items[${n}]`;
      if (!candIds.has(String(it.candidateId))) errors.push(`${at} : candidateId ${it.candidateId} absent de ifrap.json`);
      if (!subIds.has(String(it.subId))) errors.push(`${at} : subId ${it.subId} absent de ifrap.json`);
      if (typeof it.text !== "string" || it.text.trim().length < 10) errors.push(`${at} : text vide ou trop court`);
      if (typeof it.source !== "string" || !it.source.trim()) errors.push(`${at} : source manquante`);
      if (typeof it.url !== "string" || !/^https:\/\/\S+$/.test(it.url)) errors.push(`${at} : url doit être un lien https`);
      if (!isDate(it.date)) errors.push(`${at} : date doit être AAAA-MM-JJ`);
      const key = `${it.candidateId}|${it.subId}|${String(it.text).trim().toLowerCase()}`;
      if (seen.has(key)) errors.push(`${at} : doublon`);
      seen.add(key);
    });
  }
}

if (!only || only === "partis") {
  const p = load("partis.json");
  if (p) {
    if (!isDate(p.updatedAt)) errors.push("partis.json : updatedAt doit être une date AAAA-MM-JJ");
    if (typeof p.sourceUrl !== "string" || !/^https:\/\//.test(p.sourceUrl)) errors.push("partis.json : sourceUrl doit être un lien https");
    const blocs = new Set(p.blocs || []);
    if (blocs.size !== 5) errors.push("partis.json : il faut les 5 blocs");
    const c = p.candidats || {};
    for (const id of candIds) if (!c[id]) errors.push(`partis.json : pas d'entrée pour le candidat ${id}`);
    for (const [id, e] of Object.entries(c)) {
      const at = `partis.json, candidat ${id}`;
      for (const k of ["parti", "sigle", "bloc", "nuance", "base"]) if (typeof e[k] !== "string" || !e[k].trim()) errors.push(`${at} : ${k} manquant`);
      if (e.bloc && !blocs.has(e.bloc)) errors.push(`${at} : bloc « ${e.bloc} » hors de la liste`);
      if (e.base && !/^(nuance officielle|par analogie :)/.test(e.base)) errors.push(`${at} : base doit commencer par « nuance officielle » ou « par analogie : »`);
    }
  }
}

// Glossaire des termes compliqués (s'il existe) : au moins un JSON lisible.
if ((!only || only === "glossaire") && fs.existsSync(path.join(dir, "glossaire.json"))) {
  const g = load("glossaire.json");
  if (g) {
    if (!isDate(g.maj)) errors.push("glossaire.json : maj doit être une date AAAA-MM-JJ");
    if (!Array.isArray(g.termes)) errors.push("glossaire.json : termes doit être une liste");
    const ids = new Set(), motifs = new Set();
    (g.termes || []).forEach((t, n) => {
      const at = `glossaire.json, termes[${n}]`;
      if (typeof t.id !== "string" || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(t.id)) errors.push(`${at} : id doit être en kebab-case`);
      else if (ids.has(t.id)) errors.push(`${at} : id « ${t.id} » en double`);
      ids.add(t.id);
      if (!Array.isArray(t.motifs) || !t.motifs.length) errors.push(`${at} : motifs doit être une liste non vide`);
      for (const m of t.motifs || []) {
        if (typeof m !== "string" || !m.trim()) { errors.push(`${at} : motif vide`); continue; }
        const k = m.toLowerCase();
        if (motifs.has(k)) errors.push(`${at} : motif « ${m} » déjà utilisé`);
        motifs.add(k);
      }
      for (const l of ["fr", "en"]) if (typeof t[l] !== "string" || !t[l].trim() || t[l].length >= 400) errors.push(`${at} : ${l} vide ou trop long (400 caractères max)`);
      if (t.wiki != null && (typeof t.wiki !== "string" || !t.wiki.startsWith("https://fr.wikipedia.org/wiki/"))) errors.push(`${at} : wiki doit commencer par https://fr.wikipedia.org/wiki/`);
    });
  }
}

if (errors.length) {
  console.error(`${errors.length} problème(s) :\n- ` + errors.join("\n- "));
  process.exit(1);
}
console.log(`Données OK${only ? ` (${only})` : ""}.`);
