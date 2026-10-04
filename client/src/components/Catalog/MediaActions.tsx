import { Check, Heart, Minus, Plus } from "lucide-react";
import type { MouseEvent } from "react";
import { useTrackActions } from "../../hooks/useTrackActions";
import type { Media } from "../../types/Catalog";
import AuthRequiredModal from "../AuthRequiredModal";

interface MediaActionsProps {
  media: Media;
}

const buttonsClass =
  "min-h-0 h-7 w-7 btn-outline btn-circle btn bg-focus-void/70 shadow-badge";

function MediaActions({ media }: MediaActionsProps) {
  const {
    isFavorite,
    isInWatchlist,
    handleFavorite,
    handleWatchlist,
    isAuthModalOpen,
    closeAuthModal,
  } = useTrackActions(media.id);

  function handleFavoriteClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    handleFavorite();
  }

  function handleWatchlistClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    handleWatchlist();
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
        aria-label={
          isInWatchlist
            ? `Retirer ${media.name} de la watchlist`
            : `Ajouter ${media.name} à la watchlist`
        }
        aria-pressed={isInWatchlist}
        className={`${buttonsClass} ${
          isInWatchlist
            ? "!border-focus-cream !bg-focus-cream !text-focus-void"
            : ""
        }`}
        onClick={handleWatchlistClick}
      >
        {isInWatchlist ? <Minus size={14} /> : <Plus size={14} />}
      </button>

      <button
        type="button"
        aria-label={`Ajouter ${media.name} aux médias vus`}
        className={`${buttonsClass} btn-secondary`}
      >
        <Check size={14} />
      </button>

      <AuthRequiredModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
    </div>
  );
}

export default MediaActions;
