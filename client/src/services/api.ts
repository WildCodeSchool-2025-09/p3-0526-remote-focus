import type {
  Episode,
  FilmographyItem,
  Media,
  SeasonDetail,
  Serie,
} from "../types/media";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3310";

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

export async function fetchSeason(id: number): Promise<SeasonDetail> {
  const response = await fetch(`${API_URL}/api/seasons/${id}`);

  if (!response.ok) {
    throw new Error(`Saison ${id} introuvable`);
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
