import { NextResponse, type NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const isPublicPath =
    path === "/" ||
    path === "/login" ||
    path === "/register" ||
    path === "/forgot-password" ||
    path.startsWith("/reset/")

  const isAdminPath = path.startsWith("/dashboard/admin")

  const token = request.cookies.get("token")?.value || ""

  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (isPublicPath && token && (path === "/login" || path === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
