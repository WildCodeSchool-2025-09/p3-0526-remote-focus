import type { RequestHandler } from "express";
import mediaRepository from "../media/mediaRepository";
import seasonRepository from "./seasonRepository";

const read: RequestHandler = async (req, res, next) => {
  try {
    const id = Number(req.params.seasonId);

    if (Number.isNaN(id)) {
      res.sendStatus(400);
      return;
    }

    const season = await seasonRepository.read(id);

    if (season == null) {
      res.sendStatus(404);
      return;
    }

    const [episodes, cast, castTotal, totalDuration, genres, platforms] =
      await Promise.all([
        seasonRepository.readEpisodes(id),
        seasonRepository.readCast(id),
        seasonRepository.countCast(id),
        seasonRepository.readDurationTotal(id),
        mediaRepository.readGenres(season.mediaId),
        mediaRepository.readPlatforms(season.mediaId),
      ]);

    res.json({
      id: season.ID,
      name: season.name,
      number: season.number,
      poster: season.poster ?? season.seriesPoster,
      synopsis: season.synopsis,
      releasedAt: season.released_at,
      isFinished: Boolean(season.is_finished),
      overallRating: season.seriesOverallRating,
      totalDuration,
      series: {
        id: season.mediaId,
        name: season.seriesName,
      },
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
      castTotal,
      userStatus: null,
      userRating: null,
    });
  } catch (err) {
    next(err);
  }
};

export default { read };
