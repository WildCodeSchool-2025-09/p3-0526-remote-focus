import type { RequestHandler } from "express";
import trackRepository from "../track/trackRepository";
import trackingRepository from "../tracking/trackingRepository";
import mediaRepository from "./mediaRepository";

const read: RequestHandler = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      res.sendStatus(400);
      return;
    }

    const movie = await mediaRepository.read(id);

    if (movie == null) {
      res.sendStatus(404);
      return;
    }

    const userId = req.user?.id;

    const [genres, platforms, cast, castTotal, track, isWatched] =
      await Promise.all([
        mediaRepository.readGenres(id),
        mediaRepository.readPlatforms(id),
        mediaRepository.readCast(id),
        mediaRepository.countCast(id),
        userId != null ? trackRepository.readTrack(userId, id) : null,
        userId != null ? trackingRepository.isMovieWatched(userId, id) : false,
      ]);

    res.json({
      id: movie.ID,
      name: movie.name,
      originalName: movie.original_name,
      poster: movie.poster,
      synopsis: movie.synopsis,
      duration: movie.duration,
      releasedAt: movie.released_at,
      overallRating: movie.overall_rating,
      originalLanguage: movie.original_language,
      pegi: movie.pegi,
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
