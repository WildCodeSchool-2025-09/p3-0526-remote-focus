import type { RequestHandler } from "express";
import trackingRepository from "./trackingRepository";

const toggleMediaWatched: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.id || 33;

    const mediaId = Number(req.params.id);

    const isMediaWatched = await trackingRepository.isMediaWatched(
      userId,
      mediaId,
    );

    if (isMediaWatched.length === 0) {
      await trackingRepository.markMediaAsWatched(userId, mediaId);
    } else {
      await trackingRepository.unmarkMediaAsWatched(userId, mediaId);
    }

    res.json({
      watched: isMediaWatched.length === 0,
    });
  } catch (err) {
    next(err);
  }
};

export default {
  toggleMediaWatched,
};
