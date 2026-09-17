import type { Media } from "../../types/Media/Media.types";
import {
  countMediaByTitle,
  findMediaByTitle,
  findPersonByName,
} from "./searchRepository";

interface PersonDto {
  id: number;
  name: string;
  photo: string | null;
}

export interface SearchResult {
  films: Media[];
  series: Media[];
  animes: Media[];
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
    findPersonByName(q, limit, 0),
    countMediaByTitle(q, type),
  ]);

  const films: Media[] = [];
  const series: Media[] = [];
  const animes: Media[] = [];

  for (const media of mediaRows) {
    if (media.isAnime) animes.push(media);
    else if (media.type === "movie") films.push(media);
    else if (media.type === "tv") series.push(media);
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
