import Link from "next/link";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import UsuarioForm from "@/components/UsuarioForm";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarUsuarioPage({ params }: PageProps) {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "Administrador") {
    redirect("/");
  }

  const { id } = await params;
  const userId = parseInt(id, 10);

  if (isNaN(userId)) notFound();

  const [usuario] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      active: users.active,
    })
    .from(users)
    .where(eq(users.id, userId));

  if (!usuario) notFound();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/usuarios"
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Editar Usuario</h2>
          <p className="text-sm text-gray-500 mt-0.5">{usuario.name} · {usuario.email}</p>
        </div>
      </div>

      <UsuarioForm usuario={usuario} mode="edit" />
    </div>
  );
}
