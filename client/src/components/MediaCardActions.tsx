import { Bookmark, Heart } from "lucide-react";
import type { MouseEvent } from "react";
import { useMediaTrack } from "../hooks/useMediaTrack";

type MediaCardActionsProps = {
  mediaId: number;
  initialIsFavorite?: boolean;
  initialIsInWatchlist?: boolean;
};

function MediaCardActions({
  mediaId,
  initialIsFavorite = false,
  initialIsInWatchlist = false,
}: MediaCardActionsProps) {
  const {
    isFavorite,
    isInWatchlist,
    handleToggleFavorite,
    handleToggleWatchlist,
  } = useMediaTrack(mediaId, initialIsFavorite, initialIsInWatchlist);

  const stopAndRun = (
    event: MouseEvent<HTMLButtonElement>,
    action: () => void,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    action();
  };

  return (
    <div className="pointer-events-none absolute right-2 top-2 z-10 flex gap-1 md:pointer-events-auto">
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
      >
        <Bookmark
          size={14}
          fill={isInWatchlist ? "#F2B705" : "none"}
          color={isInWatchlist ? "#F2B705" : "currentColor"}
        />
      </button>
    </div>
  );
}

export default MediaCardActions;
