export type Media = {
  id: number;
  tmdbId: number;
  name: string;
  type: string;
  releasedAt: string | null;
  duration: number | null;
  poster: string | null;
  synopsis: string | null;
  overallRating: number | string | null;
  status: string | null;
  originalName: string | null;
  originalLanguage: string | null;
  pegi: string | null;
  isAnime: boolean;
};

export type EnrichedMedia = Media & {
  topRank: "top3" | "top10" | null;
  isNew: boolean;
};

export type HomepageData = {
  films: EnrichedMedia[];
  series: EnrichedMedia[];
  animes: EnrichedMedia[];
};
