import type { Episode, KnownForResponse, Media, Serie } from "../types/media";
import type { SearchResults } from "../types/search";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3310";

const searchMedias = async (
  query: string,
  page = 1,
  type?: string,
): Promise<SearchResults> => {
  const params = new URLSearchParams({ q: query, page: String(page) });

  if (type) {
    params.set("type", type);
  }

  const response = await fetch(`${API_URL}/api/medias/search?${params}`);

  if (!response.ok) {
    throw new Error("la recherche a échoué");
  }

  return response.json();
};

export async function fetchMedia(id: number): Promise<Media> {
  const response = await fetch(`${API_URL}/api/medias/${id}`);

  if (!response.ok) {
    throw new Error(`Média ${id} introuvable`);
  }

  return response.json();
}

export async function fetchSerie(id: number): Promise<Serie> {
  const response = await fetch(`${API_URL}/api/series/${id}`);

  if (!response.ok) {
    throw new Error(`Série ${id} introuvable`);
  }

  return response.json();
}

export async function fetchEpisodes(seasonId: number): Promise<Episode[]> {
  const response = await fetch(`${API_URL}/api/seasons/${seasonId}/episodes`);

  if (!response.ok) {
    throw new Error("Épisodes indisponibles");
  }

  return response.json();
}

export async function fetchFilmography(
  personId: number,
  excludeMediaId: number,
  page = 1,
): Promise<KnownForResponse> {
  const response = await fetch(
    `${API_URL}/api/actors/${personId}/known-for?exclude=${excludeMediaId}&page=${page}&user=1`,
  );

  if (!response.ok) {
    throw new Error("Filmographie indisponible");
  }

  return response.json();
}

export { searchMedias };
