import { query } from "../config/database";
import { BucketItem, CreateBucketItemDTO, UpdateBucketItemDTO } from "../types";

export const getAllItems = async (): Promise<BucketItem[]> => {
  const result = await query(
    `SELECT * FROM bucket_items 
     ORDER BY 
       CASE WHEN completed = true THEN 1 ELSE 0 END,
       priority ASC, 
       created_at DESC`,
  );
  return result.rows;
};

export const getItemsByCategory = async (
  category: string,
): Promise<BucketItem[]> => {
  const result = await query(
    `SELECT * FROM bucket_items 
     WHERE category = $1
     ORDER BY 
       CASE WHEN completed = true THEN 1 ELSE 0 END,
       priority ASC, 
       created_at DESC`,
    [category],
  );
  return result.rows;
};

export const getItemById = async (id: number): Promise<BucketItem | null> => {
  const result = await query("SELECT * FROM bucket_items WHERE id = $1", [id]);
  return result.rows[0] || null;
};

export const createItem = async (
  data: CreateBucketItemDTO,
): Promise<BucketItem> => {
  // Get the highest priority in the category
  const priorityResult = await query(
    "SELECT COALESCE(MAX(priority), 0) + 1 as next_priority FROM bucket_items WHERE category = $1",
    [data.category],
  );

  const priority = data.priority ?? priorityResult.rows[0].next_priority;

  const result = await query(
    `INSERT INTO bucket_items (title, description, category, status, priority)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [
      data.title,
      data.description || null,
      data.category,
      data.status || "active",
      priority,
    ],
  );
  return result.rows[0];
};

export const updateItem = async (
  id: number,
  data: UpdateBucketItemDTO,
): Promise<BucketItem | null> => {
  const fields: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (data.title !== undefined) {
    fields.push(`title = $${paramCount++}`);
    values.push(data.title);
  }
  if (data.description !== undefined) {
    fields.push(`description = $${paramCount++}`);
    values.push(data.description);
  }
  if (data.category !== undefined) {
    fields.push(`category = $${paramCount++}`);
    values.push(data.category);
  }
  if (data.status !== undefined) {
    fields.push(`status = $${paramCount++}`);
    values.push(data.status);
  }
  if (data.priority !== undefined) {
    fields.push(`priority = $${paramCount++}`);
    values.push(data.priority);
  }
  if (data.completed !== undefined) {
    fields.push(`completed = $${paramCount++}`);
    values.push(data.completed);

    if (data.completed) {
      fields.push(`completed_at = CURRENT_TIMESTAMP`);
    } else {
      fields.push(`completed_at = NULL`);
    }
  }

  if (fields.length === 0) {
    return getItemById(id);
  }

  values.push(id);
  const result = await query(
    `UPDATE bucket_items 
     SET ${fields.join(", ")}
     WHERE id = $${paramCount}
     RETURNING *`,
    values,
  );

  return result.rows[0] || null;
};

export const deleteItem = async (id: number): Promise<boolean> => {
  const result = await query(
    "DELETE FROM bucket_items WHERE id = $1 RETURNING id",
    [id],
  );
  return result.rowCount ? result.rowCount > 0 : false;
};

export const reorderItems = async (
  items: Array<{ id: number; priority: number }>,
): Promise<void> => {
  const client = await query("BEGIN", []);

  try {
    for (const item of items) {
      await query("UPDATE bucket_items SET priority = $1 WHERE id = $2", [
        item.priority,
        item.id,
      ]);
    }
    await query("COMMIT", []);
  } catch (error) {
    await query("ROLLBACK", []);
    throw error;
  }
};
