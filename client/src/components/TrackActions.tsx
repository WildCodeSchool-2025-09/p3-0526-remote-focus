import { Check, Heart, Minus, Plus, Star } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useTrackActions } from "../hooks/useTrackActions";
import ActionButton from "./ActionButton";
import AuthRequiredModal from "./AuthRequiredModal";
import { useState } from "react";
import RatingModal from "./RatingModal";

type TrackActionsProps = {
  mediaId: number;
  mediaName: string;
  showWatchlist?: boolean;
  showSeen?: boolean;
  showRating?: boolean;
  isSeen?: boolean;
  onSeenClick?: () => void;
};

function TrackActions({
  mediaId,
  mediaName,
  showWatchlist = false,
  showSeen = false,
  showRating = false,
  isSeen = false,
  onSeenClick,
}: TrackActionsProps) {
  const { isAuthenticated } = useAuth();
  const {
    isFavorite,
    isInWatchlist,
    handleFavorite,
    handleWatchlist,
    errorMessage,
    isAuthModalOpen,
    openAuthModal,
    closeAuthModal,
  } = useTrackActions(mediaId);

  function handleSeen() {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }

    onSeenClick?.();
  }

  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [rating, setRating] = useState(0);

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
          ariaLabel={isSeen ? "Retirer des médias vus" : "Marquer comme vu"}
          isPressed={isSeen}
          buttonClassName={
            isSeen
              ? "!border-focus-teal !bg-focus-teal !text-focus-void"
              : "!border-focus-teal text-focus-teal hover:!bg-focus-teal hover:!text-focus-void"
          }
          onClick={handleSeen}
        />
      )}

      {showRating && (
        <ActionButton
          label="Noter"
          icon={Star}
          buttonClassName="border-focus-yellow text-focus-yellow hover:border-focus-yellow hover:text-focus-void hover:bg-focus-yellow"
          fillIcon={rating > 0}
          onClick={() => setIsRatingModalOpen(true)}
        />
      )}
      <RatingModal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        rating={rating}
        setRating={setRating}
      />

      {errorMessage !== null && (
        <p role="alert" className="w-full text-sm text-focus-coral">
          {errorMessage}
        </p>
      )}

      <AuthRequiredModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
    </>
  );
}

export default TrackActions;
