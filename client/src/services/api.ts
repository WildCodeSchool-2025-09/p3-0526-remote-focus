import type { MediaType } from "../types/Catalog";
import type { WatchlistResponse } from "../types/Watchlist";
import type { Actor, FilmographyPage } from "../types/media";
import type { SearchResults } from "../types/search";
import { getAuthHeaders } from "../utils/authStorage";

export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3310";

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

type FetchWatchlistOptions = {
  page?: number;
  type?: MediaType;
  seen?: boolean;
};

export async function fetchWatchlist({
  page = 1,
  type,
  seen,
}: FetchWatchlistOptions = {}): Promise<WatchlistResponse> {
  const params = new URLSearchParams({ page: String(page) });

  if (type) {
    params.set("type", type);
  }

  if (seen != null) {
    params.set("seen", String(seen));
  }

  const response = await fetch(`${API_URL}/api/me/watchlist?${params}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Watchlist indisponible");
  }

  return response.json();
}

export { searchMedias };
