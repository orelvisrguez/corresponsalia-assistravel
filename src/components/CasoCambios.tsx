"use client";

import { useEffect, useState } from "react";
import { formatDateTimeArgentina } from "@/lib/dates";

interface CasoCambio {
  id: number;
  casoId: number;
  campo: string;
  valorAnterior: string | null;
  valorNuevo: string | null;
  modificadoPor: string;
  createdAt: Date | string;
}

export default function CasoCambios({ casoId }: { casoId: number }) {
  const [cambios, setCambios] = useState<CasoCambio[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    async function fetchCambios() {
      try {
        const res = await fetch(`/api/casos/${casoId}/cambios`);
        if (res.ok) {
          const data = await res.json();
          setCambios(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching cambios:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCambios();
  }, [casoId]);

  if (loading) {
    return (
      <div className="bg-slate-50 rounded-xl p-4">
        <div className="animate-pulse flex items-center gap-2">
          <div className="w-4 h-4 bg-slate-200 rounded-full"></div>
          <div className="h-4 bg-slate-200 rounded w-32"></div>
        </div>
      </div>
    );
  }

  if (cambios.length === 0) {
    return (
      <div className="bg-slate-50 rounded-xl p-4">
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>No hay cambios registrados aún</span>
        </div>
      </div>
    );
  }

  // Group changes by date
  const groupedCambios = cambios.reduce((acc, cambio) => {
    const date = new Date(cambio.createdAt).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(cambio);
    return acc;
  }, {} as Record<string, CasoCambio[]>);

  return (
    <div className="bg-slate-50 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-medium text-slate-700">
            Historial de Cambios
          </span>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
            {cambios.length}
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-4">
          {Object.entries(groupedCambios).map(([date, dayCambios]) => (
            <div key={date}>
              <div className="text-xs font-medium text-slate-500 mb-2">
                {new Date(date).toLocaleDateString("es-AR", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              <div className="space-y-2">
                {dayCambios.map((cambio) => (
                  <div
                    key={cambio.id}
                    className="bg-white rounded-lg p-3 border border-slate-200"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        {cambio.campo}
                      </span>
                      <span className="text-xs text-slate-400">
                        {formatDateTimeArgentina(cambio.createdAt)}
                      </span>
                    </div>
                    <div className="text-xs space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">Antes:</span>
                        <span className="text-red-600 bg-red-50 px-1.5 py-0.5 rounded font-mono">
                          {cambio.valorAnterior || "(vacío)"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">Después:</span>
                        <span className="text-green-600 bg-green-50 px-1.5 py-0.5 rounded font-mono">
                          {cambio.valorNuevo || "(vacío)"}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-100">
                      <span className="text-xs text-slate-400">
                        Por: {cambio.modificadoPor}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
