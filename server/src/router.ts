import express from "express";
import actorActions from "./modules/actor/actorActions";
import mediaActions from "./modules/media/mediaActions";
import seasonActions from "./modules/season/seasonActions";
import serieActions from "./modules/serie/serieActions";

const router = express.Router();

/* ************************************************************************* */
// Define Your API Routes Here
/* ************************************************************************* */

// Define item-related routes
/* import itemActions from "./modules/item/itemActions.old";*/
import catalogActions from "./modules/catalog/catalogActions";

router.get("/api/medias/discover", catalogActions.readDiscoverSections);

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
