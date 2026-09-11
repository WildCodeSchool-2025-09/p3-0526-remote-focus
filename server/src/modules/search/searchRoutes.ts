import type { NextFunction, Request, Response } from "express";
import userRepository from "../user/userRepository";
import type { SearchResult } from "./searchActions";
import { browseResults } from "./searchActions";
import type { SortBy, SortOrder } from "./searchRepository";

// En dessous de ce nombre de caractères, on ne lance pas de requête SQL
const MIN_QUERY_LENGTH = 2;

const VALID_SORT_BY: SortBy[] = ["name", "rating", "date"];
const VALID_SORT_ORDER: SortOrder[] = ["asc", "desc"];
const DEFAULT_SORT_ORDER: Record<SortBy, SortOrder> = {
  name: "asc",
  rating: "desc",
  date: "desc",
};

const emptyResult: SearchResult = {
  films: [],
  series: [],
  animes: [],
  actors: [],
  hasMore: false,
};

export async function browse(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const q = (req.query.q as string)?.trim();
  const type = req.query.type as string | undefined;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;

  if (!q || q.length < MIN_QUERY_LENGTH) {
    res.status(200).json(emptyResult);
    return;
  }

  const validTypes = ["movie", "series", "anime"];
  if (type && !validTypes.includes(type)) {
    res.status(400).json({ error: "type invalide" });
    return;
  }

  const requestedSortBy = req.query.sortBy as string | undefined;
  if (
    requestedSortBy !== undefined &&
    !VALID_SORT_BY.includes(requestedSortBy as SortBy)
  ) {
    res.status(400).json({ error: "sortBy invalide" });
    return;
  }
  const sortBy: SortBy = (requestedSortBy as SortBy) ?? "name";

  const requestedSortOrder = req.query.sortOrder as string | undefined;
  if (
    requestedSortOrder !== undefined &&
    !VALID_SORT_ORDER.includes(requestedSortOrder as SortOrder)
  ) {
    res.status(400).json({ error: "sortOrder invalide" });
    return;
  }
  const sortOrder: SortOrder =
    (requestedSortOrder as SortOrder) ?? DEFAULT_SORT_ORDER[sortBy];

  try {
    const userId = req.user?.id;
    const hidePegi16 =
      userId != null ? await userRepository.readIsPegi16(userId) : false;

    const data = await browseResults(
      q,
      type,
      hidePegi16,
      sortBy,
      sortOrder,
      page,
      limit,
    );
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}
