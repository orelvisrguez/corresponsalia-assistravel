import Link from "next/link";
import { db } from "@/db";
import { corresponsales, casos } from "@/db/schema";
import { eq, desc, or } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getCountryCode, isCustomCountry } from "@/lib/validations";
import { formatDateArgentina, formatUsdArgentina } from "@/lib/dates";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CorresponsalDetailPage({ params }: PageProps) {
  const { id } = await params;
  const numericId = parseInt(id);
  
  // Get correspondent
  const result = await db
    .select()
    .from(corresponsales)
    .where(eq(corresponsales.id, numericId));

  if (result.length === 0) {
    notFound();
  }

  const corresponsal = result[0];

  // Get all cases for this correspondent (by ID or by name as fallback)
  const casosCorresponsal = await db
    .select()
    .from(casos)
    .where(or(
      eq(casos.corresponsalId, numericId),
      eq(casos.corresponsal, corresponsal.nombre)
    ))
    .orderBy(desc(casos.id));

  // Calculate statistics
  const totalCasos = casosCorresponsal.length;
  const casosAbiertos = casosCorresponsal.filter(c => c.estadoInterno === "Abierto").length;
  const casosCerrados = casosCorresponsal.filter(c => c.estadoInterno === "Cerrado").length;
  const casosPausados = casosCorresponsal.filter(c => c.estadoInterno === "Pausado").length;
  
  // Calculate totals
  const totalFee = casosCorresponsal.reduce((acc, c) => acc + (Number(c.fee) || 0), 0);
  const totalCostoUsd = casosCorresponsal.reduce((acc, c) => acc + (Number(c.costoUsd) || 0), 0);
  const totalMontoAgregado = casosCorresponsal.reduce((acc, c) => acc + (Number(c.montoAgregado) || 0), 0);
  const totalGeneral = totalFee + totalCostoUsd + totalMontoAgregado;
  
  const casosConFactura = casosCorresponsal.filter(c => c.tieneFactura).length;

  // Calculate totals by status
  const casosOnGoing = casosCorresponsal.filter(c => c.estadoCaso === "On Going").length;
  const casosCobrado = casosCorresponsal.filter(c => c.estadoCaso === "Cobrado").length;
  const casosParaRefacturar = casosCorresponsal.filter(c => c.estadoCaso === "Para refacturar").length;
  const casosNoFee = casosCorresponsal.filter(c => c.estadoCaso === "No Fee").length;

  const calculateTotal = (caso: typeof casosCorresponsal[0]) => {
    return (Number(caso.fee) || 0) + (Number(caso.costoUsd) || 0) + (Number(caso.montoAgregado) || 0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {corresponsal.nombre}
            </h1>
            <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${
              corresponsal.activo 
                ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                : "bg-slate-100 text-slate-600 border-slate-200"
            }`}>
              {corresponsal.activo ? "Activo" : "Inactivo"}
            </span>
          </div>
          {corresponsal.pais && (
            <p className="text-slate-500 mt-1 flex items-center gap-2">
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
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Link
            href={`/admin/corresponsales/${corresponsal.id}/editar`}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Editar
          </Link>
          <Link
            href="/admin/corresponsales"
            className="px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Cases */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Casos</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{totalCasos}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Open Cases */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Abiertos</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{casosAbiertos}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-purple-500" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ingresos Totales</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{formatUsdArgentina(totalGeneral)}</p>
            </div>
            <div className="w-12 h-12 bg-violet-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* With Invoice */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Con Factura</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{casosConFactura}/{totalCasos}</p>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Estados Internos</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <span className="text-sm font-medium text-slate-700">Abiertos</span>
              </div>
              <span className="font-bold text-emerald-700">{casosAbiertos}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-slate-400 rounded-full"></div>
                <span className="text-sm font-medium text-slate-700">Cerrados</span>
              </div>
              <span className="font-bold text-slate-700">{casosCerrados}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                <span className="text-sm font-medium text-slate-700">Pausados</span>
              </div>
              <span className="font-bold text-amber-700">{casosPausados}</span>
            </div>
          </div>
        </div>

        {/* Financial Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Desglose Financiero</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-slate-700">Fee</span>
              </div>
              <span className="font-bold text-blue-700">{formatUsdArgentina(totalFee)}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-violet-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-violet-500 rounded-full"></div>
                <span className="text-sm font-medium text-slate-700">Costo USD</span>
              </div>
              <span className="font-bold text-violet-700">{formatUsdArgentina(totalCostoUsd)}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-teal-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                <span className="text-sm font-medium text-slate-700">Monto Agregado</span>
              </div>
              <span className="font-bold text-teal-700">{formatUsdArgentina(totalMontoAgregado)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Case Status Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Estado de Casos</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="p-3 bg-blue-50 rounded-xl text-center">
            <p className="text-2xl font-bold text-blue-700">{casosOnGoing}</p>
            <p className="text-xs font-medium text-blue-600">On Going</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-center">
            <p className="text-2xl font-bold text-emerald-700">{casosCobrado}</p>
            <p className="text-xs font-medium text-emerald-600">Cobrado</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl text-center">
            <p className="text-2xl font-bold text-amber-700">{casosParaRefacturar}</p>
            <p className="text-xs font-medium text-amber-600">Para Refacturar</p>
          </div>
          <div className="p-3 bg-violet-50 rounded-xl text-center">
            <p className="text-2xl font-bold text-violet-700">{casosNoFee}</p>
            <p className="text-xs font-medium text-violet-600">No Fee</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl text-center">
            <p className="text-2xl font-bold text-slate-700">{totalCasos - casosOnGoing - casosCobrado - casosParaRefacturar - casosNoFee}</p>
            <p className="text-xs font-medium text-slate-500">Otros</p>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Información de Contacto</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {corresponsal.email && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-slate-500">Email</p>
                <p className="text-sm font-medium text-slate-900">{corresponsal.email}</p>
              </div>
            </div>
          )}
          {corresponsal.telefono && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-slate-500">Teléfono</p>
                <p className="text-sm font-medium text-slate-900">{corresponsal.telefono}</p>
              </div>
            </div>
          )}
          {corresponsal.contacto && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-slate-500">Persona de Contacto</p>
                <p className="text-sm font-medium text-slate-900">{corresponsal.contacto}</p>
              </div>
            </div>
          )}
        </div>
        {corresponsal.direccion && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-500 mb-1">Dirección</p>
            <p className="text-sm text-slate-900">{corresponsal.direccion}</p>
          </div>
        )}
        {corresponsal.notas && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-500 mb-1">Notas</p>
            <p className="text-sm text-slate-900">{corresponsal.notas}</p>
          </div>
        )}
      </div>

      {/* Cases List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900">Casos Asignados ({totalCasos})</h3>
        </div>
        
        {casosCorresponsal.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-slate-500 font-medium">No hay casos asignados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200">
                  <th className="text-left px-5 py-4 font-semibold text-slate-600">ID</th>
                  <th className="text-left px-5 py-4 font-semibold text-slate-600">Caso Assistravel</th>
                  <th className="text-left px-5 py-4 font-semibold text-slate-600">Caso Corresponsal</th>
                  <th className="text-left px-5 py-4 font-semibold text-slate-600">Fecha</th>
                  <th className="text-left px-5 py-4 font-semibold text-slate-600">País</th>
                  <th className="text-right px-5 py-4 font-semibold text-slate-600">Total USD</th>
                  <th className="text-left px-5 py-4 font-semibold text-slate-600">Estado</th>
                  <th className="text-center px-5 py-4 font-semibold text-slate-600">Fact.</th>
                  <th className="text-right px-5 py-4 font-semibold text-slate-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {casosCorresponsal.map((caso) => (
                  <tr key={caso.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                        #{caso.id}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs text-slate-700 bg-slate-100 px-2 py-1 rounded-md">
                        {caso.nroCasoAssistravel}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {caso.nroCasoCorresponsal || "—"}
                    </td>
                    <td className="px-5 py-4 text-slate-600 whitespace-nowrap">
                      {caso.fechaInicio ? formatDateArgentina(caso.fechaInicio) : "—"}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {caso.pais ? (
                        <span className="flex items-center gap-2">
                          {isCustomCountry(caso.pais) ? (
                            <span className="w-5 h-4 flex items-center justify-center bg-slate-200 rounded text-xs font-medium">
                              ?
                            </span>
                          ) : (
                            <img
                              src={`https://flagcdn.com/w20/${getCountryCode(caso.pais)}.png`}
                              alt={caso.pais}
                              className="w-5 h-4 rounded object-cover"
                            />
                          )}
                          <span>{caso.pais}</span>
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-5 py-4 text-right font-semibold text-slate-900 whitespace-nowrap">
                      {formatUsdArgentina(calculateTotal(caso))}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                        caso.estadoInterno === "Abierto" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                        caso.estadoInterno === "Cerrado" ? "bg-slate-100 text-slate-600 border-slate-200" :
                        caso.estadoInterno === "Pausado" ? "bg-amber-50 text-amber-700 border-amber-200" :
                        "bg-slate-100 text-slate-700 border-slate-200"
                      }`}>
                        {caso.estadoInterno}
                      </span>
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
                        <Link
                          href={`/casos/${caso.id}`}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
                          title="Ver detalle"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                        <Link
                          href={`/casos/${caso.id}/editar`}
                          className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all duration-200"
                          title="Editar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="text-sm text-slate-500 text-center">
        <p>Creado: {corresponsal.createdAt ? formatDateArgentina(corresponsal.createdAt.toISOString()) : "—"}</p>
        <p>Última actualización: {corresponsal.updatedAt ? formatDateArgentina(corresponsal.updatedAt.toISOString()) : "—"}</p>
      </div>
    </div>
  );
}
