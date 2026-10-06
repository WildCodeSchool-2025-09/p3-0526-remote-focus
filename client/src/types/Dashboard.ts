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

export type SettingsProfile = {
  firstname: string;
  lastname: string | null;
  email: string;
  bornAt: string;
  name: string;
  avatar: string;
  createdAt: string;
};

export type SettingsPreferences = {
  darkTheme: 0 | 1;
  isPegi16: 0 | 1;
};

export type SettingsResponse = {
  profile: SettingsProfile;
  preferences: SettingsPreferences;
};
