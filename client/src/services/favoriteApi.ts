import type { ProfileActor, ProfileActorsPage } from "../types/ProfileActor";
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

type FetchActorsOptions = {
  page?: number;
  limit?: number;
};

async function getActorsPage<T>(
  path: string,
  token: string,
  { page = 1, limit = 6 }: FetchActorsOptions = {},
): Promise<T> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  const response = await fetch(`${API_URL}${path}?${params}`, {
    headers: getAuthHeaders(token),
  });

  if (response.status === 401) {
    throw new UnauthorizedError();
  }

  if (!response.ok) {
    throw new Error("Impossible de récupérer vos acteurs.");
  }

  return (await response.json()) as T;
}

export async function fetchFavoriteActors(
  token: string,
  options?: FetchActorsOptions,
): Promise<ProfileActorsPage> {
  return getActorsPage<ProfileActorsPage>(
    "/api/me/favorite-actors",
    token,
    options,
  );
}

export async function fetchMostWatchedActors(
  token: string,
  options?: FetchActorsOptions,
): Promise<ProfileActorsPage> {
  const { actors, pagination } = await getActorsPage<{
    actors: ProfileActor[];
    pagination: ProfileActorsPage["pagination"];
  }>("/api/me/actors/most-watched", token, options);

  return { data: actors, pagination };
}
