import Link from "next/link";
import { db } from "@/db";
import { casos } from "@/db/schema";
import { desc } from "drizzle-orm";
import CasosTable from "@/components/CasosTable";
import StatsCards from "@/components/StatsCards";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const allCasos = await db.select().from(casos).orderBy(desc(casos.id));

  const stats = {
    total: allCasos.length,
    abiertos: allCasos.filter((c) => c.estadoInterno === "Abierto").length,
    cerrados: allCasos.filter((c) => c.estadoInterno === "Cerrado").length,
    cobrados: allCasos.filter((c) => c.estadoCaso === "Cobrado").length,
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Gestión de Casos</h2>
          <p className="text-slate-500 text-base">
            Administra todos los casos de corresponsales y seguimiento médico
          </p>
        </div>
        <Link
          href="/casos/nuevo"
          className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/25 hover:shadow-xl hover:scale-[1.02]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Caso
        </Link>
      </div>

      {/* Stats Section */}
      <div className="bg-white rounded-2xl p-1 shadow-sm">
        <StatsCards stats={stats} />
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <CasosTable initialCasos={allCasos} />
      </div>
    </div>
  );
}
