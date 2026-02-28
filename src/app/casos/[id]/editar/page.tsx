import Link from "next/link";
import { db } from "@/db";
import { casos } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import CasoForm from "@/components/CasoForm";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarCasoPage({ params }: PageProps) {
  const { id } = await params;
  const casoId = parseInt(id, 10);

  if (isNaN(casoId)) notFound();

  const [caso] = await db.select().from(casos).where(eq(casos.id, casoId));

  if (!caso) notFound();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/casos/${caso.id}`}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Editar Caso #{caso.id}</h2>
          <p className="text-sm text-gray-500 mt-0.5 font-mono">{caso.nroCasoAssistravel}</p>
        </div>
      </div>

      <CasoForm caso={caso} mode="edit" />
    </div>
  );
}
