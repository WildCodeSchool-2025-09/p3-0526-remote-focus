import type { RequestHandler } from "express";
import { formatCast, formatPlatforms } from "../../utils/formatters";
import mediaRepository from "../media/mediaRepository";
import episodeRepository from "./episodeRepository";

const read: RequestHandler = async (req, res, next) => {
  try {
    const seriesId = Number(req.params.id);
    const seasonId = Number(req.params.seasonId);
    const episodeId = Number(req.params.episodeId);

    if (
      Number.isNaN(seriesId) ||
      Number.isNaN(seasonId) ||
      Number.isNaN(episodeId)
    ) {
      res.sendStatus(400);
      return;
    }

    const episode = await episodeRepository.read(episodeId);

    if (
      episode == null ||
      episode.ID_season !== seasonId ||
      episode.ID_media !== seriesId
    ) {
      res.sendStatus(404);
      return;
    }

    const [cast, castTotal, platforms] = await Promise.all([
      episodeRepository.readCast(episodeId),
      episodeRepository.countCast(episodeId),
      mediaRepository.readPlatforms(seriesId),
    ]);

    res.json({
      id: episode.ID,
      name: episode.name,
      number: episode.number,
      releasedAt: episode.released_at,
      synopsis: episode.synopsis,
      duration: episode.duration,
      poster: episode.season_poster ?? episode.media_poster,
      originalLanguage: episode.original_language,
      overallRating: episode.overall_rating,
      season: {
        id: episode.ID_season,
        number: episode.season_number,
      },
      serie: {
        id: episode.ID_media,
        name: episode.media_name,
        poster: episode.media_poster,
        isAnime: Boolean(episode.is_anime),
      },
      platforms: formatPlatforms(platforms),
      cast: formatCast(cast),
      castTotal,
      userStatus: null,
    });
  } catch (err) {
    next(err);
  }
};

export default { read };
