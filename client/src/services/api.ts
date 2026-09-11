import type { CatalogResponse, Format } from "../types/Catalog";
import type {
  DashboardData,
  MyActorsResponse,
  StatisticsData,
} from "../types/Profile";
import type {
  KnownForResponse,
  SearchResults,
  SearchSortBy,
  SearchSortOrder,
} from "../types/Search";
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

const PEGI_BLOCKED_MESSAGE =
  "Ce contenu est masqué par votre filtre PEGI 16+. Désactivez-le dans vos paramètres pour y accéder.";

function authHeaders(token?: string): HeadersInit {
  return token != null ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchMedia(id: number, token?: string): Promise<Media> {
  const response = await fetch(`${API_URL}/api/medias/${id}`, {
    headers: authHeaders(token),
  });

  if (response.status === 403) {
    throw new Error(PEGI_BLOCKED_MESSAGE);
  }

  if (!response.ok) {
    throw new Error(`Média ${id} introuvable`);
  }

  return response.json();
}

export async function fetchSeries(id: number, token?: string): Promise<Series> {
  const response = await fetch(`${API_URL}/api/series/${id}`, {
    headers: authHeaders(token),
  });

  if (response.status === 403) {
    throw new Error(PEGI_BLOCKED_MESSAGE);
  }

  if (!response.ok) {
    throw new Error(`Série ${id} introuvable`);
  }

  return response.json();
}

export async function fetchSeason(
  seriesId: number,
  seasonId: number,
  token?: string,
): Promise<SeasonDetail> {
  const response = await fetch(
    `${API_URL}/api/series/${seriesId}/seasons/${seasonId}`,
    { headers: authHeaders(token) },
  );

  if (response.status === 403) {
    throw new Error(PEGI_BLOCKED_MESSAGE);
  }

  if (!response.ok) {
    throw new Error(`Saison ${seasonId} introuvable`);
  }

  return response.json();
}

export async function fetchEpisode(
  seriesId: number,
  seasonId: number,
  episodeId: number,
  token?: string,
): Promise<EpisodeDetail> {
  const response = await fetch(
    `${API_URL}/api/series/${seriesId}/seasons/${seasonId}/episodes/${episodeId}`,
    { headers: authHeaders(token) },
  );

  if (response.status === 403) {
    throw new Error(PEGI_BLOCKED_MESSAGE);
  }

  if (!response.ok) {
    throw new Error(`Épisode ${episodeId} introuvable`);
  }

  return response.json();
}

export async function fetchActor(id: number, token?: string): Promise<Actor> {
  const response = await fetch(`${API_URL}/api/actors/${id}`, {
    headers: authHeaders(token),
  });

  if (!response.ok) {
    throw new Error(`Comédien ${id} introuvable`);
  }

  return response.json();
}

export async function toggleActorFavorite(
  personId: number,
  token: string,
): Promise<{ isFavorite: boolean }> {
  const response = await fetch(
    `${API_URL}/api/me/actors/${personId}/favorite`,
    {
      method: "PATCH",
      headers: authHeaders(token),
    },
  );

  if (!response.ok) {
    throw new Error("Impossible de mettre à jour les favoris");
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

export async function searchMedias(
  query: string,
  token?: string,
  sortBy?: SearchSortBy,
  sortOrder?: SearchSortOrder,
): Promise<SearchResults> {
  const params = new URLSearchParams({ q: query });
  if (sortBy != null) {
    params.set("sortBy", sortBy);
  }
  if (sortOrder != null) {
    params.set("sortOrder", sortOrder);
  }

  const response = await fetch(
    `${API_URL}/api/medias/search?${params.toString()}`,
    { headers: authHeaders(token) },
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

export async function toggleFavorite(
  mediaId: number,
  token: string,
): Promise<{ isFavorite: boolean }> {
  const response = await fetch(`${API_URL}/api/me/medias/${mediaId}/favorite`, {
    method: "PATCH",
    headers: authHeaders(token),
  });

  if (!response.ok) {
    throw new Error("Impossible de mettre à jour les favoris");
  }

  return response.json();
}

export async function toggleWatchlist(
  mediaId: number,
  token: string,
): Promise<{ isInWatchlist: boolean }> {
  const response = await fetch(
    `${API_URL}/api/me/medias/${mediaId}/watchlist`,
    {
      method: "PATCH",
      headers: authHeaders(token),
    },
  );

  if (!response.ok) {
    throw new Error("Impossible de mettre à jour la watchlist");
  }

  return response.json();
}

export type WatchedScope = "movie" | "series" | "season" | "episode";

const WATCHED_PATH: Record<WatchedScope, (id: number) => string> = {
  movie: (id) => `/api/me/medias/${id}/watched`,
  series: (id) => `/api/me/series/${id}/watched`,
  season: (id) => `/api/me/seasons/${id}/watched`,
  episode: (id) => `/api/me/episodes/${id}/watched`,
};

export async function toggleWatched(
  scope: WatchedScope,
  id: number,
  token: string,
): Promise<{ isWatched: boolean }> {
  const response = await fetch(`${API_URL}${WATCHED_PATH[scope](id)}`, {
    method: "PATCH",
    headers: authHeaders(token),
  });

  if (!response.ok) {
    throw new Error("Impossible de mettre à jour le statut vu");
  }

  return response.json();
}

export type RatingScope = "movie" | "series";

const RATING_PATH: Record<RatingScope, (id: number) => string> = {
  movie: (id) => `/api/me/medias/${id}/rating`,
  series: (id) => `/api/me/series/${id}/rating`,
};

export async function rateMedia(
  scope: RatingScope,
  id: number,
  rating: number | null,
  token: string,
): Promise<{ userRating: number | null }> {
  const response = await fetch(`${API_URL}${RATING_PATH[scope](id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify({ rating }),
  });

  if (response.status === 403) {
    throw new Error("Vous devez avoir vu ce média pour pouvoir le noter.");
  }

  if (!response.ok) {
    throw new Error("Impossible d'enregistrer votre note");
  }

  return response.json();
}

export async function fetchDashboard(token: string): Promise<DashboardData> {
  const response = await fetch(`${API_URL}/api/me/dashboard`, {
    headers: authHeaders(token),
  });

  if (!response.ok) {
    throw new Error("Impossible de récupérer votre tableau de bord");
  }

  return response.json();
}

export async function fetchStatistics(token: string): Promise<StatisticsData> {
  const response = await fetch(`${API_URL}/api/me/statistics`, {
    headers: authHeaders(token),
  });

  if (!response.ok) {
    throw new Error("Impossible de récupérer vos statistiques");
  }

  return response.json();
}

export async function fetchMyActors(
  token: string,
  page: number,
  limit: number,
): Promise<MyActorsResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  const response = await fetch(
    `${API_URL}/api/me/actors?${params.toString()}`,
    {
      headers: authHeaders(token),
    },
  );

  if (!response.ok) {
    throw new Error("Impossible de récupérer vos acteurs");
  }

  return response.json();
}

export type WatchedListFilter = "watched" | "to-watch" | null;

export async function fetchFavorites(
  token: string,
  type: Format,
  page: number,
  limit: number,
): Promise<CatalogResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (type != null) {
    params.set("type", type);
  }

  const response = await fetch(
    `${API_URL}/api/me/favorites?${params.toString()}`,
    { headers: authHeaders(token) },
  );

  if (!response.ok) {
    throw new Error("Impossible de récupérer vos favoris");
  }

  return response.json();
}

export async function fetchInProgress(
  token: string,
  type: Format,
  page: number,
  limit: number,
): Promise<CatalogResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (type != null) {
    params.set("type", type);
  }

  const response = await fetch(
    `${API_URL}/api/me/in-progress?${params.toString()}`,
    { headers: authHeaders(token) },
  );

  if (!response.ok) {
    throw new Error("Impossible de récupérer vos médias en cours");
  }

  return response.json();
}

export async function fetchWatchlist(
  token: string,
  type: Format,
  watched: WatchedListFilter,
  page: number,
  limit: number,
): Promise<CatalogResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (type != null) {
    params.set("type", type);
  }
  if (watched != null) {
    params.set("watched", watched);
  }

  const response = await fetch(
    `${API_URL}/api/me/watchlist?${params.toString()}`,
    { headers: authHeaders(token) },
  );

  if (!response.ok) {
    throw new Error("Impossible de récupérer votre watchlist");
  }

  return response.json();
}

async function extractErrorMessage(
  response: Response,
  fallback: string,
): Promise<string> {
  const data = await response.json().catch(() => null);
  return typeof data?.error === "string" ? data.error : fallback;
}

export async function updateLogin(login: string, token: string): Promise<User> {
  const response = await fetch(`${API_URL}/api/me/login`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify({ login }),
  });

  if (!response.ok) {
    throw new Error(
      await extractErrorMessage(response, "Impossible de modifier le pseudo"),
    );
  }

  return response.json();
}

export async function updateEmail(email: string, token: string): Promise<User> {
  const response = await fetch(`${API_URL}/api/me/email`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    throw new Error(
      await extractErrorMessage(response, "Impossible de modifier l'email"),
    );
  }

  return response.json();
}

export async function updatePassword(
  payload: {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
  },
  token: string,
): Promise<void> {
  const response = await fetch(`${API_URL}/api/me/password`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(
      await extractErrorMessage(
        response,
        "Impossible de modifier le mot de passe",
      ),
    );
  }
}

export async function updatePegiFilter(
  isPegi16: boolean,
  token: string,
): Promise<User> {
  const response = await fetch(`${API_URL}/api/me/pegi-filter`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify({ isPegi16 }),
  });

  if (!response.ok) {
    throw new Error(
      await extractErrorMessage(
        response,
        "Impossible de mettre à jour le filtre PEGI",
      ),
    );
  }

  return response.json();
}

export async function updateTheme(
  darkTheme: boolean,
  token: string,
): Promise<User> {
  const response = await fetch(`${API_URL}/api/me/theme`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify({ darkTheme }),
  });

  if (!response.ok) {
    throw new Error(
      await extractErrorMessage(
        response,
        "Impossible de mettre à jour le thème",
      ),
    );
  }

  return response.json();
}

export async function uploadAvatar(file: File, token: string): Promise<User> {
  const formData = new FormData();
  formData.append("avatar", file);

  const response = await fetch(`${API_URL}/api/me/avatar`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: formData,
  });

  if (!response.ok) {
    throw new Error(
      await extractErrorMessage(response, "Impossible de changer la photo"),
    );
  }

  return response.json();
}

export async function fetchKnownFor(
  personId: number,
  excludeMediaId: number,
  page: number,
  token?: string,
): Promise<KnownForResponse> {
  const params = new URLSearchParams({
    excludeMediaId: String(excludeMediaId),
    page: String(page),
  });

  const headers: HeadersInit = {};
  if (token != null) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_URL}/api/persons/${personId}/known-for?${params.toString()}`,
    { headers },
  );

  if (!response.ok) {
    throw new Error("Impossible de récupérer ce contenu");
  }

  return response.json();
}
