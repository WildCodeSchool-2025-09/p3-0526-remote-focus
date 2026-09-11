export type Genre = {
  id: number;
  name: string;
};

export type Platform = {
  id: number;
  name: string;
  logo: string | null;
  url: string | null;
};

export type CastMember = {
  id: number;
  name: string;
  photo: string | null;
  characterName: string | null;
  role: string | null;
};

export type Media = {
  id: number;
  name: string;
  originalName: string | null;
  poster: string | null;
  synopsis: string | null;
  duration: number | null;
  releasedAt: string | null;
  overallRating: string | null;
  originalLanguage: string | null;
  pegi: string | null;
  genres: Genre[];
  platforms: Platform[];
  cast: CastMember[];
  castTotal: number;
  isFavorite: boolean;
  isInWatchlist: boolean;
  isWatched: boolean;
  userStatus: string | null;
  userRating: number | string | null;
};

export type FilmographyItem = {
  id: number;
  name: string;
  poster: string | null;
  type: string;
  releasedAt: string | null;
  characterName: string | null;
};

export type Season = {
  id: number;
  name: string | null;
  number: number | null;
  poster: string | null;
  releasedAt: string | null;
  isFinished: boolean;
  episodeCount: number;
};

export type Episode = {
  id: number;
  name: string | null;
  number: number | null;
  releasedAt: string | null;
  synopsis: string | null;
  duration: number | null;
  isWatched: boolean;
};

export type SeasonDetail = {
  id: number;
  name: string | null;
  number: number | null;
  poster: string | null;
  synopsis: string | null;
  releasedAt: string | null;
  isFinished: boolean;
  overallRating: string | null;
  totalDuration: number;
  series: {
    id: number;
    name: string;
  };
  genres: Genre[];
  platforms: Platform[];
  episodes: Episode[];
  cast: CastMember[];
  castTotal: number;
  isWatched: boolean;
  userStatus: string | null;
  userRating: number | string | null;
};

export type EpisodeDetail = {
  id: number;
  name: string | null;
  number: number | null;
  releasedAt: string | null;
  synopsis: string | null;
  duration: number | null;
  poster: string | null;
  overallRating: string | null;
  season: {
    id: number;
    name: string | null;
    number: number | null;
  };
  series: {
    id: number;
    name: string;
  };
  platforms: Platform[];
  cast: CastMember[];
  castTotal: number;
  isWatched: boolean;
  userStatus: string | null;
};

export type Actor = {
  id: number;
  name: string;
  photo: string | null;
  biography: string | null;
  isFavorite: boolean;
};

export type Series = {
  id: number;
  name: string;
  originalName: string | null;
  poster: string | null;
  synopsis: string | null;
  releasedAt: string | null;
  overallRating: string | null;
  originalLanguage: string | null;
  pegi: string | null;
  status: string | null;
  totalDuration: number;
  averageEpisodeDuration: number | null;
  genres: Genre[];
  platforms: Platform[];
  cast: CastMember[];
  castTotal: number;
  seasons: Season[];
  isFavorite: boolean;
  isInWatchlist: boolean;
  isWatched: boolean;
  userStatus: string | null;
  userRating: number | string | null;
};
