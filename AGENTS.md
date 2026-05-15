# AGENTS.md — MovieStore Project

## Overview
**MovieStore** is a CRUD web app for managing Movie records with Role-Based Access Control (RBAC).
Read `SPEC.md` before starting any task.
Always respond in Thai.

## How to Work
- Always explain what you're about to do before doing it
- Ask when unsure, never assume
- Follow Implementation Order in Spec step by step
- Notify when encountering problems or trade-offs that require a decision

## Tech Stack
- Next.js 16 (App Router) + TypeScript
- Supabase (PostgreSQL) + Prisma 7 ORM
- MobX + mobx-state-tree (State Management)
- Tailwind CSS v4 + shadcn/ui
- JWT + bcrypt (Auth)
- React Hook Form + Zod (Form & Validation)

## Project Structure
- **No `src/` directory** — all folders (`app/`, `components/`, `stores/`, etc.) are at the root level
- `middleware.ts` is at the root level
- `prisma.config.ts` is at the root level (Prisma 7 config)

## Critical Rules
1. **MobX** → Client Component only. Every file using MobX must have `"use client"`
2. **JWT Cookie** → Handle via Route Handler or Server Action only
3. **Password** → Never return password hash in any response
4. **RBAC** → Always check permissions from Database. Never hardcode roles in code
5. **Zod** → Validate input on both Frontend and Backend
6. **Prisma 7** → Connection URL is in `prisma.config.ts`, not in `schema.prisma`

## Prisma 7 Notes

### Migrations
- `schema.prisma` datasource has only `provider = "postgresql"` — no `url`
- `prisma.config.ts` holds `datasource.url` using `DIRECT_URL` (direct connection for migrations)
- Use `npx prisma migrate dev` — not `db push`

### Runtime Client (`lib/prisma.ts`)
The PrismaClient must use the adapter pattern with `DATABASE_URL` (pgbouncer):
```typescript
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg(new Pool({ connectionString: process.env.DATABASE_URL })),
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
```

## RBAC Schema Design
- `User.role` (enum) links to `RoleDefinition.name` via Prisma relation
- RBAC check flow: `User → RoleDefinition → RolePermission → Permission`
- Never hardcode role checks — always query from DB

## Environment Variables
```env
DATABASE_URL="postgresql://...?pgbouncer=true"   # Connection pooling (runtime)
DIRECT_URL="postgresql://..."                    # Direct connection (migrations)
JWT_SECRET="your-secret-key-min-32-chars"
JWT_EXPIRES_IN="7d"
```

## Common Commands
```bash
npx prisma generate                    # Generate Prisma Client
npx prisma migrate dev --name <name>   # Create and run migration
npx prisma db seed                     # Seed initial data
npm run dev                            # Run development server
```

## Test Accounts (after seeding)
| Username | Password | Role |
|----------|----------|------|
| manager | password123 | MANAGER |
| teamleader | password123 | TEAMLEADER |
| floorstaff | password123 | FLOORSTAFF |

## Key Files
- `SPEC.md` — Full project specification
- `CLAUDE.md` — Claude Code instructions
- `AGENTS.md` — This file, for AI agents
- `prisma.config.ts` — Prisma 7 datasource + migration config
- `prisma/schema.prisma` — Database schema
- `lib/prisma.ts` — Prisma Client singleton (adapter pattern)
- `lib/jwt.ts` — JWT sign/verify utilities
- `middleware.ts` — JWT verification on every protected route
