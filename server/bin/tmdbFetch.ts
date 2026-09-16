/**
 * Récupération des données TMDB → server/database/seeds/tmdb.json
 *
 * Ce script ne touche jamais à la base. Une seule personne le lance,
 * commit le JSON produit, et le reste de l'équipe utilise tmdbSeed.ts.
 *
 * Usage : npm run tmdb:fetch
 */

import "dotenv/config";

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

/* ================================================================== *
 * 1. CONFIGURATION
 * ================================================================== */

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

/** Langue principale, et repli quand le champ FR est vide. */
const LANG = "fr-FR";
const FALLBACK_LANG = "en-US";

/** Région pour les certifications et les plateformes. */
const REGION = "FR";

/** Nombre de médias à récupérer par catégorie. */
/**
 * Nombre de médias à AJOUTER à chaque run. Si un dump existe déjà,
 * ceux qu'il contient sont ignorés et le script va chercher les
 * suivants par ordre de popularité.
 */
const COUNTS = { movies: 300, series: 300, animes: 300 };

/**
 * Marge de candidats demandés à /discover. Beaucoup sont écartés :
 * animés mélangés aux séries, séries trop longues, fiches incomplètes.
 * 3 = on récupère trois fois plus de candidats que nécessaire.
 */
const DISCOVER_PAGE_FACTOR = 3;

/** ID du genre "Animation" chez TMDB (ce n'est PAS un âge). */
const ANIMATION_GENRE_ID = 16;
const ANIME_ORIGIN_COUNTRY = "JP";

/**
 * Acteurs max par média. Infinity = tout le cast.
 * Le plafond a un effet en cascade : moins d'acteurs retenus, donc
 * moins de fiches personne à télécharger, donc un run bien plus court.
 */
const CAST_LIMIT = 20;

/** Récupérer la biographie de chaque personne (1 requête par personne). */
const FETCH_PERSON_DETAILS = true;

/**
 * "all"    → cast principal + invités de chaque épisode (1 requête/épisode)
 * "guests" → invités seuls, déjà présents dans la réponse de saison (0 requête)
 */
type EpisodeCastMode = "all" | "guests";

const EPISODE_CAST_MODE = "guests" as EpisodeCastMode;

/** Écarte les séries fleuves (One Piece, Détective Conan…). */
const MAX_EPISODES_PER_MEDIA = 200;

/** La saison 0 regroupe les "spéciaux", souvent mal renseignés. */
const INCLUDE_SEASON_ZERO = false;

/** Sections de /watch/providers retenues ("buy" et "rent" exclus). */
const PROVIDER_SECTIONS = ["flatrate", "free", "ads"] as const;

/** Requêtes simultanées. TMDB tolère ~50/s, on reste très en dessous. */
const CONCURRENCY = 10;
const MAX_RETRIES = 4;

const CACHE_DIR = path.join(__dirname, "../database/.tmdb-cache");
/**
 * Le dump est compressé : le JSON brut dépasse les limites de GitHub
 * à cette volumétrie, et gzip le divise par huit environ.
 * tmdbSeed.ts le décompresse en mémoire.
 */
const OUTPUT_FILE = path.join(__dirname, "../database/seeds/tmdb.json.gz");

/* ================================================================== *
 * 2. TYPES
 * ================================================================== */

type SeedGenre = { tmdb_id: number; name: string };

type SeedPlatform = {
  tmdb_id: number;
  name: string;
  logo: string | null;
  url: string | null;
};

type SeedPerson = {
  tmdb_id: number;
  name: string;
  biography: string | null;
  photo: string | null;
};

type SeedCredit = {
  person_tmdb_id: number;
  personnage_name: string | null;
  role: string;
};

type SeedEpisode = {
  tmdb_id: number;
  number: number;
  name: string;
  released_at: string | null;
  synopsis: string | null;
  duration: number | null;
  cast: SeedCredit[];
};

type SeedSeason = {
  tmdb_id: number;
  number: number;
  name: string;
  released_at: string | null;
  poster: string | null;
  synopsis: string | null;
  is_finished: boolean;
  episodes: SeedEpisode[];
};

type SeedMedia = {
  tmdb_id: number;
  type: "movie" | "tv";
  is_anime: boolean;
  name: string;
  original_name: string | null;
  original_language: string | null;
  released_at: string | null;
  duration: number | null;
  poster: string | null;
  synopsis: string | null;
  overall_rating: number | null;
  status: string | null;
  pegi: string | null;
  genres: number[];
  platforms: number[];
  cast: SeedCredit[];
  seasons: SeedSeason[];
};

type SeedFile = {
  generated_at: string;
  genres: SeedGenre[];
  platforms: SeedPlatform[];
  persons: SeedPerson[];
  medias: SeedMedia[];
};

/* --- Types TMDB (partiels : uniquement les champs consommés) -------- */

type CastMember = {
  id: number;
  name: string;
  character?: string;
  known_for_department?: string;
  profile_path?: string | null;
  roles?: { character?: string }[];
};

type Providers = {
  results?: Record<
    string,
    Partial<
      Record<
        string,
        { provider_id: number; provider_name: string; logo_path?: string }[]
      >
    >
  >;
};

type ReleaseDates = {
  results?: {
    iso_3166_1: string;
    release_dates?: { certification?: string }[];
  }[];
};

type ContentRatings = {
  results?: { iso_3166_1: string; rating?: string }[];
};

type MovieDetail = {
  id: number;
  title: string;
  original_title?: string;
  original_language?: string;
  release_date?: string;
  runtime?: number | null;
  poster_path?: string | null;
  overview?: string;
  vote_average?: number;
  status?: string;
  genres?: { id: number }[];
  credits?: { cast?: CastMember[] };
  release_dates?: ReleaseDates;
  "watch/providers"?: Providers;
};

type TvDetail = {
  id: number;
  name: string;
  original_name?: string;
  original_language?: string;
  first_air_date?: string;
  poster_path?: string | null;
  overview?: string;
  vote_average?: number;
  status?: string;
  number_of_episodes?: number;
  genres?: { id: number }[];
  origin_country?: string[];
  seasons?: { season_number: number }[];
  aggregate_credits?: { cast?: CastMember[] };
  content_ratings?: ContentRatings;
  "watch/providers"?: Providers;
};

type TvEpisode = {
  id: number;
  episode_number: number;
  name?: string;
  overview?: string;
  air_date?: string | null;
  runtime?: number | null;
  episode_type?: string;
  guest_stars?: CastMember[];
};

type SeasonDetail = {
  id: number;
  season_number: number;
  name?: string;
  overview?: string;
  air_date?: string | null;
  poster_path?: string | null;
  episodes?: TvEpisode[];
};

type DiscoverResult = { results?: { id: number }[]; total_pages?: number };

/* ================================================================== *
 * 3. CLIENT HTTP
 * ================================================================== */

/* --- Limiteur de concurrence --------------------------------------- *
 * File d'attente maison : au plus CONCURRENCY requêtes en vol.
 * Évite d'ajouter p-limit en dépendance pour si peu.
 */

let active = 0;
const waiting: (() => void)[] = [];

const acquire = async () => {
  if (active < CONCURRENCY) {
    active += 1;
    return;
  }

  await new Promise<void>((resolve) => waiting.push(resolve));
  active += 1;
};

const release = () => {
  active -= 1;
  waiting.shift()?.();
};

/* --- Cache disque --------------------------------------------------- *
 * Chaque réponse est stockée sous le hash de son URL. Si le script est
 * interrompu, la relance repart des données déjà téléchargées.
 * Supprimer le dossier pour forcer un rafraîchissement complet.
 */

const cachePath = (key: string) =>
  path.join(
    CACHE_DIR,
    `${crypto.createHash("sha1").update(key).digest("hex")}.json`,
  );

const readCache = (key: string) => {
  const file = cachePath(key);

  if (!fs.existsSync(file)) return undefined;

  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return undefined;
  }
};

const writeCache = (key: string, value: unknown) => {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(cachePath(key), JSON.stringify(value), "utf8");
};

/* --- Requête -------------------------------------------------------- */

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let requestCount = 0;

/**
 * Appelle un endpoint TMDB. Renvoie null sur un 404
 * (ressource absente côté TMDB, cas normal).
 */
const tmdbGet = async <T>(
  endpoint: string,
  params: Record<string, string | number | boolean | undefined> = {},
): Promise<T | null> => {
  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) throw new Error("TMDB_API_KEY absente du .env");

  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  // La clé n'entre pas dans la clé de cache : deux membres de l'équipe
  // avec des clés différentes partagent le même cache.
  const cacheKey = url.toString();
  const cached = readCache(cacheKey);

  if (cached !== undefined) return cached as T | null;

  url.searchParams.set("api_key", apiKey);

  await acquire();

  try {
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
      try {
        requestCount += 1;

        const response = await fetch(url, {
          headers: { Accept: "application/json" },
        });

        if (response.status === 404) {
          writeCache(cacheKey, null);
          return null;
        }

        // Quota dépassé : TMDB indique combien de temps patienter.
        if (response.status === 429) {
          const retryAfter = Number(response.headers.get("retry-after") ?? 1);
          await sleep((retryAfter + 1) * 1000);
          continue;
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status} sur ${endpoint}`);
        }

        const data = (await response.json()) as T;

        writeCache(cacheKey, data);

        return data;
      } catch (error) {
        if (attempt === MAX_RETRIES) {
          console.error(`✖ Échec définitif : ${endpoint}`, error);
          return null;
        }

        // Backoff exponentiel : 0,5s puis 1s, 2s, 4s.
        await sleep(500 * 2 ** attempt);
      }
    }

    return null;
  } finally {
    release();
  }
};

/** Exécute des tâches en parallèle avec une progression lisible. */
const mapWithProgress = async <T, R>(
  label: string,
  items: T[],
  handler: (item: T, index: number) => Promise<R>,
): Promise<R[]> => {
  let done = 0;

  return Promise.all(
    items.map(async (item, index) => {
      const result = await handler(item, index);

      done += 1;

      if (done % 25 === 0 || done === items.length) {
        console.info(`  ${label} : ${done}/${items.length}`);
      }

      return result;
    }),
  );
};

/* ================================================================== *
 * 4. RÈGLES DE MAPPING
 * ================================================================== */

/* --- PEGI ----------------------------------------------------------- *
 * TMDB renvoie des libellés hétérogènes selon le type et le pays.
 * On les ramène à un jeu fermé : "TP" | "10" | "12" | "16" | "18".
 * La colonne reste en VARCHAR(50), mais le filtre applicatif devient
 * fiable (WHERE pegi IN (...)) au lieu d'une liste ouverte de libellés.
 */

type Pegi = "TP" | "10" | "12" | "16" | "18";

/** Certifications françaises : "Tous publics", "-12", "16", "U"… */
const normalizeFrench = (raw: string): Pegi | null => {
  const value = raw.trim().toLowerCase();

  if (!value) return null;
  if (value.includes("18")) return "18";
  if (value.includes("16")) return "16";
  if (value.includes("12")) return "12";
  if (value.includes("10")) return "10";
  if (value.includes("tous publics") || value === "u") return "TP";

  return null;
};

/** Certifications américaines, utilisées en repli. */
const US_MAP: Record<string, Pegi> = {
  G: "TP",
  PG: "10",
  "PG-13": "12",
  R: "16",
  "NC-17": "18",
  "TV-Y": "TP",
  "TV-G": "TP",
  "TV-Y7": "10",
  "TV-PG": "10",
  "TV-14": "12",
  "TV-MA": "16",
};

const normalizeUs = (raw: string): Pegi | null =>
  US_MAP[raw.trim().toUpperCase()] ?? null;

const firstCertification = (data: ReleaseDates, country: string) => {
  const entry = data.results?.find((item) => item.iso_3166_1 === country);

  return (
    entry?.release_dates?.find(
      (item) => item.certification && item.certification.trim() !== "",
    )?.certification ?? null
  );
};

/** Films : FR prioritaire, US converti en repli. */
const pegiFromMovie = (data: ReleaseDates | undefined): Pegi | null => {
  if (!data) return null;

  const french = firstCertification(data, REGION);

  if (french) {
    const normalized = normalizeFrench(french);
    if (normalized) return normalized;
  }

  const us = firstCertification(data, "US");

  return us ? normalizeUs(us) : null;
};

/** Séries : FR prioritaire, US converti en repli. */
const pegiFromTv = (data: ContentRatings | undefined): Pegi | null => {
  if (!data) return null;

  const french = data.results?.find(
    (item) => item.iso_3166_1 === REGION,
  )?.rating;

  if (french) {
    const normalized = normalizeFrench(french);
    if (normalized) return normalized;
  }

  const us = data.results?.find((item) => item.iso_3166_1 === "US")?.rating;

  return us ? normalizeUs(us) : null;
};

/* --- Saison terminée ------------------------------------------------ *
 * Une saison est terminée si elle contient un épisode marqué "finale"
 * par TMDB et déjà diffusé. À défaut de marqueur, on se base sur la
 * date du dernier épisode connu.
 */

const isSeasonFinished = (episodes: TvEpisode[]): boolean => {
  if (episodes.length === 0) return false;

  const today = new Date();
  const isAired = (date?: string | null) =>
    Boolean(date) && new Date(date as string) <= today;

  const finale = episodes.find((episode) => episode.episode_type === "finale");

  if (finale) return isAired(finale.air_date);

  return isAired(episodes[episodes.length - 1]?.air_date);
};

/* --- Petits helpers -------------------------------------------------- */

/** Chaîne vide → null, pour ne pas polluer la base. */
const orNull = (value: string | null | undefined): string | null => {
  const trimmed = value?.trim();

  return trimmed ? trimmed : null;
};

/** TMDB renvoie 0 quand la note n'existe pas. */
const ratingOrNull = (value: number | undefined): number | null =>
  value && value > 0 ? Math.round(value * 10) / 10 : null;

/** Date TMDB ("" quand inconnue) → format MySQL ou null. */
const dateOrNull = (value: string | null | undefined): string | null =>
  value && value.trim() !== "" ? value : null;

/* ================================================================== *
 * 5. RÉCUPÉRATION
 * ================================================================== */

const platforms = new Map<number, SeedPlatform>();
const personIds = new Set<number>();

/* --- Dump existant --------------------------------------------------- *
 * Le script est cumulatif : à chaque run, il repart du dump déjà produit,
 * écarte les médias qu'il contient et ajoute COUNTS nouveaux titres.
 * Supprimer tmdb.json.gz pour repartir de zéro.
 */

const loadExisting = (): SeedFile | null => {
  if (!fs.existsSync(OUTPUT_FILE)) return null;

  try {
    const compressed = fs.readFileSync(OUTPUT_FILE);

    return JSON.parse(zlib.gunzipSync(compressed).toString("utf8"));
  } catch (error) {
    console.error("Dump existant illisible, on repart de zéro.", error);
    return null;
  }
};

const existing = loadExisting();

/** Clé d'unicité d'un média : films et séries partagent leur numérotation. */
const mediaKey = (type: string, tmdbId: number) => `${type}:${tmdbId}`;

const knownMedia = new Set(
  (existing?.medias ?? []).map((media) => mediaKey(media.type, media.tmdb_id)),
);

const knownPersons = new Set(
  (existing?.persons ?? []).map((person) => person.tmdb_id),
);

const isKnownMovie = (id: number) => knownMedia.has(mediaKey("movie", id));
const isKnownTv = (id: number) => knownMedia.has(mediaKey("tv", id));

/** Ne conserve que les acteurs, dans la limite de CAST_LIMIT. */
const toCredits = (cast: CastMember[] | undefined): SeedCredit[] => {
  if (!cast) return [];

  const actors = cast.filter(
    (member) => member.known_for_department === "Acting",
  );

  const limited = Number.isFinite(CAST_LIMIT)
    ? actors.slice(0, CAST_LIMIT)
    : actors;

  return limited.map((member) => {
    personIds.add(member.id);

    return {
      person_tmdb_id: member.id,
      // aggregate_credits expose les rôles dans "roles", credits dans "character"
      personnage_name: orNull(member.roles?.[0]?.character ?? member.character),
      role: "actor",
    };
  });
};

/** Extrait les plateformes FR, hors sections "buy" et "rent". */
const collectPlatforms = (providers: Providers | undefined): number[] => {
  const region = providers?.results?.[REGION];

  if (!region) return [];

  const ids = new Set<number>();

  for (const section of PROVIDER_SECTIONS) {
    for (const provider of region[section] ?? []) {
      ids.add(provider.provider_id);

      if (!platforms.has(provider.provider_id)) {
        platforms.set(provider.provider_id, {
          tmdb_id: provider.provider_id,
          name: provider.provider_name,
          logo: provider.logo_path ?? null,
          // TMDB ne fournit pas d'URL par plateforme : à compléter à la
          // main si l'équipe veut des liens sortants.
          url: null,
        });
      }
    }
  }

  return [...ids];
};

/* --- Genres ---------------------------------------------------------- */

const fetchGenres = async (): Promise<SeedGenre[]> => {
  type GenreList = { genres?: { id: number; name: string }[] };

  const [movie, tv] = await Promise.all([
    tmdbGet<GenreList>("/genre/movie/list", { language: LANG }),
    tmdbGet<GenreList>("/genre/tv/list", { language: LANG }),
  ]);

  // Les deux listes se recoupent (Animation, Comédie…) : l'ID fait foi.
  const byId = new Map<number, SeedGenre>();

  for (const genre of [...(movie?.genres ?? []), ...(tv?.genres ?? [])]) {
    byId.set(genre.id, { tmdb_id: genre.id, name: genre.name });
  }

  return [...byId.values()];
};

/* --- Découverte des candidats ---------------------------------------- */

const discover = async (
  endpoint: "/discover/movie" | "/discover/tv",
  params: Record<string, string | number | boolean>,
  pages: number,
): Promise<number[]> => {
  const ids: number[] = [];

  for (let page = 1; page <= pages; page += 1) {
    const data = await tmdbGet<DiscoverResult>(endpoint, {
      ...params,
      language: LANG,
      sort_by: "popularity.desc",
      include_adult: false,
      page,
    });

    for (const item of data?.results ?? []) ids.push(item.id);

    if (page >= (data?.total_pages ?? 1)) break;
  }

  return ids;
};

/* --- Films ------------------------------------------------------------ */

const fetchMovie = async (id: number): Promise<SeedMedia | null> => {
  const detail = await tmdbGet<MovieDetail>(`/movie/${id}`, {
    language: LANG,
    append_to_response: "credits,release_dates,watch/providers",
  });

  if (!detail) return null;

  // Repli anglais quand le synopsis FR est absent.
  let synopsis = orNull(detail.overview);

  if (!synopsis) {
    const fallback = await tmdbGet<MovieDetail>(`/movie/${id}`, {
      language: FALLBACK_LANG,
    });

    synopsis = orNull(fallback?.overview);
  }

  return {
    tmdb_id: detail.id,
    type: "movie",
    is_anime: false,
    name: detail.title,
    original_name: orNull(detail.original_title),
    original_language: orNull(detail.original_language),
    released_at: dateOrNull(detail.release_date),
    duration: detail.runtime ?? null,
    poster: detail.poster_path ?? null,
    synopsis,
    overall_rating: ratingOrNull(detail.vote_average),
    status: orNull(detail.status),
    pegi: pegiFromMovie(detail.release_dates),
    genres: (detail.genres ?? []).map((genre) => genre.id),
    platforms: collectPlatforms(detail["watch/providers"]),
    cast: toCredits(detail.credits?.cast),
    seasons: [],
  };
};

/* --- Saisons et épisodes ---------------------------------------------- */

const fetchEpisodeCast = async (
  tvId: number,
  seasonNumber: number,
  episode: TvEpisode,
): Promise<SeedCredit[]> => {
  // Mode "guests" : les invités sont déjà dans la réponse de saison,
  // aucune requête supplémentaire.
  if (EPISODE_CAST_MODE === "guests") return toCredits(episode.guest_stars);

  const credits = await tmdbGet<{
    cast?: CastMember[];
    guest_stars?: CastMember[];
  }>(
    `/tv/${tvId}/season/${seasonNumber}/episode/${episode.episode_number}/credits`,
  );

  return toCredits([...(credits?.cast ?? []), ...(credits?.guest_stars ?? [])]);
};

const fetchSeason = async (
  tvId: number,
  seasonNumber: number,
): Promise<SeedSeason | null> => {
  const detail = await tmdbGet<SeasonDetail>(
    `/tv/${tvId}/season/${seasonNumber}`,
    { language: LANG },
  );

  if (!detail) return null;

  // Un seul appel de repli par saison plutôt qu'un par épisode.
  const needsFallback =
    !orNull(detail.overview) ||
    (detail.episodes ?? []).some((episode) => !orNull(episode.overview));

  const fallback = needsFallback
    ? await tmdbGet<SeasonDetail>(`/tv/${tvId}/season/${seasonNumber}`, {
        language: FALLBACK_LANG,
      })
    : null;

  const fallbackEpisodes = new Map(
    (fallback?.episodes ?? []).map((episode) => [episode.id, episode]),
  );

  const rawEpisodes = detail.episodes ?? [];

  const episodes: SeedEpisode[] = await Promise.all(
    rawEpisodes.map(async (episode) => ({
      tmdb_id: episode.id,
      number: episode.episode_number,
      name: episode.name?.trim() || `Épisode ${episode.episode_number}`,
      released_at: dateOrNull(episode.air_date),
      synopsis:
        orNull(episode.overview) ??
        orNull(fallbackEpisodes.get(episode.id)?.overview),
      duration: episode.runtime ?? null,
      cast: await fetchEpisodeCast(tvId, seasonNumber, episode),
    })),
  );

  return {
    tmdb_id: detail.id,
    number: detail.season_number,
    name: detail.name?.trim() || `Saison ${detail.season_number}`,
    released_at: dateOrNull(detail.air_date),
    poster: detail.poster_path ?? null,
    synopsis: orNull(detail.overview) ?? orNull(fallback?.overview),
    is_finished: isSeasonFinished(rawEpisodes),
    episodes,
  };
};

/* --- Séries ------------------------------------------------------------ */

const fetchTvDetail = (id: number) =>
  tmdbGet<TvDetail>(`/tv/${id}`, {
    language: LANG,
    append_to_response: "aggregate_credits,content_ratings,watch/providers",
  });

const isAnime = (detail: TvDetail): boolean =>
  (detail.genres ?? []).some((genre) => genre.id === ANIMATION_GENRE_ID) &&
  (detail.origin_country ?? []).includes(ANIME_ORIGIN_COUNTRY);

const fetchTv = async (
  detail: TvDetail,
  anime: boolean,
): Promise<SeedMedia> => {
  let synopsis = orNull(detail.overview);

  if (!synopsis) {
    const fallback = await tmdbGet<TvDetail>(`/tv/${detail.id}`, {
      language: FALLBACK_LANG,
    });

    synopsis = orNull(fallback?.overview);
  }

  const seasonNumbers = (detail.seasons ?? [])
    .map((season) => season.season_number)
    .filter((number) => INCLUDE_SEASON_ZERO || number > 0)
    .sort((a, b) => a - b);

  // En parallèle : le limiteur global de concurrence fait le garde-fou.
  const seasons = (
    await Promise.all(
      seasonNumbers.map((number) => fetchSeason(detail.id, number)),
    )
  ).filter((season): season is SeedSeason => season !== null);

  return {
    tmdb_id: detail.id,
    type: "tv",
    is_anime: anime,
    name: detail.name,
    original_name: orNull(detail.original_name),
    original_language: orNull(detail.original_language),
    released_at: dateOrNull(detail.first_air_date),
    // Volontairement nul : la durée d'une série n'a pas de sens, le calcul
    // du temps de visionnage passe par episode.duration.
    duration: null,
    poster: detail.poster_path ?? null,
    synopsis,
    overall_rating: ratingOrNull(detail.vote_average),
    status: orNull(detail.status),
    pegi: pegiFromTv(detail.content_ratings),
    genres: (detail.genres ?? []).map((genre) => genre.id),
    platforms: collectPlatforms(detail["watch/providers"]),
    cast: toCredits(detail.aggregate_credits?.cast),
    seasons,
  };
};

/**
 * Parcourt les candidats jusqu'à obtenir `count` séries valides.
 * Écarte les séries trop longues et, selon le mode, les animés ou
 * les non-animés.
 */
const collectTvShows = async (
  candidateIds: number[],
  count: number,
  wantAnime: boolean,
): Promise<SeedMedia[]> => {
  // 1. Les fiches des candidats, en parallèle. Une boucle séquentielle
  //    n'utiliserait qu'un seul créneau de concurrence sur les dix.
  const details = await mapWithProgress("Fiches", candidateIds, fetchTvDetail);

  // 2. Filtrage, en conservant l'ordre de popularité de /discover.
  const selected: TvDetail[] = [];
  let skippedTooLong = 0;

  for (const detail of details) {
    if (selected.length >= count) break;
    if (!detail) continue;
    if (isKnownTv(detail.id)) continue;
    if (isAnime(detail) !== wantAnime) continue;

    if ((detail.number_of_episodes ?? 0) > MAX_EPISODES_PER_MEDIA) {
      skippedTooLong += 1;
      continue;
    }

    selected.push(detail);
  }

  if (skippedTooLong > 0) {
    console.info(`  ↷ ${skippedTooLong} série(s) écartée(s) : trop d'épisodes`);
  }

  if (selected.length < count) {
    console.warn(
      `  ⚠ ${selected.length}/${count} seulement — augmentez DISCOVER_PAGE_FACTOR`,
    );
  }

  // 3. Saisons et épisodes, en parallèle également.
  return mapWithProgress("Saisons", selected, (detail) =>
    fetchTv(detail, wantAnime),
  );
};

/* --- Personnes ---------------------------------------------------------- */

const fetchPersons = async (): Promise<SeedPerson[]> => {
  // Les fiches déjà présentes dans le dump ne sont pas retéléchargées.
  const ids = [...personIds].filter((id) => !knownPersons.has(id));

  if (!FETCH_PERSON_DETAILS) {
    return ids.map((id) => ({
      tmdb_id: id,
      name: `#${id}`,
      biography: null,
      photo: null,
    }));
  }

  const persons = await mapWithProgress("Personnes", ids, async (id) => {
    const detail = await tmdbGet<{
      id: number;
      name: string;
      biography?: string;
      profile_path?: string | null;
    }>(`/person/${id}`, { language: LANG });

    if (!detail) return null;

    let biography = orNull(detail.biography);

    if (!biography) {
      const fallback = await tmdbGet<{ biography?: string }>(`/person/${id}`, {
        language: FALLBACK_LANG,
      });

      biography = orNull(fallback?.biography);
    }

    return {
      tmdb_id: detail.id,
      name: detail.name,
      biography,
      photo: detail.profile_path ?? null,
    };
  });

  return persons.filter((person): person is SeedPerson => person !== null);
};

/* ================================================================== *
 * 6. ORCHESTRATION
 * ================================================================== */

/**
 * Nombre de pages /discover à demander pour obtenir `count` médias.
 * 20 résultats par page, multiplié par la marge de candidats.
 * TMDB plafonne la pagination à 500 pages.
 */
const pagesFor = (count: number, alreadyKnown: number) =>
  Math.min(
    500,
    Math.ceil(((count + alreadyKnown) / 20) * DISCOVER_PAGE_FACTOR),
  );

const main = async () => {
  const startedAt = Date.now();

  // Ce qui est déjà en stock, par catégorie : sert à calculer la
  // profondeur de pagination nécessaire pour trouver du nouveau.
  const previous = existing?.medias ?? [];
  const knownCounts = {
    movies: previous.filter((media) => media.type === "movie").length,
    series: previous.filter((media) => media.type === "tv" && !media.is_anime)
      .length,
    animes: previous.filter((media) => media.type === "tv" && media.is_anime)
      .length,
  };

  if (existing) {
    console.info(
      `Dump existant : ${previous.length} média(s), ${existing.persons.length} personne(s)`,
    );
    console.info(
      `On y ajoute ${COUNTS.movies} film(s), ${COUNTS.series} série(s), ${COUNTS.animes} animé(s)\n`,
    );
  }

  console.info("① Genres");
  const genres = await fetchGenres();

  console.info("② Films");
  const movieIds = await discover(
    "/discover/movie",
    { "vote_count.gte": 300 },
    pagesFor(COUNTS.movies, knownCounts.movies),
  );

  const newMovieIds = movieIds
    .filter((id) => !isKnownMovie(id))
    .slice(0, COUNTS.movies);

  if (newMovieIds.length < COUNTS.movies) {
    console.warn(
      `  ⚠ ${newMovieIds.length}/${COUNTS.movies} seulement — augmentez DISCOVER_PAGE_FACTOR`,
    );
  }

  const movies = (
    await mapWithProgress("Films", newMovieIds, fetchMovie)
  ).filter((movie): movie is SeedMedia => movie !== null);

  console.info("③ Séries (animés exclus)");
  const seriesCandidates = await discover(
    "/discover/tv",
    { "vote_count.gte": 100 },
    pagesFor(COUNTS.series, knownCounts.series),
  );
  const series = await collectTvShows(seriesCandidates, COUNTS.series, false);

  console.info("④ Animés");
  const animeCandidates = await discover(
    "/discover/tv",
    {
      with_genres: ANIMATION_GENRE_ID,
      with_origin_country: ANIME_ORIGIN_COUNTRY,
    },
    pagesFor(COUNTS.animes, knownCounts.animes),
  );
  const animes = await collectTvShows(animeCandidates, COUNTS.animes, true);

  console.info(`⑤ Personnes (${personIds.size} référencées)`);
  const persons = await fetchPersons();

  /* --- Fusion avec le dump existant --------------------------------- *
   * Les entrées existantes sont conservées en tête, les nouvelles
   * ajoutées à la suite. Cet ordre garantit que les id auto-incrémentés
   * générés au seed restent identiques d'un run à l'autre : une fiche
   * déjà en base ne change pas d'identifiant quand le catalogue grandit.
   */

  const mergeById = <T extends { tmdb_id: number }>(
    before: T[],
    after: T[],
  ): T[] => {
    const byId = new Map<number, T>();

    for (const item of [...before, ...after]) {
      if (!byId.has(item.tmdb_id)) byId.set(item.tmdb_id, item);
    }

    return [...byId.values()];
  };

  const newMedias = [...movies, ...series, ...animes];

  const allMedias: SeedMedia[] = [...previous];
  const seenMedia = new Set(
    previous.map((media) => mediaKey(media.type, media.tmdb_id)),
  );

  for (const media of newMedias) {
    const key = mediaKey(media.type, media.tmdb_id);

    if (seenMedia.has(key)) continue;

    seenMedia.add(key);
    allMedias.push(media);
  }

  const output: SeedFile = {
    generated_at: new Date().toISOString(),
    genres: mergeById(existing?.genres ?? [], genres),
    platforms: mergeById(existing?.platforms ?? [], [...platforms.values()]),
    persons: mergeById(existing?.persons ?? [], persons),
    medias: allMedias,
  };

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });

  // Pas d'indentation : le fichier n'est pas destiné à être lu à l'œil,
  // et gzip travaille sur du contenu plus compact.
  const raw = Buffer.from(JSON.stringify(output), "utf8");
  const compressed = zlib.gzipSync(raw, { level: 9 });

  fs.writeFileSync(OUTPUT_FILE, compressed);

  const mb = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} Mo`;

  const seasonCount = output.medias.reduce(
    (total, media) => total + media.seasons.length,
    0,
  );

  const episodeCount = output.medias.reduce(
    (total, media) =>
      total +
      media.seasons.reduce((sum, season) => sum + season.episodes.length, 0),
    0,
  );

  console.info(`
✔ Terminé en ${Math.round((Date.now() - startedAt) / 1000)}s
  Requêtes API : ${requestCount}
  Ajoutés      : ${newMedias.length} média(s), ${persons.length} personne(s)
  ─────────────
  Médias       : ${output.medias.length}
  Saisons      : ${seasonCount}
  Épisodes     : ${episodeCount}
  Personnes    : ${output.persons.length}
  Plateformes  : ${output.platforms.length}
  Poids        : ${mb(compressed.length)} compressé (${mb(raw.length)} brut)
  Fichier      : ${OUTPUT_FILE}
`);
};

main().catch((error) => {
  console.error("Échec du script :", error);
  process.exit(1);
});
