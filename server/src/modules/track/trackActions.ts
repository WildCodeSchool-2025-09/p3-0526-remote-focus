import type { RequestHandler } from "express";

import { formatMedias } from "../../utils/formatters";
import mediaRepository from "../media/mediaRepository";
import trackRepository, {
  type TrackedList,
  type TrackedType,
} from "./trackRepository";

const TRACKED_LIMIT = 10;

function isMediaType(value: unknown): value is "movie" | "tv" | "anime" {
  return value === "movie" || value === "tv" || value === "anime";
}

function browseTrackedList(list: TrackedList): RequestHandler {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;

      if (userId == null) {
        res.status(401).json({
          error: "Vous devez être connecté.",
        });
        return;
      }

      const {
        type: requestedType,
        seen: requestedSeen,
        page: requestedPage,
      } = req.query;

      if (requestedType !== undefined && !isMediaType(requestedType)) {
        res.status(400).json({ error: "Type de média invalide." });
        return;
      }

      if (
        requestedSeen !== undefined &&
        requestedSeen !== "true" &&
        requestedSeen !== "false"
      ) {
        res.status(400).json({ error: "Filtre de visionnage invalide." });
        return;
      }

      const page = requestedPage === undefined ? 1 : Number(requestedPage);

      if (!Number.isInteger(page) || page < 1) {
        res.status(400).json({ error: "Numéro de page invalide." });
        return;
      }

      const type: TrackedType = isMediaType(requestedType)
        ? requestedType
        : null;
      const seen =
        requestedSeen === undefined ? null : requestedSeen === "true";
      const offset = (page - 1) * TRACKED_LIMIT;

      const [rows, total] = await Promise.all([
        trackRepository.browseTracked(
          userId,
          list,
          type,
          seen,
          TRACKED_LIMIT,
          offset,
        ),
        trackRepository.countTrackedByFilters(userId, list, type, seen),
      ]);

      res.json({
        medias: formatMedias(rows),
        hasMore: offset + rows.length < total,
      });
    } catch (error) {
      next(error);
    }
  };
}

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
  browseFavorites: browseTrackedList("favorite"),
  toggleFavorite,
  toggleWatchlist,
};
