import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const casos = sqliteTable("casos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  corresponsal: text("corresponsal").notNull(),
  nroCasoAssistravel: text("nro_caso_assistravel").notNull(),
  nroCasoCorresponsal: text("nro_caso_corresponsal"),
  fechaInicio: text("fecha_inicio"),
  pais: text("pais"),
  fee: real("fee"),
  costoUsd: real("costo_usd"),
  montoAgregado: real("monto_agregado"),
  costoMonedaLocal: real("costo_moneda_local"),
  simboloMoneda: text("simbolo_moneda"),
  informeMedico: integer("informe_medico", { mode: "boolean" }).default(false),
  tieneFactura: integer("tiene_factura", { mode: "boolean" }).default(false),
  fechaEmisionFactura: text("fecha_emision_factura"),
  fechaVencimientoFactura: text("fecha_vencimiento_factura"),
  fechaPagoFactura: text("fecha_pago_factura"),
  nroFactura: text("nro_factura"),
  estadoInterno: text("estado_interno", {
    enum: ["Abierto", "Cerrado", "Pausado", "Cancelado"],
  }).default("Abierto"),
  estadoCaso: text("estado_caso", {
    enum: ["No Fee", "On Going", "Refacturado", "Para refacturar", "Cobrado"],
  }).default("On Going"),
  observaciones: text("observaciones"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
});

export type Caso = typeof casos.$inferSelect;
export type NewCaso = typeof casos.$inferInsert;
