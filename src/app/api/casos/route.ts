import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { casos } from "@/db/schema";
import { casoSchema } from "@/lib/validations";
import { getCurrentUser } from "@/lib/auth";
import { like, or, desc, asc, eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const estadoInterno = searchParams.get("estadoInterno") || "";
    const estadoCaso = searchParams.get("estadoCaso") || "";
    const sortBy = searchParams.get("sortBy") || "id";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    let query = db.select().from(casos);

    const conditions = [];

    if (search) {
      conditions.push(
        or(
          like(casos.corresponsal, `%${search}%`),
          like(casos.nroCasoAssistravel, `%${search}%`),
          like(casos.nroCasoCorresponsal, `%${search}%`),
          like(casos.pais, `%${search}%`),
          like(casos.nroFactura, `%${search}%`)
        )
      );
    }

    if (estadoInterno) {
      conditions.push(eq(casos.estadoInterno, estadoInterno as "Abierto" | "Cerrado" | "Pausado" | "Cancelado"));
    }

    if (estadoCaso) {
      conditions.push(eq(casos.estadoCaso, estadoCaso as "No Fee" | "On Going" | "Refacturado" | "Para refacturar" | "Cobrado"));
    }

    const orderColumn = sortBy === "corresponsal" ? casos.corresponsal
      : sortBy === "fechaInicio" ? casos.fechaInicio
      : sortBy === "pais" ? casos.pais
      : sortBy === "estadoInterno" ? casos.estadoInterno
      : sortBy === "estadoCaso" ? casos.estadoCaso
      : casos.id;

    const orderFn = sortOrder === "asc" ? asc : desc;

    let results;
    if (conditions.length > 0) {
      const { and } = await import("drizzle-orm");
      results = await query.where(and(...conditions)).orderBy(orderFn(orderColumn));
    } else {
      results = await query.orderBy(orderFn(orderColumn));
    }

    return NextResponse.json({ data: results, total: results.length });
  } catch (error) {
    console.error("Error fetching casos:", error);
    return NextResponse.json(
      { error: "Error al obtener los casos" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const validated = casoSchema.parse(body);

    const [newCaso] = await db.insert(casos).values({
      ...validated,
      createdBy: currentUser.name,
    }).returning();

    return NextResponse.json({ data: newCaso }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.message },
        { status: 400 }
      );
    }
    console.error("Error creating caso:", error);
    return NextResponse.json(
      { error: "Error al crear el caso" },
      { status: 500 }
    );
  }
}
