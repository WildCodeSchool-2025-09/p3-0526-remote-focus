import type { Media } from "./Catalog";

type ActorSummary = {
  id: number;
  name: string;
  photo: string | null;
};

type SearchResults = {
  films: Media[];
  series: Media[];
  animes: Media[];
  actors: ActorSummary[];
  hasMore: boolean;
};

export type { ActorSummary, Media, SearchResults };
