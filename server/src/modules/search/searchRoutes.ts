import type { NextFunction, Request, Response } from "express";
import type { SearchResult } from "./searchActions";
import { browseResults } from "./searchActions";

// En dessous de ce nombre de caractères, on ne lance pas de requête SQL
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

  try {
    const data = await browseResults(q, type, page, limit);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}
