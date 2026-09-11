//voir le typage de Media avec la cardMedia de sophie
type Media = {
  id: number;
  name: string;
  poster: string | null;
  releasedAt: string | null;
};

type Person = {
  id: number;
  name: string;
  photo: string | null;
};

type SearchResults = {
  films: Media[];
  series: Media[];
  animes: Media[];
  actors: Person[];
  hasMore: boolean;
};

export type { Media, Person, SearchResults };
