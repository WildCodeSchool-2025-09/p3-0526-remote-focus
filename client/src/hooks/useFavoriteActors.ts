import { useEffect, useRef, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { UnauthorizedError } from "../services/errors";
import { fetchFavoriteActors } from "../services/favoriteApi";
import type { ProfileActor, ProfileActorsPage } from "../types/ProfileActor";

const PAGE_SIZE = 6;

type FetchActorsPage = (
  token: string,
  options: { page: number; limit: number },
) => Promise<ProfileActorsPage>;

type UseFavoriteActorsResult = {
  actors: ProfileActor[];
  loading: boolean;
  loadingMore: boolean;
  error: boolean;
  loadMoreError: boolean;
  hasMore: boolean;
  loadMore: () => void;
};

function useFavoriteActors(
  fetchPage: FetchActorsPage = fetchFavoriteActors,
): UseFavoriteActorsResult {
  const { token, logout } = useAuth();
  const [actors, setActors] = useState<ProfileActor[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState(false);
  const generation = useRef(0);

  useEffect(() => {
    generation.current += 1;
    const current = generation.current;

    setActors([]);
    setPage(1);
    setHasMore(false);
    setLoading(true);
    setError(false);
    setLoadMoreError(false);

    if (token === null) {
      setLoading(false);
      return;
    }

    fetchPage(token, { page: 1, limit: PAGE_SIZE })
      .then((data) => {
        if (generation.current !== current) {
          return;
        }
        setActors(data.data);
        setHasMore(data.pagination.hasMore);
      })
      .catch((err) => {
        if (generation.current !== current) {
          return;
        }
        if (err instanceof UnauthorizedError) {
          logout();
          return;
        }
        setError(true);
      })
      .finally(() => {
        if (generation.current === current) {
          setLoading(false);
        }
      });
  }, [token, logout, fetchPage]);

  const loadMore = () => {
    if (token === null) {
      return;
    }

    const nextPage = page + 1;
    const current = generation.current;

    setLoadingMore(true);
    setLoadMoreError(false);

    fetchPage(token, { page: nextPage, limit: PAGE_SIZE })
      .then((data) => {
        if (generation.current !== current) {
          return;
        }
        setActors((previous) => [...previous, ...data.data]);
        setHasMore(data.pagination.hasMore);
        setPage(nextPage);
      })
      .catch((err) => {
        if (generation.current !== current) {
          return;
        }
        if (err instanceof UnauthorizedError) {
          logout();
          return;
        }
        setLoadMoreError(true);
      })
      .finally(() => {
        if (generation.current === current) {
          setLoadingMore(false);
        }
      });
  };

  return {
    actors,
    loading,
    loadingMore,
    error,
    loadMoreError,
    hasMore,
    loadMore,
  };
}

export default useFavoriteActors;
