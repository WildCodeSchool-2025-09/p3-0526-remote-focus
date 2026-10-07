import type { MediaType } from "../types/Catalog";
import type {
  TrackedList,
  TrackedMediaResponse,
  WatchStatus,
} from "../types/Tracked";
import type { Actor, FilmographyPage } from "../types/media";
import type { SearchResults } from "../types/search";
import { getAuthHeaders } from "../utils/authStorage";

export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3310";

const TRACKED_PATHS: Record<TrackedList, string> = {
  favorite: "/api/me/favorites",
  watchlist: "/api/me/watchlist",
};

const searchMedias = async (
  query: string,
  page = 1,
  type?: string,
  genre?: string,
): Promise<SearchResults> => {
  const params = new URLSearchParams({ q: query, page: String(page) });

  if (type) {
    params.set("type", type);
  }

  if (genre) {
    params.set("genre", genre);
  }

  const response = await fetch(`${API_URL}/api/medias/search?${params}`);

  if (!response.ok) {
    throw new Error("la recherche a échoué");
  }

  return response.json();
};

export async function fetchActor(id: number): Promise<Actor> {
  const response = await fetch(`${API_URL}/api/actors/${id}`);

  if (!response.ok) {
    throw new Error(`Comédien ${id} introuvable`);
  }

  return response.json();
}

type FetchFilmographyOptions = {
  page?: number;
  excludeMediaId?: number;
};

export async function fetchFilmography(
  personId: number,
  { page = 1, excludeMediaId }: FetchFilmographyOptions = {},
): Promise<FilmographyPage> {
  const params = new URLSearchParams({ page: String(page) });

  if (excludeMediaId != null) {
    params.set("exclude", String(excludeMediaId));
  }

  const response = await fetch(
    `${API_URL}/api/actors/${personId}/filmography?${params}`,
  );

  if (!response.ok) {
    throw new Error("Filmographie indisponible");
  }

  return response.json();
}

type FetchTrackedMediasOptions = {
  page?: number;
  type?: MediaType;
  seen?: boolean;
};

export async function fetchTrackedMedias(
  list: TrackedList,
  { page = 1, type, seen }: FetchTrackedMediasOptions = {},
): Promise<TrackedMediaResponse> {
  const params = new URLSearchParams({ page: String(page) });

  if (type) {
    params.set("type", type);
  }

  if (seen != null) {
    params.set("seen", String(seen));
  }

  const response = await fetch(`${API_URL}${TRACKED_PATHS[list]}?${params}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Liste indisponible");
  }

  return response.json();
}

export function toSeenParam(status: WatchStatus): boolean | undefined {
  if (status === "seen") {
    return true;
  }
  if (status === "toWatch") {
    return false;
  }
  return undefined;
}

export { searchMedias };
