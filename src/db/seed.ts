import { db } from "./index";
import { users } from "./schema";
import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("🌱 Seeding database...");

  // Check if admin already exists
  const [existingAdmin] = await db
    .select()
    .from(users)
    .where(eq(users.email, "admin@assistravel.com"));

  if (existingAdmin) {
    console.log("✅ Admin user already exists, skipping seed.");
    return;
  }

  const hashedPassword = await hash("Admin123!", 12);

  await db.insert(users).values({
    name: "Administrador",
    email: "admin@assistravel.com",
    password: hashedPassword,
    role: "Administrador",
    active: true,
  });

  console.log("✅ Admin user created:");
  console.log("   Email: admin@assistravel.com");
  console.log("   Password: Admin123!");
  console.log("   Role: Administrador");
}

seed().catch(console.error);
