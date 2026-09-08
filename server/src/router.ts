import express from "express";

const router = express.Router();

/* ************************************************************************* */
// Define Your API Routes Here
/* ************************************************************************* */

// Define item-related routes
/* import itemActions from "./modules/item/itemActions.old";*/
import CatalogActions from "./modules/Catalog/CatalogActions";

router.get("/api/medias/discover", CatalogActions.readDiscoverSections);

/*
router.get("/api/items", itemActions.browse);
router.get("/api/items/:id", itemActions.read);
router.post("/api/items", itemActions.add); 
*/

/* ************************************************************************* */

export default router;
