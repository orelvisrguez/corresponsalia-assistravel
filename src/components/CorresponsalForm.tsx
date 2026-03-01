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
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre *
          </label>
          <input
            {...register("nombre")}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.nombre && (
            <p className="mt-1 text-sm text-red-600">{errors.nombre.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            {...register("email")}
            type="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono
          </label>
          <input
            {...register("telefono")}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            País
          </label>
          <CountrySelect
            value={watch("pais") || ""}
            onChange={(value) => setValue("pais", value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contacto
          </label>
          <input
            {...register("contacto")}
            type="text"
            placeholder="Nombre de persona de contacto"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center">
          <input
            {...register("activo")}
            type="checkbox"
            id="activo"
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="activo" className="ml-2 block text-sm text-gray-700">
            Corresponsal activo
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Dirección
        </label>
        <textarea
          {...register("direccion")}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notas
        </label>
        <textarea
          {...register("notas")}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? "Guardando..." : corresponsal ? "Actualizar" : "Crear"}
        </button>
        <Link
          href="/admin/corresponsales"
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
