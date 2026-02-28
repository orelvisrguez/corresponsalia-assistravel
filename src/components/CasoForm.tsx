"use client";

import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { casoSchema, type CasoFormData, ESTADOS_INTERNOS, ESTADOS_CASO } from "@/lib/validations";
import type { Caso } from "@/db/schema";

interface CasoFormProps {
  caso?: Caso;
  mode: "create" | "edit";
}

export default function CasoForm({ caso, mode }: CasoFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CasoFormData>({
    resolver: standardSchemaResolver(casoSchema),
    defaultValues: caso
      ? {
          corresponsal: caso.corresponsal,
          nroCasoAssistravel: caso.nroCasoAssistravel,
          nroCasoCorresponsal: caso.nroCasoCorresponsal ?? "",
          fechaInicio: caso.fechaInicio ?? "",
          pais: caso.pais ?? "",
          fee: caso.fee ?? undefined,
          costoUsd: caso.costoUsd ?? undefined,
          montoAgregado: caso.montoAgregado ?? undefined,
          costoMonedaLocal: caso.costoMonedaLocal ?? undefined,
          simboloMoneda: caso.simboloMoneda ?? "",
          informeMedico: caso.informeMedico ?? false,
          tieneFactura: caso.tieneFactura ?? false,
          fechaEmisionFactura: caso.fechaEmisionFactura ?? "",
          fechaVencimientoFactura: caso.fechaVencimientoFactura ?? "",
          fechaPagoFactura: caso.fechaPagoFactura ?? "",
          nroFactura: caso.nroFactura ?? "",
          estadoInterno: caso.estadoInterno ?? "Abierto",
          estadoCaso: caso.estadoCaso ?? "On Going",
          observaciones: caso.observaciones ?? "",
        }
      : {
          corresponsal: "",
          nroCasoAssistravel: "",
          nroCasoCorresponsal: "",
          fechaInicio: "",
          pais: "",
          informeMedico: false,
          tieneFactura: false,
          estadoInterno: "Abierto",
          estadoCaso: "On Going",
          observaciones: "",
        },
  });

  const tieneFactura = watch("tieneFactura");

  // Calculate total USD
  const fee = watch("fee") ?? 0;
  const costoUsd = watch("costoUsd") ?? 0;
  const montoAgregado = watch("montoAgregado") ?? 0;
  const totalUsd = fee + costoUsd + montoAgregado;

  const onSubmit = async (data: CasoFormData) => {
    setSubmitting(true);
    setError(null);

    try {
      const url = mode === "create" ? "/api/casos" : `/api/casos/${caso!.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Error al guardar el caso");
      }

      const json = await res.json();
      router.push(`/casos/${json.data.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (hasError?: boolean) =>
    `w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
      hasError
        ? "border-red-300 bg-red-50 focus:ring-red-500"
        : "border-gray-200 bg-white hover:border-gray-300"
    }`;

  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";
  const errorClass = "mt-1 text-xs text-red-600 flex items-center gap-1";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Section: Información General */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Información General
          </h3>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div>
            <label className={labelClass}>
              Corresponsal <span className="text-red-500">*</span>
            </label>
            <input
              {...register("corresponsal")}
              className={inputClass(!!errors.corresponsal)}
              placeholder="Nombre del corresponsal"
            />
            {errors.corresponsal && (
              <p className={errorClass}>
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.corresponsal.message}
              </p>
            )}
          </div>

          <div>
            <label className={labelClass}>
              Nro Caso Assistravel <span className="text-red-500">*</span>
            </label>
            <input
              {...register("nroCasoAssistravel")}
              className={inputClass(!!errors.nroCasoAssistravel)}
              placeholder="Ej: AT-2024-001"
            />
            {errors.nroCasoAssistravel && (
              <p className={errorClass}>
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.nroCasoAssistravel.message}
              </p>
            )}
          </div>

          <div>
            <label className={labelClass}>Nro Caso Corresponsal</label>
            <input
              {...register("nroCasoCorresponsal")}
              className={inputClass()}
              placeholder="Número del corresponsal"
            />
          </div>

          <div>
            <label className={labelClass}>Fecha Inicio</label>
            <input
              type="date"
              {...register("fechaInicio")}
              className={inputClass()}
            />
          </div>

          <div>
            <label className={labelClass}>País</label>
            <input
              {...register("pais")}
              className={inputClass()}
              placeholder="Ej: Argentina"
            />
          </div>
        </div>
      </div>

      {/* Section: Información Financiera */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Información Financiera
          </h3>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div>
            <label className={labelClass}>Fee <span className="text-green-600 font-medium">(USD)</span></label>
            <input
              type="number"
              step="0.01"
              {...register("fee")}
              className={inputClass()}
              placeholder="0.00"
            />
          </div>

          <div>
            <label className={labelClass}>Costo <span className="text-green-600 font-medium">(USD)</span></label>
            <input
              type="number"
              step="0.01"
              {...register("costoUsd")}
              className={inputClass()}
              placeholder="0.00"
            />
          </div>

          <div>
            <label className={labelClass}>Monto Agregado <span className="text-green-600 font-medium">(USD)</span></label>
            <input
              type="number"
              step="0.01"
              {...register("montoAgregado")}
              className={inputClass()}
              placeholder="0.00"
            />
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-green-800">Total USD</span>
              <span className="text-lg font-bold text-green-700">
                ${totalUsd.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div>
            <label className={labelClass}>Costo Moneda Local <span className="text-gray-400 text-xs">(referencia)</span></label>
            <input
              type="number"
              step="0.01"
              {...register("costoMonedaLocal")}
              className={inputClass()}
              placeholder="0.00"
            />
          </div>

          <div>
            <label className={labelClass}>Símbolo Moneda <span className="text-gray-400 text-xs">(ej: ARS, BRL, CLP)</span></label>
            <input
              {...register("simboloMoneda")}
              className={inputClass()}
              placeholder="Ej: ARS, BRL, CLP"
            />
          </div>
        </div>
      </div>

      {/* Section: Documentación */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Documentación
          </h3>
        </div>
        <div className="p-6 space-y-5">
          <div className="flex flex-col sm:flex-row gap-6">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  {...register("informeMedico")}
                  className="sr-only peer"
                />
                <div className="w-10 h-6 bg-gray-200 peer-checked:bg-blue-600 rounded-full transition-colors peer-focus:ring-2 peer-focus:ring-blue-500 peer-focus:ring-offset-1"></div>
                <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4"></div>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Informe Médico</span>
                <p className="text-xs text-gray-400">¿Tiene informe médico?</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  {...register("tieneFactura")}
                  className="sr-only peer"
                />
                <div className="w-10 h-6 bg-gray-200 peer-checked:bg-blue-600 rounded-full transition-colors peer-focus:ring-2 peer-focus:ring-blue-500 peer-focus:ring-offset-1"></div>
                <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4"></div>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Tiene Factura</span>
                <p className="text-xs text-gray-400">¿Tiene factura asociada?</p>
              </div>
            </label>
          </div>

          {tieneFactura && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-4 border-t border-gray-100">
              <div>
                <label className={labelClass}>Nro Factura</label>
                <input
                  {...register("nroFactura")}
                  className={inputClass()}
                  placeholder="Número de factura"
                />
              </div>
              <div>
                <label className={labelClass}>Fecha Emisión</label>
                <input
                  type="date"
                  {...register("fechaEmisionFactura")}
                  className={inputClass()}
                />
              </div>
              <div>
                <label className={labelClass}>Fecha Vencimiento</label>
                <input
                  type="date"
                  {...register("fechaVencimientoFactura")}
                  className={inputClass()}
                />
              </div>
              <div>
                <label className={labelClass}>Fecha Pago</label>
                <input
                  type="date"
                  {...register("fechaPagoFactura")}
                  className={inputClass()}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Section: Estado */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Estado y Seguimiento
          </h3>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Estado Interno</label>
            <select {...register("estadoInterno")} className={inputClass()}>
              {ESTADOS_INTERNOS.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Estado Caso</label>
            <select {...register("estadoCaso")} className={inputClass()}>
              {ESTADOS_CASO.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>Observaciones</label>
            <textarea
              {...register("observaciones")}
              rows={4}
              className={`${inputClass()} resize-none`}
              placeholder="Notas adicionales sobre el caso..."
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
        >
          {submitting ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Guardando...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {mode === "create" ? "Crear Caso" : "Guardar Cambios"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
