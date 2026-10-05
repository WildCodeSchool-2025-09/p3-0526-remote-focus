import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import useFetch from "../hooks/useFetch";
import { API_URL } from "../services/api";
import { useAuth } from "./AuthContext";

interface WatchResponse {
  watched: boolean;
  episodeIds: number[];
}

interface SimpleWatchResponse {
  watched: boolean;
}

interface EnrichedWatchResponse {
  watched: boolean;
  mediaId: number;
  seriesFullyWatched: boolean;
}

interface WatchingContextType {
  watchedMediaIds: number[];
  isWatched: (mediaId: number) => boolean;
  isEpisodeWatched: (episodeId: number) => boolean;
  toggleWatchedMovie: (mediaId: number) => Promise<void>;
  toggleWatchedSeries: (seriesId: number) => Promise<WatchResponse>;
  toggleWatchedSeason: (
    seasonId: number,
    episodeIds: number[],
  ) => Promise<void>;
  toggleWatchedEpisode: (episodeId: number) => Promise<void>;
  watchError: string | null;
}

const WatchingContext = createContext<WatchingContextType | undefined>(
  undefined,
);

function WatchingProvider({ children }: { children: ReactNode }) {
  const [watchError, setWatchError] = useState<string | null>(null);
  const { token } = useAuth();
  const headers: HeadersInit = {};

  if (token !== null) {
    headers.Authorization = `Bearer ${token}`;
  }
  const [watchedMediaIds, setWatchedMediaIds] = useState<number[]>([]);
  const [watchedEpisodeIds, setWatchedEpisodeIds] = useState<number[]>([]);

  function isWatched(mediaId: number): boolean {
    return watchedMediaIds.includes(mediaId);
  }

  function isEpisodeWatched(episodeId: number): boolean {
    return watchedEpisodeIds.includes(episodeId);
  }

  function toggleWatchedMovie(mediaId: number) {
    return fetch(`${API_URL}/api/me/medias/${mediaId}/watched`, {
      method: "PATCH",
      headers,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Erreur ${response.status}`);
        }
        return response.json() as Promise<SimpleWatchResponse>;
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
      })
      .catch(() => {
        setWatchError("Impossible de modifier le statut du média.");
      });
  }

  function toggleWatchedSeries(seriesId: number) {
    return fetch(`${API_URL}/api/me/series/${seriesId}/watched`, {
      method: "PATCH",
      headers,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Erreur ${response.status}`);
        }
        return response.json() as Promise<WatchResponse>;
      })
      .then((data) => {
        if (data.watched === true) {
          setWatchedMediaIds((ids) => {
            if (!ids.includes(seriesId)) {
              return [...ids, seriesId];
            }
            return ids;
          });
          setWatchedEpisodeIds((ids) => {
            return [...new Set([...ids, ...data.episodeIds])];
          });
        } else {
          setWatchedMediaIds((ids) => ids.filter((id) => id !== seriesId));
          setWatchedEpisodeIds((ids) =>
            ids.filter((id) => !data.episodeIds.includes(id)),
          );
        }
        return data;
      })
      .catch((error) => {
        setWatchError("Impossible de modifier le statut de la série.");
        throw error;
      });
  }

  function toggleWatchedSeason(seasonId: number, episodeIds: number[]) {
    return fetch(`${API_URL}/api/me/seasons/${seasonId}/watched`, {
      method: "PATCH",
      headers,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Erreur ${response.status}`);
        }
        return response.json() as Promise<EnrichedWatchResponse>;
      })
      .then((data) => {
        const mediaId = data.mediaId;
        if (data.watched === true) {
          setWatchedEpisodeIds((ids) => {
            return [...new Set([...ids, ...episodeIds])];
          });
        } else {
          setWatchedEpisodeIds((ids) =>
            ids.filter((id) => !episodeIds.includes(id)),
          );
        }
        if (data.seriesFullyWatched === true) {
          setWatchedMediaIds((ids) => {
            if (!ids.includes(mediaId)) {
              return [...ids, mediaId];
            }
            return ids;
          });
        } else {
          setWatchedMediaIds((ids) => ids.filter((id) => id !== mediaId));
        }
      })
      .catch((error) => {
        setWatchError("Impossible de modifier le statut de la saison.");
        throw error;
      });
  }

  function toggleWatchedEpisode(episodeId: number) {
    const wasWatched = isEpisodeWatched(episodeId);
    !wasWatched
      ? setWatchedEpisodeIds((ids) => {
          return [...ids, episodeId];
        })
      : setWatchedEpisodeIds((ids) => ids.filter((id) => id !== episodeId));
    return fetch(`${API_URL}/api/me/episodes/${episodeId}/watched`, {
      method: "PATCH",
      headers,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Erreur ${response.status}`);
        }
        return response.json() as Promise<EnrichedWatchResponse>;
      })
      .then((data) => {
        const mediaId = data.mediaId;
        if (data.seriesFullyWatched === true) {
          setWatchedMediaIds((ids) => {
            if (!ids.includes(mediaId)) {
              return [...ids, mediaId];
            }
            return ids;
          });
        } else {
          setWatchedMediaIds((ids) => ids.filter((id) => id !== mediaId));
        }
      })
      .catch((error) => {
        setWatchError("Impossible de modifier le statut de l'épisode.");
        if (wasWatched) {
          setWatchedEpisodeIds((ids) => {
            return [...ids, episodeId];
          });
        } else {
          setWatchedEpisodeIds((ids) => ids.filter((id) => id !== episodeId));
        }
        throw error;
      });
  }

  const {
    data: watchedMediaIdsData,
    // loading: mediaLoading,
    // error: mediaError,
  } = useFetch<number[]>(token ? "/api/me/medias/watched" : null);

  const {
    data: watchedEpisodeIdsData,
    // loading: episodeLoading,
    // error: episodeError,
  } = useFetch<number[]>(token ? "/api/me/episodes/watched" : null);

  useEffect(() => {
    if (token === null) {
      setWatchedMediaIds([]);
      setWatchedEpisodeIds([]);
      return;
    }

    if (watchedMediaIdsData) {
      setWatchedMediaIds(watchedMediaIdsData);
    }

    if (watchedEpisodeIdsData) {
      setWatchedEpisodeIds(watchedEpisodeIdsData);
    }
  }, [watchedMediaIdsData, watchedEpisodeIdsData, token]);
  useEffect(() => {
    if (watchError === null) {
      return;
    }

    const timeout = setTimeout(() => {
      setWatchError(null);
    }, 3000);

    return () => clearTimeout(timeout);
  }, [watchError]);
  return (
    <WatchingContext.Provider
      value={{
        watchedMediaIds,
        isWatched,
        isEpisodeWatched,
        toggleWatchedMovie,
        toggleWatchedSeries,
        toggleWatchedSeason,
        toggleWatchedEpisode,
        watchError,
      }}
    >
      {watchError !== null && (
        <p className="fixed bottom-4 right-4 z-50 rounded bg-focus-coral px-4 py-2 text-white">
          {watchError}
        </p>
      )}
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
