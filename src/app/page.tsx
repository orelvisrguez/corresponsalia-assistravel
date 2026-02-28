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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Casos</h2>
          <p className="text-sm text-gray-500 mt-1">
            Administra todos los casos de corresponsales y seguimiento médico
          </p>
        </div>
        <Link
          href="/casos/nuevo"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Caso
        </Link>
      </div>

      <StatsCards stats={stats} />

      <CasosTable initialCasos={allCasos} />
    </div>
  );
}
