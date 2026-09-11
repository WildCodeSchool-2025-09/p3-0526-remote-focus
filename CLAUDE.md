# Focus — Contexte projet pour Claude Code

Ce fichier est lu automatiquement par Claude Code au démarrage. Il centralise le contexte
que l'équipe a déjà validé, pour éviter de le ré-expliquer à chaque session.

## Présentation

Focus est une application web de suivi de médias (films, séries, anime) développée par une
équipe de 4 étudiants à la Wild Code School, sur 4 sprints d'une semaine, en français.

- Repo : `WildCodeSchool-2025-09/p3-0526-remote-focus`
- Convention de branche : une US par branche, nommée d'après son identifiant (`US-CAT-01`, etc.)

## Stack technique

- Monorepo Node.js/TypeScript
- **Backend** : Express.js, MySQL (`mysql2`), requêtes SQL brutes préparées, pas d'ORM
- **Frontend** : Vite/React + TypeScript, Tailwind CSS v3, DaisyUI v4, React Router,
  react-hook-form, zod, bcryptjs, lucide-react, Recharts/Chart.js
- `tsx` comme runner TypeScript
- CI/CD : GitHub Actions, lint Biome en gate de PR (pas encore de pre-commit hook —
  `husky` + `lint-staged` recommandé mais pas encore en place)

## Design system

- Thème sombre : `#0D1117` (fond profond), `#0F242F` (surface primaire),
  `#F2B705` (primaire/jaune), `#17B890` (secondaire/teal), `#E83658` (accent/rouge)
- Typographie : Poppins (SemiBold, Bold) + Inter (Regular, Medium, SemiBold), WOFF2,
  stockées dans `client/public/fonts/`
- Thème DaisyUI custom mappé sur ces tokens
- Voir `docs/design/Focus-StyleGuide-standalone.html` et
  `docs/design/Focus-Wireframe-App-Films-Series-standalone.html` pour le rendu visuel exact

## Modèle de données — points critiques

- `media_user` est réservé aux films (`type = 'movie'`) uniquement ; la progression des
  séries/anime passe exclusivement par `episode_user`
- Le statut "vu en entier" d'une série est calculé dynamiquement via
  `isFullyWatched(userId, mediaId)`, jamais stocké
- `episode.duration` doit rester nullable (TMDB ne fournit pas toujours cette valeur)
- Clé unique composite `(type, tmdb_id)` sur `media` (TMDB réutilise des IDs numériques
  entre films et séries)
- `media.popularity` a été écarté au profit de `overall_rating`

## TMDB — spécificités

- Pas de catégorie "anime" native : détecté via genre Animation (ID=16) + `origin_country=JP`
- PEGI normalisé à l'import : `'TP' | '10' | '12' | '16' | '18'` (certification FR priorisée, US en repli)
- Appels API en `fr-FR` avec repli anglais sur champs vides
- Fournisseurs de streaming : région FR, `flatrate`/`free`/`ads` uniquement
- Voir `docs/DOC_API_TMDB` pour la référence complète de l'API
- Pipeline de seed : `db:migrate` → `tmdb:seed` → `db:seed`

## Conventions de code

- Préfixes de méthodes backend : `browse` / `read` / `readBy` / `count` / `find` / `upsert`
- Pattern seeder : toujours passer par une variable intermédiaire avant `this.insert()`
  (le check de propriétés excédentaires échoue sur un objet littéral inline)
- Voir le fichier de conventions de nommage partagé dans le repo GitHub pour le frontend
  (suffixes de fichiers, naming state/prop/handler, structure de routes)

## Format des User Stories (issu de Trello)

Chaque US suit ce format :
- Titre + description narrative (US uniquement, pas de critères/étapes dans la description)
- Label de priorité (MoSCoW)
- Checklist "Critères de validation"
- Checklist "Étapes Techniques", chaque item préfixé `[Back]` ou `[Front]` (jamais groupé
  sous des titres de catégorie)

## Point de départ

- Base de travail : branche `dev` du repo
  (https://github.com/WildCodeSchool-2025-09/p3-0526-remote-focus/tree/dev)
- Le monorepo est déjà initialisé et la Navbar est déjà partiellement en place sur cette
  branche — **ne pas repartir de zéro ni réécrire ce qui existe déjà**, s'appuyer dessus
- D'autres branches du repo peuvent contenir du travail utile (data déjà seedée, patterns
  d'implémentation déjà validés par l'équipe) — les consulter avant d'implémenter une
  fonctionnalité qui pourrait déjà exister ailleurs, pour éviter de diverger inutilement
- Priorité : rester cohérent avec le style de code, l'architecture et les choix déjà faits
  par l'équipe plutôt que d'introduire de nouvelles conventions

## État actuel (à vérifier/mettre à jour avant de lancer Claude Code)

- Fondation du projet posée (`US-INIT-00`)
- Seed backend complet : 30 médias, 65 saisons, 1118 épisodes, 5540 personnes
- Frontend : config Tailwind/DaisyUI initialisée, Navbar en cours
- ~35 US rédigées (catalogue, fiches détail, accueil, recherche, authentification, profil)
- Phase 0 (branche locale `ClaudeApp`, non poussée sur `dev`) : US-DET-01 + US-CAT-01 +
  US-REC-01 mergés (conflits Header/Navbar/App.tsx/router.ts/api.ts résolus à la main).
  US-ACC-01 à réécrire entièrement (pattern `Homepage/` non conforme aux conventions).
- Phase 1 (même branche `ClaudeApp`) : US-AUTH-01/02/03/04 implémentées et testées
  contre la base réelle. **Équipe pas encore informée** que la base partagée a été
  corrigée en direct (voir ci-dessous) — à faire avant que quelqu'un relance
  `db:migrate` en local sur un schema.sql désynchronisé.
- Phase 2 (même branche `ClaudeApp`) : US-DET-02/03/04/05/06/07 implémentées et
  testées contre la base réelle (fiches détail série/saison/épisode, widget
  "connu pour"). Rétro-fix US-DET-01 : ajout du `BackButton` partagé sur
  MovieDetail (décision produit validée, voir `docs/decisions-log.md`).
- Phase 3 (même branche `ClaudeApp`) : US-DET-08 (favoris/watchlist, module
  `track/`) + US-DET-09 (statut "vu" film/série/saison/épisode, module
  `tracking/`) implémentées et testées contre la base réelle. Branche `ClaudeApp`
  poussée (sans PR) sur une branche distante `ClaudeEquipe` pour permettre à
  l'équipe de tester visuellement sans toucher à `dev`.
- Phase 4 (même branche `ClaudeApp`) : US-PRO-01 (dashboard), US-PRO-02/03
  (favoris/watchlist), US-PRO-07 (paramètres, structure), US-PRO-08 (pseudo/email/
  mot de passe), US-PRO-09 (photo de profil), US-PRO-10 (filtre PEGI 16+),
  US-PRO-11 (mécanique de thème) implémentées et testées contre la base réelle.
  Deux bugs préexistants trouvés et corrigés au passage (voir "Décisions
  tranchées" ci-dessous) : `is_pegi16` non désactivé par défaut à l'inscription,
  et absence de middleware d'auth sur les routes de liste de médias. Suite à
  clarification produit le même jour : le filtre PEGI bloque aussi désormais
  l'accès direct par URL aux fiches détail 16+/18 (pas seulement les listes).
- Phase 5 (même branche `ClaudeApp`) : US-ACC-01 (page d'accueil de base, jamais
  reconstruite malgré la note Phase 0 — bloquant remonté et traité avant la
  suite) + US-ACC-02 (populaires) + US-ACC-03 (nouveautés personnalisées) +
  US-ACC-04/05 (suggestions personnalisées : genres + comédiens les plus vus,
  algorithme réutilisable tel quel pour US-ACC-06/US-PRO-06) + US-REC-02 (tri
  des résultats de recherche, carte vide). Implémentées et testées contre la
  base réelle.
- Phase 6 (même branche `ClaudeApp`) : US-PRO-04 (mes films favoris avec nombre
  de vues), US-PRO-06 (mes acteurs préférés), US-ACC-06 (accueil : carrousel
  "acteurs les plus vus", `personRepository.readMostViewedActors` unifié et
  réutilisé par ACC-05/ACC-06/PRO-06), US-PRO-05 (médias en cours de
  visionnage), US-DET-10 (notation demi-étoile films/séries vus, migration
  ciblée `track.user_rating` → `DECIMAL(2,1)` appliquée en préalable), US-PRO-12
  (mes statistiques : titres vus, temps de visionnage total + histogramme
  mensuel, répartition par genre en donut, graphiques Recharts). Implémentées et
  testées contre la base réelle.
- US-CAL-01 (calendrier des sorties passées/à venir, page déjà liée dans la
  Navbar depuis Phase 0) : nouveau module `calendar/`, fenêtre 90 jours
  passés/365 jours à venir, 3 onglets Films/Séries/Animés, filtre PEGI
  appliqué. Implémentée et testée contre la base réelle.
- US-APP-01 (import à la demande d'un média TMDB absent de la base) : nouveau
  `server/src/utils/tmdbClient.ts` (client TMDB léger écrit de zéro, la
  logique de `bin/tmdbFetch.ts` n'étant pas extractible sans refactorer le
  script de seed de l'équipe), module `mediaImport/` (upsert par
  `SELECT`/`INSERT` respectant `UNIQUE(tmdb_id)`), route
  `POST /api/medias/import/:type/:tmdbId`. Recherche (`search/`) fusionne
  désormais résultats locaux et suggestions TMDB non importées (page 1
  uniquement), marquées `imported:false`. Limites connues documentées dans
  `docs/decisions-log.md` (détection anime et filtre PEGI incomplets sur les
  suggestions TMDB non importées, route d'import non authentifiée/sans rate
  limiting). Testée en réel (import film/série/série anime volumineuse,
  dédoublonnage, recherche fusionnée), base revérifiée à la baseline exacte du
  seed après nettoyage.
- Toutes les décisions/écarts/limites connues de chaque US sont documentées dans
  `docs/decisions-log.md` (plus jamais dans les cartes Trello, voir consigne
  équipe) — s'y référer avant de reprendre le travail sur une US déjà entamée.

## Décisions tranchées

- **Stockage JWT** : `localStorage` (cohérent avec les étapes techniques déjà écrites
  dans les cartes US-AUTH-01/02)
- `user_.email` UNIQUE, `is_pegi16` (renommé), `media.duration`/`episode.duration` → `INT`,
  `track.user_rating` → `DECIMAL(2,1)` : déjà appliqués dans `server/database/schema.sql`
  sur `dev`
- `track.favorited_at`/`watchlist_added_at` (`DATETIME`), `user_.created_at` (`DATETIME`) :
  pas encore appliqués — à faire au fil de l'eau (avec US-DET-08 et US-AUTH-01
  respectivement), pas de conflit connu
- **`media.pegi`** : reste en `VARCHAR(50)` (`'TP'|'10'|'12'|'16'|'18'`), pas de conversion
  en INT. Confirmé par l'équipe (données reçues telles quelles, ex. `"16"`, `"TP"`) et
  cohérent avec le pipeline TMDB déjà écrit (`pegiFromMovie`/`pegiFromTv`), le seed et
  les 4 branches CAT-01/DET-01/REC-01/Presentation_branch qui l'utilisent déjà ainsi.
- **Format d'affichage des notes** : `overallRating` (DECIMAL SQL, remonte en string type
  `"8.90"`) s'affiche toujours `X.X/10` (ex. `8.9/10`), jamais la valeur brute. Utilitaire
  partagé : `client/src/utils/formatRating.ts`.
- **Pas de route `POST /api/auth/logout`** : JWT stateless en `localStorage`, rien à
  invalider côté serveur. L'étape technique d'US-AUTH-03 qui la demande est explicitement
  conditionnelle ("si gestion de session/token côté serveur, ex: invalidation ou
  blacklist du token/refresh token") — aucune autre carte (V1 ou V2) ne prévoit de
  blacklist/refresh token à ce jour. Si l'équipe introduit cette stratégie plus tard,
  revoir cette étape technique d'US-AUTH-03 à ce moment-là.
- **Drift base partagée corrigé sur `user_` (2026-09-11)** : la base partagée avait
  `password` en `VARCHAR(50)` (trop court pour un hash bcrypt) et `role`/`dark_theme`/
  `avatar` sans `DEFAULT`, alors que `schema.sql` déclarait déjà les bonnes valeurs.
  Corrigé par `ALTER TABLE` ciblé (table vide, aucune donnée perdue) — détail dans le
  commentaire au-dessus de `CREATE TABLE user_` dans `schema.sql`. **Le reste de
  l'équipe n'a pas été prévenu par ce biais** : à signaler pour qu'un `db:migrate`
  local sur un schema.sql désynchronisé ne surprenne personne.
- **Bug corrigé (2026-09-11, US-PRO-10) : `is_pegi16` n'était pas désactivé par
  défaut à l'inscription** — US-AUTH-01 le calculait selon l'âge (`age >= 16`), ce
  qui activait le filtre PEGI pour tout adulte et le désactivait pour tout mineur,
  l'inverse de l'usage attendu. `register` fixe désormais `isPegi16: false` pour
  tout le monde, sans lien avec la date de naissance. Détail complet dans
  `docs/decisions-log.md`, section US-PRO-10.
- **Bug corrigé (2026-09-11, US-PRO-10) : `/api/medias/discover`, `/api/medias` et
  `/api/medias/search` n'avaient aucun middleware d'auth**, alors que
  `readDiscoverSections` lit `req.user?.id` pour personnaliser les sections par
  genre — la personnalisation n'a donc jamais fonctionné pour un utilisateur
  connecté depuis sa mise en place. `optionalAuth` ajouté sur les 3 routes.
