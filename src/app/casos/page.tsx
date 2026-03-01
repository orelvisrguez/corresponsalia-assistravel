import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { casos } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import CasosTable from "@/components/CasosTable";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CasosPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/login");
  }

  const allCasos = await db.select().from(casos).orderBy(desc(casos.id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Lista de Casos</h1>
          <p className="text-slate-500 mt-1">
            Gestiona todos los casos de asistencia médica
          </p>
        </div>
        <Link
          href="/casos/nuevo"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/20 hover:from-blue-700 hover:to-blue-800 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Caso
        </Link>
      </div>

      {/* Casos Table */}
      <CasosTable initialCasos={allCasos} />
    </div>
  );
}
