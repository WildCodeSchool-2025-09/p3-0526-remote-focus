import { createContext, type ReactNode, useState } from "react";

import type { TrackState } from "../services/trackApi";

type TrackContextValue = {
  tracks: TrackState[];
};
type TrackProviderProps = {
  children: ReactNode;
};

export const TrackContext = createContext<TrackContextValue | null>(null);

export function TrackProvider({ children }: TrackProviderProps) {
  const [tracks] = useState<TrackState[]>([]);

  return (
    <TrackContext.Provider value={{ tracks }}>{children}</TrackContext.Provider>
  );
}
