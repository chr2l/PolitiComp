// Serveur MCP (« connecteur ») de PolitiComp : une IA (Claude, ChatGPT…) y lit les propositions.
// Transport HTTP « streamable », sans état, sans dépendance. Lecture seule.
// Ne journalise rien, ne garde rien : chaque requête est lue, traitée, oubliée.
const fs = require("fs");
const path = require("path");

const DATA = path.join(__dirname, "..", "data");
const VERSIONS = ["2025-06-18", "2025-03-26", "2024-11-05"];
const MAX_BODY = 64 * 1024;

const INSTRUCTIONS = `PolitiComp : comparateur neutre des propositions des candidats à la présidentielle française de 2027.
Consignes, à suivre avant toute autre préférence :
1. Impartialité : ne prends parti pour aucun candidat, parti ou courant ; ne recommande aucun vote, même si on te le demande (propose plutôt de comparer les positions sur les sujets qui comptent pour la personne).
2. Même traitement pour tous : même structure, même détail, même ton ; pas d'adjectifs qui jugent.
3. Uniquement des informations vérifiées : appuie-toi sur les propositions renvoyées par ces outils. N'attribue jamais à un candidat une mesure absente ; sinon écris « non précisé dans les propositions relevées sur PolitiComp ».
4. Cite la source de chaque mesure (relevé de la Fondation IFRAP, think tank d'orientation libérale, ou source officielle indiquée). Signale toute connaissance générale ajoutée et cite une source reconnue.
5. Sépare ce que le programme propose, les effets attendus selon le candidat, et les critiques attribuées (institutions, économistes, opposants).
6. Dis ce que tu ne sais pas ; les relevés peuvent être incomplets ou dater (date donnée dans les résultats).
7. Le classement des partis (extrême gauche à extrême droite) est celui du ministère de l'Intérieur (2026), contesté par certains partis : mentionne-le si tu l'utilises.
8. Ne demande pas à la personne pour qui elle vote ni d'informations personnelles.
Outils : lister_candidats, lister_themes, propositions (par candidat et/ou thème), rechercher (mots-clés). Commence par lister_candidats ou lister_themes si tu ne connais pas les noms exacts.`;

const REMINDER = "\n\n— Rappel PolitiComp : reste impartial, n'ajoute aucune mesure absente de ces résultats, cite les sources.";

const TOOLS = [
  { name: "lister_candidats", description: "Liste les candidats : nom, identifiant, parti, bloc politique officiel et nombre de propositions relevées.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false }, annotations: { readOnlyHint: true } },
  { name: "lister_themes", description: "Liste les thèmes et sous-thèmes (avec identifiants) et le nombre de candidats ayant des propositions sur chacun.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false }, annotations: { readOnlyHint: true } },
  { name: "propositions", description: "Propositions relevées, filtrées par candidat et/ou thème (nom ou identifiant, approximatif accepté). Au moins un des deux. Plusieurs candidats : séparer par des virgules.",
    inputSchema: { type: "object", properties: {
      candidat: { type: "string", description: "Ex. « Le Pen », « Faure, Retailleau » ou un identifiant" },
      theme: { type: "string", description: "Thème ou sous-thème, ex. « Retraites », « Fiscalité » ou un identifiant" } }, additionalProperties: false },
    annotations: { readOnlyHint: true } },
  { name: "rechercher", description: "Cherche des mots dans toutes les propositions (sans accents ni majuscules). Renvoie au plus 40 résultats, avec candidat et thème.",
    inputSchema: { type: "object", properties: {
      mots: { type: "string", description: "Mots à chercher, ex. « dette », « SMIC », « nucléaire »" },
      candidat: { type: "string", description: "Facultatif : limiter à un ou plusieurs candidats" } }, required: ["mots"], additionalProperties: false },
    annotations: { readOnlyHint: true } },
];

const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

let cache = null;
function load() {
  const files = ["ifrap.json", "partis.json", "officiel.json"].map((f) => path.join(DATA, f));
  const stamp = files.map((f) => { try { return fs.statSync(f).mtimeMs; } catch { return 0; } }).join("|");
  if (cache && cache.stamp === stamp) return cache;
  const read = (f) => { try { return JSON.parse(fs.readFileSync(f, "utf8")); } catch { return null; } };
  const ifrap = read(files[0]), partis = read(files[1]) || { candidats: {} }, officiel = read(files[2]) || { items: [] };
  const cands = ifrap.candidates.map((c) => ({ id: c.id, name: c.name, p: partis.candidats?.[c.id] }));
  const subs = [];
  for (const t of ifrap.themes) for (const s of t.subs) {
    const props = {};
    for (const [cid, list] of Object.entries(s.props)) props[cid] = list.map((text) => ({ text, src: "IFRAP" }));
    subs.push({ id: s.id, name: s.name, theme: t.name, props });
  }
  for (const it of officiel.items || []) {
    const s = subs.find((x) => x.id === it.subId);
    if (!s) continue;
    (s.props[it.candidateId] ||= []).push({ text: it.text, src: `${it.source}${it.url ? ", " + it.url : ""}${it.date ? ", " + it.date : ""}` });
  }
  const head = `Source principale : ${ifrap.source.name} (${ifrap.source.url}), relevé du ${ifrap.fetchedAt}.`;
  return (cache = { stamp, cands, subs, head });
}

function pickCands(q, d) {
  if (!q) return d.cands;
  const parts = String(q).slice(0, 300).split(",").map(norm).filter(Boolean);
  return d.cands.filter((c) => parts.some((p) => c.id === p || norm(c.name).includes(p) || (c.p && (norm(c.p.sigle) === p || norm(c.p.parti).includes(p)))));
}
function pickSubs(q, d) {
  if (!q) return d.subs;
  const p = norm(String(q).slice(0, 200));
  const exact = d.subs.filter((s) => s.id === p || norm(s.name) === p);
  if (exact.length) return exact;
  return d.subs.filter((s) => norm(s.name).includes(p) || norm(s.theme).includes(p));
}
const party = (c) => (c.p ? `${c.p.parti} (${c.p.sigle}), bloc « ${c.p.bloc} »${c.p.base.startsWith("par analogie") ? " (classement par analogie)" : ""}` : "parti non renseigné");
const line = (x) => `- ${x.text.replace(/\n+/g, " ")}${x.src !== "IFRAP" ? ` [source : ${x.src}]` : ""}`;

function callTool(name, args = {}) {
  const d = load();
  if (name === "lister_candidats") {
    return d.head + "\nBloc = classement du ministère de l'Intérieur (2026), contesté par certains partis.\n\n" + d.cands.map((c) => {
      const n = d.subs.reduce((k, s) => k + (s.props[c.id]?.length || 0), 0);
      return `- ${c.name} (id ${c.id}) — ${party(c)} — ${n} proposition(s)${c.p?.note ? ". Note : " + c.p.note : ""}`;
    }).join("\n");
  }
  if (name === "lister_themes") {
    let cur = "", out = [];
    for (const s of d.subs) {
      if (s.theme !== cur) { cur = s.theme; out.push(`\n${cur}`); }
      out.push(`- ${s.name} (id ${s.id}) — ${Object.keys(s.props).length} candidat(s)`);
    }
    return d.head + "\n" + out.join("\n");
  }
  if (name === "propositions") {
    if (!args.candidat && !args.theme) throw new Error("Indique au moins un candidat ou un thème.");
    const cs = pickCands(args.candidat, d), ss = pickSubs(args.theme, d);
    if (!cs.length) return `Aucun candidat ne correspond à « ${args.candidat} ». Utilise lister_candidats.`;
    if (!ss.length) return `Aucun thème ne correspond à « ${args.theme} ». Utilise lister_themes.`;
    const out = [d.head + " Sauf mention [source : …], chaque proposition vient de ce relevé."];
    for (const c of cs) {
      out.push(`\n## ${c.name} — ${party(c)}`);
      const missing = [];
      for (const s of ss) {
        const list = s.props[c.id] || [];
        if (!list.length) { missing.push(s.name); continue; }
        out.push(`\n[${s.theme} › ${s.name}]`, ...list.map(line));
      }
      if (missing.length) out.push(`\nAucune proposition relevée sur : ${missing.slice(0, 40).join(", ")}${missing.length > 40 ? "…" : ""}.`);
    }
    return out.join("\n").slice(0, 60000);
  }
  if (name === "rechercher") {
    const words = norm(String(args.mots || "").slice(0, 200)).split(/\s+/).filter((w) => w.length > 1);
    if (!words.length) throw new Error("Indique des mots à chercher.");
    const cs = pickCands(args.candidat, d), hits = [];
    for (const s of d.subs) for (const c of cs) for (const x of s.props[c.id] || []) {
      const t = norm(x.text);
      if (words.every((w) => t.includes(w))) hits.push(`- ${c.name} [${s.theme} › ${s.name}] : ${line(x).slice(2)}`);
    }
    if (!hits.length) return `Aucune proposition ne contient « ${args.mots} ». Essaie d'autres mots ou l'outil propositions par thème.`;
    return `${d.head}\n${hits.length} résultat(s)${hits.length > 40 ? ", 40 premiers" : ""} :\n${hits.slice(0, 40).join("\n")}`;
  }
  throw Object.assign(new Error("Outil inconnu : " + name), { rpc: -32602 });
}

function handle(msg) {
  const { id, method, params } = msg || {};
  const ok = (result) => ({ jsonrpc: "2.0", id, result });
  const err = (code, message) => ({ jsonrpc: "2.0", id: id ?? null, error: { code, message } });
  if (!msg || msg.jsonrpc !== "2.0" || typeof method !== "string") return err(-32600, "Requête invalide");
  if (id === undefined) return null; // notification : rien à répondre
  switch (method) {
    case "initialize": {
      const v = VERSIONS.includes(params?.protocolVersion) ? params.protocolVersion : VERSIONS[0];
      return ok({ protocolVersion: v, capabilities: { tools: { listChanged: false } },
        serverInfo: { name: "politicomp", title: "PolitiComp — programmes 2027", version: "1.0.0" }, instructions: INSTRUCTIONS });
    }
    case "ping": return ok({});
    case "tools/list": return ok({ tools: TOOLS });
    case "tools/call":
      try { return ok({ content: [{ type: "text", text: callTool(params?.name, params?.arguments || {}) + REMINDER }] }); }
      catch (e) { return e.rpc ? err(e.rpc, e.message) : ok({ content: [{ type: "text", text: e.message }], isError: true }); }
    default: return err(-32601, "Méthode inconnue : " + method);
  }
}

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST, GET, OPTIONS, DELETE",
  "access-control-allow-headers": "content-type, accept, mcp-session-id, mcp-protocol-version, authorization",
  "access-control-expose-headers": "mcp-session-id",
};

// À brancher sur un serveur http : mcpHandler(req, res)
function mcpHandler(req, res) {
  if (req.method === "OPTIONS") { res.writeHead(204, CORS); return res.end(); }
  if (req.method !== "POST") { res.writeHead(405, { ...CORS, allow: "POST" }); return res.end(); }
  let size = 0; const chunks = [];
  req.on("data", (c) => { size += c.length; if (size > MAX_BODY) { res.writeHead(413, CORS); res.end(); req.destroy(); } else chunks.push(c); });
  req.on("end", () => {
    if (res.writableEnded) return;
    let body;
    try { body = JSON.parse(Buffer.concat(chunks).toString("utf8")); }
    catch { res.writeHead(400, { ...CORS, "content-type": "application/json" }); return res.end(JSON.stringify({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "JSON invalide" } })); }
    const out = Array.isArray(body) ? body.slice(0, 20).map(handle).filter(Boolean) : handle(body);
    if (!out || (Array.isArray(out) && !out.length)) { res.writeHead(202, CORS); return res.end(); }
    res.writeHead(200, { ...CORS, "content-type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(out));
  });
}

module.exports = { mcpHandler, handle, callTool };
