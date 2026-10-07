import { ChevronDown, ChevronLeft } from "lucide-react";
import { Link, useSearchParams } from "react-router";
import { useTracks } from "../../contexts/TrackContext";
import useTrackedMedias from "../../hooks/useTrackedMedias";
import type { MediaType } from "../../types/Catalog";
import type { TrackedList, WatchStatus } from "../../types/Tracked";
import { isValidMediaType } from "../../utils/catalogUtils";
import MediaCard from "../Catalog/MediaCard";
import MediaCardLoading from "../Catalog/MediaCardLoading";
import TypeFilter from "../Catalog/TypeFilter";
import ProfileListSwitch from "./ProfileListSwitch";
import WatchStatusFilter from "./WatchStatusFilter";

type TrackedMediaListProps = {
  list: TrackedList;
};

const EMPTY_MESSAGES: Record<TrackedList, string> = {
  favorite: "Aucun média dans vos favoris pour ce filtre.",
  watchlist: "Aucun média dans votre watchlist pour ce filtre.",
};

const TITLES: Record<TrackedList, string> = {
  favorite: "Favoris",
  watchlist: "Watchlist",
};

const ERROR_MESSAGES: Record<TrackedList, string> = {
  favorite:
    "Une erreur est survenue lors du chargement de vos favoris. Merci d'actualiser la page.",
  watchlist:
    "Une erreur est survenue lors du chargement de votre watchlist. Merci d'actualiser la page.",
};

function parseWatchStatus(value: string | null): WatchStatus {
  if (value === "toWatch" || value === "seen") {
    return value;
  }
  return "all";
}

function TrackedMediaList({ list }: TrackedMediaListProps) {
  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get("type");
  const type: MediaType | undefined =
    typeParam && isValidMediaType(typeParam) ? typeParam : undefined;
  const status = parseWatchStatus(searchParams.get("status"));

  const { tracks } = useTracks();
  const favoritesCount = tracks.filter((track) => track.isFavorite).length;
  const watchlistCount = tracks.filter((track) => track.isInWatchlist).length;

  const {
    medias,
    loading,
    loadingMore,
    error,
    loadMoreError,
    hasMore,
    loadMore,
  } = useTrackedMedias(list, type, status);

  return (
    <section className="space-y-6">
      <Link
        to="/profile"
        className="inline-flex items-center gap-2 text-sm text-base-content"
      >
        <ChevronLeft size={16} />
        Retour
      </Link>

      <h1 className="sr-only">{TITLES[list]}</h1>

      <TypeFilter />

      <ProfileListSwitch
        active={list === "favorite" ? "favorites" : "watchlist"}
        favoritesCount={favoritesCount}
        watchlistCount={watchlistCount}
      />

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
        <p className="text-focus-muted">{ERROR_MESSAGES[list]}</p>
      )}

      {!loading && !error && medias.length === 0 && (
        <p className="text-focus-muted">{EMPTY_MESSAGES[list]}</p>
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

export default TrackedMediaList;
