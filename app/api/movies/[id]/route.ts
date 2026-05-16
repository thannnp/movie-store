import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getPayload, hasPermission } from "@/lib/auth"
import { movieSchema } from "@/schemas/movie.schema"
import { unauthorized, forbidden, notFound, handleApiError } from "@/lib/errors"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = getPayload(request)
    if (!payload) throw unauthorized()

    const allowed = await hasPermission(payload.role, "update")
    if (!allowed) throw forbidden()

    const { id } = await params

    const existing = await prisma.movie.findUnique({ where: { id } })
    if (!existing) throw notFound("Movie")

    const body = await request.json()
    const parsed = movieSchema.safeParse(body)
    if (!parsed.success) throw parsed.error

    const movie = await prisma.movie.update({
      where: { id },
      data: parsed.data,
    })

    return NextResponse.json(movie)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = getPayload(request)
    if (!payload) throw unauthorized()

    const allowed = await hasPermission(payload.role, "delete")
    if (!allowed) throw forbidden()

    const { id } = await params

    const existing = await prisma.movie.findUnique({ where: { id } })
    if (!existing) throw notFound("Movie")

    await prisma.movie.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
