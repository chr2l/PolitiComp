# Contribuer à PolitiComp

Merci de votre aide ! Ce projet est un comparateur politique : la confiance passe par la neutralité et les sources.

## Signaler une erreur

Ouvrez une *issue* en indiquant :
- le candidat et le thème concernés ;
- ce qui est faux ou manquant ;
- **une source** (lien vers le programme officiel, une déclaration, un document public).

## Proposer une modification (pull request)

1. Faites un *fork*, puis une branche avec un nom clair (`correction-retraites-dupont`, par exemple).
2. Gardez la modification petite et centrée sur un seul sujet.
3. Testez en local : `node scripts/serve.js`, puis <http://localhost:5177>.
4. Ouvrez la pull request en remplissant le modèle proposé.

## Règles pour les données

- **Toute proposition ajoutée a une source** : lien et date. Pas de source, pas d'ajout.
- Recopiez la proposition fidèlement, sans la reformuler en mieux ou en pire.
- `data/ifrap.json` et `site/llms-full.txt` sont **générés** : ne les modifiez pas à la main. Lancez `node scripts/fetch-ifrap.js`.
- Les ajouts tirés des sources officielles vont dans `data/officiel.json`.

## Règles pour le site

- Même traitement pour tous les candidats : même place, même mise en forme, aucun adjectif qui juge.
- Aucun outil de mesure d'audience, cookie, police ou script externe : le site promet de ne rien collecter (voir `site/conditions.html`).
- Pas de dépendance ni d'étape de construction : le site reste un simple fichier HTML.

## Ne jamais publier

Clés d'API, mots de passe, adresses IP, chemins de votre ordinateur, données personnelles.
