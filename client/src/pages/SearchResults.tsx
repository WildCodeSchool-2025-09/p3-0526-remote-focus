import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

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
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { searchQuery, setSearchQuery, setHasNoResults } = useSearch();
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
      setHasNoResults(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(false);

    searchMedias(trimmedQuery)
      .then((results) => {
        if (!cancelled) {
          setSearchResults(results);

          const noMatches =
            results.films.length === 0 &&
            results.series.length === 0 &&
            results.animes.length === 0 &&
            results.actors.length === 0;

          setHasNoResults(noMatches);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setHasNoResults(false);
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
  }, [trimmedQuery, setHasNoResults]);

  const handleClearSearch = () => {
    setSearchQuery("");
    navigate("/catalog");
  };

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
          <div className="flex flex-col items-center gap-4 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-base-content/20">
              <Search className="size-6 opacity-70" />
            </div>
            <h2>Aucun résultat trouvé</h2>
            <p className="max-w-md text-focus-muted">
              Vérifiez l'orthographe ou essayez un titre, un genre ou un nom de
              comédien plus court.
            </p>
            <button
              type="button"
              onClick={handleClearSearch}
              className="btn btn-outline btn-warning rounded-full"
            >
              Effacer la recherche
            </button>
          </div>
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
