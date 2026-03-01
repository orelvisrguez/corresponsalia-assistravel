"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CorresponsalFormData, corresponsalSchema } from "@/lib/validations";
import { Corresponsal } from "@/db/schema";
import Link from "next/link";
import CountrySelect from "./CountrySelect";

interface CorresponsalFormProps {
  corresponsal?: Corresponsal;
  onSuccess?: () => void;
}

export default function CorresponsalForm({ corresponsal, onSuccess }: CorresponsalFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CorresponsalFormData>({
    resolver: zodResolver(corresponsalSchema),
    defaultValues: {
      nombre: corresponsal?.nombre || "",
      email: corresponsal?.email || "",
      telefono: corresponsal?.telefono || "",
      pais: corresponsal?.pais || "",
      direccion: corresponsal?.direccion || "",
      contacto: corresponsal?.contacto || "",
      notas: corresponsal?.notas || "",
      activo: corresponsal?.activo ?? true,
    },
  });

  const onSubmit = async (data: CorresponsalFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const url = corresponsal 
        ? `/api/corresponsales/${corresponsal.id}`
        : "/api/corresponsales";
      
      const method = corresponsal ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al guardar el corresponsal");
      }

      if (onSuccess) {
        onSuccess();
      } else {
        window.location.href = "/admin/corresponsales";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar el corresponsal");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            {...register("nombre")}
            type="text"
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50 transition-all"
            placeholder="Nombre del corresponsal"
          />
          {errors.nombre && (
            <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {errors.nombre.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Email
          </label>
          <input
            {...register("email")}
            type="email"
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50 transition-all"
            placeholder="corresponsal@ejemplo.com"
          />
          {errors.email && (
            <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Teléfono
          </label>
          <input
            {...register("telefono")}
            type="text"
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50 transition-all"
            placeholder="+54 9 11 1234 5678"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            País
          </label>
          <CountrySelect
            value={watch("pais") || ""}
            onChange={(value) => setValue("pais", value)}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Persona de Contacto
          </label>
          <input
            {...register("contacto")}
            type="text"
            placeholder="Nombre de persona de contacto"
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50 transition-all"
          />
        </div>

        <div className="flex items-center">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input
                {...register("activo")}
                type="checkbox"
                id="activo"
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-500/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </div>
            <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
              Corresponsal activo
            </span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Dirección
        </label>
        <textarea
          {...register("direccion")}
          rows={2}
          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50 transition-all resize-none"
          placeholder="Dirección del corresponsal"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Notas
        </label>
        <textarea
          {...register("notas")}
          rows={3}
          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50 transition-all resize-none"
          placeholder="Notas adicionales sobre el corresponsal"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 shadow-lg shadow-blue-600/20 flex items-center gap-50 transition2"
        >
          {isSubmitting ? (
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
              {corresponsal ? "Actualizar" : "Crear Corresponsal"}
            </>
          )}
        </button>
        <Link
          href="/admin/corresponsales"
          className="px-6 py-2.5 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-all flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Cancelar
        </Link>
      </div>
    </form>
  );
}
