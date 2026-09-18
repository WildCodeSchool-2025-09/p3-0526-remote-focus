import type { RequestHandler } from "express";
import mediaRepository from "../media/mediaRepository";

const readEpisodes: RequestHandler = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      res.sendStatus(400);
      return;
    }

    const episodes = await mediaRepository.readEpisodes(id);

    res.json(
      episodes.map((episode) => ({
        id: episode.ID,
        name: episode.name,
        number: episode.number,
        releasedAt: episode.released_at,
        synopsis: episode.synopsis,
        duration: episode.duration,
      })),
    );
  } catch (err) {
    next(err);
  }
};

const read: RequestHandler = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      res.sendStatus(400);
      return;
    }

    const season = await mediaRepository.readSeason(id);

    if (season == null) {
      res.sendStatus(404);
      return;
    }

    const [episodes, cast, duration] = await Promise.all([
      mediaRepository.readEpisodes(id),
      mediaRepository.readSeasonCast(id),
      mediaRepository.readSeasonDuration(id),
    ]);

    res.json({
      id: season.ID,
      name: season.name,
      number: season.number,
      poster: season.poster ?? season.media_poster,
      hasOwnPoster: season.poster != null,
      synopsis: season.synopsis,
      releasedAt: season.released_at,
      isFinished: Boolean(season.is_finished),
      totalDuration: duration.total_duration
        ? Number(duration.total_duration)
        : null,
      episodeCount: Number(duration.episode_count),
      serie: {
        id: season.ID_media,
        name: season.media_name,
        poster: season.media_poster,
        originalLanguage: season.original_language,
        isAnime: Boolean(season.is_anime),
      },
      episodes: episodes.map((episode) => ({
        id: episode.ID,
        name: episode.name,
        number: episode.number,
        releasedAt: episode.released_at,
        synopsis: episode.synopsis,
        duration: episode.duration,
      })),
      cast: cast.map((person) => ({
        id: person.ID,
        name: person.name,
        photo: person.photo,
        characterName: person.personnage_name,
        role: person.role,
      })),
      userStatus: null,
      userRating: null,
    });
  } catch (err) {
    next(err);
  }
};

export default { read, readEpisodes };
