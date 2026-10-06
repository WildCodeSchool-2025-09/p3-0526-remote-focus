import type { Media } from "./Catalog";

export type TrackedList = "favorite";

export type WatchStatus = "seen" | "toWatch" | "all";

export type TrackedMediaResponse = {
  medias: Media[];
  hasMore: boolean;
};
