import { NextResponse } from "next/server";
import { db } from "@/db";
import { casos, corresponsales } from "@/db/schema";
import { eq, and, gte, lte, sql, desc } from "drizzle-orm";

export type DashboardFilter = "semanal" | "quincenal" | "mensual" | "trimestral" | "semestral" | "anual";

// Get date range based on filter
function getDateRange(filter: DashboardFilter): { start: Date; end: Date } {
  const now = new Date();
  const end = new Date(now);
  let start: Date;

  switch (filter) {
    case "semanal":
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "quincenal":
      start = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
      break;
    case "mensual":
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case "trimestral":
      start = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      break;
    case "semestral":
      start = new Date(now.getFullYear(), now.getMonth() - 6, 1);
      break;
    case "anual":
      start = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      start = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  return { start, end };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = (searchParams.get("filter") as DashboardFilter) || "mensual";

    const { start, end } = getDateRange(filter);

    // Convert dates to Unix timestamps for comparison
    const startTimestamp = Math.floor(start.getTime() / 1000);
    const endTimestamp = Math.floor(end.getTime() / 1000);

    // Get all cases for date range
    const casesInRange = await db.select()
      .from(casos)
      .where(gte(casos.createdAt, new Date(startTimestamp * 1000)))
      .orderBy(desc(casos.createdAt));

    // Total cases overall
    const totalCasesResult = await db.select({ count: sql<number>`count(*)` }).from(casos);
    const totalCases = totalCasesResult[0]?.count || 0;

    // Total cases in range
    const casesInRangeCount = casesInRange.length;

    // Cases by status (estadoInterno)
    const casesByStatus = await db.select({
      estadoInterno: casos.estadoInterno,
      count: sql<number>`count(*)`,
    })
      .from(casos)
      .groupBy(casos.estadoInterno);

    // Cases by estadoCaso
    const casesByEstadoCaso = await db.select({
      estadoCaso: casos.estadoCaso,
      count: sql<number>`count(*)`,
    })
      .from(casos)
      .groupBy(casos.estadoCaso);

    // Cases by country
    const casesByCountry = await db.select({
      pais: casos.pais,
      count: sql<number>`count(*)`,
    })
      .from(casos)
      .where(sql`${casos.pais} IS NOT NULL AND ${casos.pais} != ''`)
      .groupBy(casos.pais)
      .orderBy(desc(sql<number>`count(*)`));

    // Total correspondales
    const correspondalesResult = await db.select({ 
      count: sql<number>`count(*)`,
      activos: sql<number>`sum(case when ${corresponsales.activo} = 1 then 1 else 0 end)`
    }).from(corresponsales);
    const totalCorresponsales = correspondalesResult[0]?.count || 0;
    const corresponsalesActivos = correspondalesResult[0]?.activos || 0;

    // Financial totals
    const financialResult = await db.select({
      totalFee: sql<number>`coalesce(sum(${casos.fee}), 0)`,
      totalCostoUsd: sql<number>`coalesce(sum(${casos.costoUsd}), 0)`,
      totalMontoAgregado: sql<number>`coalesce(sum(${casos.montoAgregado}), 0)`,
    }).from(casos);
    
    const financialInRange = casesInRange.reduce(
      (acc, c) => ({
        fee: acc.fee + (c.fee || 0),
        costoUsd: acc.costoUsd + (c.costoUsd || 0),
        montoAgregado: acc.montoAgregado + (c.montoAgregado || 0),
      }),
      { fee: 0, costoUsd: 0, montoAgregado: 0 }
    );

    // Monthly cases for the chart (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    
    const casesByMonth: { month: string; count: number; fee: number }[] = [];
    for (let i = 0; i < 12; i++) {
      const monthDate = new Date(twelveMonthsAgo);
      monthDate.setMonth(monthDate.getMonth() + i);
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
      
      const monthCases = casesInRange.filter(c => {
        if (!c.createdAt) return false;
        const created = new Date(c.createdAt);
        return created >= monthStart && created <= monthEnd;
      });
      
      const monthName = monthDate.toLocaleDateString("es-AR", { month: "short", year: "2-digit" });
      casesByMonth.push({
        month: monthName,
        count: monthCases.length,
        fee: monthCases.reduce((sum, c) => sum + (c.fee || 0), 0),
      });
    }

    // Cases by status in range
    const statusInRange = {
      Abierto: casesInRange.filter(c => c.estadoInterno === "Abierto").length,
      Cerrado: casesInRange.filter(c => c.estadoInterno === "Cerrado").length,
      Pausado: casesInRange.filter(c => c.estadoInterno === "Pausado").length,
      Cancelado: casesInRange.filter(c => c.estadoInterno === "Cancelado").length,
    };

    // Cases by estadoCaso in range
    const estadoCasoInRange = {
      "No Fee": casesInRange.filter(c => c.estadoCaso === "No Fee").length,
      "On Going": casesInRange.filter(c => c.estadoCaso === "On Going").length,
      "Refacturado": casesInRange.filter(c => c.estadoCaso === "Refacturado").length,
      "Para refacturar": casesInRange.filter(c => c.estadoCaso === "Para refacturar").length,
      "Cobrado": casesInRange.filter(c => c.estadoCaso === "Cobrado").length,
    };

    // Top correspondales by cases
    const topCorresponsales = await db.select({
      id: corresponsales.id,
      nombre: corresponsales.nombre,
      pais: corresponsales.pais,
    })
      .from(corresponsales)
      .where(sql`${corresponsales.activo} = 1`)
      .limit(5);

    const topCorresponsalesWithCounts = await Promise.all(
      topCorresponsales.map(async (c) => {
        const casesCount = casesInRange.filter(caso => caso.corresponsalId === c.id).length;
        const totalFee = casesInRange
          .filter(caso => caso.corresponsalId === c.id)
          .reduce((sum, caso) => sum + (caso.fee || 0), 0);
        return {
          id: c.id,
          nombre: c.nombre,
          pais: c.pais,
          casos: casesCount,
          fee: totalFee,
        };
      })
    );

    // Recent cases
    const recentCases = casesInRange.slice(0, 10).map(c => ({
      id: c.id,
      nroCasoAssistravel: c.nroCasoAssistravel,
      corresponsal: c.corresponsal,
      pais: c.pais,
      estadoInterno: c.estadoInterno,
      estadoCaso: c.estadoCaso,
      fee: c.fee,
      createdAt: c.createdAt,
    }));

    // Comparison with previous period
    const previousPeriodStart = new Date(start.getTime() - (end.getTime() - start.getTime()));
    const previousPeriodEnd = new Date(start.getTime() - 1);
    
    const previousCasesResult = await db.select({ count: sql<number>`count(*)` })
      .from(casos)
      .where(
        and(
          gte(casos.createdAt, previousPeriodStart),
          lte(casos.createdAt, previousPeriodEnd)
        )
      );
    
    const previousCasesCount = previousCasesResult[0]?.count || 0;
    const casesGrowth = previousCasesCount > 0 
      ? ((casesInRangeCount - previousCasesCount) / previousCasesCount) * 100 
      : casesInRangeCount > 0 ? 100 : 0;

    return NextResponse.json({
      // Overall stats
      totalCases,
      totalCorresponsales,
      corresponsalesActivos,
      
      // Financial totals
      financial: {
        totalFee: financialResult[0]?.totalFee || 0,
        totalCostoUsd: financialResult[0]?.totalCostoUsd || 0,
        totalMontoAgregado: financialResult[0]?.totalMontoAgregado || 0,
      },
      
      // Period stats
      period: {
        filter,
        start: start.toISOString(),
        end: end.toISOString(),
        casesCount: casesInRangeCount,
        casesGrowth: Math.round(casesGrowth * 10) / 10,
        fee: financialInRange.fee,
        costoUsd: financialInRange.costoUsd,
        montoAgregado: financialInRange.montoAgregado,
      },
      
      // Charts data
      casesByStatus,
      statusInRange,
      casesByEstadoCaso,
      estadoCasoInRange,
      casesByCountry: casesByCountry.slice(0, 10),
      casesByMonth,
      topCorresponsales: topCorresponsalesWithCounts,
      recentCases,
      
      // Timestamp for real-time
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Error fetching dashboard data" },
      { status: 500 }
    );
  }
}
