import Link from "next/link";
import { db } from "@/db";
import { corresponsales } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CorresponsalDetailPage({ params }: PageProps) {
  const { id } = await params;
  const result = await db
    .select()
    .from(corresponsales)
    .where(eq(corresponsales.id, parseInt(id)));

  if (result.length === 0) {
    notFound();
  }

  const corresponsal = result[0];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {corresponsal.nombre}
        </h1>
        <div className="flex gap-2">
          <Link
            href={`/admin/corresponsales/${corresponsal.id}/editar`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Editar
          </Link>
          <Link
            href="/admin/corresponsales"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Volver
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Nombre</h3>
            <p className="mt-1 text-gray-900">{corresponsal.nombre}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Email</h3>
            <p className="mt-1 text-gray-900">{corresponsal.email || "-"}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Teléfono</h3>
            <p className="mt-1 text-gray-900">{corresponsal.telefono || "-"}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">País</h3>
            <p className="mt-1 text-gray-900">{corresponsal.pais || "-"}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Contacto</h3>
            <p className="mt-1 text-gray-900">{corresponsal.contacto || "-"}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Estado</h3>
            <p className="mt-1">
              <span className={`px-2 py-1 text-xs rounded-full ${
                corresponsal.activo 
                  ? "bg-green-100 text-green-800" 
                  : "bg-gray-100 text-gray-600"
              }`}>
                {corresponsal.activo ? "Activo" : "Inactivo"}
              </span>
            </p>
          </div>
        </div>

        {corresponsal.direccion && (
          <div>
            <h3 className="text-sm font-medium text-gray-500">Dirección</h3>
            <p className="mt-1 text-gray-900">{corresponsal.direccion}</p>
          </div>
        )}

        {corresponsal.notas && (
          <div>
            <h3 className="text-sm font-medium text-gray-500">Notas</h3>
            <p className="mt-1 text-gray-900">{corresponsal.notas}</p>
          </div>
        )}

        <div className="text-sm text-gray-500 pt-4 border-t">
          <p>Creado: {corresponsal.createdAt?.toLocaleDateString()}</p>
          <p>Actualizado: {corresponsal.updatedAt?.toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}
