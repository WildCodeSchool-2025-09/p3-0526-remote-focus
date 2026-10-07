import type { RequestHandler } from "express";
import actorRepository from "../actor/actorRepository";
import favoriteRepository from "./favoriteRepository";

const browse: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (userId == null) {
      res.status(401).json({
        error: "Vous devez être connecté.",
      });
      return;
    }

    const favorites = await favoriteRepository.readAll(userId);

    res.json(favorites);
  } catch (error) {
    next(error);
  }
};

const FAVORITE_ACTORS_LIMIT = 6;
const FAVORITE_ACTORS_MAX_LIMIT = 50;

const browseFavoriteActors: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (userId == null) {
      res.status(401).json({
        error: "Vous devez être connecté.",
      });
      return;
    }

    const page = req.query.page === undefined ? 1 : Number(req.query.page);
    const limit =
      req.query.limit === undefined
        ? FAVORITE_ACTORS_LIMIT
        : Number(req.query.limit);

    if (!Number.isInteger(page) || page < 1) {
      res.status(400).json({ error: "Numéro de page invalide." });
      return;
    }

    if (
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > FAVORITE_ACTORS_MAX_LIMIT
    ) {
      res.status(400).json({ error: "Limite invalide." });
      return;
    }

    const offset = (page - 1) * limit;

    const [rows, total] = await Promise.all([
      favoriteRepository.readFavoriteActors(userId, limit, offset),
      favoriteRepository.countFavoriteActors(userId),
    ]);

    res.json({
      data: rows.map((row) => ({
        id: row.ID,
        name: row.name,
        photo: row.photo,
        viewedCount: Number(row.viewed_count),
      })),
      pagination: {
        page,
        limit,
        total,
        hasMore: offset + rows.length < total,
      },
    });
  } catch (error) {
    next(error);
  }
};

const toggleFavorite: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const actorId = Number(req.params.id);

    if (userId == null) {
      res.status(401).json({
        error: "Vous devez être connecté.",
      });
      return;
    }

    if (!Number.isInteger(actorId) || actorId <= 0) {
      res.status(400).json({
        error: "Identifiant de l’acteur invalide.",
      });
      return;
    }

    const actor = await actorRepository.read(actorId);

    if (actor == null) {
      res.status(404).json({
        error: "Acteur introuvable.",
      });
      return;
    }

    const favorite = await favoriteRepository.toggleFavorite(userId, actorId);

    res.json(favorite);
  } catch (error) {
    next(error);
  }
};

export default { browse, browseFavoriteActors, toggleFavorite };
