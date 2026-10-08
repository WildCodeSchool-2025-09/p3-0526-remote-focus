/**
 * Médias à PARAÎTRE, pour le calendrier des sorties.
 *
 * Produit un fichier séparé, server/database/seeds/tmdb-upcoming.json.gz.
 * Ni tmdb.json.gz ni tmdb-cast.json.gz ne sont modifiés.
 *
 * Deux sources complémentaires :
 *   1. les nouveautés — films, séries et animés dont la sortie tombe
 *      dans la fenêtre ;
 *   2. les suites — nouvelles saisons et épisodes à venir des séries
 *      DÉJÀ présentes dans le dump principal.
 *
 * Le fichier s'applique ensuite via tmdbUpSeed.ts :
 *
 *   npm run tmdb:seed      → le catalogue
 *   npm run tmdbAct:seed   → le casting complet (optionnel)
 *   npm run tmdbUp:seed    → les sorties à venir
 *
 * Usage : npm run tmdb:fetch:upcoming
 */

import "dotenv/config";

import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

/* ================================================================== *
 * 1. CONFIGURATION
 * ================================================================== */

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

const LANG = "fr-FR";
const FALLBACK_LANG = "en-US";
const REGION = "FR";

/** Fenêtre du calendrier, bornes incluses (format AAAA-MM-JJ). */
const WINDOW_FROM = "2026-10-15";
const WINDOW_TO = "2027-10-15";

/** Nombre de nouveautés visées, par catégorie. */
const COUNTS = {
  movies: 40,
  series: 30,
  animes: 30,
};

/** Marge de candidats demandés à /discover. */
const DISCOVER_PAGE_FACTOR = 3;

/**
 * Dates de sortie françaises plutôt que mondiales.
 *
 * false (défaut) : filtre sur la date de sortie mondiale. Meilleure
 *   couverture — beaucoup de films lointains n'ont pas encore de date FR.
 * true : filtre sur la date de sortie en France. Plus juste pour un
 *   public français, mais le calendrier sera plus clairsemé.
 */
const USE_FR_RELEASE_DATES = true;

/**
 * Récupérer aussi les saisons et épisodes à venir des séries déjà
 * présentes dans le dump principal.
 */
const INCLUDE_EXISTING_SERIES = true;

/** Nombre de saisons récentes inspectées par série existante. */
const SEASONS_TO_CHECK = 2;

/** Acteurs par média. Infinity = tout le casting. */
const CAST_LIMIT = 20;

/** Télécharger la biographie des acteurs découverts. */
const FETCH_PERSON_DETAILS = true;

/** ID du genre "Animation" chez TMDB (ce n'est PAS un âge). */
const ANIMATION_GENRE_ID = 16;
const ANIME_ORIGIN_COUNTRY = "JP";

/** La saison 0 regroupe les "spéciaux", souvent mal renseignés. */
const INCLUDE_SEASON_ZERO = false;

/** Sections de /watch/providers retenues ("buy" et "rent" exclus). */
const PROVIDER_SECTIONS = ["flatrate", "free", "ads"] as const;

/** Débit visé, en requêtes par seconde (TMDB tolère ~40). */
const RATE_LIMIT = 32;
const CONCURRENCY = 40;
const MAX_RETRIES = 4;

const DUMP_FILE = path.join(__dirname, "../database/seeds/tmdb.json.gz");
const OUTPUT_FILE = path.join(
  __dirname,
  "../database/seeds/tmdb-upcoming.json.gz",
);

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

/** Le fichier produit par ce script. */
type UpcomingFile = {
  generated_at: string;
  window: { from: string; to: string };
  genres: SeedGenre[];
  platforms: SeedPlatform[];
  persons: SeedPerson[];
  /** Nouveautés : films, séries et animés qui sortent dans la fenêtre. */
  medias: SeedMedia[];
  /** Suites : saisons et épisodes à venir de séries déjà en base. */
  series_updates: {
    media_tmdb_id: number;
    media_name: string;
    seasons: SeedSeason[];
  }[];
};

/* --- Types TMDB (partiels) ------------------------------------------ */

type CastMember = {
  id: number;
  name: string;
  character?: string;
  known_for_department?: string;
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
  genres?: { id: number }[];
  origin_country?: string[];
  seasons?: { season_number: number; air_date?: string | null }[];
  next_episode_to_air?: { air_date?: string | null } | null;
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

/** Le dump principal, lu en seule lecture. */
type MainDump = {
  medias: { tmdb_id: number; type: "movie" | "tv"; is_anime: boolean }[];
  persons: { tmdb_id: number }[];
};

/* ================================================================== *
 * 3. CLIENT HTTP
 * ================================================================== */

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/* --- Régulateur de débit -------------------------------------------- *
 * Chaque requête réserve un créneau de départ, espacé de
 * 1000/RATE_LIMIT ms. Le débit reste plafonné quelle que soit la
 * latence du réseau.
 */

const MIN_INTERVAL = 1000 / RATE_LIMIT;
let nextSlot = 0;

const reserveSlot = async () => {
  const now = Date.now();
  const slot = Math.max(now, nextSlot);

  nextSlot = slot + MIN_INTERVAL;

  const delay = slot - now;

  if (delay > 0) await sleep(delay);
};

/** Sur un 429, on repousse le prochain créneau pour tout le monde. */
const backOffEveryone = (seconds: number) => {
  nextSlot = Math.max(nextSlot, Date.now() + seconds * 1000);
};

/* --- Limiteur de concurrence ---------------------------------------- */

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

/* --- Requête ---------------------------------------------------------- *
 * Pas de cache disque ici : un calendrier de sorties doit refléter des
 * dates à jour, et les dates de diffusion changent souvent.
 */

let requestCount = 0;
let rateLimitHits = 0;

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

  url.searchParams.set("api_key", apiKey);

  await acquire();

  try {
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
      try {
        await reserveSlot();

        requestCount += 1;

        const response = await fetch(url, {
          headers: { Accept: "application/json" },
        });

        if (response.status === 404) return null;

        if (response.status === 429) {
          rateLimitHits += 1;

          const retryAfter = Number(response.headers.get("retry-after") ?? 1);

          backOffEveryone(retryAfter + 1);
          continue;
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status} sur ${endpoint}`);
        }

        return (await response.json()) as T;
      } catch (error) {
        if (attempt === MAX_RETRIES) {
          console.error(`✖ Échec définitif : ${endpoint}`, error);
          return null;
        }

        await sleep(500 * 2 ** attempt);
      }
    }

    return null;
  } finally {
    release();
  }
};

const mapWithProgress = async <T, R>(
  label: string,
  items: T[],
  handler: (item: T, index: number) => Promise<R>,
): Promise<R[]> => {
  let done = 0;
  const step = items.length > 500 ? 100 : 25;

  return Promise.all(
    items.map(async (item, index) => {
      const result = await handler(item, index);

      done += 1;

      if (done % step === 0 || done === items.length) {
        console.info(`  ${label} : ${done}/${items.length}`);
      }

      return result;
    }),
  );
};

/* ================================================================== *
 * 4. RÈGLES DE MAPPING
 * ================================================================== */

type Pegi = "TP" | "10" | "12" | "16" | "18";

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

/** La plupart des titres à venir n'ont pas encore de certification. */
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

const isSeasonFinished = (episodes: TvEpisode[]): boolean => {
  if (episodes.length === 0) return false;

  const today = new Date();
  const isAired = (date?: string | null) =>
    Boolean(date) && new Date(date as string) <= today;

  const finale = episodes.find((episode) => episode.episode_type === "finale");

  if (finale) return isAired(finale.air_date);

  return isAired(episodes[episodes.length - 1]?.air_date);
};

const orNull = (value: string | null | undefined): string | null => {
  const trimmed = value?.trim();

  return trimmed ? trimmed : null;
};

const ratingOrNull = (value: number | undefined): number | null =>
  value && value > 0 ? Math.round(value * 10) / 10 : null;

const dateOrNull = (value: string | null | undefined): string | null =>
  value && value.trim() !== "" ? value : null;

/**
 * La date tombe-t-elle dans la fenêtre du calendrier ?
 * Les dates TMDB sont au format AAAA-MM-JJ : la comparaison de chaînes
 * suffit et évite de créer un objet Date par épisode.
 */
const inWindow = (date: string | null | undefined): boolean =>
  Boolean(date) &&
  (date as string) >= WINDOW_FROM &&
  (date as string) <= WINDOW_TO;

/* ================================================================== *
 * 5. RÉCUPÉRATION
 * ================================================================== */

const platforms = new Map<number, SeedPlatform>();
const personIds = new Set<number>();

const toCredits = (cast: CastMember[] | undefined): SeedCredit[] => {
  if (!cast) return [];

  const actors = cast.filter(
    (member) => member.known_for_department === "Acting",
  );

  const limited = Number.isFinite(CAST_LIMIT)
    ? actors.slice(0, CAST_LIMIT)
    : actors;

  const seen = new Set<number>();
  const credits: SeedCredit[] = [];

  for (const member of limited) {
    if (seen.has(member.id)) continue;

    seen.add(member.id);
    personIds.add(member.id);

    credits.push({
      person_tmdb_id: member.id,
      personnage_name: orNull(member.roles?.[0]?.character ?? member.character),
      role: "actor",
    });
  }

  return credits;
};

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
          url: null,
        });
      }
    }
  }

  return [...ids];
};

/* --- Genres ----------------------------------------------------------- */

const fetchGenres = async (): Promise<SeedGenre[]> => {
  type GenreList = { genres?: { id: number; name: string }[] };

  const [movie, tv] = await Promise.all([
    tmdbGet<GenreList>("/genre/movie/list", { language: LANG }),
    tmdbGet<GenreList>("/genre/tv/list", { language: LANG }),
  ]);

  const byId = new Map<number, SeedGenre>();

  for (const genre of [...(movie?.genres ?? []), ...(tv?.genres ?? [])]) {
    byId.set(genre.id, { tmdb_id: genre.id, name: genre.name });
  }

  return [...byId.values()];
};

/* --- Découverte ------------------------------------------------------- */

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

const pagesFor = (count: number) =>
  Math.min(500, Math.ceil((count / 20) * DISCOVER_PAGE_FACTOR));

/* --- Films ------------------------------------------------------------ */

const fetchMovie = async (id: number): Promise<SeedMedia | null> => {
  const detail = await tmdbGet<MovieDetail>(`/movie/${id}`, {
    language: LANG,
    append_to_response: "credits,release_dates,watch/providers",
  });

  if (!detail) return null;

  // Garde-fou : /discover filtre déjà sur la fenêtre, mais la date du
  // détail peut différer de celle de l'index.
  if (!inWindow(detail.release_date)) return null;

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

/* --- Saisons ----------------------------------------------------------- */

/**
 * Récupère une saison. `onlyUpcoming` ne garde que les épisodes dont la
 * diffusion tombe dans la fenêtre — utile pour une série déjà en base,
 * dont les épisodes passés sont déjà enregistrés.
 */
const fetchSeason = async (
  tvId: number,
  seasonNumber: number,
  onlyUpcoming: boolean,
): Promise<SeedSeason | null> => {
  const detail = await tmdbGet<SeasonDetail>(
    `/tv/${tvId}/season/${seasonNumber}`,
    { language: LANG },
  );

  if (!detail) return null;

  const rawEpisodes = detail.episodes ?? [];

  const kept = onlyUpcoming
    ? rawEpisodes.filter((episode) => inWindow(episode.air_date))
    : rawEpisodes;

  if (kept.length === 0) return null;

  const episodes: SeedEpisode[] = kept.map((episode) => ({
    tmdb_id: episode.id,
    number: episode.episode_number,
    name: episode.name?.trim() || `Épisode ${episode.episode_number}`,
    released_at: dateOrNull(episode.air_date),
    synopsis: orNull(episode.overview),
    duration: episode.runtime ?? null,
  }));

  return {
    tmdb_id: detail.id,
    number: detail.season_number,
    name: detail.name?.trim() || `Saison ${detail.season_number}`,
    released_at: dateOrNull(detail.air_date),
    poster: detail.poster_path ?? null,
    synopsis: orNull(detail.overview),
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

/** Une série entièrement nouvelle : on prend toutes ses saisons. */
const fetchNewTv = async (detail: TvDetail): Promise<SeedMedia> => {
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

  const seasons = (
    await Promise.all(
      seasonNumbers.map((number) => fetchSeason(detail.id, number, false)),
    )
  ).filter((season): season is SeedSeason => season !== null);

  return {
    tmdb_id: detail.id,
    type: "tv",
    is_anime: isAnime(detail),
    name: detail.name,
    original_name: orNull(detail.original_name),
    original_language: orNull(detail.original_language),
    released_at: dateOrNull(detail.first_air_date),
    // Volontairement nul pour les séries : le temps de visionnage se
    // calcule depuis episode.duration.
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
 * Sélectionne `count` séries parmi les candidats, en séparant animés et
 * séries classiques pour éviter les doublons entre les deux listes.
 */
const collectNewTvShows = async (
  candidateIds: number[],
  count: number,
  wantAnime: boolean,
): Promise<SeedMedia[]> => {
  const details = await mapWithProgress("Fiches", candidateIds, fetchTvDetail);

  const selected: TvDetail[] = [];

  for (const detail of details) {
    if (selected.length >= count) break;
    if (!detail) continue;
    if (isAnime(detail) !== wantAnime) continue;
    if (!inWindow(detail.first_air_date)) continue;

    selected.push(detail);
  }

  if (selected.length < count) {
    console.warn(
      `  ⚠ ${selected.length}/${count} seulement — élargissez la fenêtre ou augmentez DISCOVER_PAGE_FACTOR`,
    );
  }

  return mapWithProgress("Saisons", selected, fetchNewTv);
};

/* --- Suites des séries déjà en base ------------------------------------ */

/** Une série terminée et sans prochain épisode n'a rien à annoncer. */
const mayHaveUpcoming = (detail: TvDetail): boolean => {
  if (detail.next_episode_to_air?.air_date) return true;

  const status = (detail.status ?? "").toLowerCase();

  if (status === "ended" || status === "canceled") return false;

  // Statut ambigu : on vérifie quand même les saisons récentes.
  return true;
};

const fetchSeriesUpdate = async (
  tmdbId: number,
): Promise<UpcomingFile["series_updates"][number] | null> => {
  const detail = await fetchTvDetail(tmdbId);

  if (!detail || !mayHaveUpcoming(detail)) return null;

  // On n'inspecte que les dernières saisons : les anciennes sont
  // diffusées depuis longtemps.
  const seasonNumbers = (detail.seasons ?? [])
    .map((season) => season.season_number)
    .filter((number) => INCLUDE_SEASON_ZERO || number > 0)
    .sort((a, b) => b - a)
    .slice(0, SEASONS_TO_CHECK);

  const seasons = (
    await Promise.all(
      seasonNumbers.map((number) => fetchSeason(detail.id, number, true)),
    )
  ).filter((season): season is SeedSeason => season !== null);

  if (seasons.length === 0) return null;

  return {
    media_tmdb_id: detail.id,
    media_name: detail.name,
    seasons: seasons.sort((a, b) => a.number - b.number),
  };
};

/* --- Personnes ---------------------------------------------------------- */

const fetchPersons = async (known: Set<number>): Promise<SeedPerson[]> => {
  const ids = [...personIds].filter((id) => !known.has(id));

  if (ids.length === 0) return [];

  if (!FETCH_PERSON_DETAILS) {
    return ids.map((id) => ({
      tmdb_id: id,
      name: `#${id}`,
      biography: null,
      photo: null,
    }));
  }

  const persons = await mapWithProgress("Acteurs", ids, async (id) => {
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

const readGzip = <T>(file: string): T =>
  JSON.parse(zlib.gunzipSync(fs.readFileSync(file)).toString("utf8"));

const main = async () => {
  const startedAt = Date.now();

  /* --- Dump principal, en lecture seule ------------------------------ */

  const dump: MainDump | null = fs.existsSync(DUMP_FILE)
    ? readGzip<MainDump>(DUMP_FILE)
    : null;

  if (!dump) {
    console.warn(
      `⚠ Dump principal introuvable (${DUMP_FILE}).\n` +
        "  Les nouveautés seront récupérées, mais sans suites de séries\n" +
        "  ni déduplication avec le catalogue existant.\n",
    );
  }

  const knownMedia = new Set(
    (dump?.medias ?? []).map((media) => `${media.type}:${media.tmdb_id}`),
  );
  const knownPersons = new Set(
    (dump?.persons ?? []).map((person) => person.tmdb_id),
  );

  console.info(`Fenêtre : ${WINDOW_FROM} → ${WINDOW_TO}`);
  console.info(
    `Dates de sortie : ${USE_FR_RELEASE_DATES ? "françaises" : "mondiales"}`,
  );
  console.info(`Catalogue existant : ${knownMedia.size} média(s)\n`);

  /* --- Genres --------------------------------------------------------- */

  console.info("① Genres");
  const genres = await fetchGenres();

  /* --- Films à venir --------------------------------------------------- */

  console.info("② Films à venir");

  // Les films lointains n'ont ni note ni vote : aucun filtre de
  // popularité minimale, sous peine de liste vide.
  const movieDateParams: Record<string, string | number | boolean> =
    USE_FR_RELEASE_DATES
      ? {
          "release_date.gte": WINDOW_FROM,
          "release_date.lte": WINDOW_TO,
          region: REGION,
          with_release_type: "2|3",
        }
      : {
          "primary_release_date.gte": WINDOW_FROM,
          "primary_release_date.lte": WINDOW_TO,
        };

  const movieIds = await discover(
    "/discover/movie",
    movieDateParams,
    pagesFor(COUNTS.movies),
  );

  const newMovieIds = movieIds
    .filter((id) => !knownMedia.has(`movie:${id}`))
    .slice(0, COUNTS.movies);

  const movies = (
    await mapWithProgress("Films", newMovieIds, fetchMovie)
  ).filter((movie): movie is SeedMedia => movie !== null);

  /* --- Séries et animés à venir ----------------------------------------- */

  const tvDateParams = {
    "first_air_date.gte": WINDOW_FROM,
    "first_air_date.lte": WINDOW_TO,
  };

  console.info("③ Nouvelles séries (animés exclus)");

  const seriesCandidates = (
    await discover("/discover/tv", tvDateParams, pagesFor(COUNTS.series))
  ).filter((id) => !knownMedia.has(`tv:${id}`));

  const series = await collectNewTvShows(
    seriesCandidates,
    COUNTS.series,
    false,
  );

  console.info("④ Nouveaux animés");

  const animeCandidates = (
    await discover(
      "/discover/tv",
      {
        ...tvDateParams,
        with_genres: ANIMATION_GENRE_ID,
        with_origin_country: ANIME_ORIGIN_COUNTRY,
      },
      pagesFor(COUNTS.animes),
    )
  ).filter((id) => !knownMedia.has(`tv:${id}`));

  const animes = await collectNewTvShows(animeCandidates, COUNTS.animes, true);

  /* --- Suites des séries déjà en base ------------------------------------ */

  let seriesUpdates: UpcomingFile["series_updates"] = [];

  if (INCLUDE_EXISTING_SERIES && dump) {
    const existingTvIds = dump.medias
      .filter((media) => media.type === "tv")
      .map((media) => media.tmdb_id);

    console.info(
      `⑤ Suites des séries en base (${existingTvIds.length} à vérifier)`,
    );

    seriesUpdates = (
      await mapWithProgress("Séries", existingTvIds, fetchSeriesUpdate)
    ).filter(
      (update): update is UpcomingFile["series_updates"][number] =>
        update !== null,
    );

    for (const update of seriesUpdates) {
      const count = update.seasons.reduce(
        (total, season) => total + season.episodes.length,
        0,
      );

      console.info(`  → ${update.media_name} : ${count} épisode(s) à venir`);
    }
  }

  /* --- Acteurs ------------------------------------------------------------ */

  console.info(`⑥ Acteurs (${personIds.size} référencés)`);
  const persons = await fetchPersons(knownPersons);

  /* --- Écriture ----------------------------------------------------------- */

  const output: UpcomingFile = {
    generated_at: new Date().toISOString(),
    window: { from: WINDOW_FROM, to: WINDOW_TO },
    genres,
    platforms: [...platforms.values()],
    persons,
    medias: [...movies, ...series, ...animes],
    series_updates: seriesUpdates,
  };

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });

  const raw = Buffer.from(JSON.stringify(output), "utf8");
  const compressed = zlib.gzipSync(raw, { level: 9 });

  fs.writeFileSync(OUTPUT_FILE, compressed);

  /* --- Récapitulatif -------------------------------------------------------- */

  const mb = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} Mo`;

  const newEpisodes = output.medias.reduce(
    (total, media) =>
      total +
      media.seasons.reduce((sum, season) => sum + season.episodes.length, 0),
    0,
  );

  const updateEpisodes = seriesUpdates.reduce(
    (total, update) =>
      total +
      update.seasons.reduce((sum, season) => sum + season.episodes.length, 0),
    0,
  );

  // Aperçu du calendrier : les dix prochaines dates, toutes sources
  // confondues.
  const agenda: { date: string; label: string }[] = [];

  for (const media of output.medias) {
    if (media.released_at) {
      agenda.push({
        date: media.released_at,
        label: `${media.name} (${media.type === "movie" ? "film" : media.is_anime ? "animé" : "série"})`,
      });
    }
  }

  for (const update of seriesUpdates) {
    for (const season of update.seasons) {
      for (const episode of season.episodes) {
        if (episode.released_at) {
          agenda.push({
            date: episode.released_at,
            label: `${update.media_name} S${season.number}E${episode.number}`,
          });
        }
      }
    }
  }

  agenda.sort((a, b) => a.date.localeCompare(b.date));

  console.info(`
✔ Terminé en ${Math.round((Date.now() - startedAt) / 1000)}s
  Requêtes API : ${requestCount}${rateLimitHits > 0 ? ` (${rateLimitHits} ralentissement(s) 429)` : ""}
  ─────────────
  Nouveautés   : ${output.medias.length} (${movies.length} films, ${series.length} séries, ${animes.length} animés)
  dont épisodes: ${newEpisodes}
  Suites       : ${seriesUpdates.length} série(s), ${updateEpisodes} épisode(s)
  Acteurs      : ${persons.length}
  Poids        : ${mb(compressed.length)} compressé (${mb(raw.length)} brut)
  Fichier      : ${OUTPUT_FILE}

  Prochaines sorties :`);

  for (const entry of agenda.slice(0, 10)) {
    console.info(`    ${entry.date}  ${entry.label}`);
  }

  console.info(`
  Pour l'appliquer : npm run tmdbUp:seed
`);
};

main().catch((error) => {
  console.error("Échec du script :", error);
  process.exit(1);
});
