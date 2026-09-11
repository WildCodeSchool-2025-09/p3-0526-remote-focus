# Focus — Plan de démarrage pour Claude Code (essai global)

Objectif : donner à Claude Code tout le contexte nécessaire (US Trello, maquettes,
documentation technique) pour qu'il puisse implémenter l'application de façon autonome,
en respectant les conventions déjà posées par l'équipe.

## 1. Checklist — éléments à rassembler

### Contexte projet
- [ ] `CLAUDE.md` (généré à côté de ce fichier) — à placer à la racine du repo, Claude Code
      le lit automatiquement
- [ ] Le fichier de conventions de nommage partagé (celui déjà présent dans le repo GitHub)

### User Stories (Trello)
- [ ] Export des ~35 US du board **P3-Focus** (board ID `6a7086ba563049b6fe30ebc5`)
      - Si Claude Code a lui-même un connecteur Trello configuré, indiquer directement
        l'ID du board
      - Sinon, exporter les cartes en Markdown/JSON (titre, description, critères de
        validation, étapes techniques `[Back]`/`[Front]`) — un fichier par US ou un seul
        fichier consolidé, ex. `docs/user-stories/US-CAT-01.md`
- [ ] Préciser l'ordre/priorité (MoSCoW + sprint) si tu veux que Claude Code les traite
      dans un ordre précis plutôt que de choisir lui-même

### Maquettes et design
- [ ] `Focus - StyleGuide - standalone.html`
- [ ] `Focus - Wireframe App Films Series - standalone.html`
- [ ] `logo_focus.png`, `col1.png`
- → à copier dans `docs/design/` du repo

### Documentation technique
- [ ] `DOC_API_TMDB` → `docs/DOC_API_TMDB`
- [ ] `schemaFinal.sql` à jour (avec les modifications listées dans `CLAUDE.md`)
- [ ] Éventuels fichiers `.env.example` / variables d'environnement nécessaires
      (connexion MySQL, clé API TMDB, secret JWT…)

### Accès
- [ ] Accès au repo GitHub, en partant de la branche `dev`
      (https://github.com/WildCodeSchool-2025-09/p3-0526-remote-focus/tree/dev) —
      monorepo initialisé + Navbar déjà en partie en place
- [ ] Branches à consulter en plus de `dev` (voir détail section 4 ci-dessous) :
      `US-CAT-01`, `US-DET-01`, `US-REC-01`, `US-ACC-01`, `Presentation_branch`
      (`US-INIT-00` et `US-NAV-01` sont déjà entièrement fusionnées dans `dev`, rien à
      y récupérer)
- [ ] Clé API TMDB si le seed doit être rejoué
- [ ] Base MySQL disponible localement (ou instructions pour la monter)

## 2. Étapes recommandées pour Claude Code

1. **Lire `CLAUDE.md`** en premier pour charger le contexte stack/conventions/design
2. **Partir de la branche `dev`** du repo (monorepo initialisé, Navbar déjà en partie en
   place) et **lire l'état actuel du repo** (arborescence, code déjà en place) avant de
   proposer quoi que ce soit — ne pas repartir de zéro ni réécrire ce qui existe déjà.
   Vérifier aussi si d'autres branches contiennent de la data ou des façons de faire déjà
   validées par l'équipe (à checker au besoin, pas à copier aveuglément) — l'objectif est
   de rester cohérent avec l'existant, pas d'introduire de nouvelles conventions
3. **Lire les US** dans `docs/user-stories/` et construire un plan d'implémentation
   global (ordre de dépendances entre US, ex. auth avant profil)
4. **Consulter les maquettes** (`docs/design/`) pour chaque écran avant de coder le
   frontend correspondant
5. **Une US = une branche**, nommée selon l'identifiant (`US-XXX-NN`)
6. Respecter les préfixes de méthodes backend et le pattern seeder documentés dans
   `CLAUDE.md`
7. Lancer le lint Biome avant de considérer une US terminée (c'est le gate de CI)
8. Documenter les décisions prises en cours de route (ex. si le choix JWT
   cookie/localStorage doit être tranché) plutôt que de les laisser implicites

## 3. Détail des branches non fusionnées dans `dev`

État au 11/09/2026 (vérifier à nouveau avant de lancer Claude Code, l'équipe pousse en continu).

| Branche | Commits en avance sur `dev` | Contenu |
|---|---|---|
| `US-CAT-01` | 15 | Catalogue : route backend "top rated" + genres, page Catalogue frontend (`DiscoverSection`, `MediaSection`, sections par genre), composant carousel, corrections navbar/largeur |
| `US-DET-01` | 20 | Fiche détail média : routes backend (détail film, cast limité à 10 + total, filmographie acteur), composants `MediaHeader`, `MediaInfo`, `CastList`/`ActorPortraitCard`, `KnownFrom`/`MediaCard`, `Breadcrumb`, toggle responsive mobile, icônes lucide, typage `userStatus`/`userRating` |
| `US-REC-01` | 20 | Recherche : `searchRepository.ts` (recherche média/personne, comptage), route `/api/search`, détection anime via `is_anime`, types `Media`/`Person`/`SearchResults`, hook `useDebounce`, composant `SearchBar`, `SearchContext`/`SearchProvider`, barre de recherche globale dans le Header |
| `US-ACC-01` | 2 | Très en amont : premier setup + action/repository de la homepage, une route et un fetch front — peu de choses exploitables en l'état |
| `Presentation_branch` | 57 | Fusion de plusieurs branches (dont US-ACC-01, US-REC-01) préparée pour une démo — utile pour voir plusieurs features cohabiter, mais peut contenir des raccourcis pris dans l'urgence pour la présentation ; à relire avec prudence plutôt qu'à fusionner tel quel |

Branches déjà entièrement fusionnées dans `dev` (rien à récupérer) : `US-INIT-00`, `US-NAV-01`.
`main` est en retard sur `dev` (38 commits) — pas de source à y récupérer.

## 4. Point d'attention

Donner "tout d'un coup" est pertinent pour cet essai, mais garde à l'esprit :
- Un dump massif de 35 US + maquettes + doc API dans un seul prompt peut dépasser ce que
  Claude Code peut traiter utilement en une passe — il vaut mieux qu'il lise ces fichiers
  depuis le repo au fur et à mesure (via `CLAUDE.md` + les fichiers `docs/`) plutôt que
  tout recevoir dans le message initial
- Les décisions encore en attente (stockage JWT, migrations `schemaFinal.sql`) devraient
  être tranchées par l'équipe avant de lancer Claude Code dessus, sinon il devra deviner
