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

export default { browse, toggleFavorite };
