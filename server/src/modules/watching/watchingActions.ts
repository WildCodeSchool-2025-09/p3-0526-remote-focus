import type { RequestHandler } from "express";
import watchingRepository from "./watchingRepository";

const toggleMediaWatched: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (userId === undefined) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const mediaId = Number(req.params.id);

    const isMediaWatched = await watchingRepository.isMediaWatched(
      userId,
      mediaId,
    );

    if (isMediaWatched.length === 0) {
      await watchingRepository.markMediaAsWatched(userId, mediaId);
    } else {
      await watchingRepository.unmarkMediaAsWatched(userId, mediaId);
    }

    res.json({
      watched: isMediaWatched.length === 0,
    });
  } catch (err) {
    next(err);
  }
};

const toggleEpisodeWatched: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (userId === undefined) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const episodeId = Number(req.params.id);

    const isEpisodeWatched = await watchingRepository.isEpisodeWatched(
      userId,
      episodeId,
    );

    if (isEpisodeWatched.length === 0) {
      await watchingRepository.markEpisodeAsWatched(userId, episodeId);
    } else {
      await watchingRepository.unmarkEpisodeAsWatched(userId, episodeId);
    }

    const mediaId = await watchingRepository.readSeriesIdFromEpisode(episodeId);

    if (mediaId === null) {
      throw new Error("Série introuvable pour cet épisode");
    }

    const seriesFullyWatched = await watchingRepository.isFullyWatched(
      userId,
      mediaId,
    );

    if (seriesFullyWatched) {
      const isMediaWatched = await watchingRepository.isMediaWatched(
        userId,
        mediaId,
      );
      if (isMediaWatched.length === 0) {
        await watchingRepository.markMediaAsWatched(userId, mediaId);
      }
    } else {
      await watchingRepository.unmarkMediaAsWatched(userId, mediaId);
    }

    res.json({
      watched: isEpisodeWatched.length === 0,
      mediaId,
      seriesFullyWatched,
    });
  } catch (err) {
    next(err);
  }
};

const toggleSeasonWatched: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (userId === undefined) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const seasonId = Number(req.params.id);

    const isSeasonWatched = await watchingRepository.isSeasonWatched(
      userId,
      seasonId,
    );

    if (isSeasonWatched === false) {
      await watchingRepository.markSeasonAsWatched(userId, seasonId);
    } else {
      await watchingRepository.unmarkSeasonAsWatched(userId, seasonId);
    }

    const mediaId = await watchingRepository.readSeriesIdFromSeason(seasonId);
    if (mediaId === null) {
      throw new Error("Série introuvable pour cette saison");
    }

    const seriesFullyWatched = await watchingRepository.isFullyWatched(
      userId,
      mediaId,
    );

    if (seriesFullyWatched) {
      const isMediaWatched = await watchingRepository.isMediaWatched(
        userId,
        mediaId,
      );
      if (isMediaWatched.length === 0) {
        await watchingRepository.markMediaAsWatched(userId, mediaId);
      }
    } else {
      await watchingRepository.unmarkMediaAsWatched(userId, mediaId);
    }

    res.json({
      watched: !isSeasonWatched,
      mediaId,
      seriesFullyWatched,
    });
  } catch (err) {
    next(err);
  }
};

const toggleSeriesWatched: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (userId === undefined) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const seriesId = Number(req.params.id);

    const isFullyWatched = await watchingRepository.isFullyWatched(
      userId,
      seriesId,
    );

    if (isFullyWatched === false) {
      await watchingRepository.markSeriesAsWatched(userId, seriesId);

      const isMediaWatched = await watchingRepository.isMediaWatched(
        userId,
        seriesId,
      );

      if (isMediaWatched.length === 0) {
        await watchingRepository.markMediaAsWatched(userId, seriesId);
      }
    } else {
      await watchingRepository.unmarkSeriesAsWatched(userId, seriesId);
      await watchingRepository.unmarkMediaAsWatched(userId, seriesId);
    }

    const episodeIds = await watchingRepository.readSeriesEpisodeIds(seriesId);

    res.json({
      watched: !isFullyWatched,
      episodeIds,
    });
  } catch (err) {
    next(err);
  }
};

const readMediaWatched: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (userId === undefined) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const mediaIds = await watchingRepository.readMediaWatched(userId);

    res.json(mediaIds);
  } catch (err) {
    next(err);
  }
};

const readEpisodeWatched: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (userId === undefined) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const episodeIds = await watchingRepository.readEpisodeWatched(userId);

    res.json(episodeIds);
  } catch (err) {
    next(err);
  }
};

export default {
  toggleMediaWatched,
  toggleSeriesWatched,
  toggleEpisodeWatched,
  toggleSeasonWatched,
  readMediaWatched,
  readEpisodeWatched,
};
