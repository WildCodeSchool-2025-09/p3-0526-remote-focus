export type Genre = {
  ID: number;
  name: string;
};

export type Platform = {
  ID: number;
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
  userStatus: null;
  userRating: null;
};

export type FilmographyItem = {
  id: number;
  name: string;
  poster: string | null;
  type: string;
  releasedAt: string | null;
  characterName: string | null;
};
