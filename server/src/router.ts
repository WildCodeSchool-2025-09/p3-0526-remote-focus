import express from "express";
import * as searchRoutes from "./modules/search/searchRoutes";
const router = express.Router();

/* ************************************************************************* */
// Define Your API Routes Here
/* ************************************************************************* */
router.get("/api/search", searchRoutes.browse);

// Define item-related routes
/* import itemActions from "./modules/item/itemActions.old";*/

/*
router.get("/api/items", itemActions.browse);
router.get("/api/items/:id", itemActions.read);
router.post("/api/items", itemActions.add); 
*/

/* ************************************************************************* */

export default router;
