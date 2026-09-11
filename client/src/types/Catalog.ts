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
  isWatched?: boolean;
};

export type EnrichedMedia = Media & {
  topRank?: "top3" | "top10" | null;
  isNew?: boolean;
};

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

export type LikedGenre = {
  id: number;
  name: string;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type CatalogResponse = {
  data: EnrichedMedia[];
  pagination: PaginationMeta;
};

export type Format = "movie" | "tv" | "anime" | null;

export type HomepageResponse = {
  popular: EnrichedMedia[];
  movies: EnrichedMedia[];
  series: EnrichedMedia[];
  animes: EnrichedMedia[];
  newReleases: EnrichedMedia[];
};

export type SuggestionsResponse = {
  genreBased: Media[];
  actorBased: Media[];
};
