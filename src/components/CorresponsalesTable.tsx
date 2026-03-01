"use client";

import { useState } from "react";
import Link from "next/link";
import { Corresponsal } from "@/db/schema";

interface CorresponsalesTableProps {
  corresponsales: Corresponsal[];
}

export default function CorresponsalesTable({ corresponsales: initialCorresponsales }: CorresponsalesTableProps) {
  const [corresponsales, setCorresponsales] = useState(initialCorresponsales);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterActivo, setFilterActivo] = useState<"all" | "active" | "inactive">("all");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [corresponsalToDelete, setCorresponsalToDelete] = useState<Corresponsal | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredCorresponsales = corresponsales.filter((c) => {
    const matchesSearch = 
      c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (c.pais?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    
    if (filterActivo === "active") return matchesSearch && c.activo;
    if (filterActivo === "inactive") return matchesSearch && !c.activo;
    return matchesSearch;
  });

  const handleDelete = (corresponsal: Corresponsal) => {
    setCorresponsalToDelete(corresponsal);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!corresponsalToDelete) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/corresponsales/${corresponsalToDelete.id}`, {
        method: "DELETE",
      });
      
      if (res.ok) {
        setCorresponsales(corresponsales.filter((c) => c.id !== corresponsalToDelete.id));
        setDeleteModalOpen(false);
        setCorresponsalToDelete(null);
      } else {
        alert("Error al eliminar el corresponsal");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al eliminar el corresponsal");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <input
          type="text"
          placeholder="Buscar corresponsal..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <select
          value={filterActivo}
          onChange={(e) => setFilterActivo(e.target.value as typeof filterActivo)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Todos</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teléfono</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">País</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredCorresponsales.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No se encontraron corresponsales
                </td>
              </tr>
            ) : (
              filteredCorresponsales.map((corresponsal) => (
                <tr key={corresponsal.id} className={!corresponsal.activo ? "bg-gray-50" : ""}>
                  <td className="px-4 py-3">
                    <Link 
                      href={`/admin/corresponsales/${corresponsal.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {corresponsal.nombre}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{corresponsal.email || "-"}</td>
                  <td className="px-4 py-3 text-gray-600">{corresponsal.telefono || "-"}</td>
                  <td className="px-4 py-3 text-gray-600">{corresponsal.pais || "-"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      corresponsal.activo 
                        ? "bg-green-100 text-green-800" 
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {corresponsal.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <Link
                      href={`/admin/corresponsales/${corresponsal.id}/editar`}
                      className="inline-block px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => handleDelete(corresponsal)}
                      className="inline-block px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">Eliminar Corresponsal</h3>
                <p className="text-sm text-gray-500 mt-1">
                  ¿Estás seguro que deseas eliminar el corresponsal{" "}
                  <span className="font-semibold text-gray-700">
                    {corresponsalToDelete?.nombre}
                  </span>
                  ? Esta acción no se puede deshacer.
                </p>
              </div>
            </div>
            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={() => setDeleteModalOpen(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Eliminando...
                  </>
                ) : (
                  "Eliminar"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
