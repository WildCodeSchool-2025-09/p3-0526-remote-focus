import type { NextFunction, Request, Response } from "express";
import type { SearchResult } from "./searchHelpers";
import { browseResults } from "./searchHelpers";

const MIN_QUERY_LENGTH = 2;

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
  const genreParam = req.query.genre?.toString();
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;

  if (!q || q.length < MIN_QUERY_LENGTH) {
    res.status(200).json(emptyResult);
    return;
  }

  const validTypes = ["movie", "tv", "anime"];
  if (type && !validTypes.includes(type)) {
    res.status(400).json({ error: "type invalide" });
    return;
  }

  const genreIds = genreParam ? genreParam.split(",").map(Number) : undefined;
  if (genreIds?.some((genreId) => !Number.isInteger(genreId) || genreId <= 0)) {
    res.status(400).json({ error: "genre invalide" });
    return;
  }

  try {
    const data = await browseResults(q, type, genreIds, page, limit);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}
