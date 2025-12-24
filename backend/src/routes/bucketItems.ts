import express from "express";
import * as bucketItemController from "../controllers/bucketItemController";

const router = express.Router();

// Get all items
router.get("/", bucketItemController.getAllItems);

// Get items by category
router.get("/category/:category", bucketItemController.getItemsByCategory);

// Get single item
router.get("/:id", bucketItemController.getItemById);

// Create new item
router.post("/", bucketItemController.createItem);

// Update item
router.patch("/:id", bucketItemController.updateItem);

// Delete item
router.delete("/:id", bucketItemController.deleteItem);

// Reorder items
router.post("/reorder", bucketItemController.reorderItems);

// Get archived items
router.get("/archive/all", bucketItemController.getArchivedItems);

// Get archived items by year
router.get("/archive/:year", bucketItemController.getArchivedItemsByYear);

// Archive previous year's completed items
router.post("/archive/previous-year", bucketItemController.archivePreviousYear);

export default router;
