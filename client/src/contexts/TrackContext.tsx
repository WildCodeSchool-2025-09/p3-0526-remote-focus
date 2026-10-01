import { createContext, type ReactNode, useEffect, useState } from "react";
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
