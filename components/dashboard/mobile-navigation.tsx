"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Menu,
  Home,
  UserCheck,
  Calendar,
  Wrench,
  UtensilsCrossed,
  CreditCard,
  BarChart3,
  Settings,
  Users,
  BedDouble,
  ClipboardList,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface NavigationItem {
  title: string
  href: string
  icon: React.ElementType
  badge?: string
  description?: string
}

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false)

  const navigationItems: NavigationItem[] = [
    {
      title: "Dashboard",
      href: "/",
      icon: Home,
      description: "Main dashboard overview",
    },
    {
      title: "Front Desk",
      href: "/frontdesk",
      icon: UserCheck,
      badge: "3",
      description: "Check-ins and guest services",
    },
    {
      title: "Reservations",
      href: "/dashboard/bookings",
      icon: Calendar,
      badge: "12",
      description: "Booking management",
    },
    {
      title: "Rooms",
      href: "/dashboard/rooms",
      icon: BedDouble,
      description: "Room management and status",
    },
    {
      title: "Guests",
      href: "/dashboard/guests",
      icon: Users,
      description: "Guest profiles and history",
    },
    {
      title: "Housekeeping",
      href: "/dashboard/housekeeping",
      icon: Wrench,
      badge: "5",
      description: "Cleaning and maintenance",
    },
    {
      title: "Restaurant",
      href: "/restaurant",
      icon: UtensilsCrossed,
      badge: "8",
      description: "Kitchen and dining services",
    },
    {
      title: "Payments",
      href: "/dashboard/payments",
      icon: CreditCard,
      description: "Financial transactions",
    },
    {
      title: "Analytics",
      href: "/dashboard/analytics",
      icon: BarChart3,
      description: "Reports and insights",
    },
    {
      title: "Inventory",
      href: "/dashboard/inventory",
      icon: ClipboardList,
      description: "Stock and supplies",
    },
    {
      title: "Admin",
      href: "/admin",
      icon: Settings,
      description: "System administration",
    },
  ]

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="md:hidden">
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <div className="flex flex-col h-full">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Hotel Management</h2>
            <p className="text-sm text-muted-foreground">Navigate to different sections</p>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted",
                    "group",
                  )}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{item.title}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                    {item.description && <p className="text-xs text-muted-foreground truncate">{item.description}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </ScrollArea>

          <div className="p-4 border-t">
            <div className="text-xs text-muted-foreground">
              <p>Hotel Management System v2.0</p>
              <p>© 2024 All rights reserved</p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
