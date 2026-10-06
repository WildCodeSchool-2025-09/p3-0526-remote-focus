import express from "express";
import checkAvailability from "./middlewares/checkAvailability";
import hashPassword from "./middlewares/hashPassword";
import optionalAuth from "./middlewares/optionalAuth";
import requireAuth from "./middlewares/requireAuth";
import validateRegister from "./middlewares/validateRegister";
import actorActions from "./modules/actor/actorActions";
import authActions from "./modules/auth/authActions";
import catalogActions from "./modules/catalog/catalogActions";
import episodeActions from "./modules/episode/episodeActions";
import favoriteActions from "./modules/favorite/favoriteActions";
import homepageActions from "./modules/homepage/homepageActions";
import mediaActions from "./modules/media/mediaActions";
import * as searchActions from "./modules/search/searchActions";
import seasonActions from "./modules/season/seasonActions";
import serieActions from "./modules/serie/serieActions";
import trackActions from "./modules/track/trackActions";
import userActions from "./modules/user/userActions";
import watchingActions from "./modules/watching/watchingActions";

const router = express.Router();

router.use(optionalAuth);

/* ************************************************************************* */
// Define Your API Routes Here
/* ************************************************************************* */
router.get("/api/medias/search", searchActions.browse);

router.get("/api/medias/discover", catalogActions.readDiscoverSections);
router.get("/api/medias", catalogActions.browse);
router.get("/api/genres", catalogActions.browseGenres);

router.get("/api/medias/home", homepageActions.browseHomepage);

/* ************************************************************************* */
router.get("/api/medias/:id", mediaActions.read);
router.get("/api/medias/:id/cast", mediaActions.browseCast);
router.get("/api/actors/:id", actorActions.read);
router.get("/api/series/:id", serieActions.read);
router.get("/api/series/:id/seasons/:seasonId", seasonActions.read);
router.get(
  "/api/series/:id/seasons/:seasonId/episodes",
  seasonActions.readEpisodes,
);

router.get("/api/series/:id/seasons/:seasonId/cast", seasonActions.browseCast);
router.get(
  "/api/series/:id/seasons/:seasonId/episodes/:episodeId",
  episodeActions.read,
);
router.get(
  "/api/series/:id/seasons/:seasonId/episodes/:episodeId/cast",
  episodeActions.browseCast,
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
router.post("/api/auth/login", authActions.login);

router.use("/api/me", requireAuth);

router.get("/api/me/dashboard", userActions.readDashboard);

router.get("/api/me/tracks", trackActions.browse);

router.patch("/api/me/medias/:id/favorite", trackActions.toggleFavorite);
router.get("/api/me/actors/favorites", favoriteActions.browse);

router.patch("/api/me/actors/:id/favorite", favoriteActions.toggleFavorite);
router.patch("/api/me/medias/:id/watchlist", trackActions.toggleWatchlist);

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
