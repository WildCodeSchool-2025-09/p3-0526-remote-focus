export type TrackState = {
  mediaId: number;
  isFavorite: boolean;
  isInWatchlist: boolean;
};
function getAuthHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
  };
}
const API_URL = import.meta.env.VITE_API_URL;

export async function fetchTracks(token: string): Promise<TrackState[]> {
  const response = await fetch(`${API_URL}/api/me/tracks`, {
    headers: getAuthHeaders(token),
  });

  if (!response.ok) {
    throw new Error("Impossible de récupérer vos favoris et votre watchlist.");
  }

  return (await response.json()) as TrackState[];
}

export async function toggleFavorite(
  mediaId: number,
  token: string,
): Promise<TrackState> {
  const response = await fetch(`${API_URL}/api/me/medias/${mediaId}/favorite`, {
    method: "PATCH",
    headers: getAuthHeaders(token),
  });

  if (!response.ok) {
    throw new Error("Impossible de modifier ce favori.");
  }

  return (await response.json()) as TrackState;
}

export async function toggleWatchlist(
  mediaId: number,
  token: string,
): Promise<TrackState> {
  const response = await fetch(
    `${API_URL}/api/me/medias/${mediaId}/watchlist`,
    {
      method: "PATCH",
      headers: getAuthHeaders(token),
    },
  );

  if (!response.ok) {
    throw new Error("Impossible de modifier la watchlist.");
  }

  return (await response.json()) as TrackState;
}
