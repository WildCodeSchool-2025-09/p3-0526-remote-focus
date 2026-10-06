import { useState } from "react";
import { useActorFavorites } from "../contexts/ActorFavoriteContext";
import { useAuth } from "../contexts/AuthContext";

export function useActorFavoriteActions(actorId: number) {
  const { isAuthenticated } = useAuth();
  const { favorites, toggleFavorite } = useActorFavorites();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const isFavorite = favorites.some((favorite) => favorite.actorId === actorId);

  async function handleFavorite() {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }

    try {
      await toggleFavorite(actorId);
    } catch (error) {
      console.error(
        isFavorite
          ? "Impossible de retirer l'acteur des favoris :"
          : "Impossible d'ajouter l'acteur aux favoris :",
        error,
      );
    }
  }

  function closeAuthModal() {
    setIsAuthModalOpen(false);
  }

  return {
    isFavorite,
    handleFavorite,
    isAuthModalOpen,
    closeAuthModal,
  };
}
