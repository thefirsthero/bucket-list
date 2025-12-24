import pool from "../config/database";
import dotenv from "dotenv";

dotenv.config();

async function seedBucketList() {
  const client = await pool.connect();

  try {
    console.log("Seeding bucket list items...");

    await client.query("SET search_path TO bucket_list, public");

    // General (Someday) items - uncompleted
    const generalItems = [
      "Get motorcycle license",
      "Go to Disneyland USA",
      "Go to Disneyland Europe",
      "Visit Aunty MG in London",
    ];

    for (const title of generalItems) {
      await client.query(
        `INSERT INTO bucket_items (title, category, status, completed, priority) 
         VALUES ($1, 'general', 'active', false, 0)`,
        [title],
      );
    }
    console.log(`✓ Added ${generalItems.length} general items`);

    // Past items - completed and archived (year unknown, using 0 as sentinel)
    const pastItems = [
      "Holiday in Sudwala Lodge",
      "Go to sugarbay camp",
      "Hike Drakensburg",
      "Hike Table Mountain",
      "Holiday in Durban",
      "Holiday in Warm Baths",
      "Visit Rustenberg",
      "Northgate - Ice skating",
    ];

    for (const title of pastItems) {
      await client.query(
        `INSERT INTO bucket_items (
          title, category, status, completed, completed_at, 
          archived, archived_year, goal_year, priority
        ) 
         VALUES ($1, 'upcoming_year', 'completed', true, 
                 make_timestamp(2000, 1, 1, 12, 0, 0.0), 
                 true, 0, 0, 0)`,
        [title],
      );
    }
    console.log(`✓ Added ${pastItems.length} past (archived) items`);

    // 2025 items
    const items2025 = [
      { title: "Ice skating - Grand West Casino", completed: false },
      { title: "Hike Lion's Head", completed: true },
      { title: "Killarney racing event", completed: true },
      { title: "Acrobranch", completed: true },
      { title: "Total Ninja", completed: true },
      { title: "Atlantis Dunes - Quad biking", completed: true },
      { title: "Buy automatic car", completed: true },
      { title: "Hike Devil's Peak", completed: true },
    ];

    for (const item of items2025) {
      const completedAt = item.completed
        ? `make_timestamp(2025, 6, 15, 12, 0, 0.0)`
        : null;

      if (item.completed) {
        await client.query(
          `INSERT INTO bucket_items (
            title, category, status, completed, completed_at, goal_year, priority
          ) 
           VALUES ($1, 'upcoming_year', 'completed', true, 
                   make_timestamp(2025, 6, 15, 12, 0, 0.0), 2025, 0)`,
          [item.title],
        );
      } else {
        await client.query(
          `INSERT INTO bucket_items (
            title, category, status, completed, goal_year, priority
          ) 
           VALUES ($1, 'upcoming_year', 'active', false, 2025, 0)`,
          [item.title],
        );
      }
    }
    console.log(`✓ Added ${items2025.length} items for 2025`);

    // 2026 items
    const items2026 = [
      "Do a local mid year trip",
      "Learn to surf",
      "Go paragliding",
      "Go parasailing",
      "Get spoiler and front splitter for car",
      "Get pull-up bar",
      "Make a song every month",
      "E Guitar lessons",
      "Do sales / negotiation course",
      "Read 47 Laws of Power",
      "Read book on sales / negotiation",
    ];

    for (const title of items2026) {
      await client.query(
        `INSERT INTO bucket_items (title, category, status, completed, goal_year, priority) 
         VALUES ($1, 'upcoming_year', 'active', false, 2026, 0)`,
        [title],
      );
    }
    console.log(`✓ Added ${items2026.length} items for 2026`);

    // 2027 items
    const items2027 = ["Go to Bali"];

    for (const title of items2027) {
      await client.query(
        `INSERT INTO bucket_items (title, category, status, completed, goal_year, priority) 
         VALUES ($1, 'upcoming_year', 'active', false, 2027, 0)`,
        [title],
      );
    }
    console.log(`✓ Added ${items2027.length} items for 2027`);

    console.log("✅ Bucket list seeding completed successfully!");
    console.log(
      `Total items added: ${
        generalItems.length +
        pastItems.length +
        items2025.length +
        items2026.length +
        items2027.length
      }`,
    );
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seedBucketList();
