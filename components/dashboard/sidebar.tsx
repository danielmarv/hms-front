"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/contexts/auth-context"
import { Building, ChevronDown, CircleUser, Hotel, LayoutDashboard, LogOut, Menu, Settings, Users } from "lucide-react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultHotel?: {
    id: string
    name: string
  }
}

export function Sidebar({ className, defaultHotel, ...props }: SidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  console.log("Sidebar rendered with defaultHotel:", user)

  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      label: "Hotels",
      icon: Hotel,
      href: "/hotels",
      active: pathname.startsWith("/hotels"),
      children: defaultHotel
        ? [
            {
              label: "All Hotels",
              href: "/hotels",
              active: pathname === "/hotels",
            },
            {
              label: defaultHotel.name,
              href: `/hotels/${defaultHotel.id}`,
              active: pathname === `/hotels/${defaultHotel.id}`,
            },
            {
              label: "Configuration",
              href: `/hotels/${defaultHotel.id}/configuration`,
              active: pathname === `/hotels/${defaultHotel.id}/configuration`,
            },
          ]
        : [],
    },
    {
      label: "Users",
      icon: Users,
      href: "/users",
      active: pathname.startsWith("/users"),
    },
    {
      label: "Roles",
      icon: CircleUser,
      href: "/roles",
      active: pathname.startsWith("/roles"),
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/settings",
      active: pathname.startsWith("/settings"),
    },
  ]

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="outline" size="icon" className="ml-2">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <MobileSidebar routes={routes} user={user} onLogout={logout} />
        </SheetContent>
      </Sheet>
      <aside
        className={cn("fixed inset-y-0 left-0 z-20 hidden w-72 flex-col border-r bg-background lg:flex", className)}
        {...props}
      >
        <DesktopSidebar routes={routes} user={user} onLogout={logout} />
      </aside>
    </>
  )
}

interface SidebarContentProps {
  routes: {
    label: string
    icon: React.ElementType
    href: string
    active: boolean
    children?: {
      label: string
      href: string
      active: boolean
    }[]
  }[]
  user: {
    full_name: string
    email: string
  } | null
  onLogout: () => void
}

function MobileSidebar({ routes, user, onLogout }: SidebarContentProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <Building className="h-6 w-6" />
          <span>Hotel Management</span>
        </Link>
      </div>
      <ScrollArea className="flex-1 py-2">
        <nav className="grid gap-1 px-2">
          {routes.map((route, i) => (
            <RouteItem key={i} route={route} />
          ))}
        </nav>
      </ScrollArea>
      <div className="mt-auto border-t p-4">
        <div className="flex items-center gap-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <CircleUser className="h-4 w-4 text-primary" />
          </div>
          <div className="grid gap-0.5">
            <div className="text-sm font-medium">{user?.full_name}</div>
            <div className="text-xs text-muted-foreground">{user?.email}</div>
          </div>
        </div>
        <Button variant="outline" className="mt-2 w-full justify-start gap-2" onClick={onLogout}>
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )
}

function DesktopSidebar({ routes, user, onLogout }: SidebarContentProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <Building className="h-6 w-6" />
          <span>Hotel Management</span>
        </Link>
      </div>
      <ScrollArea className="flex-1 py-2">
        <nav className="grid gap-1 px-2">
          {routes.map((route, i) => (
            <RouteItem key={i} route={route} />
          ))}
        </nav>
      </ScrollArea>
      <div className="mt-auto border-t p-4">
        <div className="flex items-center gap-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <CircleUser className="h-4 w-4 text-primary" />
          </div>
          <div className="grid gap-0.5">
            <div className="text-sm font-medium">{user?.full_name}</div>
            <div className="text-xs text-muted-foreground">{user?.email}</div>
          </div>
        </div>
        <Button variant="outline" className="mt-2 w-full justify-start gap-2" onClick={onLogout}>
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )
}

interface RouteItemProps {
  route: {
    label: string
    icon: React.ElementType
    href: string
    active: boolean
    children?: {
      label: string
      href: string
      active: boolean
    }[]
  }
}

function RouteItem({ route }: RouteItemProps) {
  const [open, setOpen] = useState(route.active)
  const hasChildren = route.children && route.children.length > 0

  return (
    <div>
      {hasChildren ? (
        <div className="grid gap-1">
          <Button
            variant={route.active ? "secondary" : "ghost"}
            className="justify-between"
            onClick={() => setOpen(!open)}
          >
            <div className="flex items-center gap-2">
              <route.icon className="h-4 w-4" />
              {route.label}
            </div>
            <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
          </Button>
          {open && (
            <div className="grid gap-1 pl-6">
              {route.children?.map((child, i) => (
                <Button key={i} variant={child.active ? "secondary" : "ghost"} className="justify-start" asChild>
                  <Link href={child.href}>{child.label}</Link>
                </Button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <Button variant={route.active ? "secondary" : "ghost"} className="justify-start gap-2 w-full" asChild>
          <Link href={route.href}>
            <route.icon className="h-4 w-4" />
            {route.label}
          </Link>
        </Button>
      )}
    </div>
  )
}
