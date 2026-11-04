# NOTES — PolitiComp

Contexte à relire en début de session. À tenir à jour.

## En bref
Comparateur politique : site statique (site/), données JSON (data/), scripts.

## Ouverture aux IA (PR claude/public-llm-access)
- Le site n'appelle aucune IA : chaque visiteur branche la sienne. Bouton « Copier pour mon IA » (consignes + propositions).
- `site/llms.txt` = README pour les IA (neutralité, sources). Aussi servi en /README.md.
- `site/llms-full.txt` = toutes les propositions en texte, régénéré par `node scripts/build-llms.js` (lancé aussi par fetch-ifrap.js).
- `site/conditions.html` : aucune collecte. Le site ne charge plus rien d'externe (Google Fonts retiré).
- Le serveur (dépôt chr2l/serveur) doit servir ces chemins et ne garder aucun journal d'accès.

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
