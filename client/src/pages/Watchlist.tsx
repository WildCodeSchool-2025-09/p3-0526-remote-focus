import { ChevronDown, ChevronLeft } from "lucide-react";
import { Link, useSearchParams } from "react-router";
import MediaCard from "../components/Catalog/MediaCard";
import MediaCardLoading from "../components/Catalog/MediaCardLoading";
import TypeFilter from "../components/Catalog/TypeFilter";
import ProfileListSwitch from "../components/profile/ProfileListSwitch";
import WatchStatusFilter from "../components/profile/WatchStatusFilter";
import useFetch from "../hooks/useFetch";
import useWatchlist from "../hooks/useWatchlist";
import type { MediaType } from "../types/Catalog";
import type { DashboardData } from "../types/Dashboard";
import type { WatchStatus } from "../types/Watchlist";
import { isValidMediaType } from "../utils/catalogUtils";

function parseWatchStatus(value: string | null): WatchStatus {
  if (value === "toWatch" || value === "seen") {
    return value;
  }
  return "all";
}

function Watchlist() {
  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get("type");
  const type: MediaType | undefined =
    typeParam && isValidMediaType(typeParam) ? typeParam : undefined;
  const status = parseWatchStatus(searchParams.get("status"));

  const dashboard = useFetch<DashboardData>("/api/me/dashboard");
  const {
    medias,
    loading,
    loadingMore,
    error,
    loadMoreError,
    hasMore,
    loadMore,
  } = useWatchlist(type, status);

  return (
    <section className="space-y-6">
      <Link
        to="/profile"
        className="inline-flex items-center gap-2 text-sm text-base-content"
      >
        <ChevronLeft size={16} />
        Retour
      </Link>

      <TypeFilter />

      {dashboard.data != null && (
        <ProfileListSwitch
          active="watchlist"
          favoritesCount={dashboard.data.counts.favorites}
          watchlistCount={dashboard.data.counts.watchlist}
        />
      )}

      <WatchStatusFilter />

      {loading && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }, (_, index) => index + 1).map(
            (loadingId) => (
              <MediaCardLoading key={loadingId} />
            ),
          )}
        </div>
      )}

      {!loading && error && (
        <p className="text-focus-muted">
          Une erreur est survenue lors du chargement de votre watchlist. Merci
          d'actualiser la page.
        </p>
      )}

      {!loading && !error && medias.length === 0 && (
        <p className="text-focus-muted">
          Aucun média dans votre watchlist pour ce filtre.
        </p>
      )}

      {!loading && !error && medias.length > 0 && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
          {medias.map((media) => (
            <MediaCard
              key={media.id}
              media={{ ...media, topRank: null, isNew: false }}
              className="w-full"
              showTypeIcon={!type}
            />
          ))}
        </div>
      )}

      {hasMore && (
        <div className="flex flex-col items-center gap-2">
          {loadMoreError && (
            <p className="text-sm text-focus-muted">
              Impossible de charger la suite. Réessaie.
            </p>
          )}
          <button
            type="button"
            onClick={loadMore}
            disabled={loadingMore}
            className="btn-cta-pill"
          >
            {loadingMore ? (
              "Chargement…"
            ) : (
              <>
                Voir plus
                <ChevronDown size={16} />
              </>
            )}
          </button>
        </div>
      )}
    </section>
  );
}

export default Watchlist;
