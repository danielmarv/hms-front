"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Toaster } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import { RestaurantSidebar } from "@/components/restaurant/restaurant-sidebar"
import { Loader2 } from "lucide-react"
import { isAuthenticated } from "@/utils/auth-utils"

export default function RestaurantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isLoading, isAuthenticated: authState, user, checkAuth } = useAuth()
  const router = useRouter()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    const verifyAuth = async () => {
      console.log("Restaurant layout mounted, checking auth")

      if (!isAuthenticated()) {
        console.log("No token found, redirecting to login")
        router.push("/auth/login")
        return
      }

      const authValid = await checkAuth()
      if (!authValid) {
        console.log("Auth check failed, redirecting to login")
        router.push("/auth/login")
      }

      setIsCheckingAuth(false)
    }

    verifyAuth()
  }, [router, checkAuth])

  if (isLoading || isCheckingAuth) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!authState) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <RestaurantSidebar user={user} />
      <main className="flex-1 pl-0 lg:pl-72">
        <div className="h-full">{children}</div>
      </main>
      <Toaster position="top-right" />
    </div>
  )
}
