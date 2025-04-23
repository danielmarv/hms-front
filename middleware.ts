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

  // Debug log (visible in server logs)
  console.log(`[Middleware] Path: ${path}, Public: ${isPublicPath}, Token: ${token ? "exists" : "missing"}`)

  // Redirect to login if accessing protected route without token
  if (!isPublicPath && !token) {
    console.log(`[Middleware] Redirecting to login from ${path}`)
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  // Allow access to public paths even with token (except login/register)
  if (isPublicPath && token && (path === "/auth/login" || path === "/auth/register")) {
    console.log(`[Middleware] Redirecting to dashboard from ${path}`)
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Important: Clone the response to avoid modifying the original
  const response = NextResponse.next()

  // Ensure we're not accidentally clearing the token
  if (token) {
    response.cookies.set({
      name: "token",
      value: token,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: "lax",
    })
  }

  return response
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
