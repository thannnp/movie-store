# MovieStore — Project Specification
> This document is used by Claude Code to build the MovieStore project from scratch.
---
## 1. Overview
Build a CRUD web application for managing Movie records with Role-Based Access Control (RBAC).
---
## 2. Tech Stack
| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Database | Supabase (PostgreSQL) |
| ORM | Prisma |
| Auth | JWT + bcrypt |
| State Management | MobX + mobx-state-tree |
| UI Library | Tailwind CSS + shadcn/ui |
| Form | React Hook Form |
| Validation | Zod |
---
## 3. Movie Record Fields
| Field | Type | Accepted Values |
|-------|------|----------------|
| `title` | String | Movie title (required) |
| `yearReleased` | Int | Year A.D. (1888 - current year) |
| `rating` | Enum | G, PG, M, MA, R |
---
## 4. User Roles & Permissions
| Action | MANAGER | TEAMLEADER | FLOORSTAFF |
|--------|---------|-----------|-----------|
| Create | ✅ | ✅ | ✅ |
| Read | ✅ | ✅ | ✅ |
| Update | ✅ | ✅ | ✅ |
| Delete | ✅ | ❌ | ❌ |
> Permissions are managed through the RBAC Table — never hardcoded in code.
---
## 5. Database Schema (Prisma)
> Prisma 7: connection URL is configured in `prisma.config.ts`, not in `schema.prisma`

```prisma
datasource db {
  provider = "postgresql"
}
generator client {
  provider = "prisma-client-js"
}
enum Role {
  MANAGER
  TEAMLEADER
  FLOORSTAFF
}
enum Rating {
  G
  PG
  M
  MA
  R
}
model User {
  id             String         @id @default(uuid())
  username       String         @unique
  password       String         // hashed with bcrypt
  role           Role
  createdAt      DateTime       @default(now())
  movies         Movie[]
  roleDefinition RoleDefinition @relation(fields: [role], references: [name])
  @@map("users")
}
model Movie {
  id           String   @id @default(uuid())
  title        String
  yearReleased Int
  rating       Rating
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  createdBy    String
  user         User     @relation(fields: [createdBy], references: [id])
  @@map("movies")
}
model Permission {
  id              Int              @id @default(autoincrement())
  action          String           // "create" | "read" | "update" | "delete"
  resource        String           // "movie"
  rolePermissions RolePermission[]
  @@unique([action, resource])
  @@map("permissions")
}
model RoleDefinition {
  id              Int              @id @default(autoincrement())
  name            Role             @unique
  users           User[]
  rolePermissions RolePermission[]
  @@map("role_definitions")
}
model RolePermission {
  id           Int            @id @default(autoincrement())
  roleId       Int
  permissionId Int
  role         RoleDefinition @relation(fields: [roleId], references: [id])
  permission   Permission     @relation(fields: [permissionId], references: [id])
  @@unique([roleId, permissionId])
  @@map("role_permissions")
}
```

### prisma.config.ts
```typescript
import path from "node:path"
import { defineConfig } from "prisma/config"
import { config } from "dotenv"

config()

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DIRECT_URL as string,
  },
})
```
---
## 6. Seed Data (prisma/seed.ts)
```
Permissions:
  - create / movie
  - read   / movie
  - update / movie
  - delete / movie

RoleDefinitions:
  - MANAGER
  - TEAMLEADER
  - FLOORSTAFF

RolePermissions:
  - MANAGER    → create, read, update, delete
  - TEAMLEADER → create, read, update
  - FLOORSTAFF → create, read, update

Users (for dev/test):
  - username: manager    password: password123  role: MANAGER
  - username: teamleader password: password123  role: TEAMLEADER
  - username: floorstaff password: password123  role: FLOORSTAFF

Sample Movies (createdBy: manager user id = 1):
  - title: "The Shawshank Redemption"  yearReleased: 1994  rating: MA
  - title: "The Dark Knight"           yearReleased: 2008  rating: M
  - title: "Inception"                 yearReleased: 2010  rating: M
  - title: "The Lion King"             yearReleased: 1994  rating: G
  - title: "Interstellar"              yearReleased: 2014  rating: PG
```
---
## 7. REST API Endpoints
### Auth
| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| POST | `/api/auth/login` | `{ username, password }` | `{ token, user }` |
### Movies
| Method | Endpoint | Permission | Description |
|--------|----------|-----------|-------------|
| GET | `/api/movies` | read / movie | Get all movies |
| POST | `/api/movies` | create / movie | Create a movie |
| PUT | `/api/movies/[id]` | update / movie | Update a movie |
| DELETE | `/api/movies/[id]` | delete / movie | Delete a movie (MANAGER only) |
---
## 8. Auth Flow
```
1. POST /api/auth/login → verify username/password (bcrypt)
2. Valid → create JWT payload: { userId, role }
3. Store JWT in httpOnly cookie
4. Every request → middleware.ts verifies JWT
5. API routes → query RolePermission table to check permission before action
6. No permission → return 403 Forbidden
```
---
## 9. Project Structure
```
MovieStore/
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.ts
├── prisma.config.ts
├── public/
│   └── assets/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       ├── page.tsx
│   │       └── layout.tsx
│   ├── (main)/
│   │   └── movies/
│   │       ├── page.tsx
│   │       └── layout.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   └── login/
│   │   │       └── route.ts
│   │   └── movies/
│   │       ├── route.ts
│   │       └── [id]/
│   │           └── route.ts
│   ├── layout.tsx
│   ├── page.tsx
│   ├── loading.tsx
│   └── error.tsx
├── components/
│   ├── ui/
│   ├── movies/
│   │   ├── MovieTable.tsx
│   │   ├── MovieForm.tsx
│   │   └── DeleteButton.tsx
│   └── shared/
│       └── Navbar.tsx
├── stores/
│   ├── RootStore.ts
│   ├── AuthStore.ts
│   └── MovieStore.ts
├── providers/
│   └── AppProviders.tsx
├── hooks/
│   ├── useMovies.ts
│   └── useAuth.ts
├── lib/
│   ├── prisma.ts
│   └── jwt.ts
├── schemas/
│   ├── movie.schema.ts
│   └── auth.schema.ts
├── types/
│   └── index.ts
├── middleware.ts
├── .env
├── .env.example
├── next.config.ts
├── tsconfig.json
└── package.json
```
---
## 10. MobX MST Stores
### RootStore
```
RootStore
├── AuthStore
│   ├── state: { user, token, role }
│   └── actions: login(), logout(), checkAuth()
└── MovieStore
    ├── state: { movies[], isLoading, error }
    └── actions: fetchMovies(), addMovie(), updateMovie(), deleteMovie()
```
### AuthStore (mobx-state-tree)
```typescript
import { types, flow } from "mobx-state-tree"
const AuthStore = types
  .model("AuthStore", {
    username: types.maybeNull(types.string),
    role: types.maybeNull(types.string),
    isAuthenticated: types.boolean,
  })
  .actions((self) => ({
    login: flow(function* (username: string, password: string) { ... }),
    logout() { ... },
  }))
```
### MovieStore (mobx-state-tree)
```typescript
import { types, flow } from "mobx-state-tree"
const MovieModel = types.model("Movie", {
  id: types.number,
  title: types.string,
  yearReleased: types.number,
  rating: types.enumeration(["G", "PG", "M", "MA", "R"]),
})
const MovieStore = types
  .model("MovieStore", {
    movies: types.array(MovieModel),
    isLoading: types.boolean,
  })
  .actions((self) => ({
    fetchMovies: flow(function* () { ... }),
    addMovie: flow(function* (data) { ... }),
    updateMovie: flow(function* (id, data) { ... }),
    deleteMovie: flow(function* (id) { ... }),
  }))
```
---
## 11. Zod Schemas
```typescript
// schemas/movie.schema.ts  (root level, no src/)
import { z } from "zod"
export const MovieSchema = z.object({
  title: z.string().min(1, "Title is required"),
  yearReleased: z
    .number()
    .int()
    .min(1888, "Year must not be less than 1888")
    .max(new Date().getFullYear(), "Year must not exceed current year"),
  rating: z.enum(["G", "PG", "M", "MA", "R"]),
})
export type MovieInput = z.infer<typeof MovieSchema>
```
```typescript
// schemas/auth.schema.ts
import { z } from "zod"
export const LoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})
export type LoginInput = z.infer<typeof LoginSchema>
```
---
## 12. Environment Variables
```env
DATABASE_URL="postgresql://...?pgbouncer=true"   # Connection pooling (runtime)
DIRECT_URL="postgresql://..."                    # Direct connection (migrations)
JWT_SECRET="your-secret-key-min-32-chars"
JWT_EXPIRES_IN="7d"
```
---
## 13. Security Checklist
- [ ] bcrypt hash password (saltRounds: 12)
- [ ] JWT stored in httpOnly cookie (prevent XSS)
- [ ] middleware.ts verifies JWT on every route in (main)
- [ ] API routes check permission from RBAC table before every action
- [ ] Zod validates input on both frontend and backend
- [ ] Never return password hash in any response
- [ ] CORS configured correctly
---
## 14. UI Pages
### /login
- Form: username + password
- Use React Hook Form + Zod
- Show error message on failed login
- Redirect to /movies on success

### /movies
- Display all movies in a table (shadcn Table)
- Add Movie button → opens Modal Form
- Edit button → opens Modal Form with existing data
- Delete button → visible to MANAGER only + Confirm Dialog
- Show logged-in user's role on Navbar
---
## 15. Build & Run Commands
```bash
npm install
npx prisma generate
npx prisma migrate dev --name init   # Run migrations (creates tables)
npx prisma db seed                   # Seed initial data
npm run dev
npm run build
npm start
```
---
## 16. Dependencies
```bash
npm install next react react-dom typescript
npm install prisma @prisma/client @prisma/adapter-pg pg dotenv
npm install -D @types/pg
npm install jsonwebtoken bcryptjs
npm install -D @types/jsonwebtoken @types/bcryptjs
npm install mobx mobx-react-lite mobx-state-tree
npx shadcn@latest init
npm install react-hook-form zod @hookform/resolvers
npx shadcn@latest add button input label table dialog select sonner
```
---
## 17. Implementation Order
```
Step 1:  Setup Next.js 16 + TypeScript + Tailwind v4 + shadcn
Step 2:  Setup Prisma 7 + Supabase + prisma.config.ts + Schema + migrate dev
Step 3:  Write Seed data (Users + Sample Movies) + prisma db seed
Step 4:  Login page UI (interface only — no auth logic)
Step 5:  Write JWT utils + middleware
Step 6:  Write API routes (auth + movies)
Step 7:  Write Zod schemas
Step 8:  Write MobX MST stores
Step 9:  Write Movies page + CRUD UI
Step 10: Wire up Login + auth logic
Step 11: Test permissions for all roles
```
---
## 18. Important Notes for Claude Code
- MobX works on Client Component only → must have `"use client"` in every file using MobX
- JWT cookie must be handled via Route Handler or Server Action only
- Never return password hash in any response
- RBAC must always be checked from Database — never hardcode roles in code
