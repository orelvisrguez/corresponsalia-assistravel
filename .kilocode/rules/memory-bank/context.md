# Active Context: Next.js Starter Template

## Current State

**Template Status**: ✅ Full CRUD Application - Assistravel Case Management

The application is a complete CRUD system for managing medical/insurance cases (casos) with corresponsales. Built with Next.js 16, TypeScript, Tailwind CSS 4, Drizzle ORM + SQLite.

## Recently Completed

- [x] Base Next.js 16 setup with App Router
- [x] TypeScript configuration with strict mode
- [x] Tailwind CSS 4 integration
- [x] ESLint configuration
- [x] Memory bank documentation
- [x] Recipe system for common features
- [x] Full CRUD application for case management (casos)
- [x] Database schema with 22 fields for casos table
- [x] REST API routes (GET, POST, PUT, DELETE) at /api/casos
- [x] Cases list page with search, filter, sort
- [x] Stats dashboard cards
- [x] Case detail view page
- [x] Case create/edit form with validation
- [x] Delete confirmation modal
- [x] Responsive design with Tailwind CSS

## Current Structure

| File/Directory | Purpose | Status |
|----------------|---------|--------|
| `src/app/page.tsx` | Home page - cases list | ✅ Ready |
| `src/app/layout.tsx` | Root layout with nav | ✅ Ready |
| `src/app/globals.css` | Global styles | ✅ Ready |
| `src/app/casos/nuevo/page.tsx` | Create new case | ✅ Ready |
| `src/app/casos/[id]/page.tsx` | Case detail view | ✅ Ready |
| `src/app/casos/[id]/editar/page.tsx` | Edit case | ✅ Ready |
| `src/app/api/casos/route.ts` | GET all, POST | ✅ Ready |
| `src/app/api/casos/[id]/route.ts` | GET one, PUT, DELETE | ✅ Ready |
| `src/db/schema.ts` | Drizzle schema - casos table | ✅ Ready |
| `src/db/index.ts` | Database client | ✅ Ready |
| `src/db/migrate.ts` | Migration runner | ✅ Ready |
| `src/lib/validations.ts` | Zod schema + constants | ✅ Ready |
| `src/components/CasosTable.tsx` | Table with search/filter/sort | ✅ Ready |
| `src/components/CasoForm.tsx` | Create/edit form | ✅ Ready |
| `src/components/StatsCards.tsx` | Dashboard stats | ✅ Ready |
| `src/components/DeleteModal.tsx` | Delete confirmation | ✅ Ready |
| `src/components/CasoDetailActions.tsx` | Edit/delete buttons | ✅ Ready |
| `.kilocode/` | AI context & recipes | ✅ Ready |

## Database Schema - casos table

Fields: id, corresponsal, nroCasoAssistravel, nroCasoCorresponsal, fechaInicio, pais, fee, costoUsd, montoAgregado, costoMonedaLocal, simboloMoneda, informeMedico, tieneFactura, fechaEmisionFactura, fechaVencimientoFactura, fechaPagoFactura, nroFactura, estadoInterno (Abierto/Cerrado/Pausado/Cancelado), estadoCaso (No Fee/On Going/Refacturado/Para refacturar/Cobrado), observaciones, createdAt, updatedAt

## Session History

| Date | Changes |
|------|---------|
| Initial | Template created with base setup |
| 2026-02-28 | Full CRUD application for Assistravel case management |
