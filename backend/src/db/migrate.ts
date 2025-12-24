import fs from "fs";
import path from "path";
import pool from "../config/database";
import dotenv from "dotenv";

dotenv.config();

async function runMigration() {
  const client = await pool.connect();

  try {
    console.log("Running database migration...");

    const schemaSQL = fs.readFileSync(
      path.join(__dirname, "schema.sql"),
      "utf-8",
    );

    await client.query(schemaSQL);

    console.log("✅ Migration completed successfully!");
    console.log(`Schema '${process.env.DB_SCHEMA || "bucket_list"}' is ready.`);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
