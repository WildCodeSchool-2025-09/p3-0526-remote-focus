import { UnauthorizedError } from "./errors";

export type ActorFavoriteState = {
  actorId: number;
  isFavorite: boolean;
};

const API_URL = import.meta.env.VITE_API_URL;

function getAuthHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchActorFavorites(
  token: string,
): Promise<ActorFavoriteState[]> {
  const response = await fetch(`${API_URL}/api/me/actors/favorites`, {
    headers: getAuthHeaders(token),
  });

  if (response.status === 401) {
    throw new UnauthorizedError();
  }

  if (!response.ok) {
    throw new Error("Impossible de récupérer vos acteurs favoris.");
  }

  return (await response.json()) as ActorFavoriteState[];
}

export async function toggleActorFavorite(
  actorId: number,
  token: string,
): Promise<ActorFavoriteState> {
  const response = await fetch(`${API_URL}/api/me/actors/${actorId}/favorite`, {
    method: "PATCH",
    headers: getAuthHeaders(token),
  });

  if (response.status === 401) {
    throw new UnauthorizedError();
  }

  if (!response.ok) {
    throw new Error("Impossible de modifier ce favori.");
  }

  return (await response.json()) as ActorFavoriteState;
}
