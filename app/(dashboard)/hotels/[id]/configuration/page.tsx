"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useHotels, type HotelConfiguration } from "@/hooks/use-hotels"
import { Loader2, Save } from "lucide-react"

export default function HotelConfigurationPage() {
  const params = useParams()
  const router = useRouter()
  const hotelId = params.id as string
  const { getConfiguration, updateConfiguration, isLoading } = useHotels()
  const [configuration, setConfiguration] = useState<HotelConfiguration | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("general")
  const [isInitialLoading, setIsInitialLoading] = useState(true)

  useEffect(() => {
    const fetchConfiguration = async () => {
      try {
        const { data, error } = await getConfiguration(hotelId)

        if (error || !data) {
          // If configuration doesn't exist, redirect to setup
          router.push(`/hotels/${hotelId}/setup`)
          return
        }

        setConfiguration(data)
      } catch (error) {
        console.error("Error fetching configuration:", error)
        toast.error("Failed to load hotel configuration")
      } finally {
        setIsInitialLoading(false)
      }
    }

    fetchConfiguration()
  }, [hotelId, router, getConfiguration])

  const handleInputChange = (section: string, field: string, value: string) => {
    if (!configuration) return

    setConfiguration((prev) => {
      if (!prev) return prev

      if (section === "root") {
        return { ...prev, [field]: value }
      }

      return {
        ...prev,
        [section]: {
          ...prev[section as keyof HotelConfiguration],
          [field]: value,
        },
      }
    })
  }

  const handleAddressChange = (field: string, value: string) => {
    if (!configuration) return

    setConfiguration((prev) => {
      if (!prev) return prev

      return {
        ...prev,
        address: {
          ...prev.address,
          [field]: value,
        },
      }
    })
  }

  const handleContactChange = (field: string, value: string) => {
    if (!configuration) return

    setConfiguration((prev) => {
      if (!prev) return prev

      return {
        ...prev,
        contact: {
          ...prev.contact,
          [field]: value,
        },
      }
    })
  }

  const handleBrandingChange = (field: string, value: string) => {
    if (!configuration) return

    setConfiguration((prev) => {
      if (!prev) return prev

      return {
        ...prev,
        branding: {
          ...prev.branding,
          [field]: value,
        },
      }
    })
  }

  const handleDocumentPrefixChange = (field: string, value: string) => {
    if (!configuration) return

    setConfiguration((prev) => {
      if (!prev) return prev

      return {
        ...prev,
        documentPrefixes: {
          ...prev.documentPrefixes,
          [field]: value,
        },
      }
    })
  }

  const handleSystemSettingChange = (field: string, value: string) => {
    if (!configuration) return

    setConfiguration((prev) => {
      if (!prev) return prev

      return {
        ...prev,
        systemSettings: {
          ...prev.systemSettings,
          [field]: value,
        },
      }
    })
  }

  const handleSave = async () => {
    if (!configuration) return

    setIsSaving(true)
    try {
      const { error } = await updateConfiguration(hotelId, configuration)

      if (error) {
        throw new Error(error)
      }

      toast.success("Configuration saved successfully")
    } catch (error) {
      console.error("Error saving configuration:", error)
      toast.error(error instanceof Error ? error.message : "Failed to save configuration")
    } finally {
      setIsSaving(false)
    }
  }

  if (isInitialLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!configuration) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <h2 className="text-xl font-semibold">Configuration not found</h2>
        <p className="text-muted-foreground">This hotel has not been configured yet.</p>
        <Button className="mt-4" onClick={() => router.push(`/hotels/${hotelId}/setup`)}>
          Start Setup
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hotel Configuration</h1>
          <p className="text-muted-foreground">{configuration.hotelName}</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving || isLoading}>
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

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="address">Address</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>General Information</CardTitle>
              <CardDescription>Basic information about your hotel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="hotelName">Hotel Name</Label>
                  <Input
                    id="hotelName"
                    value={configuration.hotelName}
                    onChange={(e) => handleInputChange("root", "hotelName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="legalName">Legal Name</Label>
                  <Input
                    id="legalName"
                    value={configuration.legalName}
                    onChange={(e) => handleInputChange("root", "legalName", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxId">Tax ID / VAT Number</Label>
                <Input
                  id="taxId"
                  value={configuration.taxId}
                  onChange={(e) => handleInputChange("root", "taxId", e.target.value)}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Phone</Label>
                  <Input
                    id="contactPhone"
                    value={configuration.contact.phone}
                    onChange={(e) => handleContactChange("phone", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={configuration.contact.email}
                    onChange={(e) => handleContactChange("email", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactWebsite">Website</Label>
                  <Input
                    id="contactWebsite"
                    value={configuration.contact.website}
                    onChange={(e) => handleContactChange("website", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="address" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Address Information</CardTitle>
              <CardDescription>Physical location of your hotel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="street">Street Address</Label>
                <Textarea
                  id="street"
                  value={configuration.address.street}
                  onChange={(e) => handleAddressChange("street", e.target.value)}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={configuration.address.city}
                    onChange={(e) => handleAddressChange("city", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State / Province</Label>
                  <Input
                    id="state"
                    value={configuration.address.state}
                    onChange={(e) => handleAddressChange("state", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    value={configuration.address.postalCode}
                    onChange={(e) => handleAddressChange("postalCode", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={configuration.address.country}
                    onChange={(e) => handleAddressChange("country", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Branding</CardTitle>
              <CardDescription>Visual identity of your hotel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      value={configuration.branding.primaryColor}
                      onChange={(e) => handleBrandingChange("primaryColor", e.target.value)}
                    />
                    <div
                      className="h-10 w-10 rounded border"
                      style={{ backgroundColor: configuration.branding.primaryColor || "#ffffff" }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondaryColor"
                      value={configuration.branding.secondaryColor}
                      onChange={(e) => handleBrandingChange("secondaryColor", e.target.value)}
                    />
                    <div
                      className="h-10 w-10 rounded border"
                      style={{ backgroundColor: configuration.branding.secondaryColor || "#ffffff" }}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="logo">Logo URL</Label>
                <Input
                  id="logo"
                  value={configuration.branding.logo}
                  onChange={(e) => handleBrandingChange("logo", e.target.value)}
                />
                {configuration.branding.logo && (
                  <div className="mt-2 flex justify-center">
                    <img
                      src={configuration.branding.logo || "/placeholder.svg"}
                      alt="Hotel Logo"
                      className="max-h-32 object-contain"
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=128&width=256"
                      }}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Document Settings</CardTitle>
              <CardDescription>Configure document prefixes and numbering</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="invoicePrefix">Invoice Prefix</Label>
                  <Input
                    id="invoicePrefix"
                    value={configuration.documentPrefixes.invoice}
                    onChange={(e) => handleDocumentPrefixChange("invoice", e.target.value)}
                    placeholder="INV-"
                  />
                  <p className="text-xs text-muted-foreground">Example: INV-00001</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="receiptPrefix">Receipt Prefix</Label>
                  <Input
                    id="receiptPrefix"
                    value={configuration.documentPrefixes.receipt}
                    onChange={(e) => handleDocumentPrefixChange("receipt", e.target.value)}
                    placeholder="REC-"
                  />
                  <p className="text-xs text-muted-foreground">Example: REC-00001</p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="bookingPrefix">Booking Prefix</Label>
                  <Input
                    id="bookingPrefix"
                    value={configuration.documentPrefixes.booking}
                    onChange={(e) => handleDocumentPrefixChange("booking", e.target.value)}
                    placeholder="BKG-"
                  />
                  <p className="text-xs text-muted-foreground">Example: BKG-00001</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guestPrefix">Guest Prefix</Label>
                  <Input
                    id="guestPrefix"
                    value={configuration.documentPrefixes.guest}
                    onChange={(e) => handleDocumentPrefixChange("guest", e.target.value)}
                    placeholder="GST-"
                  />
                  <p className="text-xs text-muted-foreground">Example: GST-00001</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Configure system-wide settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="defaultLanguage">Default Language</Label>
                  <Input
                    id="defaultLanguage"
                    value={configuration.systemSettings.defaultLanguage}
                    onChange={(e) => handleSystemSettingChange("defaultLanguage", e.target.value)}
                    placeholder="en-US"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    value={configuration.systemSettings.currency}
                    onChange={(e) => handleSystemSettingChange("currency", e.target.value)}
                    placeholder="USD"
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Input
                    id="dateFormat"
                    value={configuration.systemSettings.dateFormat}
                    onChange={(e) => handleSystemSettingChange("dateFormat", e.target.value)}
                    placeholder="MM/DD/YYYY"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeFormat">Time Format</Label>
                  <Input
                    id="timeFormat"
                    value={configuration.systemSettings.timeFormat}
                    onChange={(e) => handleSystemSettingChange("timeFormat", e.target.value)}
                    placeholder="hh:mm A"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Input
                  id="timezone"
                  value={configuration.systemSettings.timezone}
                  onChange={(e) => handleSystemSettingChange("timezone", e.target.value)}
                  placeholder="America/New_York"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
