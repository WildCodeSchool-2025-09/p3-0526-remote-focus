import type { RequestHandler } from "express";
import { isPegiRestricted } from "../../utils/applyPegiFilter";
import mediaRepository from "../media/mediaRepository";
import trackRepository from "../track/trackRepository";
import trackingRepository from "../tracking/trackingRepository";
import userRepository from "../user/userRepository";
import seriesRepository from "./seriesRepository";

const read: RequestHandler = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      res.sendStatus(400);
      return;
    }

    const series = await seriesRepository.read(id);

    if (series == null) {
      res.sendStatus(404);
      return;
    }

    const userId = req.user?.id;

    if (userId != null && isPegiRestricted(series.pegi)) {
      const hidePegi16 = await userRepository.readIsPegi16(userId);

      if (hidePegi16) {
        res.sendStatus(403);
        return;
      }
    }

    const [
      genres,
      platforms,
      cast,
      castTotal,
      seasons,
      durationStats,
      track,
      isWatched,
    ] = await Promise.all([
      mediaRepository.readGenres(id),
      mediaRepository.readPlatforms(id),
      mediaRepository.readCast(id),
      mediaRepository.countCast(id),
      seriesRepository.readSeasons(id),
      seriesRepository.readDurationStats(id),
      userId != null ? trackRepository.readTrack(userId, id) : null,
      userId != null
        ? trackingRepository.isSeriesFullyWatched(userId, id)
        : false,
    ]);

    const averageEpisodeDuration =
      durationStats.episodeCount > 0
        ? Math.round(durationStats.totalDuration / durationStats.episodeCount)
        : null;

    res.json({
      id: series.ID,
      name: series.name,
      originalName: series.original_name,
      poster: series.poster,
      synopsis: series.synopsis,
      releasedAt: series.released_at,
      overallRating: series.overall_rating,
      originalLanguage: series.original_language,
      pegi: series.pegi,
      status: series.status,
      totalDuration: durationStats.totalDuration,
      averageEpisodeDuration,
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
      seasons: seasons.map((season) => ({
        id: season.ID,
        name: season.name,
        number: season.number,
        poster: season.poster,
        releasedAt: season.released_at,
        isFinished: Boolean(season.is_finished),
        episodeCount: season.episodeCount,
      })),
      isFavorite: track != null && Boolean(track.favorite_media),
      isInWatchlist: track != null && Boolean(track.watchlist),
      isWatched,
      userStatus: null,
      userRating: null,
    });
  } catch (err) {
    next(err);
  }
};

export default { read };
