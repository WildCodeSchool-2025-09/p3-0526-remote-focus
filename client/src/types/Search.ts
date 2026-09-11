//voir le typage de Media avec la cardMedia d'alex
type SearchMedia = {
  id: number;
  name: string;
  poster: string | null;
  releasedAt: string | null;
  type: "movie" | "tv";
  pegi?: string | null;
  overallRating?: number | string | null;
};

type SearchSortBy = "name" | "rating" | "date";
type SearchSortOrder = "asc" | "desc";

type SearchPerson = {
  id: number;
  name: string;
  photo: string | null;
};

type SearchResults = {
  films: SearchMedia[];
  series: SearchMedia[];
  animes: SearchMedia[];
  actors: SearchPerson[];
  hasMore: boolean;
};

type KnownForMode = "top-rated" | "seen";

type KnownForResponse = {
  mode: KnownForMode;
  data: SearchMedia[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
};

export type {
  SearchMedia,
  SearchSortBy,
  SearchSortOrder,
  SearchPerson,
  SearchResults,
  KnownForMode,
  KnownForResponse,
};
