import { createDatabase } from "@kilocode/app-builder-db";
import * as schema from "./schema";

let _db: ReturnType<typeof createDatabase<typeof schema>> | null = null;

export function getDb() {
  if (!_db) {
    _db = createDatabase(schema);
  }
  return _db;
}

// Keep backward compatibility - but this will throw at build time if env vars missing
// Use getDb() instead in all server code
export const db = new Proxy({} as ReturnType<typeof createDatabase<typeof schema>>, {
  get(_target, prop) {
    return getDb()[prop as keyof ReturnType<typeof createDatabase<typeof schema>>];
  },
});
