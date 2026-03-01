CREATE TABLE `corresponsales` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nombre` text NOT NULL,
	`email` text,
	`telefono` text,
	`pais` text,
	`direccion` text,
	`contacto` text,
	`notas` text,
	`activo` integer DEFAULT true NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
ALTER TABLE `casos` ADD `corresponsal_id` integer REFERENCES corresponsales(id);