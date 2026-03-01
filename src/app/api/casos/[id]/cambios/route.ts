import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { casoCambios } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
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

    const cambios = await db
      .select()
      .from(casoCambios)
      .where(eq(casoCambios.casoId, casoId))
      .orderBy(desc(casoCambios.createdAt));

    return NextResponse.json({ data: cambios });
  } catch (error) {
    console.error("Error fetching caso cambios:", error);
    return NextResponse.json(
      { error: "Error al obtener el historial de cambios" },
      { status: 500 }
    );
  }
}
