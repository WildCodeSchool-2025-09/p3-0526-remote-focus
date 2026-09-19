import type { RequestHandler } from "express";
import mediaRepository from "../media/mediaRepository";

const read: RequestHandler = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      res.sendStatus(400);
      return;
    }

    const serie = await mediaRepository.read(id);

    if (serie == null || serie.type !== "tv") {
      res.sendStatus(404);
      return;
    }

    const [genres, platforms, cast, castTotal, seasons, durations] =
      await Promise.all([
        mediaRepository.readGenres(id),
        mediaRepository.readPlatforms(id),
        mediaRepository.readCast(id),
        mediaRepository.countCast(id),
        mediaRepository.readSeasons(id),
        mediaRepository.readDurations(id),
      ]);

    res.json({
      id: serie.ID,
      name: serie.name,
      type: serie.type,
      isAnime: Boolean(serie.is_anime),
      originalName: serie.original_name,
      poster: serie.poster,
      synopsis: serie.synopsis,
      status: serie.status,
      releasedAt: serie.released_at,
      overallRating: serie.overall_rating,
      originalLanguage: serie.original_language,
      pegi: serie.pegi,
      totalDuration: durations.total_duration
        ? Number(durations.total_duration)
        : null,
      averageEpisodeDuration: durations.average_duration
        ? Math.round(Number(durations.average_duration))
        : null,
      episodeCount: Number(durations.episode_count),
      seasons: seasons.map((season) => ({
        id: season.ID,
        name: season.name,
        number: season.number,
        poster: season.poster,
        releasedAt: season.released_at,
        synopsis: season.synopsis,
        isFinished: Boolean(season.is_finished),
        episodeCount: Number(season.episode_count),
      })),
      genres: genres.map((genre) => ({
        id: genre.ID,
        name: genre.name,
      })),
      platforms: platforms.map((platform) => ({
        id: platform.ID,
        name: platform.name,
        logo: platform.logo,
        url: platform.url,
      })),
      cast: cast.map((person) => ({
        id: person.ID,
        name: person.name,
        photo: person.photo,
        characterName: person.personnage_name,
        role: person.role,
      })),
      castTotal,
      userStatus: null,
      userRating: null,
    });
  } catch (err) {
    next(err);
  }
};

export default { read };
