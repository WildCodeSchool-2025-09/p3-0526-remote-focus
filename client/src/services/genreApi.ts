import type { Genre } from "../types/Genre";

interface GenreListResponse {
  genreList: Genre[];
}

export async function fetchGenres(): Promise<Genre[]> {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/genres`);

  if (!response.ok) {
    throw new Error("Impossible de récupérer les genres.");
  }

  const data = (await response.json()) as GenreListResponse;

  return data.genreList;
}
