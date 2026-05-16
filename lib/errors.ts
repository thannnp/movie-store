import { NextResponse } from "next/server"
import { ZodError } from "zod"

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message)
  }
}

export function notFound(resource = "Resource") {
  return new AppError(404, `${resource} not found`)
}

export function unauthorized(message = "Unauthorized") {
  return new AppError(401, message)
}

export function forbidden(message = "Forbidden") {
  return new AppError(403, message)
}

export function handleApiError(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode }
    )
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: error.issues[0].message },
      { status: 400 }
    )
  }

  console.error("Unexpected error:", error)
  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 }
  )
}
