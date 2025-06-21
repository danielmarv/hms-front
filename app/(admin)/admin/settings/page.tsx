"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/hooks/use-auth"
import { useHotelSettings } from "@/hooks/use-hotel-settings"
import {
  Loader2,
  Save,
  FolderSyncIcon as Sync,
  Settings,
  Palette,
  FileText,
  CreditCard,
  Bell,
  Shield,
  AlertTriangle,
  Building,
} from "lucide-react"

interface HotelSettings {
  _id: string
  hotel: string
  name: string
  legal_name: string
  tax_id: string
  contact: {
    address: {
      street: string
      city: string
      state: string
      postal_code: string
      country: string
    }
    phone: {
      primary: string
      secondary?: string
      fax?: string
    }
    email: {
      primary: string
      secondary?: string
      support?: string
    }
    website?: string
  }
  branding: {
    logo_url?: string
    logo_secondary_url?: string
    favicon_url?: string
    watermark_url?: string
    primary_color: string
    secondary_color: string
    accent_color: string
    text_color: string
    fonts: {
      primary: { name: string; url?: string }
      secondary: { name: string; url?: string }
      headings: { name: string; url?: string }
    }
  }
  financial: {
    currency: {
      code: string
      symbol: string
      position: "before" | "after"
    }
    tax_rates: Array<{
      name: string
      rate: number
      type: "percentage" | "fixed"
      applies_to: string[]
    }>
    document_prefixes: {
      invoice: string
      receipt: string
      quotation: string
      folio: string
    }
  }
  operational: {
    check_in_time: string
    check_out_time: string
    time_zone: string
    date_format: string
    time_format: string
    cancellation_policy: string
    no_show_policy: string
  }
  features: {
    online_booking: boolean
    mobile_checkin: boolean
    keyless_entry: boolean
    loyalty_program: boolean
    multi_language: boolean
    payment_gateway: boolean
  }
  notifications: {
    email_notifications: boolean
    sms_notifications: boolean
    push_notifications: boolean
    booking_confirmations: boolean
    payment_reminders: boolean
    marketing_emails: boolean
  }
  banking: {
    primary_account: {
      bank_name: string
      account_name: string
      account_number: string
      routing_number: string
      swift_code?: string
    }
    payment_methods: {
      accepted_cards: string[]
      online_payments: boolean
      cash_payments: boolean
      bank_transfers: boolean
    }
  }
  chainInheritance?: {
    branding: boolean
    financial: boolean
    operational: boolean
    features: boolean
    notifications: boolean
    document_templates: boolean
  }
}

export default function AdminSettingsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const {
    getEffectiveConfiguration,
    updateBranding,
    updateBanking,
    syncFromChain,
    updateInheritanceSettings,
    isLoading,
  } = useHotelSettings()

  const [settings, setSettings] = useState<HotelSettings | null>(null)
  const [primaryHotel, setPrimaryHotel] = useState<any>(null)
  const [isSaving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("general")
  const [isInitialLoading, setIsInitialLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.primaryHotel?.id) {
        toast.error("No primary hotel found for your account")
        setIsInitialLoading(false)
        return
      }

      try {
        setPrimaryHotel(user.primaryHotel)

        // Get effective configuration for primary hotel
        const configResponse = await getEffectiveConfiguration(user.primaryHotel.id)
        if (configResponse.data) {
          setSettings(configResponse.data.hotelConfiguration)
        }
      } catch (error) {
        console.error("Error fetching hotel settings:", error)
        toast.error("Failed to load hotel settings")
      } finally {
        setIsInitialLoading(false)
      }
    }

    if (user) {
      fetchData()
    }
  }, [user, getEffectiveConfiguration])

  const handleSave = async (section?: string) => {
    if (!settings || !primaryHotel?.id) return

    setSaving(true)
    try {
      let response

      switch (section) {
        case "branding":
          response = await updateBranding(primaryHotel.id, settings.branding)
          break
        case "banking":
          response = await updateBanking(primaryHotel.id, settings.banking)
          break
        default:
          // Update full configuration
          response = await updateBranding(primaryHotel.id, settings)
          break
      }

      if (response.error) {
        throw new Error(response.error)
      }
      toast.success("Settings saved successfully")
    } catch (error) {
      console.error("Error saving settings:", error)
      toast.error(error instanceof Error ? error.message : "Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (section: string, field: string, value: any) => {
    if (!settings) return

    setSettings((prev) => {
      if (!prev) return prev

      const newSettings = { ...prev }
      if (section === "root") {
        newSettings[field as keyof HotelSettings] = value
      } else {
        newSettings[section as keyof HotelSettings] = {
          ...newSettings[section as keyof HotelSettings],
          [field]: value,
        }
      }
      return newSettings
    })
  }

  const handleNestedChange = (section: string, subsection: string, field: string, value: any) => {
    if (!settings) return

    setSettings((prev) => {
      if (!prev) return prev

      return {
        ...prev,
        [section]: {
          ...prev[section as keyof HotelSettings],
          [subsection]: {
            ...(prev[section as keyof HotelSettings] as any)?.[subsection],
            [field]: value,
          },
        },
      }
    })
  }

  const handleSyncFromChain = async () => {
    if (!primaryHotel?.id) return

    try {
      const response = await syncFromChain(primaryHotel.id)
      if (response.data) {
        setSettings(response.data.configuration)
        toast.success("Successfully synced from chain configuration")
      }
    } catch (error) {
      toast.error("Failed to sync from chain")
    }
  }

  if (isInitialLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user?.primaryHotel) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <Building className="h-16 w-16 text-muted-foreground" />
        <h2 className="mt-4 text-2xl font-bold">No Primary Hotel</h2>
        <p className="mt-2 text-muted-foreground">You don't have a primary hotel assigned to your account</p>
        <Button className="mt-6" onClick={() => router.push("/admin/hotels")}>
          View All Hotels
        </Button>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <Settings className="h-16 w-16 text-muted-foreground" />
        <h2 className="mt-4 text-2xl font-bold">Settings Not Found</h2>
        <p className="mt-2 text-muted-foreground">This hotel has not been configured yet</p>
        <Button className="mt-6" onClick={() => router.push(`/admin/hotels/${primaryHotel.id}/setup`)}>
          Start Setup
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hotel Settings</h1>
          <p className="text-muted-foreground">
            {primaryHotel.name} ({primaryHotel.code})
          </p>
          <Badge variant="outline" className="mt-2">
            <Building className="mr-1 h-3 w-3" />
            Primary Hotel
          </Badge>
        </div>
        <div className="flex gap-2">
          {primaryHotel.chainCode && (
            <Button variant="outline" onClick={handleSyncFromChain}>
              <Sync className="mr-2 h-4 w-4" />
              Sync from Chain
            </Button>
          )}
          <Button onClick={() => handleSave()} disabled={isSaving || isLoading}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="general">
            <Settings className="mr-2 h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="branding">
            <Palette className="mr-2 h-4 w-4" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="financial">
            <CreditCard className="mr-2 h-4 w-4" />
            Financial
          </TabsTrigger>
          <TabsTrigger value="operational">
            <FileText className="mr-2 h-4 w-4" />
            Operations
          </TabsTrigger>
          <TabsTrigger value="features">
            <Shield className="mr-2 h-4 w-4" />
            Features
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="banking">
            <CreditCard className="mr-2 h-4 w-4" />
            Banking
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>General Information</CardTitle>
              <CardDescription>Basic hotel information and contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Hotel Name</Label>
                  <Input
                    id="name"
                    value={settings.name}
                    onChange={(e) => handleInputChange("root", "name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="legal_name">Legal Name</Label>
                  <Input
                    id="legal_name"
                    value={settings.legal_name}
                    onChange={(e) => handleInputChange("root", "legal_name", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tax_id">Tax ID / VAT Number</Label>
                <Input
                  id="tax_id"
                  value={settings.tax_id}
                  onChange={(e) => handleInputChange("root", "tax_id", e.target.value)}
                />
              </div>

              <Separator />

              <h3 className="text-lg font-semibold">Contact Information</h3>

              <div className="space-y-2">
                <Label htmlFor="street">Street Address</Label>
                <Textarea
                  id="street"
                  value={settings.contact.address.street}
                  onChange={(e) => handleNestedChange("contact", "address", "street", e.target.value)}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={settings.contact.address.city}
                    onChange={(e) => handleNestedChange("contact", "address", "city", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State / Province</Label>
                  <Input
                    id="state"
                    value={settings.contact.address.state}
                    onChange={(e) => handleNestedChange("contact", "address", "state", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postal_code">Postal Code</Label>
                  <Input
                    id="postal_code"
                    value={settings.contact.address.postal_code}
                    onChange={(e) => handleNestedChange("contact", "address", "postal_code", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="primary_phone">Primary Phone</Label>
                  <Input
                    id="primary_phone"
                    value={settings.contact.phone.primary}
                    onChange={(e) => handleNestedChange("contact", "phone", "primary", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="primary_email">Primary Email</Label>
                  <Input
                    id="primary_email"
                    type="email"
                    value={settings.contact.email.primary}
                    onChange={(e) => handleNestedChange("contact", "email", "primary", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={settings.contact.website || ""}
                    onChange={(e) => handleNestedChange("contact", "", "website", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Brand Identity</CardTitle>
              <CardDescription>Visual identity and branding elements</CardDescription>
              {settings.chainInheritance?.branding && (
                <Badge variant="outline" className="w-fit">
                  <AlertTriangle className="mr-1 h-3 w-3" />
                  Inherited from Chain
                </Badge>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="logo_url">Logo URL</Label>
                  <Input
                    id="logo_url"
                    value={settings.branding.logo_url || ""}
                    onChange={(e) => handleNestedChange("branding", "", "logo_url", e.target.value)}
                    disabled={settings.chainInheritance?.branding}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="favicon_url">Favicon URL</Label>
                  <Input
                    id="favicon_url"
                    value={settings.branding.favicon_url || ""}
                    onChange={(e) => handleNestedChange("branding", "", "favicon_url", e.target.value)}
                    disabled={settings.chainInheritance?.branding}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="primary_color">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primary_color"
                      value={settings.branding.primary_color}
                      onChange={(e) => handleNestedChange("branding", "", "primary_color", e.target.value)}
                      disabled={settings.chainInheritance?.branding}
                    />
                    <div
                      className="h-10 w-10 rounded border"
                      style={{ backgroundColor: settings.branding.primary_color }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondary_color">Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondary_color"
                      value={settings.branding.secondary_color}
                      onChange={(e) => handleNestedChange("branding", "", "secondary_color", e.target.value)}
                      disabled={settings.chainInheritance?.branding}
                    />
                    <div
                      className="h-10 w-10 rounded border"
                      style={{ backgroundColor: settings.branding.secondary_color }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSave("branding")} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Branding"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Financial Settings</CardTitle>
              <CardDescription>Currency, tax rates, and document settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-semibold">Currency</h3>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="currency_code">Currency Code</Label>
                  <Input
                    id="currency_code"
                    value={settings.financial.currency.code}
                    onChange={(e) => handleNestedChange("financial", "currency", "code", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency_symbol">Symbol</Label>
                  <Input
                    id="currency_symbol"
                    value={settings.financial.currency.symbol}
                    onChange={(e) => handleNestedChange("financial", "currency", "symbol", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency_position">Position</Label>
                  <Select
                    value={settings.financial.currency.position}
                    onValueChange={(value) => handleNestedChange("financial", "currency", "position", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="before">Before Amount</SelectItem>
                      <SelectItem value="after">After Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <h3 className="text-lg font-semibold">Document Prefixes</h3>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="invoice_prefix">Invoice Prefix</Label>
                  <Input
                    id="invoice_prefix"
                    value={settings.financial.document_prefixes.invoice}
                    onChange={(e) => handleNestedChange("financial", "document_prefixes", "invoice", e.target.value)}
                    placeholder="INV-"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="receipt_prefix">Receipt Prefix</Label>
                  <Input
                    id="receipt_prefix"
                    value={settings.financial.document_prefixes.receipt}
                    onChange={(e) => handleNestedChange("financial", "document_prefixes", "receipt", e.target.value)}
                    placeholder="REC-"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operational" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Operational Settings</CardTitle>
              <CardDescription>Check-in/out times, policies, and operational preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="check_in_time">Check-in Time</Label>
                  <Input
                    id="check_in_time"
                    type="time"
                    value={settings.operational.check_in_time}
                    onChange={(e) => handleNestedChange("operational", "", "check_in_time", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="check_out_time">Check-out Time</Label>
                  <Input
                    id="check_out_time"
                    type="time"
                    value={settings.operational.check_out_time}
                    onChange={(e) => handleNestedChange("operational", "", "check_out_time", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cancellation_policy">Cancellation Policy</Label>
                <Textarea
                  id="cancellation_policy"
                  value={settings.operational.cancellation_policy}
                  onChange={(e) => handleNestedChange("operational", "", "cancellation_policy", e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Feature Settings</CardTitle>
              <CardDescription>Enable or disable hotel features and services</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Online Booking</Label>
                    <p className="text-sm text-muted-foreground">Allow guests to book online</p>
                  </div>
                  <Switch
                    checked={settings.features.online_booking}
                    onCheckedChange={(checked) => handleNestedChange("features", "", "online_booking", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Mobile Check-in</Label>
                    <p className="text-sm text-muted-foreground">Enable mobile check-in</p>
                  </div>
                  <Switch
                    checked={settings.features.mobile_checkin}
                    onCheckedChange={(checked) => handleNestedChange("features", "", "mobile_checkin", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send email notifications</p>
                  </div>
                  <Switch
                    checked={settings.notifications.email_notifications}
                    onCheckedChange={(checked) =>
                      handleNestedChange("notifications", "", "email_notifications", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Booking Confirmations</Label>
                    <p className="text-sm text-muted-foreground">Auto-send booking confirmations</p>
                  </div>
                  <Switch
                    checked={settings.notifications.booking_confirmations}
                    onCheckedChange={(checked) =>
                      handleNestedChange("notifications", "", "booking_confirmations", checked)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="banking" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Banking Information</CardTitle>
              <CardDescription>Bank account and payment method settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-semibold">Primary Bank Account</h3>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="bank_name">Bank Name</Label>
                  <Input
                    id="bank_name"
                    value={settings.banking.primary_account.bank_name}
                    onChange={(e) => handleNestedChange("banking", "primary_account", "bank_name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account_name">Account Name</Label>
                  <Input
                    id="account_name"
                    value={settings.banking.primary_account.account_name}
                    onChange={(e) => handleNestedChange("banking", "primary_account", "account_name", e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSave("banking")} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Banking"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
