import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import useFetch from "../hooks/useFetch";
import { API_URL } from "../services/api";

interface WatchingContextType {
  watchedMediaIds: number[];
  isWatched: (mediaId: number) => boolean;
}

const WatchingContext = createContext<WatchingContextType | undefined>(
  undefined,
);

function WatchingProvider({ children }: { children: ReactNode }) {
  const [watchedMediaIds, setWatchedMediaIds] = useState<number[]>([]);

  function isWatched(mediaId: number): boolean {
    return watchedMediaIds.includes(mediaId);
  }

  function toggleWatchedMedia(mediaId: number) {
    fetch(`${API_URL}/api/me/medias/${mediaId}/watched`, {
      method: "PATCH",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Erreur ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data.watched === true) {
          setWatchedMediaIds((ids) => {
            if (!ids.includes(mediaId)) {
              return [...ids, mediaId];
            }

            return ids;
          });
        } else {
          setWatchedMediaIds((ids) => ids.filter((id) => id !== mediaId));
        }
      });
  }

  const { data, loading, error } = useFetch<number[]>("/api/me/medias/watched");

  useEffect(() => {
    if (data) {
      setWatchedMediaIds(data);
    }
  }, [data]);

  return (
    <WatchingContext.Provider value={{ watchedMediaIds, isWatched }}>
      {children}
    </WatchingContext.Provider>
  );
}

const useWatch = () => {
  const watch = useContext(WatchingContext);
  if (watch == null) {
    throw new Error("useWatch has to be used within <WatchingProvider>");
  }
  return watch;
};

export { WatchingProvider, useWatch };
