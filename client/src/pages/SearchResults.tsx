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
  const [mediaPage, setMediaPage] = useState(1);
  const [loadingMoreMedia, setLoadingMoreMedia] = useState(false);

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
    setMediaPage(1);

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
    setHasNoResults(false);
    navigate("/catalog");
  };

  const handleLoadMoreMedia = () => {
    const nextPage = mediaPage + 1;
    setLoadingMoreMedia(true);

    searchMedias(trimmedQuery, nextPage)
      .then((results) => {
        setSearchResults((previous) => ({
          ...previous,
          films: [...previous.films, ...results.films],
          series: [...previous.series, ...results.series],
          animes: [...previous.animes, ...results.animes],
          hasMore: results.hasMore,
        }));
        setMediaPage(nextPage);
      })
      .catch(() => setError(true))
      .finally(() => setLoadingMoreMedia(false));
  };

  // Chaque catégorie est déjà triée par pertinence côté API, mais les concaténer perd
  // ce tri global : on refait le même critère (préfixe d'abord, puis alphabétique)
  // sur la liste fusionnée pour obtenir un classement cohérent tous types confondus.
  const trimmedLower = trimmedQuery.toLowerCase();

  const allMedias = [
    ...searchResults.films,
    ...searchResults.series,
    ...searchResults.animes,
  ].sort((a, b) => {
    const aStartsWithQuery = a.name.toLowerCase().startsWith(trimmedLower);
    const bStartsWithQuery = b.name.toLowerCase().startsWith(trimmedLower);

    if (aStartsWithQuery !== bStartsWithQuery) {
      return aStartsWithQuery ? -1 : 1;
    }

    return a.name.localeCompare(b.name);
  });

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

          {searchResults.hasMore && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleLoadMoreMedia}
                disabled={loadingMoreMedia}
                className="btn btn-outline btn-warning rounded-full"
              >
                {loadingMoreMedia ? "Chargement…" : "Voir plus"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
