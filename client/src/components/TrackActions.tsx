import { Check, Heart, Minus, Plus, Star } from "lucide-react";
import { useTrackActions } from "../hooks/useTrackActions";
import ActionButton from "./ActionButton";
import AuthRequiredModal from "./AuthRequiredModal";

type TrackActionsProps = {
  mediaId: number;
  mediaName: string;
  showWatchlist?: boolean;
  showSeen?: boolean;
  showRating?: boolean;
};

function TrackActions({
  mediaId,
  mediaName,
  showWatchlist = false,
  showSeen = false,
  showRating = false,
}: TrackActionsProps) {
  const {
    isFavorite,
    isInWatchlist,
    handleFavorite,
    handleWatchlist,
    isAuthModalOpen,
    closeAuthModal,
  } = useTrackActions(mediaId);

  return (
    <>
      <ActionButton
        label="Favoris"
        icon={Heart}
        ariaLabel={
          isFavorite
            ? `Retirer ${mediaName} des favoris`
            : `Ajouter ${mediaName} aux favoris`
        }
        isPressed={isFavorite}
        fillIcon={isFavorite}
        buttonClassName="btn-accent border-focus-coral text-focus-coral hover:!bg-focus-coral hover:!text-focus-cream"
        onClick={handleFavorite}
      />

      {showWatchlist && (
        <ActionButton
          label="Watchlist"
          icon={isInWatchlist ? Minus : Plus}
          ariaLabel={
            isInWatchlist
              ? `Retirer ${mediaName} de la watchlist`
              : `Ajouter ${mediaName} à la watchlist`
          }
          isPressed={isInWatchlist}
          buttonClassName={
            isInWatchlist
              ? "!border-focus-cream !bg-focus-cream !text-focus-void"
              : "!border-focus-cream !text-focus-cream hover:!bg-focus-cream hover:!text-focus-void"
          }
          onClick={handleWatchlist}
        />
      )}

      {showSeen && (
        <ActionButton
          label="Vu"
          icon={Check}
          buttonClassName="border-focus-teal text-focus-teal"
          disabled
        />
      )}

      {showRating && (
        <ActionButton
          label="Noter"
          icon={Star}
          buttonClassName="border-focus-yellow text-focus-yellow"
          disabled
        />
      )}

      <AuthRequiredModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
    </>
  );
}

export default TrackActions;
