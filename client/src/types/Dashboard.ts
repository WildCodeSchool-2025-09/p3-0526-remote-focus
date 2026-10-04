export type DashboardProfile = {
  name: string;
  avatar: string;
  createdAt: string;
};

export type DashboardCounts = {
  favorites: number;
  watchlist: number;
  actors: number;
};

export type DashboardData = {
  profile: DashboardProfile;
  counts: DashboardCounts;
};
