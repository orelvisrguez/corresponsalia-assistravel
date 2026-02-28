import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { casos } from "@/db/schema";
import { casoSchema } from "@/lib/validations";
import { eq } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const casoId = parseInt(id, 10);

    if (isNaN(casoId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const [caso] = await db.select().from(casos).where(eq(casos.id, casoId));

    if (!caso) {
      return NextResponse.json({ error: "Caso no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ data: caso });
  } catch (error) {
    console.error("Error fetching caso:", error);
    return NextResponse.json(
      { error: "Error al obtener el caso" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const casoId = parseInt(id, 10);

    if (isNaN(casoId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const body = await request.json();
    const validated = casoSchema.parse(body);

    const [updated] = await db
      .update(casos)
      .set({ ...validated, updatedAt: new Date() })
      .where(eq(casos.id, casoId))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Caso no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ data: updated });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.message },
        { status: 400 }
      );
    }
    console.error("Error updating caso:", error);
    return NextResponse.json(
      { error: "Error al actualizar el caso" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const casoId = parseInt(id, 10);

    if (isNaN(casoId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const [deleted] = await db
      .delete(casos)
      .where(eq(casos.id, casoId))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Caso no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ message: "Caso eliminado exitosamente" });
  } catch (error) {
    console.error("Error deleting caso:", error);
    return NextResponse.json(
      { error: "Error al eliminar el caso" },
      { status: 500 }
    );
  }
}
