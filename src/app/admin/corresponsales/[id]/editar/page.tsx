import { db } from "@/db";
import { corresponsales } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import CorresponsalForm from "@/components/CorresponsalForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarCorresponsalPage({ params }: PageProps) {
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Editar Corresponsal
      </h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <CorresponsalForm corresponsal={corresponsal} />
      </div>
    </div>
  );
}
