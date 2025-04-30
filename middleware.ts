import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { isAuthenticated } from "@/utils/auth-utils"

export function middleware(request: NextRequest) {
  // Get the pathname from the URL
  const { pathname } = request.nextUrl

  // Check if the user is authenticated
  const isUserAuthenticated = isAuthenticated(request)

  // Public routes that don't require authentication
  const publicRoutes = ["/auth/login", "/register", "/forgot-password", "/reset-password"]

  // If the route is public, allow access
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // If the user is not authenticated, redirect to login
  if (!isUserAuthenticated) {
    const url = new URL("/auth/login", request.url)
    url.searchParams.set("callbackUrl", encodeURI(pathname))
    return NextResponse.redirect(url)
  }

  // Get user data from cookies or localStorage
  const userData = getUserData(request)

  // Admin routes that require super admin or specific permissions
  const adminRoutes = ["/admin"]

  // Check if the user is trying to access admin routes
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route))

  // If it's an admin route, check if the user has the right permissions
  if (isAdminRoute) {
    const isSuperAdmin = userData?.role?.name === "super admin"
    const hasAdminPermissions = userData?.role?.permissions?.some(
      (perm: any) =>
        perm.key === "system.super.admin" || perm.key === "system.manage.all" || perm.key.startsWith("hotel.manage"),
    )

    // If not super admin or doesn't have admin permissions, redirect to dashboard
    if (!isSuperAdmin && !hasAdminPermissions) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  // Allow access to the requested route
  return NextResponse.next()
}

// Helper function to get user data from cookies or headers
function getUserData(request: NextRequest) {
  try {
    // Try to get user data from cookies
    const userCookie = request.cookies.get("user")

    if (userCookie?.value) {
      return JSON.parse(decodeURIComponent(userCookie.value))
    }

    // If no cookie, try to get from authorization header (for API routes)
    const authHeader = request.headers.get("authorization")
    if (authHeader && authHeader.startsWith("Bearer ")) {
      // You would need to decode the JWT token here
      // This is a simplified example
      const token = authHeader.split(" ")[1]
      // Decode and return user data from token
      // return decodeToken(token)
    }

    return null
  } catch (error) {
    console.error("Error parsing user data:", error)
    return null
  }
}

// Configure which routes should be processed by this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public assets)
     * - api routes (API endpoints)
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api).*)",
  ],
}
