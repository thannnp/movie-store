import { NextRequest } from "next/server"
import { Role } from "@/app/generated/prisma/enums"
import { prisma } from "@/lib/prisma"
import { verifyJwt } from "@/lib/jwt"

export function getPayload(request: NextRequest) {
  const token = request.cookies.get("token")?.value
  if (!token) return null
  return verifyJwt(token)
}

export async function hasPermission(role: Role, action: string): Promise<boolean> {
  const roleDef = await prisma.roleDefinition.findUnique({
    where: { name: role },
    include: {
      rolePermissions: { include: { permission: true } },
    },
  })
  return (
    roleDef?.rolePermissions.some(
      (rp) => rp.permission.action === action && rp.permission.resource === "movie"
    ) ?? false
  )
}
