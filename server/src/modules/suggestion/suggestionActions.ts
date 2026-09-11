import type { RequestHandler } from "express";
import { resolveHidePegi16 } from "../../utils/applyPegiFilter";
import personRepository from "../person/personRepository";
import userRepository from "../user/userRepository";
import suggestionRepository from "./suggestionRepository";

const BLOCK_SIZE = 6;
const WATCHED_MOVIES_THRESHOLD = 20;
const MOST_WATCHED_GENRES_LIMIT = 5;
// 12 correspond au carrousel "comédiens les plus vus" (US-ACC-06/US-PRO-06,
// qui réutilisent explicitement cette même logique avec limit=12)
const MOST_VIEWED_ACTORS_LIMIT = 12;
const GENRE_BLOCK_MIN_RATING = 6;
const ACTOR_BLOCK_MIN_RATING = 7;

const readSuggestions: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (userId == null) {
      res.sendStatus(401);
      return;
    }

    const hidePegi16 = await resolveHidePegi16(userId);

    const watchedMovieCount =
      await suggestionRepository.countWatchedMovies(userId);

    const genreIds =
      watchedMovieCount >= WATCHED_MOVIES_THRESHOLD
        ? await suggestionRepository.readMostWatchedGenreIds(
            userId,
            MOST_WATCHED_GENRES_LIMIT,
          )
        : (await userRepository.readPreferences(userId)).map(
            (genre) => genre.id,
          );

    const mostViewedActors = await personRepository.readMostViewedActors(
      userId,
      MOST_VIEWED_ACTORS_LIMIT,
    );
    const actorIds = mostViewedActors.map((actor) => actor.id);

    const [genreBased, actorBased] = await Promise.all([
      genreIds.length > 0
        ? suggestionRepository.readByGenres(
            userId,
            genreIds,
            hidePegi16,
            GENRE_BLOCK_MIN_RATING,
            BLOCK_SIZE,
          )
        : [],
      actorIds.length > 0
        ? suggestionRepository.readByActors(
            userId,
            actorIds,
            hidePegi16,
            ACTOR_BLOCK_MIN_RATING,
            BLOCK_SIZE,
          )
        : [],
    ]);

    res.json({ genreBased, actorBased, mostViewedActors });
  } catch (err) {
    next(err);
  }
};

export default { readSuggestions };
