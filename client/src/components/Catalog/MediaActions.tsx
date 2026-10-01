import { Check, Heart, Plus } from "lucide-react";
import type { Media } from "../../types/Catalog";
import { useTracks } from "../../contexts/TrackContext";

interface MediaActionsProps {
  media: Media;
}

const buttonsClass =
  "min-h-0 h-7 w-7 btn-outline btn-circle btn bg-focus-void/70 shadow-badge";

function MediaActions({ media }: MediaActionsProps) {
  const { tracks, toggleFavorite } = useTracks();

  const currentTrack = tracks.find((track) => track.mediaId === media.id);

  const isFavorite = currentTrack?.isFavorite ?? false;

  async function handleFavoriteClick() {
    try {
      await toggleFavorite(media.id);
    } catch (error) {
      console.error("Impossible de modifier le favori :", error);
    }
  }

  return (
    <div className="absolute top-2 right-2 flex flex-col gap-1">
      <button
        type="button"
        aria-label={
          isFavorite
            ? `Retirer ${media.name} des favoris`
            : `Ajouter ${media.name} aux favoris`
        }
        aria-pressed={isFavorite}
        className={`${buttonsClass} btn-accent`}
        onClick={handleFavoriteClick}
      >
        <Heart size={14} fill={isFavorite ? "currentColor" : "none"} />
      </button>
      <button
        type="button"
        aria-label={`Ajouter ${media.name} à la watchlist`}
        className={`${buttonsClass}`}
      >
        <Plus size={14} />
      </button>
      <button
        type="button"
        aria-label={`Ajouter ${media.name} aux médias vus`}
        className={`${buttonsClass} btn-secondary`}
      >
        <Check size={14} />
      </button>
    </div>
  );
}
export default MediaActions;
