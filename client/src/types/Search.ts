//voir le typage de Media avec la cardMedia d'alex
type SearchMedia = {
  id: number;
  name: string;
  poster: string | null;
  releasedAt: string | null;
};

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

export type { SearchMedia, SearchPerson, SearchResults };
