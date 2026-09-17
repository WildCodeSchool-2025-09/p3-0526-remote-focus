import { Search } from "lucide-react";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";

import TypeFilter from "../components/Catalog/TypeFilter";
import ActorList from "../components/Search/ActorList";
import MediaList from "../components/Search/MediaList";
import { useSearch } from "../contexts/SearchContext";
import useDebounce from "../hooks/useDebounce";
import useMediaSearch, { MIN_QUERY_LENGTH } from "../hooks/useMediaSearch";

const DEBOUNCE_DELAY_MS = 400;

const SearchResults = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { searchQuery, setSearchQuery, setHasNoResults } = useSearch();

  const debouncedQuery = useDebounce(searchQuery, DEBOUNCE_DELAY_MS);
  const trimmedQuery = debouncedQuery.trim();
  const activeType = searchParams.get("type") ?? undefined;

  const { results, loading, loadingMore, error, hasMore, loadMore } =
    useMediaSearch(trimmedQuery, activeType);

  // biome-ignore lint/correctness/useExhaustiveDependencies: hydrate le contexte depuis l'URL une seule fois au montage, pas à chaque frappe
  useEffect(() => {
    const queryFromUrl = searchParams.get("q");
    if (queryFromUrl && queryFromUrl !== searchQuery) {
      setSearchQuery(queryFromUrl);
    }
  }, []);

  useEffect(() => {
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        if (trimmedQuery) {
          next.set("q", trimmedQuery);
        } else {
          next.delete("q");
        }
        return next;
      },
      { replace: true },
    );
  }, [trimmedQuery, setSearchParams]);

  useEffect(() => {
    if (trimmedQuery.length < MIN_QUERY_LENGTH) {
      setHasNoResults(false);
      return;
    }

    if (loading) {
      return;
    }

    if (error) {
      setHasNoResults(false);
      return;
    }

    const noMatches =
      results.films.length === 0 &&
      results.series.length === 0 &&
      results.animes.length === 0 &&
      results.actors.length === 0;

    setHasNoResults(noMatches);
  }, [trimmedQuery, loading, error, results, setHasNoResults]);

  const handleClearSearch = () => {
    setSearchQuery("");
    setHasNoResults(false);
    navigate("/catalog");
  };

  const trimmedLower = trimmedQuery.toLowerCase();

  const allMedias = [
    ...results.films,
    ...results.series,
    ...results.animes,
  ].sort((a, b) => {
    const aStartsWithQuery = a.name.toLowerCase().startsWith(trimmedLower);
    const bStartsWithQuery = b.name.toLowerCase().startsWith(trimmedLower);

    if (aStartsWithQuery !== bStartsWithQuery) {
      return aStartsWithQuery ? -1 : 1;
    }

    return a.name.localeCompare(b.name);
  });

  const hasResults = allMedias.length > 0 || results.actors.length > 0;

  return (
    <div className="space-y-6">
      <TypeFilter />

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
              className="btn-cta-pill"
            >
              Effacer la recherche
            </button>
          </div>
        )}

      {!loading && !error && hasResults && (
        <div className="space-y-8">
          <ActorList actors={results.actors} />
          <MediaList medias={allMedias} />

          {hasMore && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={loadMore}
                disabled={loadingMore}
                className="btn-cta-pill"
              >
                {loadingMore ? "Chargement…" : "Voir plus"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
