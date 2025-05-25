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
  Calculator,
  CreditCard,
  FileText,
  TrendingUp,
  PieChart,
  Receipt,
  Banknote,
  Building,
  Users,
  Settings,
  LogOut,
  Menu,
  Home,
  DollarSign,
  FileBarChart,
  Wallet,
} from "lucide-react"

const navigation = [
  {
    name: "Dashboard",
    href: "/accounts",
    icon: Home,
  },
  {
    name: "Invoices",
    href: "/accounts/invoices",
    icon: FileText,
  },
  {
    name: "Payments",
    href: "/accounts/payments",
    icon: CreditCard,
  },
  {
    name: "Receipts",
    href: "/accounts/receipts",
    icon: Receipt,
  },
  {
    name: "Expenses",
    href: "/accounts/expenses",
    icon: Banknote,
  },
  {
    name: "Revenue",
    href: "/accounts/revenue",
    icon: DollarSign,
  },
  {
    name: "Financial Reports",
    href: "/accounts/reports",
    icon: FileBarChart,
  },
  {
    name: "Budget & Forecasting",
    href: "/accounts/budget",
    icon: TrendingUp,
  },
  {
    name: "Analytics",
    href: "/accounts/analytics",
    icon: PieChart,
  },
  {
    name: "Accounts Payable",
    href: "/accounts/payable",
    icon: Wallet,
  },
  {
    name: "Accounts Receivable",
    href: "/accounts/receivable",
    icon: Calculator,
  },
  {
    name: "Vendors",
    href: "/accounts/vendors",
    icon: Building,
  },
  {
    name: "Customers",
    href: "/accounts/customers",
    icon: Users,
  },
]

interface AccountsSidebarProps {
  user: any
}

export function AccountsSidebar({ user }: AccountsSidebarProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex h-16 items-center border-b px-6">
        <div className="flex items-center gap-2 font-semibold">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600 text-white">
            <Calculator className="h-4 w-4" />
          </div>
          <span className="text-lg">Accounts</span>
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
                    ? "bg-green-600 text-white"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
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
      <div className="border-t p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-3 px-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar || "/placeholder.svg"} />
                <AvatarFallback>
                  {user?.full_name
                    ?.split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase() || "AC"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start text-sm">
                <span className="font-medium">{user?.full_name || "Accountant"}</span>
                <span className="text-xs text-muted-foreground">Finance Team</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/accounts/profile">
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
          <Button variant="outline" size="icon" className="fixed left-4 top-4 z-40 lg:hidden">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r bg-white">
          <SidebarContent />
        </div>
      </div>
    </>
  )
}
