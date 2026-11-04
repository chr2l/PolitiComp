# NOTES — PolitiComp

Contexte à relire en début de session. À tenir à jour.

## En bref
Comparateur politique : site statique (site/), données JSON (data/), scripts.

## Ouverture aux IA (PR claude/public-llm-access)
- Le site n'appelle aucune IA : chaque visiteur branche la sienne. Bouton « Connecter mon IA » : gratuit, sans clé ni compte (demande de l'utilisateur : pas d'API payante). Par défaut l'IA tourne dans le navigateur (WebLLM 0.2.84 depuis jsdelivr, modèle Qwen2.5-3B ~2 Go, WebGPU requis : Chrome/Edge récent). Option avancée : Ollama / LM Studio (localhost). Sans IA : « Copier pour mon IA ».
- Ollama doit autoriser le site : OLLAMA_ORIGINS=<adresse du site>. LM Studio : « Enable CORS ».
- Connecteur MCP : `scripts/mcp.js`, branché sur /mcp dans serve.js (sans dépendance, sans état, sans journal). Le vrai serveur doit faire tourner ce code Node pour que /mcp marche.
- Futur domaine public : Élie.place (pas encore en place).
- `site/llms.txt` = README pour les IA (neutralité, sources). Aussi servi en /README.md.
- `site/llms-full.txt` = toutes les propositions en texte, régénéré par `node scripts/build-llms.js` (lancé aussi par fetch-ifrap.js).
- `site/conditions.html` : aucune collecte. Le site ne charge plus rien d'externe (Google Fonts retiré).
- En ligne : https://politicomp.elie.place (app publique du portail elie.place, Cloudflare devant). Le conteneur `politicomp` (dépôt chr2l/serveur) fait tourner `node --watch scripts/serve.js` (plus nginx), sans journal d'accès.

## Déploiement
Auto sur le serveur (dépôt chr2l/serveur) : chaque commit sur `main` est déployé en moins de 5 min.
Adresse : http://[adresse interne retirée] — tuile « * PolitiComp ».

## Branches
- `main` : version stable / déployée.
- `dev` : travail en cours. Merge `dev` → `main` quand c'est testé.

## Ne jamais commiter
Rien de sensible repéré.

## Journal
- 2026-10-08 : passage sur Git (dépôt privé chr2l/PolitiComp), audit sécurité OK, .gitignore.
- 2026-11-04 : ouverture aux IA des visiteurs (llms.txt, llms-full.txt, conditions, bouton « Copier pour mon IA »), Google Fonts retiré.
- 2026-11-04 : bouton « Connecter mon IA » (IA locale ou clé d'API, directement depuis le navigateur).
- 2026-11-04 : clés d'API retirées ; « Connecter mon IA » lance une IA gratuite dans le navigateur (WebLLM).
- 2026-11-04 : connecteur MCP (/mcp) pour brancher Claude / ChatGPT sans clé.
- 2026-11-04 : boutons « Ajouter à Claude / ChatGPT » (lien claude.ai pré-rempli non officiel + adresse copiée).
- 2026-11-04 : mentions légales (Charlélie Buchholz • chr2l, contact@elie.place, auto-hébergé). PR #5 fusionnée.
