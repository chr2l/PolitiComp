# NOTES — PolitiComp

Contexte à relire en début de session. À tenir à jour.

## En bref
Comparateur politique : site statique (site/), données JSON (data/), scripts.

## Ouverture aux IA (PR claude/public-llm-access)
- Le site n'appelle aucune IA : bouton « Activer mon IA » = WebLLM 0.2.84 (jsdelivr) + Qwen2.5-3B (~2 Go, WebGPU, Chrome/Edge). Effacement auto du modèle (caches webllm/*) si pas utilisé depuis 7 j / 30 j / à la fermeture (choix du visiteur, vérifié à la visite suivante) + bouton « Supprimer ». Sans IA : « Copier pour mon IA ». Plus de connexion Claude, connecteur MCP ni Ollama (retirés le 2026-11-06 à la demande).
- `site/llms.txt` = README pour les IA (neutralité, sources). Aussi servi en /README.md.
- `site/llms-full.txt` = toutes les propositions en texte, régénéré par `node scripts/build-llms.js` (lancé aussi par fetch-ifrap.js).
- `site/conditions.html` : aucune collecte. Le site ne charge plus rien d'externe (Google Fonts retiré).
- En ligne : https://politicomp.elie.place (Cloudflare devant). Le serveur fait tourner `node scripts/serve.js`, sans journal d'accès.

## Déploiement
Automatique via Cloudflare Pages (`node scripts/build-pages.js` → `dist/`) : chaque commit sur `main` est mis en ligne en quelques minutes.
Les détails du serveur de l'éditeur ne sont pas dans ce dépôt (dépôt public).

## Branches
- `main` : version stable / déployée.
- `dev` : travail en cours. Merge `dev` → `main` quand c'est testé.

## Ne jamais commiter (dépôt public)
Adresses IP, chemins locaux, détails du serveur maison, e-mails perso, clés ou mots de passe. Seules infos perso autorisées : celles des mentions légales (nom de l'éditeur, contact@elie.place).

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
- 2026-11-06 : barre du haut collée en haut, pleine largeur (plus de marge) ; onglets de page en style « enfoncé », distinct des pastilles de thèmes ; barre compacte sur téléphone.
- 2026-11-06 : blocs du panneau : une seule barre de 5 carrés cliquables (G … D), carré plein = bloc affiché, à moitié = en partie.
- 2026-11-06 : fenêtre de discussion flottante sur ordinateur : déplaçable par sa barre de titre, redimensionnable par le coin, position gardée (double-clic sur la barre = position d'origine). Plein écran sur téléphone.
- 2026-11-07 : fenêtre de discussion flottante : ombre en couches, surface et barre de titre plus claires en mode sombre, ombre plus forte pendant le déplacement (repères « au premier plan »).
- 2026-11-08 : page d'infos (conditions.html) refaite : sommaire collant à gauche qui suit la lecture (barre repliable sur téléphone), couleurs du comparateur.
- 2026-11-08 : passage sur Cloudflare Pages (projet `politicomp`, build `node scripts/build-pages.js` → `dist/`, adresses partagées avec serve.js dans `scripts/pages.js`), mentions légales : hébergeur Cloudflare. L'icône est gérée à part (projet elie.place).
- 2026-11-08 : icône [P] jaune remise dans les pages (site/favicon.svg) : le site est sur Cloudflare Pages, le portail elie.place ne peut plus la poser. À garder.
- 2026-11-08 : dépôt préparé pour le public : README, CONTRIBUTING, modèle de PR, captures retirées, IP et détails du serveur retirés des notes.
- 2026-11-08 : nouveau dépôt public à l'historique nettoyé (ancien : ARCHIVES-PolitiComp, privé) ; licence AGPL v3 pour le code (données IFRAP exclues).
- 2026-11-09 : barre du haut : icône balance en caractères reprise d'elie.place (texte jaune, sans fond) + titre « PolitiComp » + sous-titre ; bouton FR·EN (interface traduite, propositions laissées en français ; choix gardé, sinon langue du navigateur ; lien ?lang=en).
- 2026-11-11 : pied de page : ligne « Infos relevées le … · mises à jour chaque semaine » (date du relevé IFRAP, `fetchedAt`), avec petite horloge ; FR et EN.
