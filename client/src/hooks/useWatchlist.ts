import { useEffect, useRef, useState } from "react";
import { fetchWatchlist } from "../services/api";
import type { Media, MediaType } from "../types/Catalog";
import type { WatchStatus } from "../types/Watchlist";

type UseWatchlistResult = {
  medias: Media[];
  loading: boolean;
  loadingMore: boolean;
  error: boolean;
  hasMore: boolean;
  loadMore: () => void;
};

const toSeenParam = (status: WatchStatus): boolean | undefined => {
  if (status === "seen") {
    return true;
  }
  if (status === "toWatch") {
    return false;
  }
  return undefined;
};

const useWatchlist = (
  type: MediaType | undefined,
  status: WatchStatus,
): UseWatchlistResult => {
  const [medias, setMedias] = useState<Media[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);
  const generation = useRef(0);

  useEffect(() => {
    generation.current += 1;

    let cancelled = false;

    setMedias([]);
    setHasMore(false);
    setPage(1);
    setLoading(true);
    setError(false);

    fetchWatchlist({ page: 1, type, seen: toSeenParam(status) })
      .then((data) => {
        if (!cancelled) {
          setMedias(data.medias);
          setHasMore(data.hasMore);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [type, status]);

  const loadMore = () => {
    const nextPage = page + 1;
    const generationAtStart = generation.current;

    setLoadingMore(true);

    fetchWatchlist({ page: nextPage, type, seen: toSeenParam(status) })
      .then((data) => {
        if (generation.current !== generationAtStart) {
          return;
        }
        setMedias((previous) => [...previous, ...data.medias]);
        setHasMore(data.hasMore);
        setPage(nextPage);
      })
      .catch(() => {
        if (generation.current === generationAtStart) {
          setError(true);
        }
      })
      .finally(() => setLoadingMore(false));
  };

  return { medias, loading, loadingMore, error, hasMore, loadMore };
};

export default useWatchlist;
