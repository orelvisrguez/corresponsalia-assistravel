// Migration script - Uses Turso (libsql) database

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import * as schema from "./schema";

async function runMigrations() {
  const url = process.env.DB_URL;
  const token = process.env.DB_TOKEN;
  
  if (!url || !token) {
    throw new Error(
      "Missing database configuration. Please set DB_URL and DB_TOKEN environment variables."
    );
  }
  
  const client = createClient({
    url,
    authToken: token,
  });
  
  const db = drizzle(client, { schema });
  
  console.log("Running migrations...");
  
  await migrate(db, {
    migrationsFolder: "./src/db/migrations",
  });
  
  console.log("Migrations completed!");
}

runMigrations().catch(console.error);
