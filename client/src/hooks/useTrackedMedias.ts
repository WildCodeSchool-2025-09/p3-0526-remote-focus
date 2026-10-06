import { useEffect, useRef, useState } from "react";
import { useTracks } from "../contexts/TrackContext";
import { useWatch } from "../contexts/WatchingContext";
import { fetchTrackedMedias, toSeenParam } from "../services/api";
import type { Media, MediaType } from "../types/Catalog";
import type { TrackedList, WatchStatus } from "../types/Tracked";

type UseTrackedMediasResult = {
  medias: Media[];
  loading: boolean;
  loadingMore: boolean;
  error: boolean;
  loadMoreError: boolean;
  hasMore: boolean;
  loadMore: () => void;
};

async function fetchPages(
  list: TrackedList,
  type: MediaType | undefined,
  seen: boolean | undefined,
  pageCount: number,
) {
  const medias: Media[] = [];
  let hasMore = false;

  for (let page = 1; page <= pageCount; page += 1) {
    const data = await fetchTrackedMedias(list, { page, type, seen });
    medias.push(...data.medias);
    hasMore = data.hasMore;

    if (!hasMore) {
      break;
    }
  }

  return { medias, hasMore };
}

const useTrackedMedias = (
  list: TrackedList,
  type: MediaType | undefined,
  status: WatchStatus,
): UseTrackedMediasResult => {
  const { tracks } = useTracks();
  const { watchedMediaIds } = useWatch();

  const [medias, setMedias] = useState<Media[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState(false);
  const mediasRef = useRef<Media[]>([]);
  const loadedPages = useRef(0);
  const generation = useRef(0);

  useEffect(() => {
    generation.current += 1;
    const current = generation.current;
    const seen = toSeenParam(status);

    mediasRef.current = [];
    loadedPages.current = 0;
    setMedias([]);
    setHasMore(false);
    setLoading(true);
    setError(false);
    setLoadMoreError(false);

    fetchPages(list, type, seen, 1)
      .then((data) => {
        if (generation.current !== current) {
          return;
        }
        mediasRef.current = data.medias;
        loadedPages.current = 1;
        setMedias(data.medias);
        setHasMore(data.hasMore);
      })
      .catch(() => {
        if (generation.current === current) {
          setError(true);
        }
      })
      .finally(() => {
        if (generation.current === current) {
          setLoading(false);
        }
      });
  }, [list, type, status]);

  useEffect(() => {
    if (tracks.length === 0) {
      return;
    }

    const matchesFilters = (mediaId: number) => {
      const track = tracks.find((item) => item.mediaId === mediaId);
      if (track?.isFavorite !== true) {
        return false;
      }

      const watched = watchedMediaIds.includes(mediaId);
      if (status === "seen") {
        return watched;
      }
      if (status === "toWatch") {
        return !watched;
      }
      return true;
    };

    const stillMatching = mediasRef.current.filter((media) =>
      matchesFilters(media.id),
    );

    if (stillMatching.length === mediasRef.current.length) {
      return;
    }

    generation.current += 1;
    const current = generation.current;
    const seen = toSeenParam(status);

    mediasRef.current = stillMatching;
    setMedias(stillMatching);

    fetchPages(list, type, seen, loadedPages.current)
      .then((data) => {
        if (generation.current !== current) {
          return;
        }
        mediasRef.current = data.medias;
        setMedias(data.medias);
        setHasMore(data.hasMore);
      })
      .catch(() => {
        if (generation.current === current) {
          setError(true);
        }
      });
  }, [tracks, watchedMediaIds, list, type, status]);

  const loadMore = () => {
    const nextPage = loadedPages.current + 1;
    const current = generation.current;
    const seen = toSeenParam(status);

    setLoadingMore(true);
    setLoadMoreError(false);

    fetchTrackedMedias(list, { page: nextPage, type, seen })
      .then((data) => {
        if (generation.current !== current) {
          return;
        }
        mediasRef.current = [...mediasRef.current, ...data.medias];
        loadedPages.current = nextPage;
        setMedias(mediasRef.current);
        setHasMore(data.hasMore);
      })
      .catch(() => {
        if (generation.current === current) {
          setLoadMoreError(true);
        }
      })
      .finally(() => setLoadingMore(false));
  };

  return {
    medias,
    loading,
    loadingMore,
    error,
    loadMoreError,
    hasMore,
    loadMore,
  };
};

export default useTrackedMedias;
