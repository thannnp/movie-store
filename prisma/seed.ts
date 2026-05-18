import { PrismaClient, Role, Rating } from "../app/generated/prisma"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import { config } from "dotenv"
import bcrypt from "bcryptjs"

config()

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  // Permissions
  const permissions = await Promise.all([
    prisma.permission.upsert({
      where: { action_resource: { action: "create", resource: "movie" } },
      update: {},
      create: { action: "create", resource: "movie" },
    }),
    prisma.permission.upsert({
      where: { action_resource: { action: "read", resource: "movie" } },
      update: {},
      create: { action: "read", resource: "movie" },
    }),
    prisma.permission.upsert({
      where: { action_resource: { action: "update", resource: "movie" } },
      update: {},
      create: { action: "update", resource: "movie" },
    }),
    prisma.permission.upsert({
      where: { action_resource: { action: "delete", resource: "movie" } },
      update: {},
      create: { action: "delete", resource: "movie" },
    }),
  ])

  const [createPerm, readPerm, updatePerm, deletePerm] = permissions

  // RoleDefinitions
  const manager = await prisma.roleDefinition.upsert({
    where: { name: Role.MANAGER },
    update: {},
    create: { name: Role.MANAGER },
  })
  const teamleader = await prisma.roleDefinition.upsert({
    where: { name: Role.TEAMLEADER },
    update: {},
    create: { name: Role.TEAMLEADER },
  })
  const floorstaff = await prisma.roleDefinition.upsert({
    where: { name: Role.FLOORSTAFF },
    update: {},
    create: { name: Role.FLOORSTAFF },
  })

  // RolePermissions — MANAGER: all
  for (const perm of [createPerm, readPerm, updatePerm, deletePerm]) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: manager.id, permissionId: perm.id } },
      update: {},
      create: { roleId: manager.id, permissionId: perm.id },
    })
  }

  // RolePermissions — TEAMLEADER: create, read, update
  for (const perm of [createPerm, readPerm, updatePerm]) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: teamleader.id, permissionId: perm.id } },
      update: {},
      create: { roleId: teamleader.id, permissionId: perm.id },
    })
  }

  // RolePermissions — FLOORSTAFF: create, read, update
  for (const perm of [createPerm, readPerm, updatePerm]) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: floorstaff.id, permissionId: perm.id } },
      update: {},
      create: { roleId: floorstaff.id, permissionId: perm.id },
    })
  }

  // Users
  const hashedPassword = await bcrypt.hash("password123", 12)

  const managerUser = await prisma.user.upsert({
    where: { email: "manager@example.com" },
    update: {},
    create: { email: "manager@example.com", password: hashedPassword, role: Role.MANAGER },
  })
  await prisma.user.upsert({
    where: { email: "teamleader@example.com" },
    update: {},
    create: { email: "teamleader@example.com", password: hashedPassword, role: Role.TEAMLEADER },
  })
  await prisma.user.upsert({
    where: { email: "floorstaff@example.com" },
    update: {},
    create: { email: "floorstaff@example.com", password: hashedPassword, role: Role.FLOORSTAFF },
  })

  // Sample Movies
  const movies = [
    { title: "The Shawshank Redemption", yearReleased: 1994, rating: Rating.MA },
    { title: "The Dark Knight", yearReleased: 2008, rating: Rating.M },
    { title: "Inception", yearReleased: 2010, rating: Rating.M },
    { title: "The Lion King", yearReleased: 1994, rating: Rating.G },
    { title: "Interstellar", yearReleased: 2014, rating: Rating.PG },
  ]

  for (const movie of movies) {
    const existing = await prisma.movie.findFirst({
      where: { title: movie.title, createdBy: managerUser.id },
    })
    if (!existing) {
      await prisma.movie.create({ data: { ...movie, createdBy: managerUser.id } })
    }
  }

  console.log("Seed completed.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
