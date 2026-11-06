# NOTES — PolitiComp

Contexte à relire en début de session. À tenir à jour.

## En bref
Comparateur politique : site statique (site/), données JSON (data/), scripts.

## Ouverture aux IA (PR claude/public-llm-access)
- Le site n'appelle aucune IA : bouton « Activer mon IA » = WebLLM 0.2.84 (jsdelivr) + Qwen2.5-3B (~2 Go, WebGPU, Chrome/Edge). Effacement auto du modèle (caches webllm/*) si pas utilisé depuis 7 j / 30 j / à la fermeture (choix du visiteur, vérifié à la visite suivante) + bouton « Supprimer ». Sans IA : « Copier pour mon IA ». Plus de connexion Claude, connecteur MCP ni Ollama (retirés le 2026-11-06 à la demande).
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
- 2026-11-04 : face-à-face : en-tête des candidats plus fin et collé sous la vraie barre du haut ; cases vides réduites.
- 2026-11-04 : version du comparateur publiée dans Claude + bouton « Ouvrir dans Claude ».
- 2026-11-06 : retrait de Claude (bouton, connecteur /mcp) et d'Ollama ; seule l'IA téléchargée reste, avec effacement automatique.
- 2026-11-06 : vue « Par thème » refaite (maquette A) : thèmes en haut, panneau des candidats avec interrupteurs (Tous, Aucun, Avec propositions, blocs, « seul »), recherche dans toutes les propositions, raccourcis clavier (touche ?), sélection gardée dans le navigateur et lien partageable (#s=…&c=…).
- 2026-11-06 : barres de défilement cachées sur tout le site (le défilement marche toujours).
- 2026-11-06 : ligne des sources déplacée de la barre du haut vers le bas de la page.
- 2026-11-06 : fenêtre « Activer mon IA » plus simple et accueillante ; le téléchargement continue si on la ferme (progression affichée sur le bouton) ; la discussion s'ouvre toute seule avec un message « Ton IA est prête ! ».
- 2026-11-06 : la ligne parti + position revient à la ligne au lieu de dépasser des fiches.
- 2026-11-06 : position sur l'échiquier plus compacte (sigle + petite barre à 5 cases + bloc court) ; précisions de classement repliées derrière un « i ».
- 2026-11-06 : site moins froid : couleurs plus chaudes, coins plus ronds, ombres douces, boutons arrondis, encadré « Bienvenue ! » (masquable).
- 2026-11-06 : face-à-face : en-tête des candidats n'est plus collant (il mangeait le texte) ; chaque case rappelle le nom du candidat.
- 2026-11-06 : boutons « Copier le lien », « Poser une question », « Précédent/Suivant » remplacés par des symboles (bulle d'explication au survol).
- 2026-11-06 : titre de l'onglet : « PolitiComp ».
- 2026-11-06 : boutons de blocs du panneau remplacés par la petite barre de position (G à gauche, D à droite, bulle au survol).
