import express from "express";
import actorActions from "./modules/actor/actorActions";
import homepageActions from "./modules/homepage/homepageActions";
import mediaActions from "./modules/media/mediaActions";
import userActions from "./modules/user/userActions";
import validateRegister from "./middlewares/validateRegister";
import checkAvailability from "./middlewares/checkAvailability";
import genreActions from "./modules/genre/genreActions";

const router = express.Router();

/* ************************************************************************* */
// Define Your API Routes Here
/* ************************************************************************* */

import catalogActions from "./modules/catalog/catalogActions";
import hashPassword from "./middlewares/hashPassword";

router.get("/api/medias/discover", catalogActions.readDiscoverSections);
router.get("/api/medias/home", homepageActions.browseHomepage);
/*
router.get("/api/items", itemActions.browse);
router.get("/api/items/:id", itemActions.read);
router.post("/api/items", itemActions.add); 
*/

/* ************************************************************************* */
router.get("/api/medias/:id", mediaActions.read);
router.get("/api/actors/:id/filmography", actorActions.readFilmography);
router.get("/api/genres", genreActions.browse);

router.post(
  "/api/users",
  validateRegister,
  checkAvailability,
  hashPassword,
  userActions.add,
);

export default router;
