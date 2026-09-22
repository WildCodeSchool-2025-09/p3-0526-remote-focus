import type { RequestHandler } from "express";
import mediaRepository from "./mediaRepository";
import {
  formatCast,
  formatGenres,
  formatPlatforms,
} from "../../utils/formatters";

const read: RequestHandler = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      res.sendStatus(400);
      return;
    }

    const media = await mediaRepository.read(id);

    if (media == null) {
      res.sendStatus(404);
      return;
    }

    const [genres, platforms, cast, castTotal] = await Promise.all([
      mediaRepository.readGenres(id),
      mediaRepository.readPlatforms(id),
      mediaRepository.readCast(id),
      mediaRepository.countCast(id),
    ]);

    res.json({
      id: media.ID,
      name: media.name,
      type: media.type,
      originalName: media.original_name,
      poster: media.poster,
      synopsis: media.synopsis,
      duration: media.duration,
      releasedAt: media.released_at,
      overallRating: media.overall_rating,
      originalLanguage: media.original_language,
      pegi: media.pegi,
      genres: formatGenres(genres),
      platforms: formatPlatforms(platforms),
      cast: formatCast(cast),
      castTotal,
      userStatus: null,
      userRating: null,
    });
  } catch (err) {
    next(err);
  }
};

export default { read };
