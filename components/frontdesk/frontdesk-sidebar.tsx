"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"
import {
  Home,
  Users,
  Calendar,
  CreditCard,
  FileText,
  MapPin,
  Package,
  UserCheck,
  UserX,
  Bed,
  Settings,
} from "lucide-react"

const menuItems = [
  {
    title: "Dashboard",
    url: "/frontdesk",
    icon: Home,
  },
  {
    title: "Check-in",
    url: "/frontdesk/checkin",
    icon: UserCheck,
  },
  {
    title: "Check-out",
    url: "/frontdesk/checkout",
    icon: UserX,
  },
  {
    title: "Reservations",
    url: "/frontdesk/reservations",
    icon: Calendar,
  },
  {
    title: "Guests",
    url: "/frontdesk/guests",
    icon: Users,
  },
  {
    title: "Rooms",
    url: "/frontdesk/rooms",
    icon: MapPin,
  },
  {
    title: "Housekeeping",
    url: "/frontdesk/housekeeping",
    icon: Bed,
  },
  {
    title: "Payments",
    url: "/frontdesk/payments",
    icon: CreditCard,
  },
  {
    title: "Invoices",
    url: "/frontdesk/invoices",
    icon: FileText,
  },
  {
    title: "Inventory",
    url: "/frontdesk/inventory",
    icon: Package,
  },
  {
    title: "Events",
    url: "/frontdesk/events",
    icon: Calendar,
  },
]

export function FrontdeskSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <UserCheck className="h-4 w-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Front Desk</span>
            <span className="truncate text-xs text-muted-foreground">Hotel Management</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Front Desk Operations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url || pathname.startsWith(item.url + "/")}>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/frontdesk/settings">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
