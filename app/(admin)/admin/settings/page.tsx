"use client"

import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Settings, DollarSign, Users, FileText, Quote, Building } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCurrency } from "@/hooks/use-currency"
import { useSettings } from "@/hooks/use-settings"
import { useRoles } from "@/hooks/use-roles"
import CurrencySettings from "@/components/admin/settings/currency-settings"
import RoleSettings from "@/components/admin/settings/role-settings"
import DocumentTemplateSettings from "@/components/admin/settings/document-template-settings"
import GeneralSettings from "@/components/admin/settings/general-settings"

export default function SettingsPage() {
  const router = useRouter()
  const { currencies, getCurrencies } = useCurrency()
  const { settings, getSettings } = useSettings()
  const { getAllRoles, ...rolesResult } = useRoles()
  const roles = rolesResult.data ?? []

  useEffect(() => {
    getCurrencies()
    getSettings()
    getAllRoles()
  }, [])

  const settingsCards = [
    {
      title: "General Settings",
      description: "Company information, regional settings, and system preferences",
      icon: Building,
      href: "/admin/settings/general",
      count: settings ? "Configured" : "Not Set",
      color: "bg-blue-500",
    },
    {
      title: "Currency Management",
      description: "Manage currencies and exchange rates",
      icon: DollarSign,
      href: "/admin/settings/currencies",
      count: `${currencies.length} currencies`,
      color: "bg-green-500",
    },
    {
      title: "Roles & Permissions",
      description: "Configure user roles and access permissions",
      icon: Users,
      href: "/admin/settings/access-control",
      count: `${roles.length} roles`,
      color: "bg-purple-500",
    },
    {
      title: "Document Templates",
      description: "Customize invoice, receipt, and quotation templates",
      icon: FileText,
      href: "/admin/settings/templates",
      count: "Templates",
      color: "bg-orange-500",
    },
    {
      title: "Quotation Settings",
      description: "Configure quotation workflow and settings",
      icon: Quote,
      href: "/admin/settings/quotations",
      count: "Settings",
      color: "bg-indigo-500",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-8 w-8" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
          <p className="text-muted-foreground">
            Configure system-wide settings, currencies, roles, and document templates
          </p>
        </div>
      </div>

      {/* Quick Settings Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {settingsCards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.title} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <div className={`p-2 rounded-md ${card.color}`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-1">
                  <Badge variant="outline">{card.count}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{card.description}</p>
                <Button variant="outline" size="sm" className="w-full" onClick={() => router.push(card.href)}>
                  Configure
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Detailed Settings Sections */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <GeneralSettings />
          <CurrencySettings />
        </div>
        <div className="space-y-6">
          <RoleSettings />
          <DocumentTemplateSettings />
        </div>
      </div>
    </div>
  )
}
