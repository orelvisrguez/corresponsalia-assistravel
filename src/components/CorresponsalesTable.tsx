"use client";

import { useState } from "react";
import Link from "next/link";
import { Corresponsal } from "@/db/schema";
import { getCountryCode, isCustomCountry } from "@/lib/validations";

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
      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar corresponsal por nombre, email o país..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50 transition-all"
            />
          </div>
          <select
            value={filterActivo}
            onChange={(e) => setFilterActivo(e.target.value as typeof filterActivo)}
            className="px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50 transition-all"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
          {(searchTerm || filterActivo !== "all") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setFilterActivo("all");
              }}
              className="px-4 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Limpiar
            </button>
          )}
        </div>
        <div className="mt-3 text-sm text-slate-400 font-medium">
          {filteredCorresponsales.length} de {corresponsales.length} corresponsales
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200">
                <th className="text-left px-5 py-4 font-semibold text-slate-600">Nombre</th>
                <th className="text-left px-5 py-4 font-semibold text-slate-600">Email</th>
                <th className="text-left px-5 py-4 font-semibold text-slate-600">Teléfono</th>
                <th className="text-left px-5 py-4 font-semibold text-slate-600">País</th>
                <th className="text-left px-5 py-4 font-semibold text-slate-600">Estado</th>
                <th className="text-right px-5 py-4 font-semibold text-slate-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCorresponsales.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center">
                        <svg className="w-7 h-7 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <p className="font-semibold text-slate-600">No se encontraron corresponsales</p>
                      <p className="text-sm">Intenta ajustar los filtros</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCorresponsales.map((corresponsal) => (
                  <tr 
                    key={corresponsal.id} 
                    className={`transition-all duration-200 hover:bg-slate-50/80 ${!corresponsal.activo ? "bg-slate-50/50" : ""}`}
                  >
                    <td className="px-5 py-4">
                      <Link 
                        href={`/admin/corresponsales/${corresponsal.id}`}
                        className="font-semibold text-slate-900 hover:text-blue-600 transition-colors"
                      >
                        {corresponsal.nombre}
                      </Link>
                      {corresponsal.contacto && (
                        <div className="text-xs text-slate-400 mt-0.5">
                          Contacto: {corresponsal.contacto}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {corresponsal.email ? (
                        <a href={`mailto:${corresponsal.email}`} className="hover:text-blue-600 transition-colors">
                          {corresponsal.email}
                        </a>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {corresponsal.telefono || "—"}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {corresponsal.pais ? (
                        <span className="flex items-center gap-2">
                          {isCustomCountry(corresponsal.pais) ? (
                            <span className="w-5 h-4 flex items-center justify-center bg-slate-200 rounded text-xs font-medium">
                              ?
                            </span>
                          ) : (
                            <img
                              src={`https://flagcdn.com/w20/${getCountryCode(corresponsal.pais)}.png`}
                              alt={corresponsal.pais}
                              className="w-5 h-4 rounded object-cover"
                            />
                          )}
                          <span>{corresponsal.pais}</span>
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                        corresponsal.activo 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}>
                        {corresponsal.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/corresponsales/${corresponsal.id}`}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
                          title="Ver detalle"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                        <Link
                          href={`/admin/corresponsales/${corresponsal.id}/editar`}
                          className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all duration-200"
                          title="Editar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => handleDelete(corresponsal)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                          title="Eliminar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
