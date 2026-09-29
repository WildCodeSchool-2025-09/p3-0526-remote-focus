import type { RequestHandler } from "express";
import trackingRepository from "./watchingRepository";
import watchingRepository from "./watchingRepository";

const toggleMediaWatched: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.id || 1;

    const mediaId = Number(req.params.id);

    const isMediaWatched = await trackingRepository.isMediaWatched(
      userId,
      mediaId,
    );

    if (isMediaWatched.length === 0) {
      await trackingRepository.markMediaAsWatched(userId, mediaId);
    } else {
      await trackingRepository.unmarkMediaAsWatched(userId, mediaId);
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
    const userId = req.user?.id || 1;

    const episodeId = Number(req.params.id);

    const isEpisodeWatched = await trackingRepository.isEpisodeWatched(
      userId,
      episodeId,
    );

    if (isEpisodeWatched.length === 0) {
      await trackingRepository.markEpisodeAsWatched(userId, episodeId);
    } else {
      await trackingRepository.unmarkEpisodeAsWatched(userId, episodeId);
    }

    res.json({
      watched: isEpisodeWatched.length === 0,
    });
  } catch (err) {
    next(err);
  }
};

const toggleSeasonWatched: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.id || 1;

    const seasonId = Number(req.params.id);

    const isSeasonWatched = await trackingRepository.isSeasonWatched(
      userId,
      seasonId,
    );

    if (isSeasonWatched === false) {
      await trackingRepository.markSeasonAsWatched(userId, seasonId);
    } else {
      await trackingRepository.unmarkSeasonAsWatched(userId, seasonId);
    }

    res.json({
      watched: !isSeasonWatched,
    });
  } catch (err) {
    next(err);
  }
};

const toggleSeriesWatched: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.id || 1;

    const seriesId = Number(req.params.id);

    const isFullyWatched = await trackingRepository.isFullyWatched(
      userId,
      seriesId,
    );

    if (isFullyWatched === false) {
      await trackingRepository.markSeriesAsWatched(userId, seriesId);
    } else {
      await trackingRepository.unmarkSeriesAsWatched(userId, seriesId);
    }

    res.json({
      watched: !isFullyWatched,
    });
  } catch (err) {
    next(err);
  }
};

const readMediaWatched: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.id || 1;

    const mediaIds = await watchingRepository.readMediaWatched(userId);

    res.json(mediaIds);
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
};
