"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useUserAccess } from "@/hooks/use-user-access"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Toaster } from "sonner"
import { Loader2 } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isLoading, isAuthenticated, user } = useAuth()
  const { getUserDefaultHotel } = useUserAccess()
  const router = useRouter()
  const [defaultHotel, setDefaultHotel] = useState<{ id: string; name: string } | undefined>()
  const [isLoadingHotel, setIsLoadingHotel] = useState(true)

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }

    // Fetch user's default hotel
    const fetchDefaultHotel = async () => {
      try {
        if (!user) return

        const { data } = await getUserDefaultHotel(user.id)

        if (data && data.hotel) {
          setDefaultHotel({
            id: data.hotel._id,
            name: data.hotel.name,
          })
        }
      } catch (error) {
        console.error("Error fetching default hotel:", error)
      } finally {
        setIsLoadingHotel(false)
      }
    }

    if (isAuthenticated && user) {
      fetchDefaultHotel()
    } else {
      setIsLoadingHotel(false)
    }
  }, [isLoading, isAuthenticated, router, user, getUserDefaultHotel])

  if (isLoading || isLoadingHotel) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar defaultHotel={defaultHotel} />
      <main className="flex-1 pl-0 lg:pl-72">
        <div className="h-full p-4 md:p-6">{children}</div>
      </main>
      <Toaster position="top-right" />
    </div>
  )
}
