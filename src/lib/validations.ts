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

export const ESTADO_CASO_ROW_COLORS: Record<string, string> = {
  "No Fee": "bg-slate-50",
  "On Going": "bg-blue-50/70",
  Refacturado: "bg-purple-50/70",
  "Para refacturar": "bg-orange-50/70",
  Cobrado: "bg-emerald-50/70",
};

export const corresponsalSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Email inválido").optional().nullable(),
  telefono: z.string().optional().nullable(),
  pais: z.string().optional().nullable(),
  direccion: z.string().optional().nullable(),
  contacto: z.string().optional().nullable(),
  notas: z.string().optional().nullable(),
  activo: z.boolean(),
});

export type CorresponsalFormData = z.infer<typeof corresponsalSchema>;

// Country list with ISO codes and flag emojis
export const COUNTRIES = [
  { code: "AR", name: "Argentina", flag: "🇦🇷" },
  { code: "BO", name: "Bolivia", flag: "🇧🇴" },
  { code: "BR", name: "Brasil", flag: "🇧🇷" },
  { code: "CL", name: "Chile", flag: "🇨🇱" },
  { code: "CO", name: "Colombia", flag: "🇨🇴" },
  { code: "CR", name: "Costa Rica", flag: "🇨🇷" },
  { code: "CU", name: "Cuba", flag: "🇨🇺" },
  { code: "DO", name: "República Dominicana", flag: "🇩🇴" },
  { code: "EC", name: "Ecuador", flag: "🇪🇨" },
  { code: "SV", name: "El Salvador", flag: "🇸🇻" },
  { code: "GT", name: "Guatemala", flag: "🇬🇹" },
  { code: "HN", name: "Honduras", flag: "🇭🇳" },
  { code: "MX", name: "México", flag: "🇲🇽" },
  { code: "NI", name: "Nicaragua", flag: "🇳🇮" },
  { code: "PA", name: "Panamá", flag: "🇵🇦" },
  { code: "PY", name: "Paraguay", flag: "🇵🇾" },
  { code: "PE", name: "Perú", flag: "🇵🇪" },
  { code: "PR", name: "Puerto Rico", flag: "🇵🇷" },
  { code: "UY", name: "Uruguay", flag: "🇺🇾" },
  { code: "VE", name: "Venezuela", flag: "🇻🇪" },
  { code: "US", name: "Estados Unidos", flag: "🇺🇸" },
  { code: "CA", name: "Canadá", flag: "🇨🇦" },
  { code: "ES", name: "España", flag: "🇪🇸" },
  { code: "IT", name: "Italia", flag: "🇮🇹" },
  { code: "PT", name: "Portugal", flag: "🇵🇹" },
  { code: "FR", name: "Francia", flag: "🇫🇷" },
  { code: "DE", name: "Alemania", flag: "🇩🇪" },
  { code: "GB", name: "Reino Unido", flag: "🇬🇧" },
  { code: "CN", name: "China", flag: "🇨🇳" },
  { code: "JP", name: "Japón", flag: "🇯🇵" },
  { code: "KR", name: "Corea del Sur", flag: "🇰🇷" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
] as const;

export type Country = typeof COUNTRIES[number];

// Get country flag emoji by country name or code
export function getCountryFlag(countryNameOrCode: string): string {
  if (!countryNameOrCode) return "";
  const country = COUNTRIES.find(
    (c) => c.name === countryNameOrCode || c.code === countryNameOrCode
  );
  return country?.flag || "";
}
