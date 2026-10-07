import type { Media } from "./Catalog";

export type TrackedList = "favorite" | "watchlist";

export type WatchStatus = "seen" | "toWatch" | "all";

export type TrackedMediaResponse = {
  medias: Media[];
  hasMore: boolean;
};
