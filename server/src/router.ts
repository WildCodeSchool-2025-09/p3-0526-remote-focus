import express from "express";
import mediaActions from "./modules/media/mediaActions";

const router = express.Router();

/* ************************************************************************* */
// Define Your API Routes Here
/* ************************************************************************* */

// Define item-related routes
/* import itemActions from "./modules/item/itemActions.old";*/

/*
router.get("/api/items", itemActions.browse);
router.get("/api/items/:id", itemActions.read);
router.post("/api/items", itemActions.add); 
*/

/* ************************************************************************* */
router.get("/api/movies/:id", mediaActions.read);
export default router;
