# MovieStore — Implementation Status

> Last updated: 2026-05-16

## Done

| Step | Description |
|------|-------------|
| 1 | Next.js 16.2.6 + TypeScript + Tailwind v4 + shadcn/ui |
| 2 | Prisma 7 schema + `prisma.config.ts` + 3 migrations applied |
| 3 | `prisma/seed.ts` — Permissions, RoleDefinitions, RolePermissions, Users, Sample Movies |
| 4 | Login page UI — React Hook Form + Zod + Controller pattern + quick-login buttons |
| 5 | `lib/prisma.ts` (adapter pattern), `lib/jwt.ts` (sign/verify), `proxy.ts` (protects `/movies/:path*`) |
| 6 | API routes: `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`, `GET+POST /api/movies`, `PUT+DELETE /api/movies/[id]` |
| 7 | Zod schemas — `schemas/auth.schema.ts`, `schemas/movie.schema.ts` (frontend + backend) |
| 8 | MobX MST stores — `RootStore`, `AuthStore` (with permissions + checkAuth), `MovieStore` (CRUD) |
| 9 | Movies page — TanStack Table DataTable + pagination + skeleton loading + MovieDialog (create/edit) + DeleteDialog |
| 10 | Login wired up — redirect to `/movies`, auth state recovery via `GET /api/auth/me` on refresh |
| 11 | RBAC — permissions fetched from DB on login/refresh, `authStore.can()` view for UI checks |

## Architecture Notes

- `middleware.ts` migrated to `proxy.ts` (Next.js 16 file convention)
- Auth state recovery: `(main)/layout.tsx` calls `authStore.checkAuth()` on mount if not authenticated
- MST observable arrays converted to plain arrays via `.slice()` before passing to TanStack Table
- Login & /api/auth/me both return `permissions[]` from DB (RBAC table lookup)
- Backoffice layout: sidebar (desktop) + header with role badge + responsive

## Test Accounts (after seeding)

| Email | Password | Role |
|-------|----------|------|
| manager@example.com | password123 | MANAGER |
| teamleader@example.com | password123 | TEAMLEADER |
| floorstaff@example.com | password123 | FLOORSTAFF |
