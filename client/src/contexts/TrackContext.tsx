import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { fetchTracks, type TrackState } from "../services/trackApi";

type TrackContextValue = {
  tracks: TrackState[];
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

  return (
    <TrackContext.Provider value={{ tracks }}>{children}</TrackContext.Provider>
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
