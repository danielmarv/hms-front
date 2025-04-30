"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Toaster } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Loader2 } from "lucide-react"
import { isAuthenticated } from "@/utils/auth-utils"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isLoading, isAuthenticated: authState, user, checkAuth } = useAuth()
  const router = useRouter()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    const verifyAuth = async () => {
      console.log("Admin layout mounted, checking auth")

      // First check if we have a token
      if (!isAuthenticated()) {
        console.log("No token found, redirecting to login")
        router.push("/auth/login")
        return
      }

      // Then verify with the API
      const authValid = await checkAuth()
      if (!authValid) {
        console.log("Auth check failed, redirecting to login")
        router.push("/auth/login")
      }

      setIsCheckingAuth(false)
    }

    verifyAuth()
  }, [router, checkAuth])

  // Show loading state while checking auth
  if (isLoading || isCheckingAuth) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // If not authenticated after checking, don't render anything
  // (the useEffect will redirect)
  if (!authState) {
    return null
  }

  // Check if user is super admin or has admin permissions
  const isSuperAdmin = user?.role === "super admin"
  const hasAdminPermissions = user?.permissions?.some((perm) =>
    ["manage_hotel", "manage_users", "manage_configuration"].includes(perm),
  )

  if (!isSuperAdmin && !hasAdminPermissions) {
    router.push("/dashboard")
    return null
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar user={user} />
      <main className="flex-1 pl-0 lg:pl-72">
        <div className="h-full p-4 md:p-6">{children}</div>
      </main>
      <Toaster position="top-right" />
    </div>
  )
}
