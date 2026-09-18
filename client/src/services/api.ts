import type { FilmographyItem, Media, PersonDetail } from "../types/media";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3310";

export async function fetchMedia(id: number): Promise<Media> {
  const response = await fetch(`${API_URL}/api/medias/${id}`);

  if (!response.ok) {
    throw new Error(`Média ${id} introuvable`);
  }

  return response.json();
}

export async function fetchPerson(id: number): Promise<PersonDetail> {
  const response = await fetch(`${API_URL}/api/actors/${id}`);

  if (!response.ok) {
    throw new Error(`Comédien ${id} introuvable`);
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
