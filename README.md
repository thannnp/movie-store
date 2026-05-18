# MovieStore

CRUD web application สำหรับจัดการข้อมูลภาพยนตร์ พร้อมระบบ Role-Based Access Control (RBAC)

## Tech Stack

- **Framework** — Next.js 16 (App Router) + TypeScript
- **Database** — Supabase (PostgreSQL) + Prisma 7 ORM
- **State Management** — MobX + mobx-state-tree
- **Styling** — Tailwind CSS v4 + shadcn/ui
- **Auth** — JWT (httpOnly cookie) + bcrypt
- **Validation** — React Hook Form + Zod

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database (หรือ Supabase project)

### Installation

```bash
npm install
```

### Environment Variables

สร้างไฟล์ `.env` ที่ root:

```env
DATABASE_URL="postgresql://...?pgbouncer=true"   # Connection pooling (runtime)
DIRECT_URL="postgresql://..."                    # Direct connection (migrations)
JWT_SECRET="your-secret-key-min-32-chars"
JWT_EXPIRES_IN="7d"
```

### Database Setup

```bash
npx prisma migrate dev --name init   # Run migrations
npx prisma db seed                   # Seed initial data
```

### Development

```bash
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000)

### Build

```bash
npm run build
```

---

## Project Structure

```
movie-store/
├── app/
│   ├── (main)/            # Protected layout group
│   │   ├── layout.tsx
│   │   └── movies/page.tsx
│   ├── api/
│   │   ├── auth/          # Login, Logout, Me
│   │   └── movies/        # CRUD endpoints
│   ├── generated/prisma/  # Prisma generated client (gitignored)
│   └── login/page.tsx
├── components/
│   ├── movies/            # Movie-specific components
│   └── ui/                # shadcn/ui components
├── lib/
│   ├── auth.ts            # RBAC permission check
│   ├── errors.ts          # Error handling utilities
│   ├── jwt.ts             # JWT sign/verify
│   └── prisma.ts          # Prisma Client singleton
├── schemas/               # Zod validation schemas
├── stores/                # MobX State Tree stores
│   ├── AuthStore.ts
│   ├── MovieStore.ts
│   └── RootStore.ts
├── middleware.ts           # JWT verification on protected routes
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
└── prisma.config.ts        # Prisma 7 datasource config
```

---

## API Documentation

### Authentication

#### POST `/api/auth/login`

Login และรับ JWT cookie

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response 200:**
```json
{
  "user": { "id": "uuid", "email": "string", "role": "MANAGER | TEAMLEADER | FLOORSTAFF" },
  "permissions": ["read", "create", "update", "delete"]
}
```

**Response 401:** `{ "error": "Invalid credentials" }`

---

#### POST `/api/auth/logout`

ลบ JWT cookie

**Response 200:** `{ "success": true }`

---

#### GET `/api/auth/me`

ดึงข้อมูล user ปัจจุบันจาก JWT cookie

**Headers:** ต้องมี `token` cookie

**Response 200:**
```json
{
  "user": { "id": "uuid", "email": "string", "role": "string" },
  "permissions": ["read", "create", "update", "delete"]
}
```

**Response 401:** `{ "error": "Unauthorized" }`

---

### Movies

> ทุก endpoint ต้องมี JWT cookie (`token`) และ user ต้องมี permission ที่เหมาะสม

#### GET `/api/movies`

ดึงรายการภาพยนตร์ทั้งหมด (ต้องมี permission: `read`)

**Response 200:**
```json
[
  {
    "id": "uuid",
    "title": "string",
    "yearReleased": 2024,
    "rating": "G | PG | M | MA | R",
    "createdBy": "uuid",
    "createdAt": "ISO date",
    "updatedAt": "ISO date",
    "user": { "email": "string" }
  }
]
```

---

#### POST `/api/movies`

สร้างภาพยนตร์ใหม่ (ต้องมี permission: `create`)

**Request Body:**
```json
{
  "title": "string (required)",
  "yearReleased": 1888-2031,
  "rating": "G | PG | M | MA | R"
}
```

**Response 201:** Movie object

**Response 400:** Validation errors

---

#### PUT `/api/movies/:id`

แก้ไขภาพยนตร์ (ต้องมี permission: `update`)

**Request Body:** เหมือน POST

**Response 200:** Updated movie object

**Response 404:** `{ "error": "Movie not found" }`

---

#### DELETE `/api/movies/:id`

ลบภาพยนตร์ (ต้องมี permission: `delete`)

**Response 200:** `{ "success": true }`

**Response 404:** `{ "error": "Movie not found" }`

---

### Error Responses

ทุก endpoint อาจ return:

| Status | Meaning |
|--------|---------|
| 401 | Unauthorized — ไม่มี token หรือ token หมดอายุ |
| 403 | Forbidden — ไม่มี permission |
| 404 | Not Found — resource ไม่พบ |
| 400 | Bad Request — validation error (Zod) |

---

## Database Schema

โปรเจกต์ใช้ **PostgreSQL** (ผ่าน Supabase) + **Prisma 7 ORM** โดย schema ประกอบด้วย 5 tables:

### ER Diagram

```
┌──────────────┐       ┌──────────────────┐       ┌────────────────┐
│    users     │       │  role_definitions │       │  permissions   │
├──────────────┤       ├──────────────────┤       ├────────────────┤
│ id (UUID) PK │       │ id (Int) PK      │       │ id (Int) PK    │
│ email        │       │ name (Role) UQ   │       │ action         │
│ password     │  ┌───▶│                  │◀──┐   │ resource       │
│ role (enum)──┼──┘    └──────────────────┘   │   │ UQ(action,res) │
│ createdAt    │                              │   └───────┬────────┘
└──────┬───────┘       ┌──────────────────┐   │           │
       │               │ role_permissions  │   │           │
       │               ├──────────────────┤   │           │
       │               │ id (Int) PK      │   │           │
       │               │ roleId ──────────┼───┘           │
       │               │ permissionId ────┼───────────────┘
       │               │ UQ(roleId,permId)│
       ▼               └──────────────────┘
┌──────────────┐
│    movies    │
├──────────────┤
│ id (UUID) PK │
│ title        │
│ yearReleased │
│ rating (enum)│
│ createdBy FK─┼──▶ users.id
│ createdAt    │
│ updatedAt    │
└──────────────┘
```

### Tables

| Table | คำอธิบาย |
|-------|----------|
| `users` | ผู้ใช้งานระบบ (email, password hash, role) |
| `movies` | ข้อมูลภาพยนตร์ ผูกกับ user ที่สร้าง |
| `role_definitions` | นิยาม role (MANAGER, TEAMLEADER, FLOORSTAFF) |
| `permissions` | สิทธิ์ที่กำหนดได้ (action + resource) |
| `role_permissions` | Junction table ระหว่าง role กับ permission |

### Enums

| Enum | Values |
|------|--------|
| `Role` | `MANAGER`, `TEAMLEADER`, `FLOORSTAFF` |
| `Rating` | `G`, `PG`, `M`, `MA`, `R` |

### RBAC Flow

```
User → (role) → RoleDefinition → RolePermission → Permission
```

เมื่อต้องตรวจสิทธิ์ ระบบจะ query ตาม chain นี้เพื่อดูว่า role ของ user มี permission ที่ต้องการหรือไม่

### Prisma 7 Configuration

โปรเจกต์ใช้ Prisma 7 ซึ่งมีความแตกต่างจากเวอร์ชันก่อน:

- **`prisma.config.ts`** — กำหนด `datasource.url` (ไม่ใส่ใน `schema.prisma`)
- **Custom output** — Generated client อยู่ที่ `app/generated/prisma/`
- **Adapter pattern** — Runtime ใช้ `@prisma/adapter-pg` กับ connection pool

```typescript
// lib/prisma.ts — Singleton pattern
import { PrismaClient } from "@/app/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

const prisma = new PrismaClient({
  adapter: new PrismaPg(new Pool({ connectionString: process.env.DATABASE_URL })),
})
```

### Common Commands

```bash
npx prisma generate                    # Generate client
npx prisma migrate dev --name <name>   # Create & run migration
npx prisma db seed                     # Seed data
npx prisma studio                      # Open GUI browser
```

---

## RBAC (Role-Based Access Control)

| Role | read | create | update | delete |
|------|------|--------|--------|--------|
| MANAGER | ✅ | ✅ | ✅ | ✅ |
| TEAMLEADER | ✅ | ✅ | ✅ | ❌ |
| FLOORSTAFF | ✅ | ❌ | ❌ | ❌ |

Permissions ถูก query จาก Database เสมอ (ไม่ได้ hardcode ใน code)

---

## Learning: MobX-State-Tree (MST)

โปรเจกต์นี้ใช้ **mobx-state-tree** (MST) เป็น state management ซึ่งเป็น opinionated state container ที่ผสาน reactive programming (MobX) กับ tree structure ที่มี type safety

### ทำไมถึงใช้ MST?

- **Structured State** — State ถูกจัดเป็น tree ที่ชัดเจน ไม่กระจัดกระจาย
- **Self-describing** — Model define ตัวเอง (types, actions, views) ในที่เดียว
- **Runtime Type Checking** — ตรวจจับ type errors ตอน runtime ได้
- **Snapshot & Hydration** — Serialize/deserialize state ง่ายมาก
- **Async flows** — จัดการ async operations ด้วย `flow()` generator

### Core Concepts ที่ใช้ในโปรเจกต์

#### 1. Models — นิยาม shape ของ state

```typescript
import { types } from "mobx-state-tree"

const MovieModel = types.model("Movie", {
  id: types.identifier,       // unique key
  title: types.string,
  yearReleased: types.number,
  rating: types.string,
})
```

#### 2. Actions — วิธีเดียวที่จะแก้ไข state ได้

```typescript
.actions((self) => ({
  clearError() {
    self.error = null   // mutate ตรงๆ ได้ เพราะ MST ใช้ Immer-like approach
  },
}))
```

#### 3. Views — computed/derived values

```typescript
.views((self) => ({
  can(action: string) {
    return self.permissions.includes(action)  // reactive!
  },
}))
```

#### 4. Async Actions ด้วย `flow()`

```typescript
import { flow } from "mobx-state-tree"

.actions((self) => ({
  fetchMovies: flow(function* () {
    self.isLoading = true
    try {
      const res: Response = yield fetch("/api/movies")  // yield แทน await
      const data = yield res.json()
      self.movies.replace(data)
    } finally {
      self.isLoading = false
    }
  }),
}))
```

> ⚠️ MST ใช้ `flow()` + generator function (`function*`) แทน async/await เพื่อให้ track async state mutations ได้ถูกต้อง

#### 5. Store Composition — RootStore pattern

```typescript
const RootStore = types.model("RootStore", {
  auth: types.optional(AuthStore, {}),
  movies: types.optional(MovieStore, {}),
})
```

### การใช้ MST กับ React (Next.js)

```typescript
// ใน Client Component เท่านั้น ("use client")
import { observer } from "mobx-react-lite"

const MovieList = observer(() => {
  const { movies } = useStore()
  // component จะ re-render อัตโนมัติเมื่อ movies เปลี่ยน
  return <div>{movies.movies.map(...)}</div>
})
```

> ⚠️ **กฎสำคัญ:** ทุกไฟล์ที่ใช้ MobX/MST ต้องเป็น Client Component (`"use client"`)

### Resources สำหรับเรียนรู้เพิ่มเติม

- [MST Official Docs](https://mobx-state-tree.js.org/) — เอกสารหลัก
- [MobX-State-Tree Getting Started](https://mobx-state-tree.js.org/intro/getting-started) — Tutorial เริ่มต้น
- [MST Patterns](https://mobx-state-tree.js.org/tips/patterns) — Best practices
- [MobX React Lite](https://github.com/mobxjs/mobx/tree/main/packages/mobx-react-lite) — React bindings ที่ใช้กับ functional components
- [MST with Next.js](https://dev.to/ivandotv/mobx-server-side-rendering-with-next-js-4m18) — วิธี integrate กับ Next.js

---

## Test Accounts (Seeded)

| Email | Password | Role |
|-------|----------|------|
| manager@example.com | password123 | MANAGER |
| teamlead@example.com | password123 | TEAMLEADER |
| staff@example.com | password123 | FLOORSTAFF |
