import type { NextRequest } from "next/server"
import Cookies from "js-cookie"

// Check if the user is authenticated
export function isAuthenticated(request?: NextRequest): boolean {
  // For server-side (middleware)
  if (request) {
    const token = request.cookies.get("token")?.value
    return !!token
  }

  // For client-side
  const token = Cookies.get("token") || localStorage.getItem("accessToken")
  return !!token
}

// Get user role from localStorage or cookie
export function getUserRole(): string | null {
  try {
    // Try localStorage first
    const userStr = localStorage.getItem("user")
    if (userStr) {
      const user = JSON.parse(userStr)
      return user?.role?.name || null
    }

    // Try cookie as fallback
    const userCookie = Cookies.get("user")
    if (userCookie) {
      const user = JSON.parse(userCookie)
      return user?.role?.name || null
    }

    return null
  } catch (error) {
    console.error("Error getting user role:", error)
    return null
  }
}

// Check if user has specific permission
export function hasPermission(permissionKey: string): boolean {
  try {
    const userStr = localStorage.getItem("user")
    if (!userStr) return false

    const user = JSON.parse(userStr)

    // Super admin has all permissions
    if (user?.role?.name === "super admin") return true

    // Check role permissions
    const hasRolePermission = user?.role?.permissions?.some((perm: any) => perm.key === permissionKey)

    // Check custom permissions
    const hasCustomPermission = user?.custom_permissions?.some((perm: any) => perm.key === permissionKey)

    return hasRolePermission || hasCustomPermission || false
  } catch (error) {
    console.error("Error checking permission:", error)
    return false
  }
}

// Check if user is super admin
export function isSuperAdmin(): boolean {
  return getUserRole() === "super admin"
}

// Check if user has admin access
export function hasAdminAccess(): boolean {
  const isSuperAdminUser = isSuperAdmin()

  if (isSuperAdminUser) return true

  // Check for specific admin permissions
  const adminPermissions = [
    "system.manage.all",
    "hotel.manage.chain",
    "user.create",
    "user.update",
    "user.delete",
    "role.create",
    "role.update",
    "role.delete",
  ]

  return adminPermissions.some((perm) => hasPermission(perm))
}
