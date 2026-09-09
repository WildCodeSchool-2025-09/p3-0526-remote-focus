import type { Media, EnrichedMedia } from "../Media/Media.types";

export type GenreSection = {
  id: number;
  name: string;
  medias: EnrichedMedia[];
};

export type DiscoverResponse = {
  topRated: EnrichedMedia[];
  latest: Media[];
  genreSections: GenreSection[];
};
