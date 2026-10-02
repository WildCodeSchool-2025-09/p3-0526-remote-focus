import type { RequestHandler } from "express";
import watchingRepository from "./watchingRepository";

const toggleMediaWatched: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.id || 1;

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
    const userId = req.user?.id || 1;

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

    const isSeasonWatched = await watchingRepository.isSeasonWatched(
      userId,
      seasonId,
    );

    if (isSeasonWatched === false) {
      await watchingRepository.markSeasonAsWatched(userId, seasonId);
    } else {
      await watchingRepository.unmarkSeasonAsWatched(userId, seasonId);
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

    const isFullyWatched = await watchingRepository.isFullyWatched(
      userId,
      seriesId,
    );
    let episodeIds: number[] = [];

    if (isFullyWatched === false) {
      await watchingRepository.markSeriesAsWatched(userId, seriesId);
      episodeIds = await watchingRepository.readSeriesEpisodeIds(seriesId);
    } else {
      await watchingRepository.unmarkSeriesAsWatched(userId, seriesId);
    }

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
    const userId = req.user?.id || 1;

    const mediaIds = await watchingRepository.readMediaWatched(userId);

    res.json(mediaIds);
  } catch (err) {
    next(err);
  }
};

const readEpisodeWatched: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.id || 1;

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
