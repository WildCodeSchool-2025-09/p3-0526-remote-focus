import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTracks } from "../contexts/TrackContext";
import { UnauthorizedError } from "../services/errors";
import { useActionError } from "./useActionError";

export function useTrackActions(mediaId: number) {
  const { isAuthenticated, logout } = useAuth();
  const { tracks, toggleFavorite, toggleWatchlist } = useTracks();
  const { errorMessage, showError } = useActionError();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const currentTrack = tracks.find((track) => track.mediaId === mediaId);

  const isFavorite = currentTrack?.isFavorite ?? false;
  const isInWatchlist = currentTrack?.isInWatchlist ?? false;

  async function runToggle(
    toggle: (mediaId: number) => Promise<void>,
    failureMessage: string,
  ) {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }

    try {
      await toggle(mediaId);
    } catch (error) {
      // Token refusé par le serveur : on ferme la session et on invite à se
      // reconnecter plutôt que d'échouer silencieusement.
      if (error instanceof UnauthorizedError) {
        logout();
        setIsAuthModalOpen(true);
        return;
      }

      showError(failureMessage);
    }
  }

  function handleFavorite() {
    return runToggle(
      toggleFavorite,
      isFavorite
        ? "Impossible de retirer ce média des favoris. Réessayez plus tard."
        : "Impossible d'ajouter ce média aux favoris. Réessayez plus tard.",
    );
  }

  function handleWatchlist() {
    return runToggle(
      toggleWatchlist,
      isInWatchlist
        ? "Impossible de retirer ce média de la watchlist. Réessayez plus tard."
        : "Impossible d'ajouter ce média à la watchlist. Réessayez plus tard.",
    );
  }

  function openAuthModal() {
    setIsAuthModalOpen(true);
  }

  function closeAuthModal() {
    setIsAuthModalOpen(false);
  }

  return {
    isFavorite,
    isInWatchlist,
    handleFavorite,
    handleWatchlist,
    errorMessage,
    isAuthModalOpen,
    openAuthModal,
    closeAuthModal,
  };
}
