export type DashboardData = {
  user: {
    firstname: string;
    login: string;
    avatar: string;
  };
  counts: {
    favorites: number;
    watchlist: number;
    favoriteActors: number;
    watchedTitles: number;
  };
};
