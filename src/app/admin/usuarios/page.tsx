import { db } from "@/db";
import { users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import UsuariosTable from "@/components/UsuariosTable";

export const dynamic = "force-dynamic";

export default async function UsuariosPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "Administrador") {
    redirect("/");
  }

  const allUsers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      active: users.active,
      createdAt: users.createdAt,
    })
    .from(users);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h2>
            <p className="text-sm text-gray-500 mt-1">
              Administra los usuarios con acceso al sistema
            </p>
          </div>
        </div>
        <Link
          href="/admin/usuarios/nuevo"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Usuario
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Total Usuarios",
            value: allUsers.length,
            color: "bg-blue-50 text-blue-600",
            border: "border-blue-100",
          },
          {
            label: "Administradores",
            value: allUsers.filter((u: typeof allUsers[0]) => u.role === "Administrador").length,
            color: "bg-purple-50 text-purple-600",
            border: "border-purple-100",
          },
          {
            label: "Corresponsales",
            value: allUsers.filter((u: typeof allUsers[0]) => u.role === "Corresponsal").length,
            color: "bg-indigo-50 text-indigo-600",
            border: "border-indigo-100",
          },
          {
            label: "Activos",
            value: allUsers.filter((u: typeof allUsers[0]) => u.active).length,
            color: "bg-green-50 text-green-600",
            border: "border-green-100",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`bg-white rounded-xl border ${stat.border} p-4 shadow-sm`}
          >
            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <UsuariosTable initialUsers={allUsers} currentUserId={currentUser.id} />
    </div>
  );
}
