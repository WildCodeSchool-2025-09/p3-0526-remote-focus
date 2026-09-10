import type { RowDataPacket } from "mysql2/promise";

export type Media = RowDataPacket & {
  ID: number;
  tmdb_id: number;
  name: string;
  type: string;
  released_at: Date | string | null;
  duration: number | null;
  poster: string | null;
  synopsis: string | null;
  overall_rating: number | string | null;
  status: string | null;
  original_name: string | null;
  original_language: string | null;
  pegi: string | null;
  is_anime: boolean;
};

export type EnrichedMedia = Media & {
  topRank: "top3" | "top10" | null;
  isNew: boolean;
};
