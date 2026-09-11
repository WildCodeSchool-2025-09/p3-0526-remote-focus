import type { SearchResults } from "../types/Search";
import type { FilmographyItem, Media } from "../types/media";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3310";

export async function fetchMedia(id: number): Promise<Media> {
  const response = await fetch(`${API_URL}/api/medias/${id}`);

  if (!response.ok) {
    throw new Error(`Média ${id} introuvable`);
  }

  return response.json();
}

export async function fetchFilmography(
  personId: number,
  excludeMediaId: number,
): Promise<FilmographyItem[]> {
  const response = await fetch(
    `${API_URL}/api/actors/${personId}/filmography?exclude=${excludeMediaId}`,
  );

  if (!response.ok) {
    throw new Error("Filmographie indisponible");
  }

  return response.json();
}

export async function searchMedias(query: string): Promise<SearchResults> {
  const response = await fetch(
    `${API_URL}/api/medias/search?q=${encodeURIComponent(query)}`,
  );

  if (!response.ok) {
    throw new Error("la recherche a échoué");
  }

  return response.json();
}
