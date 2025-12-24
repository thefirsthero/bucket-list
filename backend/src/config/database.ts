import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.DATABASE_SSL === "true"
      ? {
          rejectUnauthorized: false,
        }
      : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const query = async (text: string, params?: any[]) => {
  const client = await pool.connect();
  try {
    // Set schema for this session
    await client.query(
      `SET search_path TO ${process.env.DB_SCHEMA || "bucket_list"}, public`,
    );
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
};

export default pool;
