import express from "express";
import actorActions from "./modules/actor/actorActions";
import homepageActions from "./modules/homepage/homepageActions";
import mediaActions from "./modules/media/mediaActions";
import * as searchActions from "./modules/search/searchActions";
import seasonActions from "./modules/season/seasonActions";
import serieActions from "./modules/serie/serieActions";

const router = express.Router();

/* ************************************************************************* */
// Define Your API Routes Here
/* ************************************************************************* */
router.get("/api/medias/search", searchActions.browse);

import catalogActions from "./modules/catalog/catalogActions";
import trackingActions from "./modules/tracking/trackingActions";

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
router.get("/api/actors/:id/filmography", actorActions.readFilmography);

/* Connected user, add authentication when ready*/

router.patch("/api/me/medias/:id/watched", trackingActions.toggleMediaWatched);
router.patch("/api/me/series/:id/watched");
router.patch("/api/me/seasons/:id/watched");
router.patch("/api/me/episodes/:id/watched");

export default router;
