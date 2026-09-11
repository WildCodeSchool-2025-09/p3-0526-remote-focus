import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { toggleFavorite, toggleWatchlist } from "../services/api";

export function useMediaTrack(
  mediaId: number,
  initialIsFavorite = false,
  initialIsInWatchlist = false,
) {
  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isInWatchlist, setIsInWatchlist] = useState(initialIsInWatchlist);

  const handleToggleFavorite = () => {
    if (!isAuthenticated || token == null) {
      navigate("/login");
      return;
    }

    const previous = isFavorite;
    setIsFavorite(!previous);

    toggleFavorite(mediaId, token).catch(() => {
      setIsFavorite(previous);
    });
  };

  const handleToggleWatchlist = () => {
    if (!isAuthenticated || token == null) {
      navigate("/login");
      return;
    }

    const previous = isInWatchlist;
    setIsInWatchlist(!previous);

    toggleWatchlist(mediaId, token).catch(() => {
      setIsInWatchlist(previous);
    });
  };

  return {
    isFavorite,
    isInWatchlist,
    handleToggleFavorite,
    handleToggleWatchlist,
  };
}
