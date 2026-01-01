import { Request, Response } from "express";
import * as BucketItemModel from "../models/bucketItem";
import {
  CreateBucketItemDTO,
  UpdateBucketItemDTO,
  ReorderItemsDTO,
} from "../types";

export const getAllItems = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const items = await BucketItemModel.getAllItems(userId);
    res.json(items);
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({ error: "Failed to fetch items" });
  }
};

export const getItemsByCategory = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { category } = req.params;

    if (!["upcoming_year", "general"].includes(category)) {
      return res.status(400).json({ error: "Invalid category" });
    }

    const items = await BucketItemModel.getItemsByCategory(userId, category);
    res.json(items);
  } catch (error) {
    console.error("Error fetching items by category:", error);
    res.status(500).json({ error: "Failed to fetch items" });
  }
};

export const getItemById = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid item ID" });
    }

    const item = await BucketItemModel.getItemById(userId, id);

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.json(item);
  } catch (error) {
    console.error("Error fetching item:", error);
    res.status(500).json({ error: "Failed to fetch item" });
  }
};

export const createItem = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const data: CreateBucketItemDTO = req.body;

    if (!data.title || !data.category) {
      return res.status(400).json({ error: "Title and category are required" });
    }

    if (!["upcoming_year", "general"].includes(data.category)) {
      return res.status(400).json({ error: "Invalid category" });
    }

    const item = await BucketItemModel.createItem(userId, data);
    res.status(201).json(item);
  } catch (error) {
    console.error("Error creating item:", error);
    res.status(500).json({ error: "Failed to create item" });
  }
};

export const updateItem = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid item ID" });
    }

    const data: UpdateBucketItemDTO = req.body;
    const item = await BucketItemModel.updateItem(userId, id, data);

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.json(item);
  } catch (error) {
    console.error("Error updating item:", error);
    res.status(500).json({ error: "Failed to update item" });
  }
};

export const deleteItem = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid item ID" });
    }

    const success = await BucketItemModel.deleteItem(userId, id);

    if (!success) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({ error: "Failed to delete item" });
  }
};

export const reorderItems = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const data: ReorderItemsDTO = req.body;

    if (!data.items || !Array.isArray(data.items)) {
      return res.status(400).json({ error: "Items array is required" });
    }

    await BucketItemModel.reorderItems(userId, data.items);
    res.json({ message: "Items reordered successfully" });
  } catch (error) {
    console.error("Error reordering items:", error);
    res.status(500).json({ error: "Failed to reorder items" });
  }
};

export const getArchivedItems = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const items = await BucketItemModel.getArchivedItems(userId);
    res.json(items);
  } catch (error) {
    console.error("Error fetching archived items:", error);
    res.status(500).json({ error: "Failed to fetch archived items" });
  }
};

export const getArchivedItemsByYear = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const year = parseInt(req.params.year);

    if (isNaN(year)) {
      return res.status(400).json({ error: "Invalid year" });
    }

    const items = await BucketItemModel.getArchivedItemsByYear(userId, year);
    res.json(items);
  } catch (error) {
    console.error("Error fetching archived items by year:", error);
    res.status(500).json({ error: "Failed to fetch archived items" });
  }
};

export const archivePreviousYear = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;

    // First update goal years for current items
    await BucketItemModel.updateGoalYearForCurrentItems(userId);

    // Then archive previous year's completed items
    const archivedCount = await BucketItemModel.archivePreviousYearItems(
      userId,
    );

    res.json({
      message: "Previous year items archived successfully",
      archivedCount,
    });
  } catch (error) {
    console.error("Error archiving previous year items:", error);
    res.status(500).json({ error: "Failed to archive items" });
  }
};
