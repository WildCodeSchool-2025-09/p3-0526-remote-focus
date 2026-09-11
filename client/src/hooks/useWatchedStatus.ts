import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import type { WatchedScope } from "../services/api";
import { toggleWatched } from "../services/api";

export function useWatchedStatus(
  scope: WatchedScope,
  id: number,
  initialIsWatched = false,
) {
  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [isWatched, setIsWatched] = useState(initialIsWatched);

  const handleToggleWatched = () => {
    if (!isAuthenticated || token == null) {
      navigate("/login");
      return;
    }

    const previous = isWatched;
    setIsWatched(!previous);

    toggleWatched(scope, id, token).catch(() => {
      setIsWatched(previous);
    });
  };

  return { isWatched, handleToggleWatched };
}
