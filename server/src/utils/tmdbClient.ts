const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const LANG = "fr-FR";
const FALLBACK_LANG = "en-US";
const REGION = "FR";

const ANIMATION_GENRE_ID = 16;
const ANIME_ORIGIN_COUNTRY = "JP";

const CAST_LIMIT = 15;

type Pegi = "TP" | "10" | "12" | "16" | "18";

export type TmdbGenre = { id: number; name: string };
type TmdbCastMember = {
  id: number;
  name: string;
  known_for_department?: string;
  profile_path?: string | null;
  character?: string;
  roles?: { character?: string }[];
};
type TmdbReleaseDates = {
  results?: {
    iso_3166_1: string;
    release_dates?: { certification?: string }[];
  }[];
};
type TmdbContentRatings = {
  results?: { iso_3166_1: string; rating?: string }[];
};

export type TmdbMovieDetail = {
  id: number;
  title: string;
  original_title?: string;
  original_language?: string;
  release_date?: string | null;
  runtime?: number | null;
  poster_path?: string | null;
  overview?: string;
  vote_average?: number;
  status?: string;
  genres?: TmdbGenre[];
  credits?: { cast?: TmdbCastMember[] };
  release_dates?: TmdbReleaseDates;
};

export type TmdbTvDetail = {
  id: number;
  name: string;
  original_name?: string;
  original_language?: string;
  first_air_date?: string | null;
  poster_path?: string | null;
  overview?: string;
  vote_average?: number;
  status?: string;
  genres?: TmdbGenre[];
  origin_country?: string[];
  seasons?: { season_number: number }[];
  aggregate_credits?: { cast?: TmdbCastMember[] };
  content_ratings?: TmdbContentRatings;
};

export type TmdbEpisode = {
  id: number;
  episode_number: number;
  name?: string;
  air_date?: string | null;
  overview?: string;
  runtime?: number | null;
};

export type TmdbSeasonDetail = {
  id: number;
  season_number: number;
  name?: string;
  air_date?: string | null;
  poster_path?: string | null;
  overview?: string;
  episodes?: TmdbEpisode[];
};

export type TmdbSearchMovie = {
  id: number;
  title: string;
  poster_path?: string | null;
  release_date?: string | null;
  genre_ids?: number[];
  adult?: boolean;
};

export type TmdbSearchTv = {
  id: number;
  name: string;
  poster_path?: string | null;
  first_air_date?: string | null;
  genre_ids?: number[];
  origin_country?: string[];
};

export type Credit = {
  personTmdbId: number;
  name: string;
  photo: string | null;
  characterName: string | null;
};

async function tmdbGet<T>(
  endpoint: string,
  params: Record<string, string | number | undefined> = {},
): Promise<T | null> {
  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    throw new Error("TMDB_API_KEY absente du .env");
  }

  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  }

  url.searchParams.set("api_key", apiKey);

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} sur ${endpoint}`);
  }

  return (await response.json()) as T;
}

function orNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function ratingOrNull(value: number | undefined): number | null {
  return value && value > 0 ? Math.round(value * 10) / 10 : null;
}

function dateOrNull(value: string | null | undefined): string | null {
  return value && value.trim() !== "" ? value : null;
}

function normalizeFrench(raw: string): Pegi | null {
  const value = raw.trim().toLowerCase();

  if (!value) return null;
  if (value.includes("18")) return "18";
  if (value.includes("16")) return "16";
  if (value.includes("12")) return "12";
  if (value.includes("10")) return "10";
  if (value.includes("tous publics") || value === "u") return "TP";

  return null;
}

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

function normalizeUs(raw: string): Pegi | null {
  return US_MAP[raw.trim().toUpperCase()] ?? null;
}

function firstMovieCertification(
  data: TmdbReleaseDates,
  country: string,
): string | null {
  const entry = data.results?.find((item) => item.iso_3166_1 === country);

  return (
    entry?.release_dates?.find(
      (item) => item.certification && item.certification.trim() !== "",
    )?.certification ?? null
  );
}

export function pegiFromMovie(data: TmdbReleaseDates | undefined): Pegi | null {
  if (!data) return null;

  const french = firstMovieCertification(data, REGION);

  if (french) {
    const normalized = normalizeFrench(french);
    if (normalized) return normalized;
  }

  const us = firstMovieCertification(data, "US");
  return us ? normalizeUs(us) : null;
}

export function pegiFromTv(data: TmdbContentRatings | undefined): Pegi | null {
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
}

export function detectIsAnime(
  genreIds: number[],
  originCountry: string[],
): boolean {
  return (
    genreIds.includes(ANIMATION_GENRE_ID) &&
    originCountry.includes(ANIME_ORIGIN_COUNTRY)
  );
}

function toCredits(cast: TmdbCastMember[] | undefined): Credit[] {
  if (!cast) return [];

  const actors = cast.filter(
    (member) => member.known_for_department === "Acting",
  );

  return actors.slice(0, CAST_LIMIT).map((member) => ({
    personTmdbId: member.id,
    name: member.name,
    photo: member.profile_path ?? null,
    characterName: orNull(member.roles?.[0]?.character ?? member.character),
  }));
}

export type ImportedMovie = {
  tmdbId: number;
  name: string;
  originalName: string | null;
  originalLanguage: string | null;
  releasedAt: string | null;
  duration: number | null;
  poster: string | null;
  synopsis: string | null;
  overallRating: number | null;
  status: string | null;
  pegi: Pegi | null;
  isAnime: boolean;
  genres: TmdbGenre[];
  cast: Credit[];
};

export type ImportedEpisode = {
  tmdbId: number;
  number: number;
  name: string;
  releasedAt: string | null;
  synopsis: string | null;
  duration: number | null;
};

export type ImportedSeason = {
  tmdbId: number;
  number: number;
  name: string;
  releasedAt: string | null;
  poster: string | null;
  synopsis: string | null;
  isFinished: boolean;
  episodes: ImportedEpisode[];
};

export type ImportedSeries = ImportedMovie & {
  seasons: ImportedSeason[];
};

export async function fetchMovieForImport(
  tmdbId: number,
): Promise<ImportedMovie | null> {
  const detail = await tmdbGet<TmdbMovieDetail>(`/movie/${tmdbId}`, {
    language: LANG,
    append_to_response: "credits,release_dates",
  });

  if (!detail) return null;

  let synopsis = orNull(detail.overview);

  if (!synopsis) {
    const fallback = await tmdbGet<TmdbMovieDetail>(`/movie/${tmdbId}`, {
      language: FALLBACK_LANG,
    });
    synopsis = orNull(fallback?.overview);
  }

  return {
    tmdbId: detail.id,
    name: detail.title,
    originalName: orNull(detail.original_title),
    originalLanguage: orNull(detail.original_language),
    releasedAt: dateOrNull(detail.release_date),
    duration: detail.runtime ?? null,
    poster: detail.poster_path ?? null,
    synopsis,
    overallRating: ratingOrNull(detail.vote_average),
    status: orNull(detail.status ?? null),
    pegi: pegiFromMovie(detail.release_dates),
    isAnime: false,
    genres: detail.genres ?? [],
    cast: toCredits(detail.credits?.cast),
  };
}

async function fetchSeasonForImport(
  tvId: number,
  seasonNumber: number,
): Promise<ImportedSeason | null> {
  const detail = await tmdbGet<TmdbSeasonDetail>(
    `/tv/${tvId}/season/${seasonNumber}`,
    { language: LANG },
  );

  if (!detail) return null;

  const needsFallback =
    !orNull(detail.overview) ||
    (detail.episodes ?? []).some((episode) => !orNull(episode.overview));

  const fallback = needsFallback
    ? await tmdbGet<TmdbSeasonDetail>(`/tv/${tvId}/season/${seasonNumber}`, {
        language: FALLBACK_LANG,
      })
    : null;

  const fallbackEpisodes = new Map(
    (fallback?.episodes ?? []).map((episode) => [episode.id, episode]),
  );

  const episodes: ImportedEpisode[] = (detail.episodes ?? []).map(
    (episode) => ({
      tmdbId: episode.id,
      number: episode.episode_number,
      name: episode.name?.trim() || `Épisode ${episode.episode_number}`,
      releasedAt: dateOrNull(episode.air_date),
      synopsis:
        orNull(episode.overview) ??
        orNull(fallbackEpisodes.get(episode.id)?.overview),
      duration: episode.runtime ?? null,
    }),
  );

  const today = new Date();
  const isAired = (date: string | null) =>
    date != null && new Date(date) <= today;
  const lastEpisode = episodes[episodes.length - 1];

  return {
    tmdbId: detail.id,
    number: detail.season_number,
    name: detail.name?.trim() || `Saison ${detail.season_number}`,
    releasedAt: dateOrNull(detail.air_date),
    poster: detail.poster_path ?? null,
    synopsis: orNull(detail.overview) ?? orNull(fallback?.overview),
    isFinished: lastEpisode != null && isAired(lastEpisode.releasedAt),
    episodes,
  };
}

export async function fetchSeriesForImport(
  tmdbId: number,
): Promise<ImportedSeries | null> {
  const detail = await tmdbGet<TmdbTvDetail>(`/tv/${tmdbId}`, {
    language: LANG,
    append_to_response: "aggregate_credits,content_ratings",
  });

  if (!detail) return null;

  let synopsis = orNull(detail.overview);

  if (!synopsis) {
    const fallback = await tmdbGet<TmdbTvDetail>(`/tv/${tmdbId}`, {
      language: FALLBACK_LANG,
    });
    synopsis = orNull(fallback?.overview);
  }

  const seasonNumbers = (detail.seasons ?? [])
    .map((season) => season.season_number)
    .filter((number) => number > 0)
    .sort((a, b) => a - b);

  const seasons: ImportedSeason[] = [];

  for (const number of seasonNumbers) {
    const season = await fetchSeasonForImport(detail.id, number);
    if (season) seasons.push(season);
  }

  const genres = detail.genres ?? [];
  const isAnime = detectIsAnime(
    genres.map((genre) => genre.id),
    detail.origin_country ?? [],
  );

  return {
    tmdbId: detail.id,
    name: detail.name,
    originalName: orNull(detail.original_name),
    originalLanguage: orNull(detail.original_language),
    releasedAt: dateOrNull(detail.first_air_date),
    duration: null,
    poster: detail.poster_path ?? null,
    synopsis,
    overallRating: ratingOrNull(detail.vote_average),
    status: orNull(detail.status ?? null),
    pegi: pegiFromTv(detail.content_ratings),
    isAnime,
    genres,
    cast: toCredits(detail.aggregate_credits?.cast),
    seasons,
  };
}

export async function searchMovies(query: string): Promise<TmdbSearchMovie[]> {
  const result = await tmdbGet<{ results?: TmdbSearchMovie[] }>(
    "/search/movie",
    { query, language: LANG, region: REGION },
  );
  return result?.results ?? [];
}

export async function searchTvShows(query: string): Promise<TmdbSearchTv[]> {
  const result = await tmdbGet<{ results?: TmdbSearchTv[] }>("/search/tv", {
    query,
    language: LANG,
  });
  return result?.results ?? [];
}
