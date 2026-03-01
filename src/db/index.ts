import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

// Create client based on environment
function createDbClient() {
  const url = process.env.DB_URL || "./data.db";
  const token = process.env.DB_TOKEN;
  
  // If DB_URL is a local file path (SQLite), use without token
  if (url.startsWith("./") || url.startsWith("/")) {
    return createClient({
      url,
    });
  }
  
  // For remote databases (Turso, PostgreSQL), use token if available
  return createClient({
    url,
    authToken: token,
  });
}

const client = createDbClient();
export const db = drizzle(client, { schema });
