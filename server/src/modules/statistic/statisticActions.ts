import type { RequestHandler } from "express";
import profileRepository from "../profile/profileRepository";
import statisticRepository from "./statisticRepository";

const readStatistics: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (userId == null) {
      res.sendStatus(401);
      return;
    }

    const currentYear = new Date().getFullYear();

    const [watchedTitles, watchTimeMinutes, monthlyWatchTimeMinutes, mediaIds] =
      await Promise.all([
        profileRepository.countWatchedTitles(userId),
        statisticRepository.sumWatchTimeMinutes(userId),
        statisticRepository.readMonthlyWatchTimeMinutes(userId, currentYear),
        statisticRepository.readWatchedMediaIds(userId),
      ]);

    const genreCounts = await statisticRepository.readGenreBreakdown(mediaIds);
    const totalClassified = genreCounts.reduce(
      (sum, genre) => sum + genre.count,
      0,
    );

    const genreBreakdown = genreCounts.map((genre) => ({
      genreId: genre.genreId,
      genreName: genre.genreName,
      count: genre.count,
      percentage:
        totalClassified > 0
          ? Math.round((genre.count / totalClassified) * 1000) / 10
          : 0,
    }));

    res.json({
      watchedTitles,
      watchTimeMinutes,
      monthlyWatchTimeMinutes,
      genreBreakdown,
    });
  } catch (err) {
    next(err);
  }
};

export default { readStatistics };
