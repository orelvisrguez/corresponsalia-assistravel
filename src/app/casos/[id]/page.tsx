import { db } from "@/db";
import { casos } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ESTADO_INTERNO_COLORS, ESTADO_CASO_COLORS, getCountryFlag } from "@/lib/validations";
import CasoDetailActions from "@/components/CasoDetailActions";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

function Field({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</dt>
      <dd className={`mt-1 text-sm text-gray-900 ${mono ? "font-mono" : ""}`}>
        {value || "—"}
      </dd>
    </div>
  );
}

function BoolField({ label, value }: { label: string; value: boolean | null }) {
  return (
    <div>
      <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</dt>
      <dd className="mt-1">
        {value ? (
          <span className="inline-flex items-center gap-1.5 text-sm text-green-700 font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            Sí
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-sm text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
            No
          </span>
        )}
      </dd>
    </div>
  );
}

function formatDate(date: string | null) {
  if (!date) return "—";
  try {
    return new Date(date + "T00:00:00").toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return date;
  }
}

function formatCurrency(value: number | null, symbol?: string | null) {
  if (value === null || value === undefined) return "—";
  return `${symbol || "$"} ${value.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatUsd(value: number | null) {
  if (value === null || value === undefined) return "—";
  return `USD ${value.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function calculateTotalUsd(caso: typeof casos.$inferSelect) {
  const fee = Number(caso.fee) || 0;
  const costo = Number(caso.costoUsd) || 0;
  const monto = Number(caso.montoAgregado) || 0;
  return fee + costo + monto;
}

export default async function CasoDetailPage({ params }: PageProps) {
  const { id } = await params;
  const casoId = parseInt(id, 10);

  if (isNaN(casoId)) notFound();

  const [caso] = await db.select().from(casos).where(eq(casos.id, casoId));

  if (!caso) notFound();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
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
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-2xl font-bold text-gray-900">Caso #{caso.id}</h2>
              {caso.estadoInterno && (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${ESTADO_INTERNO_COLORS[caso.estadoInterno]}`}>
                  {caso.estadoInterno}
                </span>
              )}
              {caso.estadoCaso && (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${ESTADO_CASO_COLORS[caso.estadoCaso]}`}>
                  {caso.estadoCaso}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-0.5 font-mono">{caso.nroCasoAssistravel}</p>
          </div>
        </div>
        <CasoDetailActions casoId={caso.id} />
      </div>

      {/* General Info */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Información General
          </h3>
        </div>
        <dl className="p-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          <Field label="Corresponsal" value={caso.corresponsal} />
          <Field label="Nro Caso Assistravel" value={caso.nroCasoAssistravel} mono />
          <Field label="Nro Caso Corresponsal" value={caso.nroCasoCorresponsal} mono />
          <Field label="Fecha Inicio" value={formatDate(caso.fechaInicio)} />
          <Field label="País" value={caso.pais ? `${getCountryFlag(caso.pais)} ${caso.pais}` : ""} />
        </dl>
      </div>

      {/* Financial Info */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Información Financiera
          </h3>
        </div>
        <dl className="p-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          <Field label="Fee (USD)" value={formatUsd(caso.fee)} mono />
          <Field label="Costo (USD)" value={formatUsd(caso.costoUsd)} mono />
          <Field label="Monto Agregado (USD)" value={formatUsd(caso.montoAgregado)} mono />
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <dt className="text-xs font-medium text-green-600 uppercase tracking-wide">Total USD</dt>
            <dd className="mt-1 text-xl font-bold text-green-700 font-mono">
              ${calculateTotalUsd(caso).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </dd>
          </div>
          <Field label="Costo Moneda Local" value={formatCurrency(caso.costoMonedaLocal, caso.simboloMoneda)} mono />
          <Field label="Símbolo Moneda" value={caso.simboloMoneda} />
        </dl>
      </div>

      {/* Documentation */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Documentación
          </h3>
        </div>
        <dl className="p-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          <BoolField label="Informe Médico" value={caso.informeMedico} />
          <BoolField label="Tiene Factura" value={caso.tieneFactura} />
          {caso.tieneFactura && (
            <>
              <Field label="Nro Factura" value={caso.nroFactura} mono />
              <Field label="Fecha Emisión" value={formatDate(caso.fechaEmisionFactura)} />
              <Field label="Fecha Vencimiento" value={formatDate(caso.fechaVencimientoFactura)} />
              <Field label="Fecha Pago" value={formatDate(caso.fechaPagoFactura)} />
            </>
          )}
        </dl>
      </div>

      {/* Status */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Estado y Seguimiento
          </h3>
        </div>
        <dl className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide">Estado Interno</dt>
            <dd className="mt-1">
              {caso.estadoInterno ? (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${ESTADO_INTERNO_COLORS[caso.estadoInterno]}`}>
                  {caso.estadoInterno}
                </span>
              ) : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide">Estado Caso</dt>
            <dd className="mt-1">
              {caso.estadoCaso ? (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${ESTADO_CASO_COLORS[caso.estadoCaso]}`}>
                  {caso.estadoCaso}
                </span>
              ) : "—"}
            </dd>
          </div>
          {caso.observaciones && (
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide">Observaciones</dt>
              <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap bg-gray-50 rounded-lg p-3 border border-gray-100">
                {caso.observaciones}
              </dd>
            </div>
          )}
        </dl>
      </div>

      {/* Timestamps */}
      <div className="text-xs text-gray-400 flex flex-col sm:flex-row gap-2 sm:gap-6 px-1">
        {caso.createdAt && (
          <span>
            Creado: {new Date(caso.createdAt).toLocaleString("es-AR")}
          </span>
        )}
        {caso.updatedAt && (
          <span>
            Actualizado: {new Date(caso.updatedAt).toLocaleString("es-AR")}
          </span>
        )}
      </div>
    </div>
  );
}
