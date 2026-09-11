import {
  detectIsAnime,
  searchMovies,
  searchTvShows,
} from "../../utils/tmdbClient";
import type { SortBy, SortOrder } from "./searchRepository";
import {
  countMediaByTitle,
  findAllLocalTmdbIds,
  findMediaByTitle,
  findPersonByName,
} from "./searchRepository";

interface MediaDto {
  id: number | null;
  tmdbId: number;
  name: string;
  poster: string | null;
  releasedAt: Date | string | null;
  type: "movie" | "tv";
  pegi: string | null;
  overallRating: number | string | null;
  imported: boolean;
}

interface PersonDto {
  id: number;
  name: string;
  photo: string | null;
}

export interface SearchResult {
  films: MediaDto[];
  series: MediaDto[];
  animes: MediaDto[];
  actors: PersonDto[];
  hasMore: boolean;
}

async function findTmdbOnlyResults(
  q: string,
  type: string | undefined,
  hidePegi16: boolean,
): Promise<{ films: MediaDto[]; series: MediaDto[]; animes: MediaDto[] }> {
  const wantsMovies =
    type === undefined || type === "movie" || type === "anime";
  const wantsTv = type === undefined || type === "tv" || type === "anime";

  const [movieResults, tvResults, localTmdbIds] = await Promise.all([
    wantsMovies ? searchMovies(q) : Promise.resolve([]),
    wantsTv ? searchTvShows(q) : Promise.resolve([]),
    findAllLocalTmdbIds(),
  ]);

  const localMovieIds = new Set(
    localTmdbIds
      .filter((row) => row.type === "movie")
      .map((row) => row.tmdb_id),
  );
  const localTvIds = new Set(
    localTmdbIds.filter((row) => row.type === "tv").map((row) => row.tmdb_id),
  );

  const films: MediaDto[] = [];
  const series: MediaDto[] = [];
  const animes: MediaDto[] = [];

  for (const movie of movieResults) {
    if (localMovieIds.has(movie.id)) continue;
    // Pas de origin_country sur /search/movie : on ne peut pas confirmer
    // le critère JP, donc les films TMDB non importés vont toujours dans
    // "films", jamais dans "animes" (limite documentée dans decisions-log).
    if (hidePegi16 && movie.adult) continue;

    films.push({
      id: null,
      tmdbId: movie.id,
      name: movie.title,
      poster: movie.poster_path ?? null,
      releasedAt: movie.release_date ?? null,
      type: "movie",
      pegi: null,
      overallRating: null,
      imported: false,
    });
  }

  for (const tv of tvResults) {
    if (localTvIds.has(tv.id)) continue;
    if (type === "movie") continue;

    const dto: MediaDto = {
      id: null,
      tmdbId: tv.id,
      name: tv.name,
      poster: tv.poster_path ?? null,
      releasedAt: tv.first_air_date ?? null,
      type: "tv",
      pegi: null,
      overallRating: null,
      imported: false,
    };

    const isAnime = detectIsAnime(tv.genre_ids ?? [], tv.origin_country ?? []);

    if (isAnime) {
      if (type === "tv") continue;
      animes.push(dto);
    } else {
      if (type === "anime") continue;
      series.push(dto);
    }
  }

  return { films, series, animes };
}

export async function browseResults(
  q: string,
  type: string | undefined,
  hidePegi16: boolean,
  sortBy: SortBy,
  sortOrder: SortOrder,
  page: number,
  limit: number,
): Promise<SearchResult> {
  const offset = (page - 1) * limit;

  const [mediaRows, personRows, totalMedia] = await Promise.all([
    findMediaByTitle(q, type, hidePegi16, sortBy, sortOrder, limit, offset),
    findPersonByName(q, limit, offset),
    countMediaByTitle(q, type, hidePegi16),
  ]);

  const films: MediaDto[] = [];
  const series: MediaDto[] = [];
  const animes: MediaDto[] = [];

  for (const row of mediaRows) {
    const dto: MediaDto = {
      id: row.id,
      tmdbId: row.tmdb_id,
      name: row.name,
      poster: row.poster,
      releasedAt: row.released_at,
      type: row.type,
      pegi: row.pegi,
      overallRating: row.overall_rating,
      imported: true,
    };

    // is_anime prime sur type : un anime reste un anime, qu'il soit "movie" ou "tv"
    if (row.is_anime) animes.push(dto);
    else if (row.type === "movie") films.push(dto);
    else if (row.type === "tv") series.push(dto);
  }

  const actors: PersonDto[] = personRows.map((p) => ({
    id: p.id,
    name: p.name,
    photo: p.photo,
  }));

  // Les résultats TMDB non importés ne sont proposés qu'en page 1 : ce sont
  // des suggestions d'import, pas des résultats paginés à part entière.
  if (page === 1) {
    const tmdbOnly = await findTmdbOnlyResults(q, type, hidePegi16);
    films.push(...tmdbOnly.films);
    series.push(...tmdbOnly.series);
    animes.push(...tmdbOnly.animes);
  }

  return {
    films,
    series,
    animes,
    actors,
    hasMore: offset + mediaRows.length < totalMedia,
  };
}
