import type { Media } from "./Catalog";

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
