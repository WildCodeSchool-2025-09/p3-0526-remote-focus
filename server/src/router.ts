import express from "express";
import { optionalAuth } from "./middlewares/optionalAuth";
import { verifyToken } from "./middlewares/verifyToken";
import actorActions from "./modules/actor/actorActions";
import authActions from "./modules/auth/authActions";
import episodeActions from "./modules/episode/episodeActions";
import genreActions from "./modules/genre/genreActions";
import mediaActions from "./modules/media/mediaActions";
import personActions from "./modules/person/personActions";
import * as searchRoutes from "./modules/search/searchRoutes";
import seasonActions from "./modules/season/seasonActions";
import seriesActions from "./modules/series/seriesActions";
import userActions from "./modules/user/userActions";

const router = express.Router();

/* ************************************************************************* */
// Define Your API Routes Here
/* ************************************************************************* */
router.post("/api/auth/register", authActions.register);
router.post("/api/auth/login", authActions.login);

router.get("/api/genres", genreActions.browse);
router.post("/api/me/preferences", verifyToken, userActions.savePreferences);

router.get("/api/medias/search", searchRoutes.browse);

// Define item-related routes
/* import itemActions from "./modules/item/itemActions.old";*/
import catalogActions from "./modules/catalog/catalogActions";

router.get("/api/medias/discover", catalogActions.readDiscoverSections);
router.get("/api/medias", catalogActions.browse);

/*
router.get("/api/items", itemActions.browse);
router.get("/api/items/:id", itemActions.read);
router.post("/api/items", itemActions.add); 
*/

/* ************************************************************************* */
router.get("/api/medias/:id", mediaActions.read);
router.get("/api/series/:id", seriesActions.read);
router.get("/api/series/:serieId/seasons/:seasonId", seasonActions.read);
router.get(
  "/api/series/:serieId/seasons/:seasonId/episodes/:episodeId",
  episodeActions.read,
);
router.get("/api/actors/:id", actorActions.read);
router.get("/api/actors/:id/filmography", actorActions.readFilmography);
router.get(
  "/api/persons/:id/known-for",
  optionalAuth,
  personActions.readKnownFor,
);

export default router;
