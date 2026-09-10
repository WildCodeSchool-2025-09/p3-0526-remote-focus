# US-ACC-01 — Guide d'implémentation de la page d'Accueil (v2)

> Document de travail personnel. Décryptage de ce que la branche `US-CAT-01` a
> déjà construit, du parallèle avec l'Accueil, et des étapes granulaires
> (fichier par fichier : **où**, **comment**, **pourquoi**, **comment vérifier**).
>
> **v2** — intègre les **badges de carte** (« Nouveau » = sorti il y a < 30 jours,
> et « TOP 3 / TOP 10 »), repris du mécanisme `isMediaNew` / `enrichRanking` de
> `US-CAT-01`. La v1 disait à tort de « jeter » cette partie.
>
> Rédigé à partir de la lecture (sans modification) des branches `US-CAT-01` et
> `origin/US-DET-01`, du schéma SQL, des seeds, et de `docs/conventions-nommage.md`.

## Sommaire

1. [Le mental model du back : 3 couches](#1-le-mental-model-du-back--3-couches)
2. [Ce que US-CAT-01 a construit — et le parallèle avec l'Accueil](#2-ce-que-us-cat-01-a-construit--et-le-parallèle-avec-laccueil)
3. [Les badges de carte : de quoi as-tu VRAIMENT besoin ?](#3-les-badges-de-carte--de-quoi-as-tu-vraiment-besoin-)
4. [À vérifier AVANT de coder (coordination d'équipe)](#4-à-vérifier-avant-de-coder-coordination-déquipe)
5. [BACK — pas à pas](#5-back--pas-à-pas)
6. [FRONT — pas à pas](#6-front--pas-à-pas)
7. [Correspondance avec les tâches Trello](#7-correspondance-avec-les-tâches-trello)
8. [Ordre de travail conseillé + commits](#8-ordre-de-travail-conseillé--commits)
9. [Annexe — rappels de nommage](#annexe--rappels-de-nommage)

---

## Sources lues

| Source | Ce qu'on en tire |
|---|---|
| `US-CAT-01` : `server/src/modules/Catalog/CatalogRepository.ts`, `CatalogActions.ts`, `router.ts` | Le patron back « route → Actions → Repository », la requête SQL movie/tv/anime, **et les fonctions `isMediaNew` + `enrichRanking` pour les badges** |
| `US-CAT-01` : `server/src/types/Media/Media.types.ts` | Les types `Media` (ligne SQL brute) et `EnrichedMedia` (`Media` + `topRank` + `isNew`) |
| `origin/US-DET-01` : `client/src/services/api.ts`, `pages/MovieDetail.tsx`, `components/CastList.tsx`, `components/MediaHeader.tsx` | Le patron front « fetch dans `useEffect` + `loading`/`error` », un carrousel horizontal déjà écrit, le préfixe des posters TMDB |
| `docs/conventions-nommage.md` | Règles de nommage imposées (fichiers, routes, states…) |
| `server/database/schema.sql` + `server/database/seeds/tmdb.json` | Structure réelle de `media` ; **jeu de seed = 10 films + 10 séries + 10 animés** ; posters = chemins TMDB ; au 2026-09-10, **2 médias seulement** sont « sortis il y a < 30 jours » (`La captura`, `Lanterns`) |
| `client/tailwind.config.js` | DaisyUI installé, thème `focus`, tokens `base-100/200/300`, `primary`, `primary-content`, `base-content` |

---

## 1. Le mental model du back : 3 couches

Tout le backend suit **toujours** le même trajet.

```
Navigateur                                                    Base MySQL
    │                                                              ▲
    │  GET /api/medias/home                                        │
    ▼                                                              │
┌─────────────┐   ┌───────────────────────┐   ┌────────────────────┐    │
│  router.ts  │──▶│    catalogActions     │──▶│  catalogRepository │────┘
│(l'aiguillage)│   │(orchestre + calcule    │   │  (le traducteur SQL)│
│              │   │ les badges + structure)│   │                    │
└─────────────┘   └───────────────────────┘   └────────────────────┘
                          │
                          ▼
     res.json({ films: EnrichedMedia[], series: […], animes: […] })
```

- **`router.ts`** = le standard téléphonique. « Une requête `GET /api/medias/home` arrive ? Je la passe à telle fonction. » Rien d'autre.
- **`catalogActions.ts`** = le chef d'orchestre. Il ne parle **jamais** SQL directement. Il appelle le Repository (souvent plusieurs fois), **calcule ce qui se calcule en JS** (ici : les badges `isNew` et `topRank`), assemble, gère les erreurs, décide **la forme de la réponse JSON**.
- **`catalogRepository.ts`** = le seul autorisé à écrire du SQL. Une méthode = une requête. Il reçoit des paramètres simples (`"movie"`, `20`), renvoie des lignes brutes. **Aucune logique métier, aucun calcul.**

> `docs/conventions-nommage.md` §2 : *« Repository : SQL uniquement, aucune logique métier. Actions : orchestre les appels repository, calcule (offset, agrégats) et structure la réponse. »*

Le front ne connaît que l'URL `/api/medias/home` et la forme du JSON.

---

## 2. Ce que US-CAT-01 a construit — et le parallèle avec l'Accueil

### 2.1 Table de correspondance CAT-01 → ACC-01

| US-CAT-01 (Catalogue) | US-ACC-01 (Accueil) | Verdict |
|---|---|---|
| Route `GET /api/medias/discover` | Route `GET /api/medias/home` | **Même idée**, on copie la structure |
| `CatalogRepository.readTopRated(type)` — filtre movie/tv/anime + tri + LIMIT | `catalogRepository.readByCategory(category)` | **Quasi identique**, on simplifie |
| `CatalogRepository.readLatest30Days(type)` — requête dédiée aux sorties récentes | *(rien)* | **On jette la requête** — c'est pour un carrousel « Nouveautés » séparé (US future). Voir §3. |
| `CatalogRepository.readTopByGenre`, `UserRepository.readRandomGenres` | *(rien)* | **On jette** — sections « genres likés » = autre US, utilisateur connecté |
| **`isMediaNew(releasedAt)`** (fonction pure, calcul de date) | **On GARDE** → badge « Nouveau » | ✅ copie de la fonction telle quelle |
| **`enrichRanking(medias)`** (ajoute `topRank` + `isNew`) | **On GARDE** (renommée `enrichMedias`) → badges | ✅ adaptée |
| Type `Media` + type `EnrichedMedia` | Les deux, réutilisés | **On recopie à l'identique** |
| `CatalogActions.readDiscoverSections` — assemble `{ topRated, latest, genreSections }` | `catalogActions.browseByCategory` — assemble `{ films, series, animes }` | **Même patron**, plus simple |
| `req.user?.id` (utilisateur connecté) | *(rien)* | **On ignore** — sections connecté = hors périmètre (dernière ligne de la checklist) |

**En clair : le back = une version dégraissée de celui de CAT-01, mais on garde tout le calcul des badges.** On enlève : l'utilisateur connecté, les genres, la requête « nouveautés » dédiée, le classement global multi-type. On garde : le filtre par catégorie, le tri par note, la limite, et les 2 badges calculés en JS.

### 2.2 Le back de CAT-01 expliqué morceau par morceau

#### a) La méthode Repository `readTopRated` (le cœur du besoin)

`server/src/modules/Catalog/CatalogRepository.ts` :

```ts
async readTopRated(
  type: "movie" | "tv" | "anime" | null,
  limit = 10,
): Promise<Media[]> {
  const [rows] = await databaseClient.query<Media[]>(
    "SELECT * FROM media WHERE (? IS NULL OR (? = 'anime' AND is_anime = TRUE) OR (? = 'movie' AND type = 'movie' AND is_anime = FALSE) OR (? = 'tv' AND type = 'tv' AND is_anime = FALSE)) ORDER BY overall_rating DESC LIMIT ?",
    [type, type, type, type, limit],
  );
  return rows;
}
```

Décryptage :

- **`async … Promise<Media[]>`** : méthode asynchrone (elle attend la base), promet un **tableau de `Media`**.
- **`databaseClient.query<Media[]>(sql, params)`** : `databaseClient` = le pool de connexions MySQL (`server/database/client.ts`). `query` renvoie `[rows, metadata]` — d'où le **`const [rows] =`** (destructuration : on ne garde que le 1er élément).
- **Les `?`** : des **placeholders**. `mysql2` les remplace, dans l'ordre, par les valeurs de `params`. C'est la protection anti-injection SQL : la valeur n'est jamais collée à la main dans la chaîne.
- **Pourquoi `type` répété 4 fois dans `params`** : il y a 4 `?` qui utilisent `type` dans la requête. Chaque `?` consomme **un** élément du tableau, dans l'ordre. On ne peut pas « réutiliser » un `?`, donc on repasse la valeur autant de fois qu'elle apparaît.
- **La clause `WHERE` « magique »** : une astuce pour gérer 3 catégories avec **une seule requête**. Pour une valeur de `type` donnée, une seule parenthèse `OR` est vraie :
  - `type = 'anime'` → lignes où `is_anime = TRUE`
  - `type = 'movie'` → `type = 'movie' AND is_anime = FALSE` (un film qui n'est pas un animé)
  - `type = 'tv'` → `type = 'tv' AND is_anime = FALSE` (une série qui n'est pas un animé)
  - `type IS NULL` → aucune condition, on prend tout (cas « toutes catégories » du catalogue — **pas besoin ici**)
- **`ORDER BY overall_rating DESC`** : les mieux notés d'abord. ➜ **conséquence importante pour toi** : dans le tableau résultat, `rows[0]` est le mieux noté de la catégorie, `rows[1]` le 2ᵉ, etc. **La position dans le tableau = le rang.** C'est ce qui permet de calculer le badge « TOP 3 » sans requête supplémentaire.
- **`LIMIT ?`** : on ne renvoie que `limit` lignes.

> **Structure de la table** (`schema.sql` l.27-44) : `media` a une colonne `type` (`'movie'` ou `'tv'`) **et** un booléen `is_anime`. Un « animé » = `is_anime = TRUE` peu importe que ce soit film ou série. D'où : filtre « Animés » = seulement `is_anime` ; filtres « Films »/« Séries » = doivent exclure `is_anime`.

#### b) Les fonctions de badges (`CatalogActions.ts`)

Toujours dans `server/src/modules/Catalog/CatalogActions.ts`, US-CAT-01 a écrit **deux fonctions pures** (pas de SQL, juste du JS) :

```ts
const isMediaNew = (releasedAt: Date | string | null): boolean => {
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const releasedAtDate = releasedAt ? new Date(releasedAt) : null;
  return (
    releasedAtDate !== null &&
    releasedAtDate >= thirtyDaysAgo &&
    releasedAtDate <= today
  );
};

const enrichRanking = (medias: Media[]): EnrichedMedia[] => {
  return medias.map((media, index) => {
    const position = index + 1;
    let topRank: "top3" | "top10" | null = null;
    if (position <= 3) {
      topRank = "top3";
    } else if (position <= 10) {
      topRank = "top10";
    }
    const isNew = isMediaNew(media.released_at);
    return { ...media, topRank, isNew };
  });
};
```

Décryptage :

- **`isMediaNew`** : prend une date de sortie, renvoie `true` si elle est **entre aujourd'hui et il y a 30 jours**. Aucune base : le champ `released_at` est déjà dans chaque ligne renvoyée par `SELECT *`.
- **`enrichRanking`** : parcourt le tableau **déjà trié par note** (`.map((media, index) => …)`), et pour chaque média :
  - calcule `position = index + 1` (le 1ᵉʳ du tableau est le rang 1) ;
  - en déduit `topRank` : `"top3"` si dans les 3 premiers, `"top10"` si dans les 10 premiers, sinon `null` ;
  - calcule `isNew` via `isMediaNew` ;
  - renvoie `{ ...media, topRank, isNew }` — c'est-à-dire **toutes les colonnes de la ligne + 2 champs calculés**.
- Le résultat est typé `EnrichedMedia[]` (voir §2.3).

#### c) Le fichier Actions — l'assemblage

```ts
const readDiscoverSections: RequestHandler = async (req, res, next) => {
  try {
    const topRated = await CatalogRepository.readTopRated(type);
    // …
    const enrichedTopRated = enrichRanking(topRated);
    // …
    res.json({ topRated: enrichedTopRated, latest: newReleases, genreSections });
  } catch (err) {
    next(err); // en cas d'erreur SQL, on passe au middleware d'erreur
  }
};

export default { readDiscoverSections };
```

À retenir :

- **`RequestHandler`** : le type Express pour une fonction `(req, res, next)`.
- **`try / catch (err) { next(err) }`** : **obligatoire**. Si la base plante, on ne laisse pas le serveur crasher : on refile l'erreur à Express (`app.ts` a déjà un `logErrors` en bout de chaîne).
- **`enrichRanking(topRated)`** appelé **après** le repo, **dans les Actions** : le calcul se fait à la couche « orchestration », jamais dans le repo.
- **`res.json({...})`** : c'est **ici** qu'on décide la forme de la réponse.
- **`export default { readDiscoverSections }`** : objet qui regroupe les fonctions du module. Le router fera `CatalogActions.readDiscoverSections`.

#### d) Le router

`server/src/router.ts`, 2 lignes ajoutées par US-CAT-01 :

```ts
import CatalogActions from "./modules/Catalog/CatalogActions";

router.get("/api/medias/discover", CatalogActions.readDiscoverSections);
```

→ *« quand un `GET /api/medias/discover` arrive, exécute `readDiscoverSections` »*.

### 2.3 Les types de US-CAT-01

`server/src/types/Media/Media.types.ts` :

```ts
import type { RowDataPacket } from "mysql2/promise";

export type Media = RowDataPacket & {
  ID: number;
  tmdb_id: number;
  name: string;
  type: string;
  released_at: Date | string | null;
  duration: number | null;
  poster: string | null;
  synopsis: string | null;
  overall_rating: number | string | null;
  status: string | null;
  original_name: string | null;
  original_language: string | null;
  pegi: string | null;
  is_anime: boolean;
};

export type EnrichedMedia = Media & {
  topRank: "top3" | "top10" | null;
  isNew: boolean;
};
```

- **`RowDataPacket & {…}`** : `RowDataPacket` est le type « ligne SQL » de `mysql2`. Le `&` (intersection) dit *« une ligne SQL qui a EN PLUS ces colonnes »*. C'est ce que `query<Media[]>` attend.
- **`EnrichedMedia = Media & {…}`** : *« un `Media` avec, EN PLUS, `topRank` et `isNew` »*. C'est ce que `enrichRanking` renvoie et ce que le front recevra.

### 2.4 Ce qu'on récupère concrètement de US-CAT-01

| Élément | Action |
|---|---|
| La requête SQL de `readTopRated` | **Copier-coller puis simplifier** (enlever la branche `? IS NULL`) → `readByCategory` |
| La fonction `isMediaNew` | **Copier telle quelle** dans ton `catalogActions.ts` |
| La fonction `enrichRanking` | **Copier**, renommer `enrichMedias`, l'appliquer à chaque carrousel |
| Le squelette `try/catch/next` de l'Actions | **Copier**, remplacer le contenu par 3 appels + enrichissement + `res.json` |
| La ligne `import … ; router.get(…)` | **Copier**, changer l'URL et le nom de la fonction |
| Les types `Media` **et** `EnrichedMedia` | **Recopier à l'identique** côté serveur, et créer les équivalents côté client |
| `readLatest30Days`, `readTopByGenre`, `readRandomGenres`, `req.user` | **Ignorer** |

---

## 3. Les badges de carte : de quoi as-tu VRAIMENT besoin ?

C'est le point ajouté en v2. Il faut distinguer **3 badges** possibles sur une carte, et ce que chacun coûte :

| Badge | Ce qu'il affiche | Donnée nécessaire | Requête SQL en plus ? | Statut pour US-ACC-01 |
|---|---|---|---|---|
| **« Nouveau »** | Média sorti il y a < 30 jours | `released_at` — **déjà dans chaque ligne** de `SELECT *` | ❌ **Non** — juste la fonction `isMediaNew` (calcul de date) | ✅ **On l'active** |
| **« TOP 3 / TOP 10 »** | Rang du média dans son carrousel | l'**index** dans le tableau (déjà trié par note) | ❌ **Non** — juste `index + 1` | ✅ **On le câble** (facile à retirer) |
| **« Film / Série / Animé »** (pastille de type) | Le format du contenu | `type` + `is_anime` — déjà dans la ligne | ❌ Non | ⏸️ **Prévu mais éteint** — la checklist dit « non applicable ici » (carrousels mono-type), utile pour les futures sections mixtes |

> **La confusion à éviter.** `readLatest30Days` (US-CAT-01) n'est **pas** ce dont tu as besoin pour le badge « Nouveau ». Cette requête sert à construire **un carrousel entier « Nouveautés »** qui ne contiendrait *que* des sorties récentes — c'est une **US future** (section « Nouveautés » de l'accueil). Le **badge**, lui, se calcule sur les données que tu as déjà, avec la fonction `isMediaNew`. Tu ne touches pas au SQL.

**Où se fait le calcul ?** Dans `catalogActions.ts` (comme US-CAT-01), pas dans le repo, pas dans le front. Le front reçoit directement des `EnrichedMedia` avec `isNew` et `topRank` déjà remplis, et se contente d'afficher ou non le badge.

> ⚠️ **Attente réaliste avec le seed actuel :** au 2026-09-10, seuls **`La captura`** (film) et **`Lanterns`** (série) sont sortis il y a < 30 jours → le badge « Nouveau » n'apparaîtra que sur ces 2 cartes. Et comme il n'y a que **10 médias par catégorie**, le badge « TOP 10 » s'affichera sur *toutes* les cartes (10 ≤ 10) — c'est normal, ça deviendra discriminant quand la base grossira. Tu peux ne garder que « TOP 3 » si le rendu te paraît chargé.

---

## 4. À vérifier AVANT de coder (coordination d'équipe)

Trois collisions possibles avec les branches des collègues. Regarde l'état de `dev` au démarrage :

```bash
git checkout dev && git pull
git ls-tree -r --name-only dev -- server/src/modules server/src/types client/src/services client/src/types
```

1. **Le module `catalog` côté back.**
   - US-CAT-01 l'a nommé `server/src/modules/Catalog/CatalogActions.ts` (**majuscule**), **contraire** à la convention (`docs/conventions-nommage.md` §2 : *« module = dossier en camelCase singulier »* → devrait être `catalog/catalogActions.ts`).
   - **Si US-CAT-01 est déjà dans `dev`** : **reprends LEUR dossier** (`Catalog/`). Tu ajoutes juste `readByCategory` dans leur `CatalogRepository`, et `browseByCategory` + `enrichMedias` dans leur `CatalogActions`. **Les fonctions `isMediaNew` / `enrichRanking` y sont déjà** → tu les réutilises directement. Ne crée pas un 2ᵉ module.
   - **Si `dev` ne l'a pas encore** : crée `catalog/` (minuscule, propre), et préviens le collègue qu'il faudra réconcilier au merge.
2. **`server/src/types/Media/Media.types.ts`** : créé par US-CAT-01. S'il est dans `dev`, **ne le recrée pas**, importe-le.
3. **`client/src/services/api.ts`** : créé par US-DET-01. S'il est dans `dev`, tu **ajoutes** une fonction dedans, tu ne le réécris pas.
4. **`client/src/types/media.ts`** : créé par US-DET-01 (type `Media` en camelCase, adapté à la fiche détail). Le tien sera différent (lignes brutes snake_case) → on met le tien dans **`client/src/types/catalog.ts`** pour éviter le conflit.

Le reste (`router.ts`, `Homepage.tsx`, composants `Carousel`/`MediaCard`) : pas de collision.

---

## 5. BACK — pas à pas

> Hypothèse pour les chemins ci-dessous : `dev` n'a **pas encore** le module Catalog → tu crées `catalog/` en minuscule. Si tu récupères celui de CAT-01 (`Catalog/`), adapte les chemins et **ajoute** les méthodes aux fichiers existants au lieu de les créer.

### Étape 5.0 — Préparer la base de données

**🎯 But.** Avoir des lignes dans la table `media`, sinon la route renverra `[]` partout et tu croiras à un bug.

**Ce que tu fais :**

1. Ouvre un terminal **à la racine du projet** (`p3-0526-remote-focus/`).
2. Vérifie que `server/.env` existe et contient au minimum :
   ```
   APP_PORT=3310
   DB_NAME=Focus
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=…
   DB_PASSWORD=…
   CLIENT_URL=http://localhost:3000
   ```
   `CLIENT_URL` est ce qui **autorise le front à appeler l'API** (CORS, cf `server/src/app.ts`). Sans lui, le navigateur bloquera les requêtes.
3. Lance, dans l'ordre :
   ```bash
   npm run db:migrate   # supprime + recrée toutes les tables depuis schema.sql (bin/migrate.ts)
   npm run tmdb:seed    # remplit genre, media, person… depuis seeds/tmdb.json (bin/tmdbSeed.ts)
   ```
4. `npm run db:seed` (users, likes…) : **inutile** pour l'accueil, tu peux le sauter.

**✅ Vérifier.** Dans un client SQL (ou `npx tsx` rapide) :
```sql
SELECT type, is_anime, COUNT(*) FROM media GROUP BY type, is_anime;
```
Tu dois voir ~10 `movie/0`, ~10 `tv/0`, ~10 `*/1`.

**⚠️ Piège.** `db:migrate` fait un `DROP DATABASE` : toute donnée locale est perdue à chaque run. C'est voulu (base de dev).

---

### Étape 5.1 — Les types serveur (`Media` + `EnrichedMedia`)

**🎯 But.** Décrire à TypeScript la forme d'une ligne `media` (pour `query<Media[]>`) et la forme enrichie renvoyée au front. **Aucun code exécuté** — que du typage.

**📁 Fichier.** `server/src/types/Media/Media.types.ts` — *à créer* (ou déjà présent si US-CAT-01 récupéré → **passe cette étape**).

**Ce que tu fais :**

1. Dans `server/src/types/`, crée un dossier `Media`.
2. Dedans, crée `Media.types.ts`.
3. Colle **exactement** (recopié de US-CAT-01) :

```ts
import type { RowDataPacket } from "mysql2/promise";

export type Media = RowDataPacket & {
  ID: number;
  tmdb_id: number;
  name: string;
  type: string;
  released_at: Date | string | null;
  duration: number | null;
  poster: string | null;
  synopsis: string | null;
  overall_rating: number | string | null;
  status: string | null;
  original_name: string | null;
  original_language: string | null;
  pegi: string | null;
  is_anime: boolean;
};

export type EnrichedMedia = Media & {
  topRank: "top3" | "top10" | null;
  isNew: boolean;
};
```

**Décryptage :**

| Élément | Rôle |
|---|---|
| `import type { RowDataPacket }` | `import type` = import supprimé à la compilation (typage pur). `RowDataPacket` = « une ligne renvoyée par mysql2 ». |
| `Media = RowDataPacket & { … }` | Intersection : une ligne mysql2 **qui possède en plus** ces 14 colonnes (celles du `CREATE TABLE media`). |
| `overall_rating: number \| string \| null` | Une colonne `DECIMAL` peut revenir en **chaîne** avec mysql2 (`"7.9"`). Le type prévoit les deux. |
| `EnrichedMedia = Media & { topRank; isNew }` | La version « prête à afficher » : toutes les colonnes + les 2 badges calculés. |
| `"top3" \| "top10" \| null` | Type fermé : seules ces 3 valeurs sont possibles. |

**✅ Vérifier.** `npm run check-types --workspace=server` ne doit **pas** signaler ce fichier.

**⚠️ Piège.** Respecte la casse `Media/Media.types.ts` : `forceConsistentCasingInFileNames` est activé, et Windows est insensible à la casse — une divergence passera chez toi mais cassera la CI.

---

### Étape 5.2 — Le Repository (`readByCategory`)

**🎯 But.** Écrire **la seule requête SQL** du module : « donne-moi les N médias d'une catégorie, triés par note ».

**📁 Fichier.** `server/src/modules/catalog/catalogRepository.ts` — *à créer* (ou : ajouter la méthode à `Catalog/CatalogRepository.ts` si récupéré).

**Ce que tu fais :**

1. Dans `server/src/modules/`, crée un dossier `catalog`.
2. Dedans, crée `catalogRepository.ts`.
3. Colle :

```ts
import databaseClient from "../../../database/client";

import type { Media } from "../../types/Media/Media.types";

class CatalogRepository {
  // "readBy" = lecture filtrée sur un critère (convention §2)
  async readByCategory(
    category: "movie" | "tv" | "anime",
    limit = 20,
  ): Promise<Media[]> {
    const [rows] = await databaseClient.query<Media[]>(
      `SELECT * FROM media
       WHERE (? = 'anime' AND is_anime = TRUE)
          OR (? = 'movie' AND type = 'movie' AND is_anime = FALSE)
          OR (? = 'tv'    AND type = 'tv'    AND is_anime = FALSE)
       ORDER BY overall_rating DESC
       LIMIT ?`,
      [category, category, category, limit],
    );

    return rows;
  }
}

export default new CatalogRepository();
```

4. Sauvegarde. Lance `npm run check:fix` à la racine : Biome réordonnera les imports automatiquement, ne t'en occupe pas à la main.

**Décryptage ligne par ligne :**

| Ligne | Pourquoi |
|---|---|
| `import databaseClient from "../../../database/client"` | 3 crans de `..` : de `modules/catalog/` on remonte à `server/`, puis `database/client.ts` (le pool MySQL partagé). Chemin identique à US-CAT-01. |
| `import type { Media } …` | Pour typer le retour `Promise<Media[]>`. |
| `class CatalogRepository { … }` | On regroupe les méthodes SQL du domaine « catalogue » dans une classe. |
| `async readByCategory(category, limit = 20)` | `category` = **type fermé** `"movie" \| "tv" \| "anime"` → impossible d'appeler avec autre chose, TypeScript refuse. `limit = 20` = valeur par défaut → **la tâche Trello « LIMIT 20 par carrousel » est réglée ICI, en un seul point**. |
| `databaseClient.query<Media[]>(sql, params)` | Exécute la requête. `<Media[]>` dit à TS « les lignes ont la forme `Media` ». Renvoie `[rows, fields]`. |
| `const [rows] =` | Destructuration : on ne garde que le tableau de lignes. |
| Requête entre backticks `` ` `` | Permet le multi-ligne → lisible. Version de US-CAT-01 **sans** la branche `? IS NULL` (toi tu passes toujours une catégorie). |
| `WHERE (? = 'anime' AND …) OR (? = 'movie' AND …) OR (? = 'tv' AND …)` | Pour une valeur de `category`, **une seule** parenthèse est vraie → un seul filtre s'applique. « Animés » ne regarde que `is_anime` ; « Films » / « Séries » excluent `is_anime`. |
| `[category, category, category, limit]` | 3 `?` utilisent `category` + 1 `?` pour `limit`. **L'ordre compte** : chaque `?` prend l'élément suivant du tableau. |
| `ORDER BY overall_rating DESC` | Mieux notés d'abord → **la position dans `rows` = le rang** (sert au badge TOP 3). |
| `return rows` | On renvoie les lignes **brutes**, sans transformation. Le repo ne calcule rien. |
| `export default new CatalogRepository()` | On exporte **une instance déjà construite** (singleton). Ailleurs : `catalogRepository.readByCategory(…)` — jamais de `new`. Patron identique à US-CAT-01 et US-DET-01. |

**✅ Vérifier.** `npm run check-types --workspace=server` OK. (Test réel du résultat SQL : étape 5.5.)

**⚠️ Pièges :**
- Ne mets **pas** de `;` à l'intérieur de la chaîne SQL.
- `LIMIT ?` avec mysql2 : passe bien un **nombre** (`limit`), pas une chaîne.
- Si tu récupères le module de CAT-01 : ajoute juste la **méthode** dans la classe existante, ne recrée pas la classe.

> **Variante plus lisible** (si la clause `WHERE` à rallonge te gêne) — tout aussi sûre, `category` étant un type fermé et sans interpolation de saisie utilisateur :
> ```ts
> const filterByCategory = {
>   movie: "type = 'movie' AND is_anime = FALSE",
>   tv:    "type = 'tv' AND is_anime = FALSE",
>   anime: "is_anime = TRUE",
> } as const;
>
> const [rows] = await databaseClient.query<Media[]>(
>   `SELECT * FROM media WHERE ${filterByCategory[category]}
>    ORDER BY overall_rating DESC LIMIT ?`,
>   [limit],
> );
> ```
> La 1ʳᵉ version reste conseillée pour rester collé au style de CAT-01.

---

### Étape 5.3 — Les Actions (`browseByCategory` + badges)

**🎯 But.** Appeler le repo 3 fois (une par catégorie), **calculer les badges** de chaque média, et renvoyer le JSON `{ films, series, animes }`.

**📁 Fichier.** `server/src/modules/catalog/catalogActions.ts` — *à créer* (ou : ajouter `browseByCategory` + `enrichMedias` à `Catalog/CatalogActions.ts` si récupéré — `isMediaNew` y est déjà).

**Ce que tu fais :**

1. Dans `server/src/modules/catalog/`, crée `catalogActions.ts`.
2. Colle :

```ts
import type { RequestHandler } from "express";

import catalogRepository from "./catalogRepository";

import type { EnrichedMedia, Media } from "../../types/Media/Media.types";

const NEW_RELEASE_WINDOW_DAYS = 30;

// true si le média est sorti dans les 30 derniers jours (repris de US-CAT-01)
const isMediaNew = (releasedAt: Date | string | null): boolean => {
  if (releasedAt == null) {
    return false;
  }

  const today = new Date();

  const windowStart = new Date();
  windowStart.setDate(windowStart.getDate() - NEW_RELEASE_WINDOW_DAYS);

  const released = new Date(releasedAt);

  return released >= windowStart && released <= today;
};

// ajoute les infos d'affichage (badges) à chaque média d'UN carrousel.
// la liste reçue est déjà triée par note décroissante => index = rang.
// (équivalent de `enrichRanking` de US-CAT-01)
const enrichMedias = (medias: Media[]): EnrichedMedia[] =>
  medias.map((media, index) => {
    const position = index + 1;

    let topRank: "top3" | "top10" | null = null;

    if (position <= 3) {
      topRank = "top3";
    } else if (position <= 10) {
      topRank = "top10";
    }

    return { ...media, topRank, isNew: isMediaNew(media.released_at) };
  });

// "browse" = liste complète, côté Actions (convention §2)
const browseByCategory: RequestHandler = async (_req, res, next) => {
  try {
    const [films, series, animes] = await Promise.all([
      catalogRepository.readByCategory("movie"),
      catalogRepository.readByCategory("tv"),
      catalogRepository.readByCategory("anime"),
    ]);

    res.json({
      films: enrichMedias(films),
      series: enrichMedias(series),
      animes: enrichMedias(animes),
    });
  } catch (err) {
    next(err);
  }
};

export default { browseByCategory };
```

**Décryptage bloc par bloc :**

| Bloc | Ce qu'il fait / pourquoi |
|---|---|
| `import type { RequestHandler } from "express"` | Type d'une fonction de route `(req, res, next)`. |
| `import catalogRepository from "./catalogRepository"` | L'instance singleton créée à l'étape 5.2. |
| `import type { EnrichedMedia, Media } …` | `Media` pour typer l'entrée de `enrichMedias`, `EnrichedMedia` pour sa sortie. |
| `const NEW_RELEASE_WINDOW_DAYS = 30` | La fenêtre « nouveauté » nommée **une fois**. Si le PO dit « finalement 15 jours », tu changes ici. |
| `isMediaNew(releasedAt)` | Fonction **pure** (pas de SQL). `null` → `false`. Sinon `true` si `windowStart ≤ date ≤ today`. Copie fidèle de US-CAT-01. |
| `enrichMedias(medias)` | `.map((media, index) => …)` : parcourt le tableau **déjà trié**. `position = index + 1`. `topRank` = `"top3"` / `"top10"` / `null` selon la position. `{ ...media, topRank, isNew }` = **toutes les colonnes + 2 champs calculés**. Renvoie `EnrichedMedia[]`. |
| `browseByCategory: RequestHandler` | La fonction branchée sur la route. `_req` (underscore) = « je n'utilise pas la requête, c'est volontaire » (Biome ne râle pas). |
| `Promise.all([...3 appels...])` | Lance les **3 requêtes SQL en parallèle** (pas l'une après l'autre) → ~3× plus rapide. |
| `const [films, series, animes] =` | `Promise.all` renvoie les résultats **dans l'ordre du tableau** → destructuration en 3 variables. |
| `res.json({ films: enrichMedias(films), … })` | **La forme exacte demandée par la checklist.** Chaque groupe est enrichi juste avant l'envoi. |
| `catch (err) { next(err) }` | Erreur SQL → passe au middleware d'erreur d'Express. Le serveur ne crashe pas. |
| `export default { browseByCategory }` | Le router importe cet objet. (`isMediaNew` / `enrichMedias` restent privées au fichier.) |

**✅ Vérifier.** `npm run check-types --workspace=server` OK. Le serveur (`npm run dev:server`) redémarre sans erreur dans la console.

**⚠️ Pièges :**
- Si tu ne veux **que** le badge « Nouveau », supprime les 6 lignes de `topRank` (garde `return { ...media, isNew: isMediaNew(media.released_at) }`) et retire `topRank` du type `EnrichedMedia`.
- N'appelle pas `enrichMedias` dans le **repo** : le calcul appartient aux Actions (convention).
- Si le module de CAT-01 est récupéré : `isMediaNew` existe déjà → ne la redéclare pas, réutilise-la (ou extrais-la dans `server/src/utils/` et importe-la des deux côtés — à décider avec l'équipe au merge).

> **Pourquoi 1 seule route qui renvoie les 3 groupes** plutôt que `?category=xxx` appelé 3 fois ? C'est ce que demandent les critères d'acceptation (*« objet structuré { films, series, animes } »*), c'est le même patron que `/api/medias/discover`, et ça fait 1 aller-retour réseau + 1 seul `loading` côté front. Pour suivre la carte Trello à la lettre (`?category=`), lis `req.query.category`, valide-la comme CAT-01 valide `req.query.type`, et renvoie un seul tableau enrichi.

---

### Étape 5.4 — Brancher la route

**🎯 But.** Rendre l'URL `GET /api/medias/home` réelle.

**📁 Fichier.** `server/src/router.ts` — *à modifier*.

**Ce que tu fais :**

1. Ouvre `server/src/router.ts`.
2. Sous la ligne `const router = express.Router();` (et à côté de l'`import` de CAT-01 s'il existe), ajoute l'import :
   ```ts
   import catalogActions from "./modules/catalog/catalogActions";
   ```
3. Dans la zone « Define Your API Routes Here », ajoute :
   ```ts
   router.get("/api/medias/home", catalogActions.browseByCategory);
   ```
4. Sauvegarde.

**État attendu du fichier (extrait) :**

```ts
import express from "express";

import catalogActions from "./modules/catalog/catalogActions";

const router = express.Router();

router.get("/api/medias/home", catalogActions.browseByCategory);

export default router;
```

**Décryptage :**

| Élément | Pourquoi |
|---|---|
| `import catalogActions from …` | On récupère l'objet `{ browseByCategory }` exporté à l'étape 5.3. |
| `router.get(path, handler)` | *« quand un `GET` sur ce chemin arrive, exécute ce handler »*. |
| `/api/medias/home` | Convention §1 : préfixe `/api`, ressource **au pluriel** (`medias`). `/home` = une « vue » de la ressource, comme CAT-01 fait `/discover`. |
| `catalogActions.browseByCategory` | **Sans parenthèses** : on passe la fonction, on ne l'appelle pas. C'est Express qui l'appellera à chaque requête. |

**✅ Vérifier.** Étape suivante.

**⚠️ Piège.** `app.ts` fait déjà `app.use(router)` et `app.use(express.json())` : **ne touche pas** à `app.ts` ni `main.ts`.

---

### Étape 5.5 — Tester le back SEUL (avant tout front)

**🎯 But.** Prouver que l'API renvoie la bonne structure **avant** d'écrire la moindre ligne de React.

**Ce que tu fais :**

1. `npm run dev:server` (démarre l'API sur `:3310`).
2. Dans un autre terminal (ou le navigateur, ou Postman) :
   ```bash
   curl http://localhost:3310/api/medias/home
   ```
   Sur Windows PowerShell : `curl.exe http://localhost:3310/api/medias/home` (le `curl` natif de PowerShell est un alias différent).

**✅ Ce que tu dois voir :**

```jsonc
{
  "films":  [ { "ID": 12, "name": "…", "poster": "/xxx.jpg", "type": "movie",
                "is_anime": 0, "overall_rating": "8.1",
                "topRank": "top3", "isNew": false }, /* … ≤ 20 */ ],
  "series": [ /* … type "tv", is_anime 0 … */ ],
  "animes": [ /* … is_anime 1 … */ ]
}
```

Points à contrôler :
- 3 clés `films` / `series` / `animes`, chacune un tableau ;
- chaque objet a bien `topRank` et `isNew` (les badges) ;
- `films[0].topRank === "top3"`, et `films[0].overall_rating` ≥ `films[1].overall_rating` (tri OK) ;
- `La captura` et/ou `Lanterns` ont `isNew: true` ; les autres `false` ;
- dans `animes`, tous ont `is_anime: 1`.

**⚠️ Dépannage :**
- `[]` partout → base pas seedée → retour étape 5.0.
- Erreur SQL dans la console serveur → relis ta requête (virgule, nom de colonne, ordre des `?`).
- `Cannot find module './modules/catalog/catalogActions'` → chemin ou casse du dossier faux.

Quand ce `curl` est bon, **le back est terminé**. Toutes les tâches Trello `[Back]` sont couvertes.

---

## 6. FRONT — pas à pas

Objectif : `Homepage` récupère `/api/medias/home`, puis affiche 3 `<Carousel>` (Films, Séries, Animés), chacun rempli de `<MediaCard>` avec ses badges.

```
Homepage.tsx  ──fetch──▶ services/api.ts ──▶ GET /api/medias/home
    │  (gère loading / error)
    │
    ├─ <Carousel title="Films"  items={home.films}  />
    ├─ <Carousel title="Séries" items={home.series} />   chaque Carousel :
    └─ <Carousel title="Animés" items={home.animes} />     ├─ flèches ◀ ▶ (scrollBy)
                                                            └─ items.map(m => <MediaCard media={m} />)
                                                                               ├─ poster
                                                                               ├─ badge « Nouveau » si m.isNew
                                                                               └─ badge TOP 3/10 si m.topRank
```

### Étape 6.1 — Les types front

**🎯 But.** Décrire côté client la forme du JSON reçu, pour typer `useState` et les props.

**📁 Fichier.** `client/src/types/catalog.ts` — *à créer* (nom choisi pour **ne pas** entrer en collision avec le `media.ts` de US-DET-01).

**Ce que tu fais :**

1. Dans `client/src/types/`, crée `catalog.ts`.
2. Colle :

```ts
// Une ligne de la table `media` telle que renvoyée par l'API
export type Media = {
  ID: number;
  tmdb_id: number;
  name: string;
  type: string;
  released_at: string | null;
  duration: number | null;
  poster: string | null;
  synopsis: string | null;
  overall_rating: number | string | null;
  status: string | null;
  original_name: string | null;
  original_language: string | null;
  pegi: string | null;
  is_anime: number | boolean; // MySQL renvoie 0 / 1 en JSON
};

// Media + les 2 badges calculés par le back (cf catalogActions.enrichMedias)
export type EnrichedMedia = Media & {
  topRank: "top3" | "top10" | null;
  isNew: boolean;
};

// La réponse complète de GET /api/medias/home
export type HomeData = {
  films: EnrichedMedia[];
  series: EnrichedMedia[];
  animes: EnrichedMedia[];
};
```

**Décryptage :**

| Détail | Pourquoi |
|---|---|
| Pas de `RowDataPacket` | Ça, c'est côté serveur uniquement. Le front reçoit du JSON pur. |
| `released_at: string` (pas `Date`) | Le JSON ne connaît pas `Date` : c'est une chaîne `"2026-07-29"`. |
| `is_anime: number \| boolean` | Selon la version de `mysql2`, sort en `0/1` ou `true/false`. On couvre les deux. |
| `EnrichedMedia` | **Miroir exact** du type serveur. Le front n'a rien à calculer : `isNew` et `topRank` arrivent déjà remplis. |
| `HomeData` | Décrit `{ films, series, animes }`. Sert à `useState<HomeData \| null>`. |

**✅ Vérifier.** `npm run check-types --workspace=client` OK.

---

### Étape 6.2 — Le service d'appel API

**🎯 But.** Une fonction `fetchHome()` qui va chercher les données. Les composants n'écrivent jamais d'URL en dur.

**📁 Fichier.** `client/src/services/api.ts` — *à créer* (ou : **ajouter juste `fetchHome`** si le fichier existe déjà via US-DET-01).

**Ce que tu fais :**

1. Dans `client/src/services/`, crée `api.ts` (ou ouvre l'existant).
2. Colle (ou ajoute la fonction + l'import de type) :

```ts
import type { HomeData } from "../types/catalog";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3310";

export async function fetchHome(): Promise<HomeData> {
  const response = await fetch(`${API_URL}/api/medias/home`);

  if (!response.ok) {
    throw new Error("Impossible de charger la page d'accueil");
  }

  return response.json();
}
```

3. Crée `client/.env` (s'il n'existe pas) avec :
   ```
   VITE_API_URL=http://localhost:3310
   ```

**Décryptage :**

| Élément | Pourquoi |
|---|---|
| `import.meta.env.VITE_API_URL` | Vite n'expose au front **que** les variables préfixées `VITE_`. Voir `client/.env.sample`. |
| `?? "http://localhost:3310"` | Filet de sécurité si le `.env` manque. |
| `async function … Promise<HomeData>` | Fonction asynchrone ; on **annonce** qu'elle renvoie un `HomeData` (TypeScript ne vérifie pas le contenu réel du JSON, c'est un contrat). |
| `await fetch(url)` | Requête HTTP. `fetch` **ne rejette pas** sur un 404/500 → il faut tester soi-même. |
| `if (!response.ok) throw` | Sans ça, un serveur en erreur ferait planter `.json()` avec un message obscur. |
| `return response.json()` | Parse le corps en objet JS. C'est une promesse → `await` implicite via le `return` dans une `async`. |

**✅ Vérifier.** `npm run check-types --workspace=client` OK.

**⚠️ Piège.** Après avoir créé/modifié `client/.env`, **redémarre `vite`** (`npm run dev:client`) : les variables d'env ne sont lues qu'au démarrage.

---

### Étape 6.3 — Le composant carte `MediaCard` (avec badges)

**🎯 But.** Afficher **un** média : poster + titre + badges conditionnels.

**📁 Fichier.** `client/src/components/MediaCard.tsx` — *à créer*.

> La checklist dit « CarouselItem **ou réutiliser la Card du Catalogue** ». Or la Card du Catalogue **n'existe pas encore** (sur `US-CAT-01`, `DiscoverSection.tsx` est un stub vide). Donc tu crées `MediaCard` (nom conforme convention §3 : *« Card : élément unitaire, généralement cliquable »*). Quand le Catalogue aura sa carte, l'équipe fusionnera vers celle-ci.

**Ce que tu fais :**

1. Dans `client/src/components/`, crée `MediaCard.tsx`.
2. Colle :

```tsx
import type { EnrichedMedia } from "../types/catalog";

type MediaCardProps = {
  media: EnrichedMedia;
  showTypeBadge?: boolean; // prévu pour les futures sections mixtes, éteint ici
};

const POSTER_BASE = "https://image.tmdb.org/t/p/w342";

const TOP_RANK_LABEL: Record<"top3" | "top10", string> = {
  top3: "TOP 3",
  top10: "TOP 10",
};

function MediaCard({ media, showTypeBadge = false }: MediaCardProps) {
  const typeLabel = media.is_anime
    ? "Animé"
    : media.type === "movie"
      ? "Film"
      : "Série";

  return (
    <article className="w-32 shrink-0 md:w-40">
      <div className="relative aspect-[2/3] overflow-hidden rounded-box bg-base-200">
        {media.poster != null && (
          <img
            src={`${POSTER_BASE}${media.poster}`}
            alt={media.name}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        )}

        {/* Badge nouveauté — haut droite */}
        {media.isNew && (
          <span className="badge badge-primary badge-sm absolute right-1 top-1 font-semibold">
            Nouveau
          </span>
        )}

        {/* Badge classement — bas gauche */}
        {media.topRank != null && (
          <span className="badge badge-sm absolute bottom-1 left-1 border-none bg-base-100/80 font-semibold text-base-content">
            {TOP_RANK_LABEL[media.topRank]}
          </span>
        )}

        {/* Badge type — éteint par défaut (sections mixtes futures) */}
        {showTypeBadge && (
          <span className="badge badge-sm badge-neutral absolute left-1 top-1">
            {typeLabel}
          </span>
        )}
      </div>

      <h3 className="mt-2 line-clamp-2 text-sm font-semibold text-base-content">
        {media.name}
      </h3>
    </article>
  );
}

export default MediaCard;
```

**Décryptage bloc par bloc :**

| Bloc | Rôle / pourquoi |
|---|---|
| `type MediaCardProps` | Props typées : `media` (obligatoire, un `EnrichedMedia`), `showTypeBadge` (optionnel, `false` par défaut). |
| `POSTER_BASE` | En base, `poster` = `"/abc.jpg"` (chemin TMDB). Il faut préfixer par `https://image.tmdb.org/t/p/w342`. US-DET-01 fait pareil (`w500` pour la fiche). |
| `TOP_RANK_LABEL` | Traduit la valeur technique (`"top3"`) en libellé affiché (`"TOP 3"`). `Record<…>` garantit qu'on couvre les 2 clés. |
| `typeLabel` | Calcule « Film / Série / Animé ». Non affiché tant que `showTypeBadge` est `false`, mais **prêt**. |
| `<article className="w-32 shrink-0 md:w-40">` | Largeur fixe (128px mobile / 160px desktop). **`shrink-0` = crucial** : dans un conteneur flex, empêche la carte de se compresser → elle garde sa taille → le contenu déborde → **ça devient scrollable**. |
| `relative` sur le conteneur du poster | Référence de positionnement pour les badges `absolute`. |
| `aspect-[2/3]` + `object-cover` | Ratio d'affiche standard, image recadrée sans déformation. |
| `overflow-hidden rounded-box` | Coins arrondis (token `--rounded-box` du thème) qui rognent l'image. |
| `{media.poster != null && …}` | Pas de poster → pas de `<img>` cassée (on laisse le fond `bg-base-200`). |
| `loading="lazy"` | Les posters hors écran ne se chargent qu'au scroll. |
| `{media.isNew && <span className="badge badge-primary …">Nouveau</span>}` | **Badge nouveauté.** `badge badge-primary badge-sm` = composant DaisyUI. `absolute right-1 top-1`. S'affiche **seulement si** `isNew` est `true` (calculé par le back). |
| `{media.topRank != null && …}` | **Badge classement.** `TOP_RANK_LABEL[media.topRank]`. Fond semi-transparent `bg-base-100/80`. `absolute bottom-1 left-1`. |
| `{showTypeBadge && …}` | **Badge type**, rendu **uniquement** si on passe `showTypeBadge` (jamais dans cette US). |
| `<h3 … line-clamp-2>` | Titre sur 2 lignes max, coupé avec « … » au-delà. |

**✅ Vérifier.** `npm run check-types --workspace=client` OK. (Rendu visuel : étape 6.5.)

**⚠️ Pièges :**
- Ne rends pas le badge type visible ici : la checklist l'exclut explicitement.
- Pour **désactiver** le badge classement : supprime le bloc `{media.topRank != null && …}`.
- `badge-primary` a un fond jaune (thème `focus`) et un texte foncé auto — pas besoin de forcer la couleur du texte.

---

### Étape 6.4 — Le composant `Carousel` (générique, ×3)

**🎯 But.** Un rail horizontal scrollable + flèches + gestion du cas vide. **Générique** : il ne sait rien de « Films/Séries/Animés », il reçoit `title` + `items`.

**📁 Fichier.** `client/src/components/Carousel.tsx` — *à créer*.

**Ce que tu fais :**

1. Dans `client/src/components/`, crée `Carousel.tsx`.
2. Colle :

```tsx
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import MediaCard from "./MediaCard";
import type { EnrichedMedia } from "../types/catalog";

type CarouselProps = {
  title: string;
  items: EnrichedMedia[];
};

function Carousel({ title, items }: CarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 1 | -1) => {
    trackRef.current?.scrollBy({ left: direction * 400, behavior: "smooth" });
  };

  return (
    <section>
      <h2 className="mb-4 text-xl font-display font-semibold text-base-content">
        {title}
      </h2>

      {items.length === 0 ? (
        <p className="italic text-base-content/60">Aucun contenu disponible</p>
      ) : (
        <div className="relative">
          <div
            ref={trackRef}
            className="carousel carousel-center w-full scrollbar-none gap-4 rounded-box"
          >
            {items.map((media) => (
              <div key={media.ID} className="carousel-item">
                <MediaCard media={media} />
              </div>
            ))}
          </div>

          <button
            type="button"
            aria-label="Précédent"
            onClick={() => handleScroll(-1)}
            className="btn btn-circle btn-sm absolute left-1 top-1/3 -translate-y-1/2 bg-base-200/80 text-base-content hover:bg-primary"
          >
            <ChevronLeft size={16} />
          </button>

          <button
            type="button"
            aria-label="Suivant"
            onClick={() => handleScroll(1)}
            className="btn btn-circle btn-sm absolute right-1 top-1/3 -translate-y-1/2 bg-base-200/80 text-base-content hover:bg-primary"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </section>
  );
}

export default Carousel;
```

**Décryptage bloc par bloc :**

| Bloc | Rôle / pourquoi |
|---|---|
| `import { useRef }` | Pour obtenir une « poignée » vers le div qui scrolle (les flèches en ont besoin). |
| `import { ChevronLeft, ChevronRight } from "lucide-react"` | Icônes. `lucide-react` est déjà utilisé dans `Navbar.tsx`. |
| `type CarouselProps = { title; items }` | **Les 2 seules props.** `title` = texte affiché (français). `items` = la liste à rendre. C'est ça, « générique ». |
| `const trackRef = useRef<HTMLDivElement>(null)` | Créé vide, puis rattaché au div via `ref={trackRef}`. `trackRef.current` = le nœud DOM réel. |
| `handleScroll(direction)` | `direction` = `1` (droite) ou `-1` (gauche). `trackRef.current?.scrollBy({ left, behavior: "smooth" })` : fait défiler le rail de 400px. Le `?.` protège si la ref n'est pas encore prête. **C'est exactement le « scrollBy sur le conteneur » de la checklist.** |
| `<section>` + `<h2 className="mb-4 text-xl font-display font-semibold text-base-content">` | **Le style de titre demandé mot pour mot par la checklist.** |
| `{items.length === 0 ? <p>Aucun contenu disponible</p> : ( … )}` | **Cas limite « catégorie vide »** de la checklist. Style `italic text-base-content/60` demandé. |
| `<div className="relative">` | Enveloppe le rail + les flèches ; sert d'ancrage aux flèches `absolute`. |
| `className="carousel carousel-center w-full scrollbar-none gap-4 rounded-box"` | **Classes DaisyUI de la checklist.** `.carousel` apporte **gratuitement** `overflow-x` + `scroll-snap` → **swipe tactile mobile + molette/trackpad fonctionnent sans code**. `w-full` force la largeur (`.carousel` est `inline-flex` par défaut). `scrollbar-none` (défini dans `globals.css`) cache la barre. `gap-4` = espace entre cartes. |
| `{items.map((media) => ( <div key={media.ID} className="carousel-item"> <MediaCard media={media} /> </div> ))}` | Une entrée `carousel-item` (classe DaisyUI = point d'accroche du snap) par média, contenant la carte. **`key={media.ID}`** : obligatoire, unique, l'`ID` de la base est parfait. |
| Les 2 `<button>` | `type="button"` (sinon un `<button>` dans un futur `<form>` soumettrait). `aria-label` : le bouton n'a qu'une icône → indispensable pour les lecteurs d'écran. `onClick={() => handleScroll(±1)}`. Classes `btn btn-circle btn-sm bg-base-200/80 text-base-content hover:bg-primary` ≈ celles de la checklist (elle écrit `hover:bg-base-primary`, qui n'existe pas en DaisyUI → `hover:bg-primary`). `absolute left-1/right-1 top-1/3` : posées sur le rail, à hauteur des posters. |

**✅ Vérifier.** `npm run check-types --workspace=client` OK. (Rendu : étape suivante.)

**⚠️ Pièges :**
- `ref` se met sur le div qui a la classe `carousel` (celui qui scrolle), **pas** sur `<section>`.
- Si les flèches ne font rien : vérifie que `trackRef` est bien sur le bon div, et que `items` n'est pas vide (sinon le div n'est pas rendu).
- `carousel-item` doit envelopper chaque carte, pas être sur la carte elle-même.

---

### Étape 6.5 — La page `Homepage`

**🎯 But.** Le chef d'orchestre du front : fetch au montage, gestion `loading`/`error`, puis 3 `<Carousel>`.

**📁 Fichier.** `client/src/pages/Homepage.tsx` — *à modifier* (contient `<h1>WORK IN PROGRESS</h1>`, on remplace tout).

**Ce que tu fais :**

1. Ouvre `client/src/pages/Homepage.tsx`.
2. Remplace **tout** le contenu par :

```tsx
import { useEffect, useState } from "react";

import Carousel from "../components/Carousel";
import { fetchHome } from "../services/api";
import type { HomeData } from "../types/catalog";

function Homepage() {
  const [home, setHome] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHome()
      .then((data) => setHome(data))
      .catch(() => setError("Le chargement de l'accueil a échoué."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-base-content/60">Chargement…</p>;
  }

  if (error != null || home == null) {
    return (
      <p className="text-base-content/60">{error ?? "Une erreur est survenue."}</p>
    );
  }

  return (
    <div className="space-y-10">
      <Carousel title="Films" items={home.films} />
      <Carousel title="Séries" items={home.series} />
      <Carousel title="Animés" items={home.animes} />
    </div>
  );
}

export default Homepage;
```

**Décryptage bloc par bloc :**

| Bloc | Rôle / pourquoi |
|---|---|
| `const [home, setHome] = useState<HomeData \| null>(null)` | Les données. `null` tant qu'elles ne sont pas arrivées → le type **force** à gérer ce cas. |
| `const [loading, setLoading] = useState(true)` | `true` au départ (on charge dès le montage). Convention §3 : *« `loading`, `error` systématiques sur chaque appel API »*. |
| `const [error, setError] = useState<string \| null>(null)` | Message d'erreur à afficher, ou `null`. |
| `useEffect(() => { … }, [])` | **Le `[]` = « exécute une seule fois, au montage »**. Sans lui : re-fetch à chaque rendu = boucle infinie. |
| `fetchHome().then(…).catch(…).finally(…)` | Succès → `setHome(data)`. Échec → `setError(...)`. **Dans tous les cas** → `setLoading(false)`. Patron identique à `MovieDetail.tsx` (US-DET-01). |
| `if (loading) return <p>Chargement…</p>` | **Gestion de l'état de chargement** (checklist). Court-circuite le rendu tant que ça charge. |
| `if (error != null \|\| home == null) return …` | Filet de sécurité **+** ça apprend à TypeScript qu'après cette ligne, `home` **n'est plus `null`** → `home.films` ne lève pas d'alerte. |
| `<div className="space-y-10">` | Espace vertical entre les 3 sections. |
| `<Carousel title="Films" items={home.films} />` ×3 | **Le seul endroit** où on nomme les catégories (texte français, convention). Le `Carousel` reste générique. |

**✅ Vérifier.**
1. `npm run dev` (racine) → lance client + serveur.
2. Ouvre `http://localhost:3000`.
3. Tu dois voir 3 sections « Films / Séries / Animés », chacune un rail de cartes scrollable, flèches ◀ ▶ fonctionnelles, badge « Nouveau » sur `La captura` / `Lanterns`.
4. Coupe le serveur (`Ctrl+C` sur `dev:server`) et recharge → tu dois voir le message d'erreur, pas une page blanche.

**⚠️ Pièges :**
- Oubli du `[]` dans `useEffect` → le réseau part en boucle (visible dans l'onglet Network).
- Si rien ne s'affiche et la console dit « CORS » → `CLIENT_URL` manque dans `server/.env` (étape 5.0).
- `import { fetchHome }` (accolades = export nommé) vs `import Carousel` (pas d'accolades = export default). Respecte ce que chaque fichier exporte.

---

### Étape 6.6 — La route `/`

**🎯 But.** Rien à faire. La route existe déjà.

**📁 Fichier.** `client/src/main.tsx` — *lecture seule*.

Le routeur contient déjà :
```tsx
{ index: true, element: <Homepage /> }
```
`index: true` = *« page affichée quand l'URL est exactement `/` »*. Le lien « Accueil » de la `Navbar` (`<NavLink to="/">`) pointe déjà dessus. **Tâche Trello « [Front] Ajout de la route / » = déjà faite par US-NAV-01.**

**✅ Vérifier.** Le clic sur « Accueil » dans la navbar affiche bien la `Homepage`.

---

### Étape 6.7 — (Bonus, optionnel) clic-glissé souris

**🎯 But.** « nice-to-have » de la checklist. Le swipe tactile et la molette marchent **déjà** via `.carousel` ; ceci ajoute le glisser-déposer à la souris sur desktop.

**📁 Fichier.** `client/src/hooks/useDragScroll.ts` — *à créer*.

```ts
import { useRef } from "react";

export function useDragScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const state = useRef({ down: false, startX: 0, scrollLeft: 0 });

  const onMouseDown = (e: React.MouseEvent) => {
    if (ref.current == null) return;
    state.current = {
      down: true,
      startX: e.pageX,
      scrollLeft: ref.current.scrollLeft,
    };
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!state.current.down || ref.current == null) return;
    e.preventDefault();
    ref.current.scrollLeft =
      state.current.scrollLeft - (e.pageX - state.current.startX);
  };

  const stop = () => {
    state.current.down = false;
  };

  return { ref, onMouseDown, onMouseMove, onMouseUp: stop, onMouseLeave: stop };
}
```

**Comment le brancher dans `Carousel` :**
1. Remplace `const trackRef = useRef<HTMLDivElement>(null)` par `const drag = useDragScroll<HTMLDivElement>()`.
2. Sur le div `.carousel` : `ref={drag.ref}` **et** étale les handlers : `<div ref={drag.ref} onMouseDown={drag.onMouseDown} onMouseMove={drag.onMouseMove} onMouseUp={drag.onMouseUp} onMouseLeave={drag.onMouseLeave} …>`.
3. Dans `handleScroll`, remplace `trackRef` par `drag.ref`.

**Décryptage :** on mémorise la position de la souris + du scroll au `mousedown`, puis à chaque `mousemove` on décale `scrollLeft` de la distance parcourue. `e.preventDefault()` empêche la sélection de texte pendant le drag.

**⚠️ Piège.** À faire **seulement une fois** que 6.1 → 6.6 sont validées et commитées. Facile à casser, faible valeur.

---

## 7. Correspondance avec les tâches Trello

| Tâche Trello | Où ça se fait |
|---|---|
| **[Back]** route `GET api/medias?category` | Étape 5.4 — `router.get("/api/medias/home", …)` (variante groupée, note en 5.3) |
| **[Back]** `readByCategory(type)` dans le Repository | Étape 5.2 |
| **[Back]** `LIMIT 20` par catégorie | Étape 5.2 — le paramètre `limit = 20` |
| **[Back]** `browseByCategory` appelant `readByCategory` ×3 | Étape 5.3 — le `Promise.all` |
| **[Back]** objet `{ films, series, animes }` | Étape 5.3 — le `res.json(...)` |
| **[Back]** catégorie sans résultat → tableau vide | Étape 5.2 — comportement naturel de `SELECT`, rien à coder |
| **[Back]** badges « Nouveau » / « TOP 3-10 » *(ajout v2)* | Étape 5.1 (`EnrichedMedia`) + 5.3 (`isMediaNew`, `enrichMedias`) |
| **[Front]** page Accueil | Étape 6.5 |
| **[Front]** route `/` | Étape 6.6 — déjà faite |
| **[Front]** fetch dans `useEffect` + state `{ films, series, animes }` | Étape 6.5 (+ 6.2 pour le service) |
| **[Front]** composant `Carousel` générique (`carousel-center gap-4 rounded-box`) | Étape 6.4 |
| **[Front]** `CarouselItem` / réutiliser `Card` | Étape 6.3 — `MediaCard` (la Card du Catalogue n'existe pas encore) |
| **[Front]** props `Carousel` = titre + liste | Étape 6.4 — `CarouselProps` |
| **[Front]** 3 instances `Carousel` (Film, Série, Animé) | Étape 6.5 |
| **[Front]** scroll natif + flèches prev/next (`scrollBy`, `btn btn-circle btn-sm …`) | Étape 6.4 |
| **[Front]** cas vide → « Aucun contenu disponible » `italic text-base-content/60` | Étape 6.4 — ternaire `items.length === 0` |
| **[Front]** état de chargement | Étape 6.5 — `if (loading)` |
| **[Front]** badge de type (pastille) — *prévu, éteint* | Étape 6.3 — prop `showTypeBadge` (jamais passée ici) |
| **[Front]** clic-glissé souris (optionnel) | Étape 6.7 |
| **[Front]** titre de section `text-xl font-display font-semibold text-base-content mb-4` | Étape 6.4 — le `<h2>` |

---

## 8. Ordre de travail conseillé + commits

Dans **cet ordre**, en testant à chaque palier (ne pas tout coder d'un bloc) :

1. `git checkout dev && git pull` → `git checkout -b US-ACC-01` (si pas déjà fait) puis inspecter `dev` (§4).
2. **Base** : `npm run db:migrate && npm run tmdb:seed`.
3. **Back** : types (5.1) → Repository (5.2) → Actions + badges (5.3) → router (5.4).
   → test `curl` (5.5). **Commit** : `feat: add /api/medias/home returning medias by category with new/top badges`
4. **Front data** : types (6.1) → `api.ts` (6.2). Vérifier dans la console navigateur que `fetchHome()` renvoie l'objet.
5. **Front UI** : `MediaCard` (6.3) → `Carousel` (6.4) → `Homepage` (6.5).
   `npm run dev` → `http://localhost:3000`. **Commit** : `feat: add home page with Films/Séries/Animés carousels`
6. **Finitions** : cas vide, loading, flèches, responsive mobile, badges OK. **Commit** : `feat: handle carousel empty/loading states and nav arrows`
7. `npm run check` à la racine (Biome + types) **avant** de pousser — le hook de commit le refusera sinon.
8. Bonus clic-glissé (6.7) → **commit** séparé si le temps le permet.

Format de commit imposé (commitlint) : `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `test:` (voir `docs/conventions-nommage.md` §4).

---

## Annexe — rappels de nommage

Extraits de `docs/conventions-nommage.md` :

- **Routes API** : `/api/<ressource>` au pluriel ; query params en camelCase ; `me` (jamais `:userId`) pour l'utilisateur authentifié.
- **Back** : un module = un dossier **camelCase singulier** ; deux fichiers `<module>Actions.ts` + `<module>Repository.ts`. Préfixes de méthodes : `browse` (liste complète, côté Actions), `read` / `readBy` (lecture), `count` / `sum` (agrégats), `find` (existence). Champs d'API en **camelCase** même si la colonne SQL est en snake_case.
- **Front** : Pages et Composants en **PascalCase** ; suffixes `Section` (bloc réutilisable dans une page), `List` (collection), `Card` (élément unitaire cliquable). Services/utils en camelCase (`api.ts`). Types en PascalCase singulier.
- **States** : `loading` et `error` systématiques sur chaque appel API ; booléens préfixés `is` ; sélection préfixée `selected`/`active` ; handlers préfixés `handle`.
- **Git** : Conventional Commits ; branches `US-<SCOPE>-<NUMÉRO>` en majuscules ; branche d'intégration `dev`.

---

## Écarts assumés vis-à-vis de la checklist / des conventions (à signaler en review)

| Écart | Raison |
|---|---|
| Route `GET /api/medias/home` au lieu de `?category=` | Renvoie `{ films, series, animes }` en 1 appel = ce que demandent les critères d'acceptation ; aligné sur `/api/medias/discover` de CAT-01 |
| Champs d'API en **snake_case** (`released_at`, `overall_rating`…) | La convention dit camelCase, mais CAT-01 renvoie déjà du `SELECT *` brut → on reste cohérent avec le module voisin. À harmoniser ensemble plus tard. |
| Dossier `catalog/` (minuscule) | Conforme à la convention ; CAT-01 a `Catalog/` (majuscule) → **à réconcilier au merge** |
| `client/src/types/catalog.ts` | Évite la collision avec `client/src/types/media.ts` de US-DET-01 |
| `hover:bg-primary` au lieu de `hover:bg-base-primary` (checklist) | `base-primary` n'existe pas dans DaisyUI |
