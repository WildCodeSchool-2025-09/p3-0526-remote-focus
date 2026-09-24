import type { RequestHandler } from "express";
import {
  formatCast,
  formatEpisodes,
  formatPlatforms,
} from "../../utils/formatters";
import mediaRepository from "../media/mediaRepository";
import seasonRepository from "./seasonRepository";

const readEpisodes: RequestHandler = async (req, res, next) => {
  try {
    const seriesId = Number(req.params.id);
    const seasonId = Number(req.params.seasonId);

    if (Number.isNaN(seriesId) || Number.isNaN(seasonId)) {
      res.sendStatus(400);
      return;
    }

    const season = await seasonRepository.read(seasonId);

    if (season == null || season.ID_media !== seriesId) {
      res.sendStatus(404);
      return;
    }

    const episodes = await seasonRepository.readEpisodes(seasonId);

    res.json(formatEpisodes(episodes));
  } catch (err) {
    next(err);
  }
};

const read: RequestHandler = async (req, res, next) => {
  try {
    const seriesId = Number(req.params.id);
    const seasonId = Number(req.params.seasonId);

    if (Number.isNaN(seriesId) || Number.isNaN(seasonId)) {
      res.sendStatus(400);
      return;
    }

    const season = await seasonRepository.read(seasonId);

    if (season == null || season.ID_media !== seriesId) {
      res.sendStatus(404);
      return;
    }

    const [episodes, cast, duration, platforms, castTotal] = await Promise.all([
      seasonRepository.readEpisodes(seasonId),
      seasonRepository.readCast(seasonId),
      seasonRepository.sumDuration(seasonId),
      mediaRepository.readPlatforms(seriesId),
      seasonRepository.countCast(seasonId),
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
      platforms: formatPlatforms(platforms),
      episodes: formatEpisodes(episodes),
      cast: formatCast(cast),
      castTotal,
      userStatus: null,
      userRating: null,
    });
  } catch (err) {
    next(err);
  }
};

export default { read, readEpisodes };
