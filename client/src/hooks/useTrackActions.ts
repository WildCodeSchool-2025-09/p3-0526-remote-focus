import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTracks } from "../contexts/TrackContext";

export function useTrackActions(mediaId: number) {
  const { isAuthenticated } = useAuth();
  const { tracks, toggleFavorite, toggleWatchlist } = useTracks();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const currentTrack = tracks.find((track) => track.mediaId === mediaId);

  const isFavorite = currentTrack?.isFavorite ?? false;
  const isInWatchlist = currentTrack?.isInWatchlist ?? false;

  async function handleFavorite() {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }

    try {
      await toggleFavorite(mediaId);
    } catch (error) {
      console.error(
        isFavorite
          ? "Impossible de retirer le média des favoris :"
          : "Impossible d'ajouter le média aux favoris :",
        error,
      );
    }
  }

  async function handleWatchlist() {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }

    try {
      await toggleWatchlist(mediaId);
    } catch (error) {
      console.error(
        isInWatchlist
          ? "Impossible de retirer le média de la watchlist :"
          : "Impossible d'ajouter le média à la watchlist :",
        error,
      );
    }
  }

  function closeAuthModal() {
    setIsAuthModalOpen(false);
  }

  return {
    isFavorite,
    isInWatchlist,
    handleFavorite,
    handleWatchlist,
    isAuthModalOpen,
    closeAuthModal,
  };
}
