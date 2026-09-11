import { Check, Heart, Minus, Plus } from "lucide-react";
import type { MouseEvent } from "react";
import { useMediaTrack } from "../hooks/useMediaTrack";
import { useWatchedStatus } from "../hooks/useWatchedStatus";

type MediaCardActionsProps = {
  mediaId: number;
  mediaType: string;
  initialIsFavorite?: boolean;
  initialIsInWatchlist?: boolean;
  initialIsWatched?: boolean;
};

function MediaCardActions({
  mediaId,
  mediaType,
  initialIsFavorite = false,
  initialIsInWatchlist = false,
  initialIsWatched = false,
}: MediaCardActionsProps) {
  const {
    isFavorite,
    isInWatchlist,
    handleToggleFavorite,
    handleToggleWatchlist,
  } = useMediaTrack(mediaId, initialIsFavorite, initialIsInWatchlist);

  const { isWatched, handleToggleWatched } = useWatchedStatus(
    mediaType === "movie" ? "movie" : "series",
    mediaId,
    initialIsWatched,
  );

  const stopAndRun = (
    event: MouseEvent<HTMLButtonElement>,
    action: () => void,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    action();
  };

  const WatchlistIcon = isInWatchlist ? Minus : Plus;

  return (
    <div className="pointer-events-none absolute right-2 top-2 z-10 flex flex-col gap-1 md:pointer-events-auto">
      <button
        type="button"
        onClick={(event) => stopAndRun(event, handleToggleFavorite)}
        aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
        aria-pressed={isFavorite}
        className="flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
      >
        <Heart
          size={14}
          fill={isFavorite ? "#E83658" : "none"}
          color={isFavorite ? "#E83658" : "currentColor"}
        />
      </button>
      <button
        type="button"
        onClick={(event) => stopAndRun(event, handleToggleWatchlist)}
        aria-label={
          isInWatchlist ? "Retirer de la watchlist" : "Ajouter à la watchlist"
        }
        aria-pressed={isInWatchlist}
        className="flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
        style={
          isInWatchlist
            ? { backgroundColor: "#F5F5F0", color: "#0D1117" }
            : undefined
        }
      >
        <WatchlistIcon size={14} />
      </button>
      <button
        type="button"
        onClick={(event) => stopAndRun(event, handleToggleWatched)}
        aria-label={isWatched ? "Marquer comme non vu" : "Marquer comme vu"}
        aria-pressed={isWatched}
        className="flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
      >
        <Check
          size={14}
          color={isWatched ? "#17B890" : "currentColor"}
          strokeWidth={isWatched ? 3 : 2}
        />
      </button>
    </div>
  );
}

export default MediaCardActions;
