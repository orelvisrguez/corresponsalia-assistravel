import { sqliteTable, text, integer, real, foreignKey } from "drizzle-orm/sqlite-core";

export const corresponsales = sqliteTable("corresponsales", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nombre: text("nombre").notNull(),
  email: text("email"),
  telefono: text("telefono"),
  pais: text("pais"),
  direccion: text("direccion"),
  contacto: text("contacto"),
  notas: text("notas"),
  activo: integer("activo", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
});

export type Corresponsal = typeof corresponsales.$inferSelect;
export type NewCorresponsal = typeof corresponsales.$inferInsert;

export const casos = sqliteTable("casos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  corresponsal: text("corresponsal").notNull(),
  corresponsalId: integer("corresponsal_id").references(() => corresponsales.id),
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

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["Administrador", "Corresponsal"] })
    .notNull()
    .default("Corresponsal"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
