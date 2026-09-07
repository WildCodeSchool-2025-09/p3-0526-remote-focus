# Focus — Conventions de nommage

Lexique extrait des User Stories rédigées. Référence commune pour le développement.

**Principe général :** tout le code est en anglais (fichiers, identifiants, champs d'API, URLs). Seul le contenu affiché à l'utilisateur est en français.

---

## 1. Routes API

- **Structure** : `/api/<ressource>` pour le public, `/api/me/<ressource>` pour l'utilisateur authentifié — `/api/medias`, `/api/me/watchlist`
- **Ressource au pluriel** — `medias`, `series`, `actors`, `genres`
- **Multi-mots en kebab-case** — `most-viewed-actors`, `pegi-filter`
- **`me` remplace l'identifiant utilisateur** : jamais de `:userId` dans l'URL, il est dérivé du token
- **Sous-ressource imbriquée** — `/api/actors/:id/filmography`, `/api/series/:id/seasons/:seasonId`
- **Query params en camelCase** — `sortBy`, `sortOrder`, `page`, `limit`, `seen`

---

## 2. Backend

### Fichiers et modules

- **Un module = un dossier** en camelCase singulier — `auth`, `media`, `track`, `statistics`
- **Deux fichiers par module** : `<module>Actions.ts` et `<module>Repository.ts` — `mediaActions.ts`, `trackRepository.ts`
- **Middlewares, utils et services** en camelCase — `verifyToken.ts`, `pagination.ts`, `tmdbClient.ts`

### Répartition des couches

- **Repository** : SQL uniquement, aucune logique métier
- **Actions** : orchestre les appels repository, calcule (offset, agrégats) et structure la réponse
- **Utils** : fonctions transverses réutilisées par plusieurs modules — `applyPegiFilter`, `generateToken`

### Préfixes de méthodes

- **`browse`** : liste complète avec pagination/tri/filtres, côté Actions — `browseFavorites`, `browseSuggestions`
- **`read`** : lecture d'une donnée ou d'un sous-ensemble — `read`, `readSeasons`, `readCast`
- **`readBy`** : lecture filtrée sur un critère — `readByCategory`, `readUnseenByGenres`
- **`count`** / **`sum`** : agrégats — `countFavorites`, `sumWatchTime`
- **`find`** : recherche sur un champ unique, pour tester l'existence — `findByEmail`, `findByLogin`
- **`create`** / **`update`** / **`add`** / **`upsert`** : écritures — `updateAvatar`, `addGenrePreferences`, `upsertRating`
- **`apply`** : utilitaire transverse appliqué à une requête — `applyPegiFilter`

### Champs d'API

- **camelCase en sortie**, même si la colonne SQL est en snake_case — `userRating`, `viewedCount`, `isSeen`, `createdAt`

---

## 3. Frontend

### Fichiers

- **Pages** : PascalCase, nom métier seul, sans suffixe — `Catalog.tsx`, `Favorites.tsx`, `Statistics.tsx`
- **Composants** : PascalCase, nom métier — `MediaCard.tsx`, `Carousel.tsx`, `SortMenu.tsx`
- **Hooks** : camelCase préfixé `use` — `useTheme.ts`, `useAuth.ts`
- **Contextes** : PascalCase suffixé `Context` — `ThemeContext.tsx`, `AuthContext.tsx`
- **Services et utils** : camelCase — `api.ts`, `formatDuration.ts`
- **Types** : PascalCase singulier — `Media`, `User`, `Pagination`

### Suffixes de composants

- **`Section`** : bloc réutilisable au sein d'une page — `PopularSection`, `AccountSection`
- **`List`** : rendu d'une collection — `CastList`, `EpisodeList`
- **`Card`** : élément unitaire, généralement cliquable — `MediaCard`, `ActorPortraitCard`
- **`Header`** / **`Info`** : en-tête et bloc d'informations d'une fiche — `MediaHeader`, `SerieInfo`
- **`Form`** : formulaire — `RegisterForm`, `PasswordChangeForm`
- **`Toggle`** / **`Badge`** / **`Chart`** : interrupteur, pastille, graphique — `ThemeToggle`, `PegiBadge`, `GenreDonutChart`

### States, props et handlers

- **State** : camelCase, nom de la donnée — `mediaDetail`, `searchQuery`, `currentPage`, `hasMore`
- **State de sélection** : préfixe `selected` ou `active` — `selectedGenres`, `activeTab`, `activeType`
- **State booléen** : préfixe `is` — `isMenuOpen`, `isLoading`
- **State transverse** : `loading`, `error` (systématiques sur chaque appel API)
- **Props booléennes** : préfixe `show` ou `is` — `showTypeBadge`, `isSeen`
- **Handlers** : préfixe `handle` — `handleLogout`, `handleLoadMore`, `handleSubmit`

### Routes

- **URLs en anglais, kebab-case**, alignées sur les ressources de l'API — `/catalog`, `/search`, `/calendar`
- **Listes au pluriel, détail imbriqué dessous** — `/movies` et `/movies/:id`, `/series` et `/series/:id`
- **Imbrication pour les sous-ressources** — `/series/:seriesId/seasons/:seasonId`
- **Espace personnel préfixé** — `/profile`, `/profile/favorites`, `/profile/watchlist`, `/profile/settings`
- **Authentification à la racine** — `/register`, `/login`, `/preferences`

---

## 4. Git

- **Commits** : Conventional Commits, imposé par commitlint — `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `test:`
- **Branches** : `US-<SCOPE>-<NUMÉRO>` en majuscules — `US-INIT-00`, `US-CATALOG-01`
- **Branche d'intégration** : `dev`
