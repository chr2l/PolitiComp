# PolitiComp

Comparateur **neutre et sourcé** des programmes des candidats à l'élection présidentielle française de 2027.

- Site : <https://politicomp.elie.place>
- Aucune collecte : pas de cookie, pas de traceur, pas de compte. Le site n'appelle aucune IA ; le visiteur peut lancer une IA gratuite **dans son propre navigateur** (WebLLM).
- Tout est public : le code, les données et leurs sources.

## Comment c'est fait

Un site statique, sans framework ni dépendance. Hébergé sur Cloudflare Pages.

```
site/                 ce que voit le visiteur
  index.html          le comparateur (HTML + CSS + JS dans un seul fichier)
  conditions.html     conditions d'utilisation, confidentialité, mentions légales
  llms.txt            consignes de neutralité et accès aux données pour les IA
  llms-full.txt       toutes les propositions en texte (fichier généré)
  favicon.svg         icône de l'onglet
  robots.txt
data/                 les données
  ifrap.json          propositions relevées par la Fondation IFRAP (fichier généré)
  officiel.json       propositions tirées des sources officielles des candidats
  partis.json         partis, sigles et classement officiel (ministère de l'Intérieur)
scripts/
  serve.js            petit serveur local, sans journal ni cookie
  fetch-ifrap.js      met à jour data/ifrap.json depuis le comparateur IFRAP
  build-llms.js       régénère site/llms-full.txt
  pages.js            liste des adresses du site (partagée)
  build-pages.js      construit dist/ pour l'hébergement (Cloudflare Pages)
```

## Lancer en local

Il faut seulement [Node.js](https://nodejs.org) (18 ou plus), sans rien installer d'autre.

```sh
node scripts/serve.js        # puis ouvrir http://localhost:5177
node scripts/fetch-ifrap.js  # mettre à jour les données IFRAP (et llms-full.txt)
```

## Sources des données

- **Fondation IFRAP**, comparateur « Présidentielles 2027 » : <https://www.ifrap.org/comparateurs/presidentielles-2027>. L'IFRAP est un think tank d'orientation libérale ; le site le précise.
- **Sources officielles des candidats** (`data/officiel.json`) : chaque proposition a son lien et sa date.
- **Classement des partis** : nuancier administratif du ministère de l'Intérieur (2026), contesté par certains partis ; le site le signale.

## Principes

1. Neutralité : même traitement pour chaque candidat, aucun jugement, aucune consigne de vote.
2. Chaque donnée a une source. Rien n'est inventé.
3. Rien n'est collecté sur les visiteurs.

## Contribuer

Les relectures, signalements d'erreur et pull requests sont les bienvenus : voir [CONTRIBUTING.md](CONTRIBUTING.md).

## Licence

Le code est sous licence **GNU AGPL v3** (voir [LICENSE](LICENSE)) : vous pouvez le réutiliser et le modifier, mais toute version modifiée, y compris un site en ligne, doit publier son code sous la même licence.

Les données de `data/ifrap.json` appartiennent à la Fondation IFRAP, et les programmes à leurs candidats : elles ne sont pas couvertes par cette licence. Voir leurs sources.

## Contact

Éditeur : Charlélie Buchholz • chr2l — <contact@elie.place> (voir les [mentions légales](https://politicomp.elie.place/conditions.html)).
