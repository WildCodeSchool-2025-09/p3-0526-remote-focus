import type { Media } from "./Catalog";

export type WatchStatus = "seen" | "toWatch" | "all";

export type WatchlistResponse = {
  medias: Media[];
  hasMore: boolean;
};
