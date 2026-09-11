export type HomepageMedia = {
  ID: number;
  tmdb_id: number;
  name: string;
  type: string;
  released_at: string | null;
  duration: number | null;
  poster: string | null;
  synopsis: string | null;
  overall_rating: number | string | null;
  status: string | null;
  original_name: string | null;
  original_language: string | null;
  pegi: string | null;
  is_anime: number | boolean;
  topRank: "top3" | "top10" | null;
  isNew: boolean;
};

export type HomepageData = {
  films: HomepageMedia[];
  series: HomepageMedia[];
  animes: HomepageMedia[];
};
