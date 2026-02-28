import { z } from "zod";

export const casoSchema = z.object({
  corresponsal: z.string().min(1, "El corresponsal es requerido"),
  nroCasoAssistravel: z.string().min(1, "El número de caso Assistravel es requerido"),
  nroCasoCorresponsal: z.string().optional().nullable(),
  fechaInicio: z.string().optional().nullable(),
  pais: z.string().optional().nullable(),
  fee: z.coerce.number().optional().nullable(),
  costoUsd: z.coerce.number().optional().nullable(),
  montoAgregado: z.coerce.number().optional().nullable(),
  costoMonedaLocal: z.coerce.number().optional().nullable(),
  simboloMoneda: z.string().optional().nullable(),
  informeMedico: z.boolean().default(false),
  tieneFactura: z.boolean().default(false),
  fechaEmisionFactura: z.string().optional().nullable(),
  fechaVencimientoFactura: z.string().optional().nullable(),
  fechaPagoFactura: z.string().optional().nullable(),
  nroFactura: z.string().optional().nullable(),
  estadoInterno: z.enum(["Abierto", "Cerrado", "Pausado", "Cancelado"]).default("Abierto"),
  estadoCaso: z.enum(["No Fee", "On Going", "Refacturado", "Para refacturar", "Cobrado"]).default("On Going"),
  observaciones: z.string().optional().nullable(),
});

export type CasoFormData = z.infer<typeof casoSchema>;

export const ESTADOS_INTERNOS = ["Abierto", "Cerrado", "Pausado", "Cancelado"] as const;
export const ESTADOS_CASO = ["No Fee", "On Going", "Refacturado", "Para refacturar", "Cobrado"] as const;

export const ESTADO_INTERNO_COLORS: Record<string, string> = {
  Abierto: "bg-green-100 text-green-800 border-green-200",
  Cerrado: "bg-gray-100 text-gray-800 border-gray-200",
  Pausado: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Cancelado: "bg-red-100 text-red-800 border-red-200",
};

export const ESTADO_CASO_COLORS: Record<string, string> = {
  "No Fee": "bg-slate-100 text-slate-800 border-slate-200",
  "On Going": "bg-blue-100 text-blue-800 border-blue-200",
  Refacturado: "bg-purple-100 text-purple-800 border-purple-200",
  "Para refacturar": "bg-orange-100 text-orange-800 border-orange-200",
  Cobrado: "bg-emerald-100 text-emerald-800 border-emerald-200",
};
