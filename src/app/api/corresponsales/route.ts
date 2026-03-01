import { NextResponse } from "next/server";
import { db } from "@/db";
import { corresponsales } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const activo = searchParams.get("activo");
    
    if (activo === "true") {
      const result = await db
        .select()
        .from(corresponsales)
        .where(eq(corresponsales.activo, true))
        .orderBy(corresponsales.nombre);
      return NextResponse.json(result);
    }
    
    const result = await db
      .select()
      .from(corresponsales)
      .orderBy(corresponsales.nombre);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching corresponsales:", error);
    return NextResponse.json({ error: "Error al obtener los corresponsales" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    const result = await db.insert(corresponsales).values({
      nombre: data.nombre,
      email: data.email || null,
      telefono: data.telefono || null,
      pais: data.pais || null,
      direccion: data.direccion || null,
      contacto: data.contacto || null,
      notas: data.notas || null,
      activo: data.activo !== undefined ? data.activo : true,
    }).returning();
    
    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("Error creating corresponsal:", error);
    return NextResponse.json({ error: "Error al crear el corresponsal" }, { status: 500 });
  }
}
