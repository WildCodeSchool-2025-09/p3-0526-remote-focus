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

export type ActorWithSeenCount = {
  id: number;
  name: string;
  photo: string | null;
  seenCount: number;
};

export type MyActorsResponse = {
  favorites: {
    data: ActorWithSeenCount[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  mostViewed: ActorWithSeenCount[];
};
