import type { RequestHandler } from "express";

import mediaRepository from "../media/mediaRepository";
import trackRepository from "./trackRepository";

const browse: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (userId == null) {
      res.status(401).json({
        error: "Vous devez être connecté.",
      });
      return;
    }

    const tracks = await trackRepository.readAll(userId);

    res.json(tracks);
  } catch (error) {
    next(error);
  }
};

const toggleFavorite: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const mediaId = Number(req.params.id);

    if (userId == null) {
      res.status(401).json({
        error: "Vous devez être connecté.",
      });
      return;
    }

    if (!Number.isInteger(mediaId) || mediaId <= 0) {
      res.status(400).json({
        error: "Identifiant du média invalide.",
      });
      return;
    }

    const media = await mediaRepository.read(mediaId);

    if (media == null) {
      res.status(404).json({
        error: "Média introuvable.",
      });
      return;
    }

    const track = await trackRepository.toggleFavorite(userId, mediaId);

    res.json(track);
  } catch (error) {
    next(error);
  }
};

const toggleWatchlist: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const mediaId = Number(req.params.id);

    if (userId == null) {
      res.status(401).json({
        error: "Vous devez être connecté.",
      });
      return;
    }

    if (!Number.isInteger(mediaId) || mediaId <= 0) {
      res.status(400).json({
        error: "Identifiant du média invalide.",
      });
      return;
    }

    const media = await mediaRepository.read(mediaId);

    if (media == null) {
      res.status(404).json({
        error: "Média introuvable.",
      });
      return;
    }

    const track = await trackRepository.toggleWatchlist(userId, mediaId);

    res.json(track);
  } catch (error) {
    next(error);
  }
};

export default {
  browse,
  toggleFavorite,
  toggleWatchlist,
};
