import express from "express";
import checkAvailability from "./middlewares/checkAvailability";
import validateRegister from "./middlewares/validateRegister";
import actorActions from "./modules/actor/actorActions";
import episodeActions from "./modules/episode/episodeActions";
import homepageActions from "./modules/homepage/homepageActions";
import mediaActions from "./modules/media/mediaActions";
import * as searchActions from "./modules/search/searchActions";
import seasonActions from "./modules/season/seasonActions";
import serieActions from "./modules/serie/serieActions";
import userActions from "./modules/user/userActions";

const router = express.Router();

/* ************************************************************************* */
// Define Your API Routes Here
/* ************************************************************************* */
router.get("/api/medias/search", searchActions.browse);

import hashPassword from "./middlewares/hashPassword";
import catalogActions from "./modules/catalog/catalogActions";
import watchingActions from "./modules/watching/watchingActions";

router.get("/api/medias/discover", catalogActions.readDiscoverSections);
router.get("/api/medias", catalogActions.browse);
router.get("/api/genres", catalogActions.browseGenres);

router.get("/api/medias/home", homepageActions.browseHomepage);

/* ************************************************************************* */
router.get("/api/medias/:id", mediaActions.read);
router.get("/api/actors/:id", actorActions.read);
router.get("/api/series/:id", serieActions.read);
router.get("/api/series/:id/seasons/:seasonId", seasonActions.read);
router.get(
  "/api/series/:id/seasons/:seasonId/episodes",
  seasonActions.readEpisodes,
);
router.get(
  "/api/series/:id/seasons/:seasonId/episodes/:episodeId",
  episodeActions.read,
);
router.get("/api/actors/:id/filmography", actorActions.browseFilmography);
router.get("/api/actors/:id/known-for", actorActions.readKnownFor);

router.post(
  "/api/users",
  validateRegister,
  checkAvailability,
  hashPassword,
  userActions.add,
);

/* Connected user, add authentication when ready*/

router.patch("/api/me/medias/:id/watched", watchingActions.toggleMediaWatched);
router.patch("/api/me/series/:id/watched", watchingActions.toggleSeriesWatched);
router.patch(
  "/api/me/seasons/:id/watched",
  watchingActions.toggleSeasonWatched,
);
router.patch(
  "/api/me/episodes/:id/watched",
  watchingActions.toggleEpisodeWatched,
);
router.get("/api/me/medias/watched", watchingActions.readMediaWatched);
router.get("/api/me/episodes/watched", watchingActions.readEpisodeWatched);
export default router;
