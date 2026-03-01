import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { casos, casoCambios } from "@/db/schema";
import { casoSchema, CAMPO_LABELS } from "@/lib/validations";
import { getCurrentUser } from "@/lib/auth";
import { eq } from "drizzle-orm";

// Helper to format values for comparison
function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value ? "Sí" : "No";
  if (typeof value === "number") return value.toString();
  return String(value);
}

// Helper to detect actual changes
function hasChanged(oldVal: unknown, newVal: unknown): boolean {
  return formatValue(oldVal) !== formatValue(newVal);
}

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
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const casoId = parseInt(id, 10);

    if (isNaN(casoId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    // Fetch current case before update
    const [currentCaso] = await db.select().from(casos).where(eq(casos.id, casoId));
    
    if (!currentCaso) {
      return NextResponse.json({ error: "Caso no encontrado" }, { status: 404 });
    }

    const body = await request.json();
    const validated = casoSchema.parse(body);

    // Compare fields and record changes
    const cambios: {
      casoId: number;
      campo: string;
      valorAnterior: string | null;
      valorNuevo: string | null;
      modificadoPor: string;
    }[] = [];

    for (const [key, value] of Object.entries(validated)) {
      const oldValue = (currentCaso as Record<string, unknown>)[key];
      if (hasChanged(oldValue, value)) {
        cambios.push({
          casoId,
          campo: CAMPO_LABELS[key] || key,
          valorAnterior: formatValue(oldValue) || null,
          valorNuevo: formatValue(value) || null,
          modificadoPor: currentUser.name,
        });
      }
    }

    // Update the case
    const [updated] = await db
      .update(casos)
      .set({ ...validated, updatedAt: new Date(), updatedBy: currentUser.name })
      .where(eq(casos.id, casoId))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Caso no encontrado" }, { status: 404 });
    }

    // Insert change records if there are changes
    if (cambios.length > 0) {
      await db.insert(casoCambios).values(cambios);
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
