import type { Request, Response } from "express";
import { browseResults } from "./searchActions";

export async function browse(req: Request, res: Response): Promise<void> {
  const q = (req.query.q as string)?.trim();
  const type = req.query.type as string | undefined;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;

  if (!q) {
    res.status(400).json({ error: "Le paramètre q est requis" });
    return;
  }

  const validTypes = ["movie", "series", "anime"];
  if (type && !validTypes.includes(type)) {
    res.status(400).json({ error: "type invalide" });
    return;
  }

  const data = await browseResults(q, type, page, limit);
  res.status(200).json(data);
}
