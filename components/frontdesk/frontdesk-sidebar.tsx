"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Hotel,
  Calendar,
  Users,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  Home,
  UserCheck,
  UserX,
  ClipboardList,
  Phone,
  MessageSquare,
  Key,
  Bed,
  Settings2
} from "lucide-react"

const navigation = [
  {
    name: "Dashboard",
    href: "/frontdesk",
    icon: Home,
  },
  {
    name: "Check-in",
    href: "/frontdesk/checkin",
    icon: UserCheck,
  },
  {
    name: "Check-out",
    href: "/frontdesk/checkout",
    icon: UserX,
  },
  {
    name: "Reservations",
    href: "/frontdesk/reservations",
    icon: Calendar,
  },
  {
    name: "Housekeeping",
    href: "/frontdesk/housekeeping",
    icon: Bed,
  },
  // {
  //   name: "Guest Services",
  //   href: "/frontdesk/services",
  //   icon: Phone,
  // },
  {
    name: "Room Status",
    href: "/frontdesk/rooms",
    icon: Key,
  },
  {
    name: "Guests",
    href: "/frontdesk/guests",
    icon: Users,
  },
  {
    name: "Payments",
    href: "/frontdesk/payments",
    icon: CreditCard,
  },
  {
    name: "Maintenance",
    href: "/frontdesk/maintenance",
    icon: Settings2,
  },
  // {
  //   name: "Reports",
  //   href: "/frontdesk/reports",
  //   icon: ClipboardList,
  // },
]

interface FrontDeskSidebarProps {
  user: any
}

export function FrontDeskSidebar({ user }: FrontDeskSidebarProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-sidebar">
      {/* Header */}
      <div className="flex h-16 items-center border-b border-sidebar-border px-6">
        <div className="flex items-center gap-2 font-semibold text-sidebar-foreground">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Hotel className="h-4 w-4" />
          </div>
          <span className="text-lg">Front Desk</span>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      {/* User Menu */}
      <div className="border-t border-sidebar-border p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 px-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar || "/placeholder.svg"} />
                <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">
                  {user?.full_name
                    ?.split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase() || "FD"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start text-sm">
                <span className="font-medium">{user?.full_name || "Front Desk Agent"}</span>
                <span className="text-xs text-sidebar-foreground/70">Front Desk Team</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/frontdesk/profile">
                <Settings className="mr-2 h-4 w-4" />
                Profile Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="fixed left-4 top-4 z-40 lg:hidden bg-transparent">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-52 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-sidebar-border bg-sidebar">
          <SidebarContent />
        </div>
      </div>
    </>
  )
}
