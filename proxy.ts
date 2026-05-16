import { NextRequest, NextResponse } from "next/server"
import { verifyJwt } from "@/lib/jwt"

export function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  const payload = verifyJwt(token)
  if (!payload) {
    const response = NextResponse.redirect(new URL("/login", request.url))
    response.cookies.delete("token")
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/movies/:path*"],
}
