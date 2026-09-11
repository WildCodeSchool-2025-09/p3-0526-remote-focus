import type { RequestHandler } from "express";
import { resolveHidePegi16 } from "../../utils/applyPegiFilter";
import calendarRepository, { type CalendarItem } from "./calendarRepository";

const PAST_WINDOW_DAYS = 90;
const FUTURE_WINDOW_DAYS = 365;

function buildDateWindow(): { dateFrom: Date; dateTo: Date } {
  const now = new Date();
  const dateFrom = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - PAST_WINDOW_DAYS,
  );
  const dateTo = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + FUTURE_WINDOW_DAYS,
  );
  return { dateFrom, dateTo };
}

function groupByDate(items: CalendarItem[]) {
  const sorted = [...items].sort((a, b) =>
    a.releasedAt.localeCompare(b.releasedAt),
  );

  const groups: { date: string; items: CalendarItem[] }[] = [];

  for (const item of sorted) {
    const lastGroup = groups[groups.length - 1];

    if (lastGroup != null && lastGroup.date === item.releasedAt) {
      lastGroup.items.push(item);
    } else {
      groups.push({ date: item.releasedAt, items: [item] });
    }
  }

  return groups;
}

const browseCalendar: RequestHandler = async (req, res, next) => {
  try {
    const type = req.query.type;

    if (type !== "movie" && type !== "tv" && type !== "anime") {
      res.status(400).json({ error: "Invalid or missing type" });
      return;
    }

    const hidePegi16 = await resolveHidePegi16(req.user?.id);
    const { dateFrom, dateTo } = buildDateWindow();

    let items: CalendarItem[];

    if (type === "movie") {
      items = await calendarRepository.readMovies(
        dateFrom,
        dateTo,
        hidePegi16,
        false,
      );
    } else if (type === "tv") {
      items = await calendarRepository.readEpisodes(
        dateFrom,
        dateTo,
        hidePegi16,
        false,
      );
    } else {
      const [animeMovies, animeEpisodes] = await Promise.all([
        calendarRepository.readMovies(dateFrom, dateTo, hidePegi16, true),
        calendarRepository.readEpisodes(dateFrom, dateTo, hidePegi16, true),
      ]);
      items = [...animeMovies, ...animeEpisodes];
    }

    res.json(groupByDate(items));
  } catch (err) {
    next(err);
  }
};

export default { browseCalendar };
