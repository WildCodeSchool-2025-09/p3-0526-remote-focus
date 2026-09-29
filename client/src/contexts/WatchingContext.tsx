import { createContext, type ReactNode } from "react";

interface WatchingContextType {
  watchedMediaIds: number[];
  isWatched: (mediaId: number) => boolean;
}

const WatchingContext = createContext<WatchingContextType | undefined>(
  undefined,
);

function WatchingProvider({ children }: { children: ReactNode }) {
  return children;
}

export { WatchingProvider };
