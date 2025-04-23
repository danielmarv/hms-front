import { NextResponse, type NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const isPublicPath =
    path === "/" ||
    path === "/auth/login" ||
    path === "/auth/register" ||
    path === "/auth/forgot-password" ||
    path.startsWith("/auth/reset/")

  // Define admin paths that require admin role
  const isAdminPath = path.startsWith("/dashboard/admin")

  // Get token from cookies
  const token = request.cookies.get("token")?.value || ""

  // Redirect to login if accessing protected route without token
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  // Allow access to public paths even with token (except login/register)
  if (isPublicPath && token && (path === "/auth/login" || path === "/auth/register")) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

// Match all routes except for static files, api routes, and _next
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
