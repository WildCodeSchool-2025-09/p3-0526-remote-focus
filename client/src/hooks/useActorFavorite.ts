import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { toggleActorFavorite } from "../services/api";

export function useActorFavorite(personId: number, initialIsFavorite = false) {
  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);

  const handleToggleFavorite = () => {
    if (!isAuthenticated || token == null) {
      navigate("/login");
      return;
    }

    const previous = isFavorite;
    setIsFavorite(!previous);

    toggleActorFavorite(personId, token).catch(() => {
      setIsFavorite(previous);
    });
  };

  return { isFavorite, handleToggleFavorite };
}
