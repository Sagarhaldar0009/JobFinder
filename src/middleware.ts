import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/jwt"

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value
  const user = token ? await verifyToken(token) : null
  const isLoggedIn = !!user

  const isAuthPage =
    req.nextUrl.pathname.startsWith("/login") ||
    req.nextUrl.pathname.startsWith("/register")

  const isProtectedRoute =
    req.nextUrl.pathname.startsWith("/dashboard") ||
    req.nextUrl.pathname.startsWith("/onboarding") ||
    req.nextUrl.pathname.startsWith("/jobs") ||
    req.nextUrl.pathname.startsWith("/applications") ||
    req.nextUrl.pathname.startsWith("/profile")

  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.nextUrl))
  }

  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}