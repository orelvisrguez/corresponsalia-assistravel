import Link from "next/link";
import { db } from "@/db";
import { corresponsales } from "@/db/schema";
import CorresponsalesTable from "@/components/CorresponsalesTable";

export default async function CorresponsalesPage() {
  const corresponsalesList = await db.select().from(corresponsales).orderBy(corresponsales.nombre);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Corresponsales</h1>
        <Link
          href="/admin/corresponsales/nuevo"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Nuevo Corresponsal
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <CorresponsalesTable corresponsales={corresponsalesList} />
      </div>
    </div>
  );
}
