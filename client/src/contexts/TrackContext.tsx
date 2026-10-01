import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  fetchTracks,
  toggleFavorite as toggleFavoriteApi,
  toggleWatchlist as toggleWatchlistApi,
  type TrackState,
} from "../services/trackApi";

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
  const [tracks, setTracks] = useState<TrackState[]>([]);

  useEffect(() => {
    fetchTracks()
      .then((data) => {
        setTracks(data);
      })
      .catch(() => {
        setTracks([]);
      });
  }, []);

  async function toggleFavorite(mediaId: number) {
    const updatedTrack = await toggleFavoriteApi(mediaId);

    setTracks((currentTracks) => [
      ...currentTracks.filter((track) => track.mediaId !== mediaId),
      updatedTrack,
    ]);
  }
  async function toggleWatchlist(mediaId: number) {
    const updatedTrack = await toggleWatchlistApi(mediaId);

    setTracks((currentTracks) => [
      ...currentTracks.filter((track) => track.mediaId !== mediaId),
      updatedTrack,
    ]);
  }

  return (
    <TrackContext.Provider value={{ tracks, toggleFavorite }}>
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
