import { Check, Heart, Plus } from "lucide-react";
import type { Media } from "../../types/Catalog";
import { useWatch } from "../../contexts/WatchingContext";

interface MediaActionsProps {
  media: Media;
}

const buttonsClass = "min-h-0 h-7 w-7 btn-circle btn shadow-badge";

function MediaActions({ media }: MediaActionsProps) {
  const { isWatched, toggleWatchedMovie, toggleWatchedSeries } = useWatch();
  const isMediaWatched = isWatched(media.id);

  return (
    <div className="absolute top-2 right-2 flex flex-col gap-1">
      <button
        type="button"
        aria-label={`Ajouter ${media.name} aux favoris`}
        className={`${buttonsClass} btn-accent btn-outline bg-focus-void/70`}
      >
        <Heart size={14} />
      </button>
      <button
        type="button"
        aria-label={`Ajouter ${media.name} à la watchlist`}
        className={`${buttonsClass} btn-outline bg-focus-void/70`}
      >
        <Plus size={14} />
      </button>
      <button
        type="button"
        aria-label={
          isMediaWatched
            ? `Supprimer ${media.name} des médias vus`
            : `Ajouter ${media.name} aux médias vus`
        }
        className={
          isMediaWatched
            ? `${buttonsClass} btn-secondary bg-focus-teal`
            : `${buttonsClass} btn-secondary btn-outline bg-focus-void/70`
        }
        onClick={() => {
          if (media.type === "movie") {
            toggleWatchedMovie(media.id);
          } else if (media.type === "tv") {
            toggleWatchedSeries(media.id);
          }
        }}
      >
        <Check size={14} />
      </button>
    </div>
  );
}
export default MediaActions;
