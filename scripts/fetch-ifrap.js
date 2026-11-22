// Récupère le comparateur IFRAP Présidentielles 2027 et produit data/ifrap.json
// Usage : node scripts/fetch-ifrap.js
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const URL = "https://www.ifrap.org/comparateurs/presidentielles-2027";
const OUT = path.join(__dirname, "..", "data", "ifrap.json");

const strip = (html) =>
  String(html || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|li|div)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&rsquo;/g, "’")
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&amp;/g, "&")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n")
    .trim();

(async () => {
  const res = await fetch(URL);
  if (!res.ok) throw new Error(`page IFRAP indisponible (HTTP ${res.status})`);
  const html = await res.text();
  const start = html.indexOf("window.__NUXT__=");
  if (start < 0) throw new Error("données window.__NUXT__ introuvables : la structure de la page a changé");
  const end = html.indexOf("</script>", start);
  const sandbox = { window: {} };
  vm.runInNewContext(html.slice(start, end), sandbox);
  const comp = sandbox.window.__NUXT__.state.comparator;

  const candidates = comp.candidates.map((c) => ({
    id: c.id,
    name: `${c.first_name.trim()} ${c.last_name.trim()}`,
    party: (c.political_party || "").trim(),
    photo: c.photo && c.photo.url,
  }));

  let total = 0;
  const themes = comp.content.map((t) => ({
    id: t.id,
    name: t.name.trim(),
    subs: t.items.map((s) => {
      const props = {};
      for (const c of s.items) {
        const list = (c.content.proposals || []).map((p) => strip(p.text)).filter(Boolean);
        const chiffre = numberText(c.content.number);
        if (chiffre) list.push("Chiffrage : " + chiffre);
        if (list.length) { props[c.id] = list; total += list.length; }
      }
      return { id: s.id, name: s.name.trim(), props };
    }),
  }));

  // Garde-fou : ne jamais remplacer data/ifrap.json par un relevé vide ou cassé.
  if (!candidates.length || !themes.length || !total) {
    throw new Error(`relevé suspect (${candidates.length} candidats, ${themes.length} thèmes, ${total} propositions) : ancien fichier gardé`);
  }

  let previous = null;
  try { previous = JSON.parse(fs.readFileSync(OUT, "utf8")); } catch {}
  const data = {
    source: { name: "Fondation IFRAP – Comparateur Présidentielles 2027", url: URL },
    fetchedAt: new Date().toISOString().slice(0, 10),
    candidates,
    themes,
  };
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(data));
  const changed = !previous || JSON.stringify(previous.themes) !== JSON.stringify(themes)
    || JSON.stringify(previous.candidates) !== JSON.stringify(candidates);
  require("./build-llms")(); // met à jour site/llms-full.txt
  const before = previous ? countProps(previous) : 0;
  console.log(`${candidates.length} candidats, ${themes.length} thèmes, ${total} propositions${changed && previous ? ` (avant : ${before})` : ""} — ${changed ? "MODIFIÉ" : "inchangé"}`);
})().catch((e) => {
  console.error("ÉCHEC — data/ifrap.json n'a pas été modifié :", e.message);
  process.exit(1);
});

// Le chiffrage est parfois un texte, parfois un objet (ex. { text: "…" }) : on garde seulement un vrai texte.
function numberText(n) {
  if (!n) return "";
  if (typeof n === "string" || typeof n === "number") return strip(String(n));
  if (typeof n === "object") {
    for (const k of ["text", "value", "label", "amount", "content"]) if (typeof n[k] === "string" || typeof n[k] === "number") return strip(String(n[k]));
  }
  return "";
}

function countProps(d) {
  let n = 0;
  for (const t of d.themes || []) for (const s of t.subs || []) for (const l of Object.values(s.props || {})) n += l.length;
  return n;
}
