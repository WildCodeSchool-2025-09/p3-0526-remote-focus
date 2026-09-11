import express from "express";
import { avatarUpload } from "./middlewares/avatarUpload";
import { optionalAuth } from "./middlewares/optionalAuth";
import { verifyToken } from "./middlewares/verifyToken";
import actorActions from "./modules/actor/actorActions";
import authActions from "./modules/auth/authActions";
import episodeActions from "./modules/episode/episodeActions";
import genreActions from "./modules/genre/genreActions";
import mediaActions from "./modules/media/mediaActions";
import personActions from "./modules/person/personActions";
import profileActions from "./modules/profile/profileActions";
import * as searchRoutes from "./modules/search/searchRoutes";
import seasonActions from "./modules/season/seasonActions";
import seriesActions from "./modules/series/seriesActions";
import trackActions from "./modules/track/trackActions";
import trackingActions from "./modules/tracking/trackingActions";
import userActions from "./modules/user/userActions";

const router = express.Router();

/* ************************************************************************* */
// Define Your API Routes Here
/* ************************************************************************* */
router.post("/api/auth/register", authActions.register);
router.post("/api/auth/login", authActions.login);

router.get("/api/genres", genreActions.browse);
router.post("/api/me/preferences", verifyToken, userActions.savePreferences);
router.patch("/api/me/login", verifyToken, userActions.updateLogin);
router.patch("/api/me/email", verifyToken, userActions.updateEmail);
router.patch("/api/me/password", verifyToken, userActions.updatePassword);
router.patch(
  "/api/me/avatar",
  verifyToken,
  avatarUpload,
  userActions.uploadAvatar,
);
router.patch("/api/me/pegi-filter", verifyToken, userActions.updatePegiFilter);
router.patch("/api/me/theme", verifyToken, userActions.updateTheme);

router.get("/api/medias/search", optionalAuth, searchRoutes.browse);

// Define item-related routes
/* import itemActions from "./modules/item/itemActions.old";*/
import catalogActions from "./modules/catalog/catalogActions";

router.get(
  "/api/medias/discover",
  optionalAuth,
  catalogActions.readDiscoverSections,
);
router.get("/api/medias", optionalAuth, catalogActions.browse);

/*
router.get("/api/items", itemActions.browse);
router.get("/api/items/:id", itemActions.read);
router.post("/api/items", itemActions.add); 
*/

/* ************************************************************************* */
router.get("/api/medias/:id", optionalAuth, mediaActions.read);
router.get("/api/series/:id", optionalAuth, seriesActions.read);
router.get(
  "/api/series/:serieId/seasons/:seasonId",
  optionalAuth,
  seasonActions.read,
);
router.get(
  "/api/series/:serieId/seasons/:seasonId/episodes/:episodeId",
  optionalAuth,
  episodeActions.read,
);
router.get("/api/actors/:id", actorActions.read);
router.get("/api/actors/:id/filmography", actorActions.readFilmography);
router.get(
  "/api/persons/:id/known-for",
  optionalAuth,
  personActions.readKnownFor,
);

router.patch(
  "/api/me/medias/:id/favorite",
  verifyToken,
  trackActions.toggleFavorite,
);
router.patch(
  "/api/me/medias/:id/watchlist",
  verifyToken,
  trackActions.toggleWatchlist,
);
router.patch(
  "/api/me/medias/:id/watched",
  verifyToken,
  trackingActions.toggleMovieWatched,
);
router.patch(
  "/api/me/series/:id/watched",
  verifyToken,
  trackingActions.toggleSeriesWatched,
);
router.patch(
  "/api/me/seasons/:id/watched",
  verifyToken,
  trackingActions.toggleSeasonWatched,
);
router.patch(
  "/api/me/episodes/:id/watched",
  verifyToken,
  trackingActions.toggleEpisodeWatched,
);

router.get("/api/me/dashboard", verifyToken, profileActions.readDashboard);
router.get("/api/me/favorites", verifyToken, trackActions.browseFavorites);
router.get("/api/me/watchlist", verifyToken, trackActions.browseWatchlist);

export default router;
