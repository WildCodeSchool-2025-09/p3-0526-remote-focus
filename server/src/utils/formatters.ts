import type { Rows } from "../../database/client";

export function formatGenres(rows: Rows) {
  return rows.map((genre) => ({
    id: genre.ID,
    name: genre.name,
  }));
}

export function formatPlatforms(rows: Rows) {
  return rows.map((platform) => ({
    id: platform.ID,
    name: platform.name,
    logo: platform.logo,
    url: platform.url,
  }));
}

export function formatCast(rows: Rows) {
  return rows.map((person) => ({
    id: person.ID,
    name: person.name,
    photo: person.photo,
    characterName: person.personnage_name,
    role: person.role,
  }));
}

export function formatFilmography(rows: Rows) {
  return rows.map((media) => ({
    id: media.ID,
    tmdbId: media.tmdb_id,
    name: media.name,
    type: media.type,
    releasedAt: media.released_at,
    duration: media.duration,
    poster: media.poster,
    synopsis: media.synopsis,
    overallRating: media.overall_rating,
    status: media.status,
    originalName: media.original_name,
    originalLanguage: media.original_language,
    pegi: media.pegi,
    isAnime: media.is_anime,
    genreName: media.genre_name,
    characterName: media.personnage_name,
  }));
}

export function formatEpisodes(rows: Rows) {
  return rows.map((episode) => ({
    id: episode.ID,
    name: episode.name,
    number: episode.number,
    releasedAt: episode.released_at,
    synopsis: episode.synopsis,
    duration: episode.duration,
  }));
}
