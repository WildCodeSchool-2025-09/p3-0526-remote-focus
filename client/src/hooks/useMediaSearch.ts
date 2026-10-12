import { useEffect, useRef, useState } from "react";
import { searchMedias } from "../services/api";
import type { SearchResults as SearchResultsType } from "../types/search";

export const MIN_QUERY_LENGTH = 2;

const emptyResults: SearchResultsType = {
  films: [],
  series: [],
  animes: [],
  actors: [],
  hasMore: false,
};

interface UseMediaSearchResult {
  results: SearchResultsType;
  loading: boolean;
  loadingMore: boolean;
  error: boolean;
  hasMore: boolean;
  loadMore: () => void;
}

const useMediaSearch = (
  query: string,
  type: string | undefined,
  genre: string | undefined,
): UseMediaSearchResult => {
  const [results, setResults] = useState<SearchResultsType>(emptyResults);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);
  const searchGeneration = useRef(0);

  useEffect(() => {
    searchGeneration.current += 1;
    setPage(1);

    if (query.length < MIN_QUERY_LENGTH) {
      setResults(emptyResults);
      setLoading(false);
      setError(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(false);

    searchMedias(query, 1, type, genre)
      .then((data) => {
        if (!cancelled) {
          setResults(data);
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
  }, [query, type, genre]);

  const loadMore = () => {
    const nextPage = page + 1;
    const generationAtStart = searchGeneration.current;
    setLoadingMore(true);

    searchMedias(query, nextPage, type, genre)
      .then((data) => {
        if (searchGeneration.current !== generationAtStart) {
          return;
        }
        setResults((previous) => ({
          ...previous,
          films: [...previous.films, ...data.films],
          series: [...previous.series, ...data.series],
          animes: [...previous.animes, ...data.animes],
          hasMore: data.hasMore,
        }));
        setPage(nextPage);
      })
      .catch(() => {
        if (searchGeneration.current === generationAtStart) {
          setError(true);
        }
      })
      .finally(() => setLoadingMore(false));
  };

  return {
    results,
    loading,
    loadingMore,
    error,
    hasMore: results.hasMore,
    loadMore,
  };
};

export default useMediaSearch;
