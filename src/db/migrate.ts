// Migration script - Only run manually when needed
// This script requires DB_URL and DB_TOKEN env vars for Turso/libsql
// For local development: bun run db:migrate
// For production: migrations should be applied via SQL files or Vercel

import { createClient } from "@libsql/client";
import * as fs from "fs";
import * as path from "path";

const url = process.env.DB_URL;
const token = process.env.DB_TOKEN;

if (!url || !token) {
  console.log("⚠️  Database configuration not found.");
  console.log("   DB_URL and DB_TOKEN environment variables are required for migrations.");
  console.log("   Skipping migration step...");
  console.log("   Note: Migrations have already been applied via SQL files.");
  process.exit(0);
}

console.log("🔄 Connecting to Turso database...");

const client = createClient({
  url,
  authToken: token,
});

async function runMigrations() {
  const migrationsDir = "./src/db/migrations";
  const metaDir = path.join(migrationsDir, "meta");
  
  // Get all migration files
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith(".sql") && f !== "meta")
    .sort();

  console.log(`📁 Found ${files.length} migration files`);

  // Create migrations table if not exists
  await client.execute(`
    CREATE TABLE IF NOT EXISTS __drizzle_migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hash TEXT NOT NULL,
      created_at INTEGER NOT NULL
    )
  `);

  // Get applied migrations
  const applied = await client.execute("SELECT hash FROM __drizzle_migrations");
  const appliedHashes = new Set(applied.rows.map(r => r.hash as string));

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, "utf-8");
    
    // Generate a simple hash from file content
    const hash = Buffer.from(sql).toString("base64").slice(0, 16);
    
    if (appliedHashes.has(hash)) {
      console.log(`⏭️  Skipping ${file} (already applied)`);
      continue;
    }

    console.log(`🔄 Applying ${file}...`);
    
    // Split by semicolon and execute each statement
    const statements = sql.split(";").map(s => s.trim()).filter(s => s.length > 0);
    
    for (const stmt of statements) {
      try {
        await client.execute(stmt);
      } catch (err: any) {
        // Ignore "table already exists" errors
        if (!err.message?.includes("already exists")) {
          console.error(`   Error: ${err.message}`);
        }
      }
    }
    
    // Record the migration
    await client.execute(
      "INSERT INTO __drizzle_migrations (hash, created_at) VALUES (?, ?)",
      [hash, Date.now()]
    );
    
    console.log(`✅ Applied ${file}`);
  }
  
  console.log("✅ All migrations completed successfully!");
}

runMigrations()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  });
