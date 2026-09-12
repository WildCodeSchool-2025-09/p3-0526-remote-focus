import { Check, Heart, Plus } from "lucide-react";
import type { Media } from "../../types/Catalog";

interface MediaActionsProps {
  media: Media;
}

const buttonsClass =
  "min-h-0 h-9 w-9 btn-outline btn-circle btn bg-focus-void/50 shadow-badge";

function MediaActions({ media }: MediaActionsProps) {
  return (
    <>
      <div className="absolute top-2 right-2 flex flex-col gap-1">
        <button
          type="button"
          aria-label={`Ajouter ${media.name} aux favoris`}
          className={`${buttonsClass} btn-accent`}
        >
          <Heart size={16} />
        </button>
        <button
          type="button"
          aria-label={`Ajouter ${media.name} à la watchlist`}
          className={`${buttonsClass}`}
        >
          <Plus size={16} />
        </button>
        <button
          type="button"
          aria-label={`Ajouter ${media.name} aux médias vus`}
          className={`${buttonsClass} btn-secondary`}
        >
          <Check size={16} />
        </button>
      </div>
    </>
  );
}
export default MediaActions;
