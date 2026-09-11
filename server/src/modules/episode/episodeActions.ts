import type { RequestHandler } from "express";
import mediaRepository from "../media/mediaRepository";
import episodeRepository from "./episodeRepository";

const read: RequestHandler = async (req, res, next) => {
  try {
    const id = Number(req.params.episodeId);

    if (Number.isNaN(id)) {
      res.sendStatus(400);
      return;
    }

    const episode = await episodeRepository.read(id);

    if (episode == null) {
      res.sendStatus(404);
      return;
    }

    const [cast, castTotal, platforms] = await Promise.all([
      episodeRepository.readCast(id),
      episodeRepository.countCast(id),
      mediaRepository.readPlatforms(episode.mediaId),
    ]);

    res.json({
      id: episode.ID,
      name: episode.name,
      number: episode.number,
      releasedAt: episode.released_at,
      synopsis: episode.synopsis,
      duration: episode.duration,
      poster: episode.seasonPoster ?? episode.seriesPoster,
      overallRating: episode.seriesOverallRating,
      season: {
        id: episode.seasonId,
        name: episode.seasonName,
        number: episode.seasonNumber,
      },
      series: {
        id: episode.mediaId,
        name: episode.seriesName,
      },
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
    });
  } catch (err) {
    next(err);
  }
};

export default { read };
