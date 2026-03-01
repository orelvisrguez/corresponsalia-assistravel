import { NextResponse } from "next/server";
import { db } from "@/db";
import { corresponsales } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await db
      .select()
      .from(corresponsales)
      .where(eq(corresponsales.id, parseInt(id)));
    
    if (result.length === 0) {
      return NextResponse.json({ error: "Corresponsal no encontrado" }, { status: 404 });
    }
    
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error fetching corresponsal:", error);
    return NextResponse.json({ error: "Error al obtener el corresponsal" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    
    const result = await db
      .update(corresponsales)
      .set({
        nombre: data.nombre,
        email: data.email || null,
        telefono: data.telefono || null,
        pais: data.pais || null,
        direccion: data.direccion || null,
        contacto: data.contacto || null,
        notas: data.notas || null,
        activo: data.activo !== undefined ? data.activo : true,
        updatedAt: new Date(),
      })
      .where(eq(corresponsales.id, parseInt(id)))
      .returning();
    
    if (result.length === 0) {
      return NextResponse.json({ error: "Corresponsal no encontrado" }, { status: 404 });
    }
    
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error updating corresponsal:", error);
    return NextResponse.json({ error: "Error al actualizar el corresponsal" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const result = await db
      .delete(corresponsales)
      .where(eq(corresponsales.id, parseInt(id)))
      .returning();
    
    if (result.length === 0) {
      return NextResponse.json({ error: "Corresponsal no encontrado" }, { status: 404 });
    }
    
    return NextResponse.json({ message: "Corresponsal eliminado correctamente" });
  } catch (error) {
    console.error("Error deleting corresponsal:", error);
    return NextResponse.json({ error: "Error al eliminar el corresponsal" }, { status: 500 });
  }
}
