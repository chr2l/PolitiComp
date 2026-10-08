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
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&rsquo;/g, "’")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n")
    .trim();

(async () => {
  const html = await (await fetch(URL)).text();
  const start = html.indexOf("window.__NUXT__=");
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
        if (c.content.number) list.push("Chiffrage : " + strip(c.content.number));
        if (list.length) { props[c.id] = list; total += list.length; }
      }
      return { id: s.id, name: s.name.trim(), props };
    }),
  }));

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
  console.log(`${candidates.length} candidats, ${themes.length} thèmes, ${total} propositions — ${changed ? "MODIFIÉ" : "inchangé"}`);
})();
