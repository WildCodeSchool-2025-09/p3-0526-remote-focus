import { useState } from "react";
import { useActorFavorites } from "../contexts/ActorFavoriteContext";
import { useAuth } from "../contexts/AuthContext";
import { UnauthorizedError } from "../services/errors";
import { useActionError } from "./useActionError";

export function useActorFavoriteActions(actorId: number) {
  const { isAuthenticated, logout } = useAuth();
  const { favorites, toggleFavorite } = useActorFavorites();
  const { errorMessage, showError } = useActionError();

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
      // Token refusé par le serveur : on ferme la session et on invite à se
      // reconnecter plutôt que d'échouer silencieusement.
      if (error instanceof UnauthorizedError) {
        logout();
        setIsAuthModalOpen(true);
        return;
      }

      showError(
        isFavorite
          ? "Impossible de retirer cet acteur des favoris. Réessayez plus tard."
          : "Impossible d'ajouter cet acteur aux favoris. Réessayez plus tard.",
      );
    }
  }

  function closeAuthModal() {
    setIsAuthModalOpen(false);
  }

  return {
    isFavorite,
    handleFavorite,
    errorMessage,
    isAuthModalOpen,
    closeAuthModal,
  };
}
