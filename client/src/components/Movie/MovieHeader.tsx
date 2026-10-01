import {
  Check,
  ChevronDown,
  ChevronUp,
  Heart,
  Minus,
  Plus,
  Star,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useTracks } from "../../contexts/TrackContext";
import type { Media } from "../../types/media";
import { formatDuration } from "../../utils/formatDuration";
import ActionButton from "../ActionButton";
import PlatformList from "../PlatformList";
import MovieInfo from "./MovieInfo";

type MovieHeaderProps = {
  media: Media;
};

const PILL = "rounded-full border border-focus-cream/30 px-4 py-2 text-sm";

const PILL_ACTIVE =
  "rounded-full border border-focus-yellow bg-focus-yellow px-4 py-2 text-sm font-semibold text-focus-void";

function MovieHeader({ media }: MovieHeaderProps) {
  const { isAuthenticated } = useAuth();
  const { tracks, toggleFavorite, toggleWatchlist } = useTracks();

  const [isMetaOpen, setIsMetaOpen] = useState(false);

  const currentTrack = tracks.find((track) => track.mediaId === media.id);

  const isFavorite = currentTrack?.isFavorite ?? false;
  const isInWatchlist = currentTrack?.isInWatchlist ?? false;

  const year = media.releasedAt
    ? new Date(media.releasedAt).getFullYear()
    : null;

  function handleToggleMeta() {
    setIsMetaOpen(!isMetaOpen);
  }

  async function handleFavoriteClick() {
    if (!isAuthenticated) {
      window.alert("Vous devez être connecté pour réaliser cette action.");
      return;
    }

    try {
      await toggleFavorite(media.id);
    } catch (error) {
      console.error(
        isFavorite
          ? "Impossible de retirer le média des favoris :"
          : "Impossible d'ajouter le média aux favoris :",
        error,
      );
    }
  }

  async function handleWatchlistClick() {
    if (!isAuthenticated) {
      window.alert("Vous devez être connecté pour réaliser cette action.");
      return;
    }

    try {
      await toggleWatchlist(media.id);
    } catch (error) {
      console.error(
        isInWatchlist
          ? "Impossible de retirer le média de la watchlist :"
          : "Impossible d'ajouter le média à la watchlist :",
        error,
      );
    }
  }

  return (
    <div className="grid grid-cols-[128px_minmax(0,1fr)] gap-4 md:grid-cols-[264px_minmax(0,1fr)] md:grid-rows-[auto_1fr] md:gap-8">
      {media.poster != null && (
        <img
          src={`https://image.tmdb.org/t/p/w500${media.poster}`}
          alt={media.name}
          className="col-start-1 row-start-1 h-48 w-32 rounded-lg object-cover md:row-span-2 md:h-[396px] md:w-[264px]"
        />
      )}

      <div className="col-start-2 row-start-1 flex min-w-0 flex-col gap-3 md:gap-4">
        <h1 className="text-2xl font-bold md:text-4xl">{media.name}</h1>

        <div className="flex flex-wrap items-center gap-2">
          {media.genres.map((genre) => (
            <span key={genre.id} className={PILL_ACTIVE}>
              {genre.name}
            </span>
          ))}

          {year != null && <span className={PILL}>{year}</span>}

          <button
            type="button"
            onClick={handleToggleMeta}
            aria-expanded={isMetaOpen}
            aria-label="Afficher plus d'informations"
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-focus-cream/30 text-sm md:hidden ${
              isMetaOpen ? "text-focus-yellow" : "text-focus-cream"
            }`}
          >
            {isMetaOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          <div
            className={`${
              isMetaOpen ? "flex" : "hidden"
            } w-full flex-wrap gap-2 rounded-lg border border-focus-cream/15 bg-focus-surface p-2 md:contents md:w-auto md:border-0 md:bg-transparent md:p-0`}
          >
            {media.originalLanguage != null && (
              <span className={PILL}>
                VO : {media.originalLanguage.toUpperCase()}
              </span>
            )}

            {media.duration != null && (
              <span className={PILL}>{formatDuration(media.duration)}</span>
            )}

            {media.overallRating != null && (
              <span className={PILL}>★ {media.overallRating}</span>
            )}

            {media.pegi != null && (
              <span className={PILL}>PEGI {media.pegi}</span>
            )}
          </div>
        </div>
      </div>

      <div className="col-span-2 row-start-2 flex flex-col gap-4 md:col-span-1 md:col-start-2">
        <MovieInfo media={media} />

        <div className="flex flex-wrap items-start gap-4">
          <ActionButton
            label="Favoris"
            icon={Heart}
            ariaLabel={
              isFavorite
                ? `Retirer ${media.name} des favoris`
                : `Ajouter ${media.name} aux favoris`
            }
            isPressed={isFavorite}
            fillIcon={isFavorite}
            buttonClassName="border-focus-coral text-focus-coral"
            onClick={handleFavoriteClick}
          />

          <ActionButton
            label="Watchlist"
            icon={isInWatchlist ? Minus : Plus}
            ariaLabel={
              isInWatchlist
                ? `Retirer ${media.name} de la watchlist`
                : `Ajouter ${media.name} à la watchlist`
            }
            isPressed={isInWatchlist}
            buttonClassName={
              isInWatchlist
                ? "border-focus-cream bg-focus-cream text-focus-void"
                : "border-focus-cream text-focus-cream"
            }
            onClick={handleWatchlistClick}
          />

          <ActionButton
            label="Vu"
            icon={Check}
            buttonClassName="border-focus-teal text-focus-teal"
            disabled
          />

          <ActionButton
            label="Noter"
            icon={Star}
            buttonClassName="border-focus-yellow text-focus-yellow"
            disabled
          />

          <PlatformList platforms={media.platforms} />
        </div>
      </div>
    </div>
  );
}

export default MovieHeader;
