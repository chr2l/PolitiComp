# Consignes pour Claude — PolitiComp

- Français simple, phrases courtes : l'utilisateur ne code pas. Détail : NOTES.md ; y ajouter une ligne au Journal en fin de tâche.
- Site statique sans build : `site/index.html`. Données : `data/partis.json`, `data/officiel.json`, `data/ifrap.json`.
- Mettre à jour les données IFRAP : `node scripts/fetch-ifrap.js`. Serveur local : `node scripts/serve.js`.
- Comparateur politique : rester neutre et équilibré entre les partis, sourcer chaque donnée, ne rien inventer.
- Dépôt PUBLIC : ne jamais commiter d'IP, chemin local, détail du serveur ou e-mail perso. Branches `claude/*` : PR fusionnée automatiquement dans `main`, en ligne en moins de 5 min.
- Les JSON peuvent être gros : chercher la clé avec Grep plutôt que tout lire.

- rtk actif (hook) : sortie Bash compressée auto. Sortie brute : `rtk bypass <cmd>`. Read/Grep/Glob non concernés.
