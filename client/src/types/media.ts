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
  userStatus: string | null;
  userRating: number | null;
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
  userStatus: string | null;
  userRating: number | null;
};
