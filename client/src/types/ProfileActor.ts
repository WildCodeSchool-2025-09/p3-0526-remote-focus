export type ProfileActor = {
  id: number;
  name: string;
  photo: string | null;
  viewedCount: number;
};

export type ProfileActorsPage = {
  data: ProfileActor[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
};
