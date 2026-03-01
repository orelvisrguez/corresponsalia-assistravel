"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { Caso } from "@/db/schema";
import {
  ESTADO_INTERNO_COLORS,
  ESTADO_CASO_COLORS,
  ESTADO_CASO_ROW_COLORS,
  ESTADOS_INTERNOS,
  ESTADOS_CASO,
  getCountryFlag,
} from "@/lib/validations";
import { formatDateArgentina, formatCurrencyArgentina, formatUsdArgentina } from "@/lib/dates";
import DeleteModal from "./DeleteModal";

interface CasosTableProps {
  initialCasos: Caso[];
}

type SortField = "id" | "corresponsal" | "fechaInicio" | "pais" | "estadoInterno" | "estadoCaso" | "costoUsd";
type SortOrder = "asc" | "desc";

export default function CasosTable({ initialCasos }: CasosTableProps) {
  const router = useRouter();
  const [casos, setCasos] = useState<Caso[]>(initialCasos);
  const [search, setSearch] = useState("");
  const [filterEstadoInterno, setFilterEstadoInterno] = useState("");
  const [filterEstadoCaso, setFilterEstadoCaso] = useState("");
  const [sortField, setSortField] = useState<SortField>("id");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; caso: Caso | null }>({
    open: false,
    caso: null,
  });
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    let result = [...casos];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.corresponsal?.toLowerCase().includes(q) ||
          c.nroCasoAssistravel?.toLowerCase().includes(q) ||
          c.nroCasoCorresponsal?.toLowerCase().includes(q) ||
          c.pais?.toLowerCase().includes(q) ||
          c.nroFactura?.toLowerCase().includes(q)
      );
    }

    if (filterEstadoInterno) {
      result = result.filter((c) => c.estadoInterno === filterEstadoInterno);
    }

    if (filterEstadoCaso) {
      result = result.filter((c) => c.estadoCaso === filterEstadoCaso);
    }

    result.sort((a, b) => {
      let aVal: string | number | null = null;
      let bVal: string | number | null = null;

      switch (sortField) {
        case "id":
          aVal = a.id;
          bVal = b.id;
          break;
        case "corresponsal":
          aVal = a.corresponsal || "";
          bVal = b.corresponsal || "";
          break;
        case "fechaInicio":
          aVal = a.fechaInicio || "";
          bVal = b.fechaInicio || "";
          break;
        case "pais":
          aVal = a.pais || "";
          bVal = b.pais || "";
          break;
        case "estadoInterno":
          aVal = a.estadoInterno || "";
          bVal = b.estadoInterno || "";
          break;
        case "estadoCaso":
          aVal = a.estadoCaso || "";
          bVal = b.estadoCaso || "";
          break;
        case "costoUsd":
          aVal = a.costoUsd ?? 0;
          bVal = b.costoUsd ?? 0;
          break;
      }

      if (aVal === null) aVal = "";
      if (bVal === null) bVal = "";

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal);
      const bStr = String(bVal);
      return sortOrder === "asc"
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });

    return result;
  }, [casos, search, filterEstadoInterno, filterEstadoCaso, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.caso) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/casos/${deleteModal.caso.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setCasos((prev) => prev.filter((c) => c.id !== deleteModal.caso!.id));
        setDeleteModal({ open: false, caso: null });
        router.refresh();
      }
    } finally {
      setDeleting(false);
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return (
        <svg className="w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return sortOrder === "asc" ? (
      <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  const formatCurrency = (value: number | null, symbol?: string | null) => {
    return formatCurrencyArgentina(value, symbol || "$");
  };

  const formatUsd = (value: number | null) => {
    return formatUsdArgentina(value);
  };

  const calculateTotalUsd = (caso: Caso) => {
    const fee = Number(caso.fee) || 0;
    const costo = Number(caso.costoUsd) || 0;
    const monto = Number(caso.montoAgregado) || 0;
    return fee + costo + monto;
  };

  const formatDate = (date: string | null) => {
    return formatDateArgentina(date);
  };

  return (
    <>
      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar por corresponsal, caso, país, factura..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50 transition-all"
            />
          </div>
          <select
            value={filterEstadoInterno}
            onChange={(e) => setFilterEstadoInterno(e.target.value)}
            className="px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50 transition-all"
          >
            <option value="">Estado Interno</option>
            {ESTADOS_INTERNOS.map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
          <select
            value={filterEstadoCaso}
            onChange={(e) => setFilterEstadoCaso(e.target.value)}
            className="px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50 transition-all"
          >
            <option value="">Estado Caso</option>
            {ESTADOS_CASO.map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
          {(search || filterEstadoInterno || filterEstadoCaso) && (
            <button
              onClick={() => {
                setSearch("");
                setFilterEstadoInterno("");
                setFilterEstadoCaso("");
              }}
              className="px-4 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Limpiar
            </button>
          )}
        </div>
        <div className="mt-3 text-sm text-slate-400 font-medium">
          {filtered.length} de {casos.length} casos
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200">
              <th className="text-left px-5 py-4 font-semibold text-slate-600 whitespace-nowrap">
                <button
                  onClick={() => handleSort("id")}
                  className="flex items-center gap-1.5 hover:text-blue-600 transition-colors"
                >
                  ID <SortIcon field="id" />
                </button>
              </th>
              <th className="text-left px-5 py-4 font-semibold text-slate-600 whitespace-nowrap">
                <button
                  onClick={() => handleSort("corresponsal")}
                  className="flex items-center gap-1.5 hover:text-blue-600 transition-colors"
                >
                  Corresponsal <SortIcon field="corresponsal" />
                </button>
              </th>
              <th className="text-left px-5 py-4 font-semibold text-slate-600 whitespace-nowrap">
                Nro Caso Assistravel
              </th>
              <th className="text-left px-5 py-4 font-semibold text-slate-600 whitespace-nowrap">
                <button
                  onClick={() => handleSort("fechaInicio")}
                  className="flex items-center gap-1.5 hover:text-blue-600 transition-colors"
                >
                  Fecha Inicio <SortIcon field="fechaInicio" />
                </button>
              </th>
              <th className="text-left px-5 py-4 font-semibold text-slate-600 whitespace-nowrap">
                <button
                  onClick={() => handleSort("pais")}
                  className="flex items-center gap-1.5 hover:text-blue-600 transition-colors"
                >
                  País <SortIcon field="pais" />
                </button>
              </th>
              <th className="text-right px-5 py-4 font-semibold text-slate-600 whitespace-nowrap">
                <button
                  onClick={() => handleSort("costoUsd")}
                  className="flex items-center gap-1.5 hover:text-blue-600 transition-colors ml-auto"
                >
                  Total USD <SortIcon field="costoUsd" />
                </button>
              </th>
              <th className="text-left px-5 py-4 font-semibold text-slate-600 whitespace-nowrap">
                <button
                  onClick={() => handleSort("estadoInterno")}
                  className="flex items-center gap-1.5 hover:text-blue-600 transition-colors"
                >
                  Estado Interno <SortIcon field="estadoInterno" />
                </button>
              </th>
              <th className="text-left px-5 py-4 font-semibold text-slate-600 whitespace-nowrap">
                <button
                  onClick={() => handleSort("estadoCaso")}
                  className="flex items-center gap-1.5 hover:text-blue-600 transition-colors"
                >
                  Estado Caso <SortIcon field="estadoCaso" />
                </button>
              </th>
              <th className="text-center px-5 py-4 font-semibold text-slate-600 whitespace-nowrap">
                Factura
              </th>
              <th className="text-right px-5 py-4 font-semibold text-slate-600 whitespace-nowrap">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-5 py-16 text-center text-slate-400">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center">
                      <svg className="w-7 h-7 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="font-semibold text-slate-600">No se encontraron casos</p>
                    <p className="text-sm">Intenta ajustar los filtros o crea un nuevo caso</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((caso) => (
                <tr
                  key={caso.id}
                  className={`transition-all duration-200 hover:bg-slate-50/80 ${ESTADO_CASO_ROW_COLORS[caso.estadoCaso || ""] || ""} ${!caso.estadoCaso ? "" : ""}`}
                >
                  <td className="px-5 py-4">
                    <span className="font-mono text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                      #{caso.id}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-semibold text-slate-900 max-w-[160px] truncate" title={caso.corresponsal}>
                      {caso.corresponsal}
                    </div>
                    {caso.nroCasoCorresponsal && (
                      <div className="text-xs text-slate-400 mt-0.5">{caso.nroCasoCorresponsal}</div>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-mono text-xs text-slate-700 bg-slate-100 px-2 py-1 rounded-md">
                      {caso.nroCasoAssistravel}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-600 whitespace-nowrap">
                    {formatDate(caso.fechaInicio)}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {caso.pais ? `${getCountryFlag(caso.pais)} ${caso.pais}` : "—"}
                  </td>
                  <td className="px-5 py-4 text-right font-semibold text-slate-900 whitespace-nowrap">
                    {formatUsd(calculateTotalUsd(caso))}
                  </td>
                  <td className="px-5 py-4">
                    {caso.estadoInterno ? (
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${ESTADO_INTERNO_COLORS[caso.estadoInterno] || "bg-slate-100 text-slate-700 border-slate-200"}`}>
                        {caso.estadoInterno}
                      </span>
                    ) : "—"}
                  </td>
                  <td className="px-5 py-4">
                    {caso.estadoCaso ? (
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${ESTADO_CASO_COLORS[caso.estadoCaso] || "bg-slate-100 text-slate-700 border-slate-200"}`}>
                        {caso.estadoCaso}
                      </span>
                    ) : "—"}
                  </td>
                  <td className="px-5 py-4 text-center">
                    {caso.tieneFactura ? (
                      <span className="inline-flex items-center justify-center w-7 h-7 bg-emerald-100 rounded-xl">
                        <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-7 h-7 bg-slate-100 rounded-xl">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <a
                        href={`/casos/${caso.id}`}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
                        title="Ver detalle"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </a>
                      <a
                        href={`/casos/${caso.id}/editar`}
                        className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all duration-200"
                        title="Editar"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </a>
                      <button
                        onClick={() => setDeleteModal({ open: true, caso })}
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

      <DeleteModal
        open={deleteModal.open}
        caso={deleteModal.caso}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ open: false, caso: null })}
      />
    </>
  );
}
