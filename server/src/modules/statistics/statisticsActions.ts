import type { RequestHandler } from "express";
import statisticsRepository from "./statisticsRepository";

const MONTHS_IN_YEAR = 12;

function buildMonthlyDuration(
  monthlyData: { month: number; totalDuration: number }[],
): number[] {
  const durationByMonth = new Array<number>(MONTHS_IN_YEAR).fill(0);

  for (const { month, totalDuration } of monthlyData) {
    durationByMonth[month - 1] = totalDuration;
  }

  return durationByMonth;
}

const readStatistics: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (userId == null) {
      res.sendStatus(401);
      return;
    }

    const currentYear = new Date().getFullYear();

    const [titlesWatched, totalDurationMinutes, monthlyData, genreBreakdown] =
      await Promise.all([
        statisticsRepository.countWatchedTitles(userId),
        statisticsRepository.sumWatchedDuration(userId),
        statisticsRepository.readMonthlyWatchedDuration(userId, currentYear),
        statisticsRepository.readGenreBreakdown(userId),
      ]);

    const genreDistribution = genreBreakdown.map(({ genreName, total }) => ({
      genre: genreName ?? "Autres",
      percentage:
        titlesWatched === 0 ? 0 : Math.round((total / titlesWatched) * 100),
    }));

    const topGenres = genreBreakdown.map(({ genreName, total }) => ({
      genre: genreName ?? "Autres",
      count: total,
    }));

    res.json({
      titlesWatched,
      totalDurationMinutes,
      monthlyDuration: buildMonthlyDuration(monthlyData),
      genreDistribution,
      topGenres,
    });
  } catch (error) {
    next(error);
  }
};

export default { readStatistics };
