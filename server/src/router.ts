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

// Define item-related routes
/* import itemActions from "./modules/item/itemActions.old";*/
import catalogActions from "./modules/catalog/catalogActions";

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
router.get("/api/series/:id", serieActions.read);
router.get("/api/seasons/:id/episodes", seasonActions.readEpisodes);
router.get("/api/actors/:id/filmography", actorActions.readFilmography);

export default router;
