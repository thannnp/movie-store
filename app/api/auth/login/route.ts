import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { signJwt } from "@/lib/jwt"
import { loginSchema } from "@/schemas/auth.schema"
import { AppError, handleApiError } from "@/lib/errors"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = loginSchema.safeParse(body)
    if (!parsed.success) throw parsed.error

    const { email, password } = parsed.data

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) throw new AppError(401, "Invalid credentials")

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) throw new AppError(401, "Invalid credentials")

    const token = signJwt({ userId: user.id, role: user.role })

    const roleDef = await prisma.roleDefinition.findUnique({
      where: { name: user.role },
      include: { rolePermissions: { include: { permission: true } } },
    })
    const permissions = roleDef?.rolePermissions.map((rp) => rp.permission.action) ?? []

    const response = NextResponse.json({
      user: { id: user.id, email: user.email, role: user.role },
      permissions,
    })

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    return handleApiError(error)
  }
}
