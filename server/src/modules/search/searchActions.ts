import {
  countMediaByTitle,
  findMediaByTitle,
  findPersonByName,
} from "./searchRepository";

interface MediaDto {
  id: number;
  name: string;
  poster: string | null;
  releasedAt: Date | null;
}

interface PersonDto {
  id: number;
  name: string;
  photo: string | null;
}

export interface SearchResult {
  results: {
    movies: MediaDto[];
    series: MediaDto[];
    animes: MediaDto[];
    actors: PersonDto[];
  };
  hasMore: boolean;
}

export async function browseResults(
  q: string,
  type: string | undefined,
  page: number,
  limit: number,
): Promise<SearchResult> {
  const offset = (page - 1) * limit;

  const [mediaRows, personRows, totalMedia] = await Promise.all([
    findMediaByTitle(q, type, limit, offset),
    findPersonByName(q, limit, offset),
    countMediaByTitle(q, type),
  ]);

  const movies: MediaDto[] = [];
  const series: MediaDto[] = [];
  const animes: MediaDto[] = [];

  for (const row of mediaRows) {
    const dto: MediaDto = {
      id: row.id,
      name: row.name,
      poster: row.poster,
      releasedAt: row.released_at,
    };

    if (row.type === "movie") movies.push(dto);
    else if (row.type === "series") series.push(dto);
    else if (row.type === "anime") animes.push(dto);
  }

  const actors: PersonDto[] = personRows.map((p) => ({
    id: p.id,
    name: p.name,
    photo: p.photo,
  }));

  return {
    results: { movies, series, animes, actors },
    hasMore: offset + mediaRows.length < totalMedia,
  };
}
