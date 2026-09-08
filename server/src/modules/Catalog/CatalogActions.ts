import type { RequestHandler } from "express";

import CatalogRepository from "./CatalogRepository";

const readDiscoverSections: RequestHandler = async (req, res, next) => {
  try {
    const type = req.query.params;
    const topRated = await CatalogRepository.readTopRated(
      type as string | null,
    );
    res.json(topRated);
  } catch (err) {
    next(err);
  }
};

export default { readDiscoverSections };
