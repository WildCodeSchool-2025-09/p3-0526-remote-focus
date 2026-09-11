import type { SearchResults } from "../types/Search";
import type { User } from "../types/User";
import type {
  Actor,
  EpisodeDetail,
  FilmographyItem,
  Genre,
  Media,
  SeasonDetail,
  Series,
} from "../types/media";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3310";

export async function fetchMedia(id: number): Promise<Media> {
  const response = await fetch(`${API_URL}/api/medias/${id}`);

  if (!response.ok) {
    throw new Error(`Média ${id} introuvable`);
  }

  return response.json();
}

export async function fetchSeries(id: number): Promise<Series> {
  const response = await fetch(`${API_URL}/api/series/${id}`);

  if (!response.ok) {
    throw new Error(`Série ${id} introuvable`);
  }

  return response.json();
}

export async function fetchSeason(
  seriesId: number,
  seasonId: number,
): Promise<SeasonDetail> {
  const response = await fetch(
    `${API_URL}/api/series/${seriesId}/seasons/${seasonId}`,
  );

  if (!response.ok) {
    throw new Error(`Saison ${seasonId} introuvable`);
  }

  return response.json();
}

export async function fetchEpisode(
  seriesId: number,
  seasonId: number,
  episodeId: number,
): Promise<EpisodeDetail> {
  const response = await fetch(
    `${API_URL}/api/series/${seriesId}/seasons/${seasonId}/episodes/${episodeId}`,
  );

  if (!response.ok) {
    throw new Error(`Épisode ${episodeId} introuvable`);
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

export async function fetchActor(id: number): Promise<Actor> {
  const response = await fetch(`${API_URL}/api/actors/${id}`);

  if (!response.ok) {
    throw new Error(`Comédien ${id} introuvable`);
  }

  return response.json();
}

export async function fetchActorFilmography(
  actorId: number,
  sortOrder: "asc" | "desc" = "desc",
): Promise<FilmographyItem[]> {
  const response = await fetch(
    `${API_URL}/api/actors/${actorId}/filmography?sortBy=date-${sortOrder}`,
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

type AuthResponse = {
  user: User;
  token: string;
};

type RegisterPayload = {
  firstname: string;
  login: string;
  email: string;
  bornAt: string;
  password: string;
  confirmPassword: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

async function handleAuthResponse(response: Response): Promise<AuthResponse> {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof data?.error === "string" ? data.error : "Une erreur est survenue";
    throw new Error(message);
  }

  return data;
}

export async function registerUser(
  payload: RegisterPayload,
): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return handleAuthResponse(response);
}

export async function loginUser(payload: LoginPayload): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return handleAuthResponse(response);
}

export async function fetchGenres(): Promise<Genre[]> {
  const response = await fetch(`${API_URL}/api/genres`);

  if (!response.ok) {
    throw new Error("Impossible de récupérer les genres");
  }

  return response.json();
}

export async function saveGenrePreferences(
  genreIds: number[],
  token: string,
): Promise<void> {
  const response = await fetch(`${API_URL}/api/me/preferences`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ genreIds }),
  });

  if (!response.ok) {
    throw new Error("Impossible d'enregistrer vos préférences");
  }
}
