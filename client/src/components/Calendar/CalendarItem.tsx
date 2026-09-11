import { Plus } from "lucide-react";
import type { MouseEvent } from "react";
import { Link } from "react-router";
import { useMediaTrack } from "../../hooks/useMediaTrack";
import type { CalendarItem as CalendarItemData } from "../../types/Catalog";
import { getMediaPath } from "../../utils/mediaPath";

type CalendarItemProps = {
  item: CalendarItemData;
  mediaType: "movie" | "tv";
};

function CalendarItem({ item, mediaType }: CalendarItemProps) {
  const { handleToggleWatchlist } = useMediaTrack(item.id, false, false);

  const handleAddToWatchlist = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    handleToggleWatchlist();
  };

  const subtitle =
    item.seasonNumber != null && item.episodeNumber != null
      ? `S${item.seasonNumber} E${item.episodeNumber}${item.episodeName ? ` · ${item.episodeName}` : ""}`
      : null;

  return (
    <Link
      to={getMediaPath(mediaType, item.id)}
      className="flex items-center gap-3 rounded-lg bg-base-200 p-2 transition-colors hover:bg-base-300"
    >
      {item.poster != null && (
        <img
          src={`https://image.tmdb.org/t/p/w92${item.poster}`}
          alt={item.title}
          className="h-16 w-11 shrink-0 rounded object-cover"
        />
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{item.title}</p>
        <p className="text-focus-muted-dark truncate text-xs">
          {subtitle ?? item.year}
          {item.genreName != null && ` · ${item.genreName}`}
        </p>
      </div>

      <button
        type="button"
        onClick={handleAddToWatchlist}
        aria-label="Ajouter à la watchlist"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/30 hover:border-primary hover:text-primary"
      >
        <Plus size={16} />
      </button>
    </Link>
  );
}

export default CalendarItem;
