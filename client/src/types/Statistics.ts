export type GenreShare = {
  genre: string;
  percentage: number;
};

export type GenreCount = {
  genre: string;
  count: number;
};

export type StatisticsResponse = {
  titlesWatched: number;
  totalDurationMinutes: number;
  monthlyDuration: number[];
  genreDistribution: GenreShare[];
  topGenres: GenreCount[];
};
