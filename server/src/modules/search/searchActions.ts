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
  type: "movie" | "tv";
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

  const films: MediaDto[] = [];
  const series: MediaDto[] = [];
  const animes: MediaDto[] = [];

  for (const row of mediaRows) {
    const dto: MediaDto = {
      id: row.id,
      name: row.name,
      poster: row.poster,
      releasedAt: row.released_at,
      type: row.type,
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

  return {
    films,
    series,
    animes,
    actors,
    hasMore: offset + mediaRows.length < totalMedia,
  };
}
