import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getPayload, hasPermission } from "@/lib/auth"
import { movieSchema } from "@/schemas/movie.schema"
import { unauthorized, forbidden, handleApiError } from "@/lib/errors"

export async function GET(request: NextRequest) {
  try {
    const payload = getPayload(request)
    if (!payload) throw unauthorized()

    const allowed = await hasPermission(payload.role, "read")
    if (!allowed) throw forbidden()

    const movies = await prisma.movie.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: { select: { email: true } } },
    })

    return NextResponse.json(movies)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = getPayload(request)
    if (!payload) throw unauthorized()

    const allowed = await hasPermission(payload.role, "create")
    if (!allowed) throw forbidden()

    const body = await request.json()
    const parsed = movieSchema.safeParse(body)
    if (!parsed.success) throw parsed.error

    const movie = await prisma.movie.create({
      data: { ...parsed.data, createdBy: payload.userId },
    })

    return NextResponse.json(movie, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
