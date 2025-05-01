"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Building2, ChevronRight, Loader2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useHotelChains, type HotelChain, type SharedConfiguration } from "@/hooks/use-hotel-chains"
import { toast } from "sonner"

export default function EditConfigurationPage() {
  const params = useParams()
  const router = useRouter()
  const chainCode = params.id as string
  const { getChainDetails, updateSharedConfiguration, isLoading } = useHotelChains()

  const [chain, setChain] = useState<HotelChain | null>(null)
  const [isLoadingChain, setIsLoadingChain] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("branding")

  const [formData, setFormData] = useState<SharedConfiguration>({
    chainCode: "",
    name: "",
    branding: {
      primaryColor: "#4f46e5",
      secondaryColor: "#6366f1",
      accentColor: "#818cf8",
      font: {
        primary: "Inter",
        secondary: "Roboto",
      },
    },
    documentPrefixes: {
      invoice: {
        prefix: "INV",
        startingNumber: 1000,
        format: "{prefix}-{number}",
      },
      receipt: {
        prefix: "RCP",
        startingNumber: 1000,
        format: "{prefix}-{number}",
      },
      booking: {
        prefix: "BKG",
        startingNumber: 1000,
        format: "{prefix}-{number}",
      },
      guest: {
        prefix: "GST",
        startingNumber: 1000,
        format: "{prefix}-{number}",
      },
    },
    systemSettings: {
      dateFormat: "MM/DD/YYYY",
      timeFormat: "12h",
      currency: {
        code: "USD",
        symbol: "$",
        position: "before",
      },
      timezone: "UTC",
      language: "en-US",
      measurementSystem: "imperial",
    },
    overrideSettings: {
      branding: false,
      documentPrefixes: false,
      systemSettings: false,
    },
  })

  useEffect(() => {
    const fetchChainDetails = async () => {
      try {
        setIsLoadingChain(true)
        const response = await getChainDetails(chainCode)
        if (response.data) {
          setChain(response.data)

          // If the chain has shared configuration, use it
          if (response.data.sharedConfiguration) {
            setFormData(response.data.sharedConfiguration)
          } else {
            // Otherwise, set the chain code and name in the default form data
            setFormData((prev) => ({
              ...prev,
              chainCode: response.data.chainCode,
              name: response.data.name,
            }))
          }
        }
      } catch (error) {
        console.error("Error fetching chain details:", error)
        toast.error("Failed to load chain details")
      } finally {
        setIsLoadingChain(false)
      }
    }

    if (chainCode) {
      fetchChainDetails()
    }
  }, [chainCode, getChainDetails])

  const handleNestedChange = (section: string, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value,
      },
    }))
  }

  const handleDeepNestedChange = (section: string, subsection: string, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [subsection]: {
          ...prev[section as keyof typeof prev][subsection as any],
          [field]: value,
        },
      },
    }))
  }

  const handleDocumentPrefixChange = (docType: string, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      documentPrefixes: {
        ...prev.documentPrefixes,
        [docType]: {
          ...prev.documentPrefixes[docType as keyof typeof prev.documentPrefixes],
          [field]: field === "startingNumber" ? Number.parseInt(value) : value,
        },
      },
    }))
  }

  const handleOverrideSettingChange = (field: string, value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      overrideSettings: {
        ...prev.overrideSettings,
        [field]: value,
      },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsSubmitting(true)

      const response = await updateSharedConfiguration(chainCode, formData)

      if (response.data) {
        toast.success("Configuration updated successfully")
        router.push(`/admin/chains/${chainCode}?tab=configuration`)
      } else {
        throw new Error("Failed to update configuration")
      }
    } catch (error) {
      console.error("Error updating configuration:", error)
      toast.error("Failed to update configuration")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingChain) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-[250px]" />
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <Skeleton className="h-8 w-[150px]" />
        </div>
        <Skeleton className="h-[500px] w-full" />
      </div>
    )
  }

  if (!chain) {
    return (
      <div className="flex h-[600px] flex-col items-center justify-center">
        <Building2 className="h-16 w-16 text-muted-foreground" />
        <h2 className="mt-4 text-2xl font-bold">Chain Not Found</h2>
        <p className="mt-2 text-muted-foreground">The hotel chain you're looking for doesn't exist</p>
        <Button className="mt-6" onClick={() => router.push("/admin/chains")}>
          Back to Chains
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/admin/chains/${chainCode}?tab=configuration`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center space-x-2">
              <Link href="/admin/chains" className="text-muted-foreground hover:text-foreground">
                Hotel Chains
              </Link>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <Link href={`/admin/chains/${chainCode}`} className="text-muted-foreground hover:text-foreground">
                {chain.name}
              </Link>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Edit Configuration</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Configuration</h1>
            <p className="text-muted-foreground">Update shared configuration for {chain.name}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="branding">Branding & Appearance</TabsTrigger>
            <TabsTrigger value="documents">Document Prefixes</TabsTrigger>
            <TabsTrigger value="settings">System Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="branding" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Branding & Appearance</CardTitle>
                <CardDescription>Configure the visual identity for the chain</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Brand Colors</h3>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="primaryColor">Primary Color</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="primaryColor"
                          type="color"
                          value={formData.branding.primaryColor}
                          onChange={(e) => handleNestedChange("branding", "primaryColor", e.target.value)}
                          className="h-10 w-20"
                        />
                        <Input
                          value={formData.branding.primaryColor}
                          onChange={(e) => handleNestedChange("branding", "primaryColor", e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="secondaryColor">Secondary Color</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="secondaryColor"
                          type="color"
                          value={formData.branding.secondaryColor}
                          onChange={(e) => handleNestedChange("branding", "secondaryColor", e.target.value)}
                          className="h-10 w-20"
                        />
                        <Input
                          value={formData.branding.secondaryColor}
                          onChange={(e) => handleNestedChange("branding", "secondaryColor", e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accentColor">Accent Color</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="accentColor"
                          type="color"
                          value={formData.branding.accentColor}
                          onChange={(e) => handleNestedChange("branding", "accentColor", e.target.value)}
                          className="h-10 w-20"
                        />
                        <Input
                          value={formData.branding.accentColor}
                          onChange={(e) => handleNestedChange("branding", "accentColor", e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Typography</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="primaryFont">Primary Font</Label>
                      <Select
                        value={formData.branding.font.primary}
                        onValueChange={(value) => handleDeepNestedChange("branding", "font", "primary", value)}
                      >
                        <SelectTrigger id="primaryFont">
                          <SelectValue placeholder="Select font" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Inter">Inter</SelectItem>
                          <SelectItem value="Roboto">Roboto</SelectItem>
                          <SelectItem value="Open Sans">Open Sans</SelectItem>
                          <SelectItem value="Montserrat">Montserrat</SelectItem>
                          <SelectItem value="Lato">Lato</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="secondaryFont">Secondary Font</Label>
                      <Select
                        value={formData.branding.font.secondary}
                        onValueChange={(value) => handleDeepNestedChange("branding", "font", "secondary", value)}
                      >
                        <SelectTrigger id="secondaryFont">
                          <SelectValue placeholder="Select font" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Inter">Inter</SelectItem>
                          <SelectItem value="Roboto">Roboto</SelectItem>
                          <SelectItem value="Open Sans">Open Sans</SelectItem>
                          <SelectItem value="Montserrat">Montserrat</SelectItem>
                          <SelectItem value="Lato">Lato</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="overrideBranding"
                      checked={formData.overrideSettings.branding}
                      onChange={(e) => handleOverrideSettingChange("branding", e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="overrideBranding">Allow hotels to override branding settings</Label>
                  </div>
                  <p className="text-xs text-muted-foreground pl-6">
                    When enabled, individual hotels can customize their own branding
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" asChild>
                  <Link href={`/admin/chains/${chainCode}?tab=configuration`}>Cancel</Link>
                </Button>
                <Button type="button" onClick={() => setActiveTab("documents")}>
                  Next: Document Prefixes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Document Prefixes</CardTitle>
                <CardDescription>Configure document numbering formats across the chain</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <h4 className="font-medium">Invoice</h4>
                    <div className="space-y-2">
                      <Label htmlFor="invoicePrefix">Prefix</Label>
                      <Input
                        id="invoicePrefix"
                        value={formData.documentPrefixes.invoice.prefix}
                        onChange={(e) => handleDocumentPrefixChange("invoice", "prefix", e.target.value)}
                        placeholder="INV"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="invoiceStartingNumber">Starting Number</Label>
                      <Input
                        id="invoiceStartingNumber"
                        type="number"
                        value={formData.documentPrefixes.invoice.startingNumber}
                        onChange={(e) => handleDocumentPrefixChange("invoice", "startingNumber", e.target.value)}
                        placeholder="1000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="invoiceFormat">Format</Label>
                      <Input
                        id="invoiceFormat"
                        value={formData.documentPrefixes.invoice.format}
                        onChange={(e) => handleDocumentPrefixChange("invoice", "format", e.target.value)}
                        placeholder="{prefix}-{number}"
                      />
                      <p className="text-xs text-muted-foreground">
                        Use {"{prefix}"} and {"{number}"} as placeholders
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Receipt</h4>
                    <div className="space-y-2">
                      <Label htmlFor="receiptPrefix">Prefix</Label>
                      <Input
                        id="receiptPrefix"
                        value={formData.documentPrefixes.receipt.prefix}
                        onChange={(e) => handleDocumentPrefixChange("receipt", "prefix", e.target.value)}
                        placeholder="RCP"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="receiptStartingNumber">Starting Number</Label>
                      <Input
                        id="receiptStartingNumber"
                        type="number"
                        value={formData.documentPrefixes.receipt.startingNumber}
                        onChange={(e) => handleDocumentPrefixChange("receipt", "startingNumber", e.target.value)}
                        placeholder="1000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="receiptFormat">Format</Label>
                      <Input
                        id="receiptFormat"
                        value={formData.documentPrefixes.receipt.format}
                        onChange={(e) => handleDocumentPrefixChange("receipt", "format", e.target.value)}
                        placeholder="{prefix}-{number}"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <h4 className="font-medium">Booking</h4>
                    <div className="space-y-2">
                      <Label htmlFor="bookingPrefix">Prefix</Label>
                      <Input
                        id="bookingPrefix"
                        value={formData.documentPrefixes.booking.prefix}
                        onChange={(e) => handleDocumentPrefixChange("booking", "prefix", e.target.value)}
                        placeholder="BKG"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bookingStartingNumber">Starting Number</Label>
                      <Input
                        id="bookingStartingNumber"
                        type="number"
                        value={formData.documentPrefixes.booking.startingNumber}
                        onChange={(e) => handleDocumentPrefixChange("booking", "startingNumber", e.target.value)}
                        placeholder="1000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bookingFormat">Format</Label>
                      <Input
                        id="bookingFormat"
                        value={formData.documentPrefixes.booking.format}
                        onChange={(e) => handleDocumentPrefixChange("booking", "format", e.target.value)}
                        placeholder="{prefix}-{number}"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Guest</h4>
                    <div className="space-y-2">
                      <Label htmlFor="guestPrefix">Prefix</Label>
                      <Input
                        id="guestPrefix"
                        value={formData.documentPrefixes.guest.prefix}
                        onChange={(e) => handleDocumentPrefixChange("guest", "prefix", e.target.value)}
                        placeholder="GST"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="guestStartingNumber">Starting Number</Label>
                      <Input
                        id="guestStartingNumber"
                        type="number"
                        value={formData.documentPrefixes.guest.startingNumber}
                        onChange={(e) => handleDocumentPrefixChange("guest", "startingNumber", e.target.value)}
                        placeholder="1000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="guestFormat">Format</Label>
                      <Input
                        id="guestFormat"
                        value={formData.documentPrefixes.guest.format}
                        onChange={(e) => handleDocumentPrefixChange("guest", "format", e.target.value)}
                        placeholder="{prefix}-{number}"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="overrideDocumentPrefixes"
                      checked={formData.overrideSettings.documentPrefixes}
                      onChange={(e) => handleOverrideSettingChange("documentPrefixes", e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="overrideDocumentPrefixes">Allow hotels to override document prefix settings</Label>
                  </div>
                  <p className="text-xs text-muted-foreground pl-6">
                    When enabled, individual hotels can customize their own document numbering formats
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setActiveTab("branding")}>
                  Back
                </Button>
                <Button type="button" onClick={() => setActiveTab("settings")}>
                  Next: System Settings
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>Configure system-wide settings for the chain</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="dateFormat">Date Format</Label>
                    <Select
                      value={formData.systemSettings.dateFormat}
                      onValueChange={(value) => handleNestedChange("systemSettings", "dateFormat", value)}
                    >
                      <SelectTrigger id="dateFormat">
                        <SelectValue placeholder="Select date format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                        <SelectItem value="DD.MM.YYYY">DD.MM.YYYY</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timeFormat">Time Format</Label>
                    <Select
                      value={formData.systemSettings.timeFormat}
                      onValueChange={(value) => handleNestedChange("systemSettings", "timeFormat", value)}
                    >
                      <SelectTrigger id="timeFormat">
                        <SelectValue placeholder="Select time format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                        <SelectItem value="24h">24-hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Currency Settings</h3>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="currencyCode">Currency Code</Label>
                      <Select
                        value={formData.systemSettings.currency.code}
                        onValueChange={(value) => handleDeepNestedChange("systemSettings", "currency", "code", value)}
                      >
                        <SelectTrigger id="currencyCode">
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD - US Dollar</SelectItem>
                          <SelectItem value="EUR">EUR - Euro</SelectItem>
                          <SelectItem value="GBP">GBP - British Pound</SelectItem>
                          <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                          <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                          <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currencySymbol">Currency Symbol</Label>
                      <Input
                        id="currencySymbol"
                        value={formData.systemSettings.currency.symbol}
                        onChange={(e) => handleDeepNestedChange("systemSettings", "currency", "symbol", e.target.value)}
                        placeholder="$"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currencyPosition">Symbol Position</Label>
                      <Select
                        value={formData.systemSettings.currency.position}
                        onValueChange={(value) =>
                          handleDeepNestedChange("systemSettings", "currency", "position", value)
                        }
                      >
                        <SelectTrigger id="currencyPosition">
                          <SelectValue placeholder="Select position" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="before">Before amount ($100)</SelectItem>
                          <SelectItem value="after">After amount (100$)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Default Timezone</Label>
                    <Select
                      value={formData.systemSettings.timezone}
                      onValueChange={(value) => handleNestedChange("systemSettings", "timezone", value)}
                    >
                      <SelectTrigger id="timezone">
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                        <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                        <SelectItem value="Europe/London">London (GMT)</SelectItem>
                        <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                        <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Default Language</Label>
                    <Select
                      value={formData.systemSettings.language}
                      onValueChange={(value) => handleNestedChange("systemSettings", "language", value)}
                    >
                      <SelectTrigger id="language">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en-US">English (US)</SelectItem>
                        <SelectItem value="en-GB">English (UK)</SelectItem>
                        <SelectItem value="es-ES">Spanish</SelectItem>
                        <SelectItem value="fr-FR">French</SelectItem>
                        <SelectItem value="de-DE">German</SelectItem>
                        <SelectItem value="ja-JP">Japanese</SelectItem>
                        <SelectItem value="zh-CN">Chinese (Simplified)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="measurementSystem">Measurement System</Label>
                  <Select
                    value={formData.systemSettings.measurementSystem}
                    onValueChange={(value) => handleNestedChange("systemSettings", "measurementSystem", value)}
                  >
                    <SelectTrigger id="measurementSystem">
                      <SelectValue placeholder="Select measurement system" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="metric">Metric (cm, kg, °C)</SelectItem>
                      <SelectItem value="imperial">Imperial (in, lb, °F)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="overrideSystemSettings"
                      checked={formData.overrideSettings.systemSettings}
                      onChange={(e) => handleOverrideSettingChange("systemSettings", e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="overrideSystemSettings">Allow hotels to override system settings</Label>
                  </div>
                  <p className="text-xs text-muted-foreground pl-6">
                    When enabled, individual hotels can customize their own system settings
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setActiveTab("documents")}>
                  Back
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Configuration
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  )
}
