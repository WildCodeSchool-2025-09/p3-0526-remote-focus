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
