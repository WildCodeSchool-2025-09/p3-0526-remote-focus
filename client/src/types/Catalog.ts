import type { Genre } from "./Genre";

export type Media = {
  id: number;
  tmdbId: number;
  name: string;
  type: string;
  releasedAt: Date | string | null;
  duration: number | null;
  poster: string | null;
  synopsis: string | null;
  overallRating: number | string | null;
  status: string | null;
  originalName: string | null;
  originalLanguage: string | null;
  pegi: string | null;
  isAnime: boolean;
  genreName: string | null;
};

export type EnrichedMedia = Media & {
  topRank: "top3" | "top10" | null;
  isNew: boolean;
};

export type MediaType = "movie" | "tv" | "anime";

export type GenreSection = {
  id: number;
  name: string;
  medias: EnrichedMedia[];
};

export type DiscoverResponse = {
  topRated: EnrichedMedia[];
  latest: EnrichedMedia[];
  genreSections: GenreSection[];
};

export type Pagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type PaginatedMediaResponse = {
  medias: EnrichedMedia[];
  pagination: Pagination;
};

export type LikedGenre = {
  id: number;
  name: string;
};
