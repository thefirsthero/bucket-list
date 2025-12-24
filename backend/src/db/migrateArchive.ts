import pool from "../config/database";
import dotenv from "dotenv";

dotenv.config();

async function runArchiveMigration() {
  const client = await pool.connect();

  try {
    console.log("Running archive migration...");

    await client.query("SET search_path TO bucket_list, public");

    // Add archived column
    await client.query(`
      ALTER TABLE bucket_items 
      ADD COLUMN IF NOT EXISTS archived BOOLEAN NOT NULL DEFAULT FALSE
    `);
    console.log("✓ Added archived column");

    // Add archived_year column
    await client.query(`
      ALTER TABLE bucket_items 
      ADD COLUMN IF NOT EXISTS archived_year INTEGER
    `);
    console.log("✓ Added archived_year column");

    // Add goal_year column
    await client.query(`
      ALTER TABLE bucket_items 
      ADD COLUMN IF NOT EXISTS goal_year INTEGER
    `);
    console.log("✓ Added goal_year column");

    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_bucket_items_archived ON bucket_items(archived)
    `);
    console.log("✓ Created archived index");

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_bucket_items_archived_year ON bucket_items(archived_year)
    `);
    console.log("✓ Created archived_year index");

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_bucket_items_goal_year ON bucket_items(goal_year)
    `);
    console.log("✓ Created goal_year index");

    // Set goal_year for existing upcoming_year items
    const result = await client.query(`
      UPDATE bucket_items 
      SET goal_year = EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER
      WHERE category = 'upcoming_year' AND goal_year IS NULL
    `);
    console.log(`✓ Updated ${result.rowCount} items with current year`);

    console.log("✅ Archive migration completed successfully!");
  } catch (error) {
    console.error("❌ Archive migration failed:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runArchiveMigration();
