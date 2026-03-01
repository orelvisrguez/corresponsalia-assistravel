import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

// Create Turso client using environment variables
const createTursoClient = () => {
  const url = process.env.DATABASE_URL;
  const token = process.env.DATABASE_TOKEN;
  
  if (!url || !token) {
    // During build time, return a dummy client
    // The real client will be created at runtime
    if (process.env.NODE_ENV === "production") {
      console.warn("DATABASE_URL and DATABASE_TOKEN not set - database will be unavailable during build");
      return null;
    }
    throw new Error(
      "Missing database configuration. Please set DATABASE_URL and DATABASE_TOKEN environment variables."
    );
  }
  
  const client = createClient({
    url,
    authToken: token,
  });
  
  return drizzle(client, { schema });
};

// Create client only when needed (lazy initialization)
let dbInstance: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (!dbInstance) {
    dbInstance = createTursoClient();
  }
  return dbInstance;
}

// Export db for backwards compatibility (will be lazy initialized)
export const db = new Proxy({} as any, {
  get(_target, prop) {
    const realDb = getDb();
    if (!realDb) return undefined;
    return (realDb as any)[prop];
  }
});
