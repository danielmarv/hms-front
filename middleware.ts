import { type NextRequest, NextResponse } from "next/server"

// Define paths that don't require authentication
const publicPaths = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-email"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the path is public
  const isPublicPath = publicPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))

  // Allow access to public paths
  if (isPublicPath) {
    return NextResponse.next()
  }

  // Check for auth token in localStorage (client-side only)
  // For server-side middleware, we need to check cookies or headers
  const token = request.cookies.get("accessToken")?.value || request.headers.get("authorization")?.split(" ")[1]

  // If no token and not a public path, redirect to login
  if (!token) {
    const url = new URL("/login", request.url)
    url.searchParams.set("callbackUrl", encodeURI(request.url))
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
}
