import type { Media as CatalogMedia } from "./Catalog";

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
  type: string;
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

export type FilmographyItem = CatalogMedia & {
  characterName: string | null;
};

export type FilmographyPage = {
  items: FilmographyItem[];
  hasMore: boolean;
};

export type Actor = {
  id: number;
  name: string;
  photo: string | null;
  biography: string | null;
};

export type Season = {
  id: number;
  name: string | null;
  number: number | null;
  poster: string | null;
  releasedAt: string | null;
  synopsis: string | null;
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
};

export type Serie = {
  id: number;
  name: string;
  type: string;
  isAnime: boolean;
  originalName: string | null;
  poster: string | null;
  synopsis: string | null;
  status: string | null;
  releasedAt: string | null;
  overallRating: string | null;
  originalLanguage: string | null;
  pegi: string | null;
  totalDuration: number | null;
  averageEpisodeDuration: number | null;
  episodeCount: number;
  seasons: Season[];
  genres: Genre[];
  platforms: Platform[];
  cast: CastMember[];
  castTotal: number;
  userStatus: string | null;
  userRating: number | null;
};

export type SeasonDetail = {
  id: number;
  name: string | null;
  number: number | null;
  poster: string | null;
  hasOwnPoster: boolean;
  synopsis: string | null;
  releasedAt: string | null;
  isFinished: boolean;
  totalDuration: number | null;
  episodeCount: number;
  serie: {
    id: number;
    name: string;
    poster: string | null;
    originalLanguage: string | null;
    isAnime: boolean;
  };
  episodes: Episode[];
  cast: CastMember[];
  castTotal: number;
  platforms: Platform[];
  userStatus: string | null;
  userRating: number | null;
};
