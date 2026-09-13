import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";

//a voir avec les composants extérieur
import ActorList from "../components/Search/ActorList";
import MediaList from "../components/Search/MediaList";
import { useSearch } from "../contexts/SearchContext";
import useDebounce from "../hooks/useDebounce";
import { searchMedias } from "../services/api";
import type { SearchResults as SearchResultsType } from "../types/Search";

const DEBOUNCE_DELAY_MS = 400;
const MIN_QUERY_LENGTH = 2;

const emptyResults: SearchResultsType = {
  films: [],
  series: [],
  animes: [],
  actors: [],
  hasMore: false,
};

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { searchQuery, setSearchQuery } = useSearch();
  const [searchResults, setSearchResults] =
    useState<SearchResultsType>(emptyResults);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const debouncedQuery = useDebounce(searchQuery, DEBOUNCE_DELAY_MS);
  const trimmedQuery = debouncedQuery.trim();

  // biome-ignore lint/correctness/useExhaustiveDependencies:
  useEffect(() => {
    const queryFromUrl = searchParams.get("q");
    if (queryFromUrl && queryFromUrl !== searchQuery) {
      setSearchQuery(queryFromUrl);
    }
  }, []);

  useEffect(() => {
    setSearchParams(trimmedQuery ? { q: trimmedQuery } : {}, { replace: true });
  }, [trimmedQuery, setSearchParams]);

  useEffect(() => {
    if (trimmedQuery.length < MIN_QUERY_LENGTH) {
      setSearchResults(emptyResults);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(false);

    searchMedias(trimmedQuery)
      .then((results) => {
        if (!cancelled) {
          setSearchResults(results);
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
  }, [trimmedQuery]);

  const allMedias = [
    ...searchResults.films,
    ...searchResults.series,
    ...searchResults.animes,
  ];

  const hasResults = allMedias.length > 0 || searchResults.actors.length > 0;

  return (
    <div className="min-h-screen bg-base-100 p-8 space-y-6">
      {loading && <span className="loading loading-spinner text-primary" />}

      {!loading && error && (
        <p className="text-error">Une erreur est survenue, réessayez.</p>
      )}

      {!loading &&
        !error &&
        trimmedQuery.length >= MIN_QUERY_LENGTH &&
        !hasResults && (
          <p className="text-focus-muted">
            Aucun résultat trouvé pour « {trimmedQuery} ».
          </p>
        )}

      {!loading && !error && hasResults && (
        <div className="space-y-8">
          <ActorList title="Comédiens" actors={searchResults.actors} />
          <MediaList medias={allMedias} />
        </div>
      )}
    </div>
  );
};

export default SearchResults;
