# Active Context: Next.js Starter Template

## Current State

**Template Status**: ✅ Full CRUD Application with Authentication - Assistravel Case Management (Build Fixed)

The application is a complete CRUD system for managing medical/insurance cases (casos) with corresponsales, plus a full authentication and user management system. Built with Next.js 16, TypeScript, Tailwind CSS 4, Drizzle ORM + SQLite, bcryptjs + jose JWT.

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
- [x] Authentication system with JWT (bcryptjs + jose)
- [x] Users table with roles (Administrador, Corresponsal)
- [x] Login page with form
- [x] Auth API routes (POST /api/auth/login, POST /api/auth/logout)
- [x] Middleware for route protection
- [x] Fixed Edge Middleware deployment issue (proxy.ts with default export)
- [x] User management module (admin only) at /admin/usuarios
- [x] User CRUD API routes at /api/usuarios
- [x] UserMenu component with logout and role display
- [x] Seed script for default admin user
- [x] Role-based access control
- [x] Corresponsales module with CRUD operations
- [x] Corresponsales table in database (nombre, email, telefono, pais, direccion, contacto, notas, activo)
- [x] Corresponsales API routes at /api/corresponsales
- [x] Admin pages for managing corresponsales at /admin/corresponsales
- [x] CasoForm now uses dropdown with active corresponsales
- [x] Country dropdown with flag emojis in forms and tables
- [x] Case registration info block (createdBy, updatedBy, createdAt, updatedAt)

## Current Structure

| File/Directory | Purpose | Status |
|----------------|---------|--------|
| `src/app/page.tsx` | Home page - cases list | ✅ Ready |
| `src/app/layout.tsx` | Root layout with nav + UserMenu | ✅ Ready |
| `src/app/globals.css` | Global styles | ✅ Ready |
| `src/app/login/page.tsx` | Login page | ✅ Ready |
| `src/app/casos/nuevo/page.tsx` | Create new case | ✅ Ready |
| `src/app/casos/[id]/page.tsx` | Case detail view | ✅ Ready |
| `src/app/casos/[id]/editar/page.tsx` | Edit case | ✅ Ready |
| `src/app/admin/usuarios/page.tsx` | Users list (admin only) | ✅ Ready |
| `src/app/admin/usuarios/nuevo/page.tsx` | Create user (admin only) | ✅ Ready |
| `src/app/admin/usuarios/[id]/editar/page.tsx` | Edit user (admin only) | ✅ Ready |
| `src/app/admin/corresponsales/page.tsx` | Corresponsales list | ✅ Ready |
| `src/app/admin/corresponsales/nuevo/page.tsx` | Create corresponsal | ✅ Ready |
| `src/app/admin/corresponsales/[id]/page.tsx` | Corresponsal detail | ✅ Ready |
| `src/app/admin/corresponsales/[id]/editar/page.tsx` | Edit corresponsal | ✅ Ready |
| `src/app/api/casos/route.ts` | GET all, POST | ✅ Ready |
| `src/app/api/casos/[id]/route.ts` | GET one, PUT, DELETE | ✅ Ready |
| `src/app/api/auth/login/route.ts` | POST login | ✅ Ready |
| `src/app/api/auth/logout/route.ts` | POST logout | ✅ Ready |
| `src/app/api/usuarios/route.ts` | GET all, POST users | ✅ Ready |
| `src/app/api/usuarios/[id]/route.ts` | GET, PUT, DELETE user | ✅ Ready |
| `src/db/schema.ts` | Drizzle schema - casos + users tables | ✅ Ready |
| `src/db/index.ts` | Database client | ✅ Ready |
| `src/db/migrate.ts` | Migration runner | ✅ Ready |
| `src/db/seed.ts` | Seed admin user | ✅ Ready |
| `src/lib/validations.ts` | Zod schema + constants | ✅ Ready |
| `src/lib/auth.ts` | JWT auth utilities | ✅ Ready |
| `src/middleware.ts` | Route protection middleware | ✅ Ready |
| `src/components/CasosTable.tsx` | Table with search/filter/sort | ✅ Ready |
| `src/components/CasoForm.tsx` | Create/edit form | ✅ Ready |
| `src/components/StatsCards.tsx` | Dashboard stats | ✅ Ready |
| `src/components/DeleteModal.tsx` | Delete confirmation | ✅ Ready |
| `src/components/CasoDetailActions.tsx` | Edit/delete buttons | ✅ Ready |
| `src/components/LoginForm.tsx` | Login form | ✅ Ready |
| `src/components/UserMenu.tsx` | User dropdown menu | ✅ Ready |
| `src/components/UsuariosTable.tsx` | Users table | ✅ Ready |
| `src/components/UsuarioForm.tsx` | Create/edit user form | ✅ Ready |
| `.kilocode/` | AI context & recipes | ✅ Ready |

## Database Schema

### casos table
Fields: id, corresponsal, nroCasoAssistravel, nroCasoCorresponsal, fechaInicio, pais, fee, costoUsd, montoAgregado, costoMonedaLocal, simboloMoneda, informeMedico, tieneFactura, fechaEmisionFactura, fechaVencimientoFactura, fechaPagoFactura, nroFactura, estadoInterno (Abierto/Cerrado/Pausado/Cancelado), estadoCaso (No Fee/On Going/Refacturado/Para refacturar/Cobrado), observaciones, createdBy, updatedBy, createdAt, updatedAt

### users table
Fields: id, name, email, password (hashed), role (Administrador/Corresponsal), active, createdAt, updatedAt

### corresponsales table
Fields: id, nombre, email, telefono, pais, direccion, contacto, notas, activo, createdAt, updatedAt

## Default Admin User
- Email: admin@assistravel.com
- Password: Admin123!
- Role: Administrador

## Session History

| Date | Changes |
|------|---------|
| Initial | Template created with base setup |
| 2026-02-28 | Full CRUD application for Assistravel case management |
| 2026-02-28 | Authentication system + user management module |
| 2026-03-01 | Corresponsales module with CRUD + integration with cases form |
| 2026-03-01 | Case registration info block (createdBy, updatedBy) |
