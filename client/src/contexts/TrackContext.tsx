import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { UnauthorizedError } from "../services/errors";
import {
  type TrackState,
  fetchTracks,
  toggleFavorite as toggleFavoriteApi,
  toggleWatchlist as toggleWatchlistApi,
} from "../services/trackApi";
import { useAuth } from "./AuthContext";

type TrackContextValue = {
  tracks: TrackState[];
  toggleFavorite: (mediaId: number) => Promise<void>;
  toggleWatchlist: (mediaId: number) => Promise<void>;
};

type TrackProviderProps = {
  children: ReactNode;
};

export const TrackContext = createContext<TrackContextValue | null>(null);

export function TrackProvider({ children }: TrackProviderProps) {
  const { token, isAuthenticated, logout } = useAuth();
  const [tracks, setTracks] = useState<TrackState[]>([]);

  useEffect(() => {
    if (!isAuthenticated || token === null) {
      setTracks([]);
      return;
    }

    fetchTracks(token)
      .then((data) => {
        setTracks(data);
      })
      .catch((error) => {
        setTracks([]);

        // Le serveur refuse le token : la session n'est plus valable.
        if (error instanceof UnauthorizedError) {
          logout();
        }
      });
  }, [isAuthenticated, token, logout]);

  async function toggleFavorite(mediaId: number) {
    if (token === null) {
      throw new Error("Vous devez être connecté.");
    }

    const updatedTrack = await toggleFavoriteApi(mediaId, token);

    setTracks((currentTracks) => [
      ...currentTracks.filter((track) => track.mediaId !== mediaId),
      updatedTrack,
    ]);
  }
  async function toggleWatchlist(mediaId: number) {
    if (token === null) {
      throw new Error("Vous devez être connecté.");
    }

    const updatedTrack = await toggleWatchlistApi(mediaId, token);

    setTracks((currentTracks) => [
      ...currentTracks.filter((track) => track.mediaId !== mediaId),
      updatedTrack,
    ]);
  }

  return (
    <TrackContext.Provider value={{ tracks, toggleFavorite, toggleWatchlist }}>
      {children}
    </TrackContext.Provider>
  );
}

export function useTracks() {
  const context = useContext(TrackContext);

  if (context === null) {
    throw new Error(
      "useTracks doit être utilisé à l'intérieur du TrackProvider",
    );
  }
  return context;
}
