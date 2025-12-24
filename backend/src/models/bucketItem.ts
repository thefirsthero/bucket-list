import { query } from "../config/database";
import { BucketItem, CreateBucketItemDTO, UpdateBucketItemDTO } from "../types";

export const getAllItems = async (): Promise<BucketItem[]> => {
  const result = await query(
    `SELECT * FROM bucket_items 
     WHERE archived = false
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
     WHERE category = $1 AND archived = false
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
    "SELECT COALESCE(MAX(priority), 0) + 1 as next_priority FROM bucket_items WHERE category = $1 AND archived = false",
    [data.category],
  );

  const priority = data.priority ?? priorityResult.rows[0].next_priority;

  // Set goal_year to current year for upcoming_year items
  const goalYear =
    data.category === "upcoming_year"
      ? data.goal_year ?? new Date().getFullYear()
      : null;

  const result = await query(
    `INSERT INTO bucket_items (title, description, category, status, priority, goal_year)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      data.title,
      data.description || null,
      data.category,
      data.status || "active",
      priority,
      goalYear,
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

export const getArchivedItems = async (): Promise<BucketItem[]> => {
  const result = await query(
    `SELECT * FROM bucket_items 
     WHERE archived = true
     ORDER BY archived_year DESC, completed_at DESC`,
  );
  return result.rows;
};

export const getArchivedItemsByYear = async (
  year: number,
): Promise<BucketItem[]> => {
  const result = await query(
    `SELECT * FROM bucket_items 
     WHERE archived = true AND archived_year = $1
     ORDER BY completed_at DESC`,
    [year],
  );
  return result.rows;
};

export const archivePreviousYearItems = async (): Promise<number> => {
  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;

  const result = await query(
    `UPDATE bucket_items 
     SET archived = true, archived_year = $1
     WHERE category = 'upcoming_year' 
       AND completed = true 
       AND archived = false
       AND (goal_year < $2 OR (goal_year = $2 AND EXTRACT(YEAR FROM completed_at) < $2))
     RETURNING id`,
    [previousYear, currentYear],
  );

  return result.rowCount || 0;
};

export const updateGoalYearForCurrentItems = async (): Promise<number> => {
  const currentYear = new Date().getFullYear();

  const result = await query(
    `UPDATE bucket_items 
     SET goal_year = $1
     WHERE category = 'upcoming_year' 
       AND archived = false
       AND (goal_year IS NULL OR goal_year < $1)
     RETURNING id`,
    [currentYear],
  );

  return result.rowCount || 0;
};
