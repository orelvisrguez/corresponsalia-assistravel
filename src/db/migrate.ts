// Migration script - Only run manually when needed
// This script requires DB_URL and DB_TOKEN env vars for Turso/libsql
// For local development: bun run db:migrate
// For production: migrations are already applied via SQL files

import { runMigrations } from "@kilocode/app-builder-db";
import { db } from "./index";

const url = process.env.DB_URL;
const token = process.env.DB_TOKEN;

if (!url || !token) {
  console.log("⚠️  Database configuration not found.");
  console.log("   DB_URL and DB_TOKEN environment variables are required for migrations.");
  console.log("   Skipping migration step...");
  console.log("   Note: Migrations have already been applied via SQL files.");
  process.exit(0);
}

await runMigrations(db, {}, { migrationsFolder: "./src/db/migrations" });
