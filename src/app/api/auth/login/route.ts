import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { compare, hash } from "bcryptjs";
import { createSession, setSessionCookie } from "@/lib/auth";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = loginSchema.parse(body);

    let [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, validated.email.toLowerCase()));

    // Auto-create admin user if no users exist
    if (!user) {
      const allUsers = await db.select().from(users);
      if (allUsers.length === 0 && validated.email.toLowerCase() === "admin@assistravel.com") {
        const hashedPassword = await hash(validated.password, 12);
        const [newUser] = await db
          .insert(users)
          .values({
            name: "Administrador",
            email: validated.email.toLowerCase(),
            password: hashedPassword,
            role: "Administrador",
            active: true,
          })
          .returning();
        user = newUser;
      } else {
        return NextResponse.json(
          { error: "Credenciales inválidas" },
          { status: 401 }
        );
      }
    }

    if (!user.active) {
      return NextResponse.json(
        { error: "Tu cuenta está desactivada. Contacta al administrador." },
        { status: 403 }
      );
    }

    const passwordMatch = await compare(validated.password, user.password);

    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    const token = await createSession({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role as "Administrador" | "Corresponsal",
    });

    await setSessionCookie(token);

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Datos inválidos" },
        { status: 400 }
      );
    }
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Error al iniciar sesión" },
      { status: 500 }
    );
  }
}
