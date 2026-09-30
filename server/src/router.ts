import express from "express";
import checkAvailability from "./middlewares/checkAvailability";
import validateRegister from "./middlewares/validateRegister";
import actorActions from "./modules/actor/actorActions";
import homepageActions from "./modules/homepage/homepageActions";
import mediaActions from "./modules/media/mediaActions";
import * as searchActions from "./modules/search/searchActions";
import seasonActions from "./modules/season/seasonActions";
import serieActions from "./modules/serie/serieActions";
import userActions from "./modules/user/userActions";
import fakeAuth from "./middlewares/fakeAuth";
import trackActions from "./modules/track/trackActions";
import hashPassword from "./middlewares/hashPassword";
import catalogActions from "./modules/catalog/catalogActions";

const router = express.Router();

/* ************************************************************************* */
// Define Your API Routes Here
/* ************************************************************************* */
router.get("/api/medias/search", searchActions.browse);
router.get("/api/medias/discover", catalogActions.readDiscoverSections);
router.get("/api/medias", catalogActions.browse);
router.get("/api/genres", catalogActions.browseGenres);

router.get("/api/medias/home", homepageActions.browseHomepage);
/*
router.get("/api/items", itemActions.browse);
router.get("/api/items/:id", itemActions.read);
router.post("/api/items", itemActions.add); 
*/

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

router.post(
  "/api/users",
  validateRegister,
  checkAvailability,
  hashPassword,
  userActions.add,
);

router.use("/api/me", fakeAuth);

router.get("/api/me/tracks", trackActions.browse);

router.patch("/api/me/medias/:id/favorite", trackActions.toggleFavorite);

router.patch("/api/me/medias/:id/watchlist", trackActions.toggleWatchlist);

export default router;
