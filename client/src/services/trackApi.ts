export type TrackState = {
  mediaId: number;
  isFavorite: boolean;
  isInWatchlist: boolean;
};

const API_URL = import.meta.env.VITE_API_URL;

export async function fetchTracks(): Promise<TrackState[]> {
  const response = await fetch(`${API_URL}/api/me/tracks`);

  if (!response.ok) {
    throw new Error("Impossible de récupérer vos favoris et votre watchlist.");
  }

  return (await response.json()) as TrackState[];
}

export async function toggleFavorite(mediaId: number): Promise<TrackState> {
  const response = await fetch(`${API_URL}/api/me/medias/${mediaId}/favorite`, {
    method: "PATCH",
  });

  if (!response.ok) {
    throw new Error("Impossible de modifier ce favori.");
  }

  return (await response.json()) as TrackState;
}

export async function toggleWatchlist(mediaId: number): Promise<TrackState> {
  const response = await fetch(
    `${API_URL}/api/me/medias/${mediaId}/watchlist`,
    {
      method: "PATCH",
    },
  );

  if (!response.ok) {
    throw new Error("Impossible de modifier la watchlist.");
  }

  return (await response.json()) as TrackState;
}
