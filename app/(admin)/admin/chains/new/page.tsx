"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Building2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useHotelChains } from "@/hooks/use-hotel-chains"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"

export default function CreateHotelChainPage() {
  const router = useRouter()
  const { createChain } = useHotelChains()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")

  const [formData, setFormData] = useState({
    // Basic information
    name: "",
    chainCode: "",
    code: "",
    description: "",
    type: "hotel",
    starRating: "0",

    // Configuration
    branding: {
      primaryColor: "#4f46e5",
      secondaryColor: "#6366f1",
      accentColor: "#818cf8",
      font: {
        primary: "Inter",
        secondary: "Roboto",
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
    overrideSettings: {
      branding: false,
      documentPrefixes: false,
      systemSettings: false,
    },
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

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

    if (!formData.name || !formData.chainCode || !formData.code) {
      toast.error("Please fill in all required fields")
      setActiveTab("basic")
      return
    }

    try {
      setIsSubmitting(true)

      const chainData = {
        name: formData.name,
        chainCode: formData.chainCode,
        code: formData.code,
        description: formData.description,
        type: formData.type,
        starRating: Number.parseInt(formData.starRating),
      }

      const response = await createChain(chainData)

      if (response.data) {
        // After creating the chain, we would update the configuration
        // In a real implementation, you would call updateSharedConfiguration here

        toast.success("Hotel chain created successfully")
        router.push(`/admin/chains/${formData.chainCode}`)
      } else {
        throw new Error("Failed to create hotel chain")
      }
    } catch (error) {
      console.error("Error creating hotel chain:", error)
      toast.error("Failed to create hotel chain")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/chains">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create Hotel Chain</h1>
            <p className="text-muted-foreground">Set up a new hotel chain with headquarters</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Information</TabsTrigger>
            <TabsTrigger value="branding">Branding & Appearance</TabsTrigger>
            <TabsTrigger value="settings">System Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Chain Information</CardTitle>
                <CardDescription>Basic details about the hotel chain</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Chain Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Luxe Hotels International"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="chainCode">
                      Chain Code <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="chainCode"
                      name="chainCode"
                      value={formData.chainCode}
                      onChange={handleChange}
                      placeholder="LUXE"
                      required
                    />
                    <p className="text-xs text-muted-foreground">Unique identifier for the chain</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="code">
                      Headquarters Code <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="code"
                      name="code"
                      value={formData.code}
                      onChange={handleChange}
                      placeholder="LHI-HQ"
                      required
                    />
                    <p className="text-xs text-muted-foreground">Unique code for headquarters hotel</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Chain Type</Label>
                    <Select value={formData.type} onValueChange={(value) => handleSelectChange("type", value)}>
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hotel">Hotel</SelectItem>
                        <SelectItem value="resort">Resort</SelectItem>
                        <SelectItem value="motel">Motel</SelectItem>
                        <SelectItem value="boutique">Boutique</SelectItem>
                        <SelectItem value="apartment">Serviced Apartment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe the hotel chain"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="starRating">Star Rating</Label>
                  <Select
                    value={formData.starRating}
                    onValueChange={(value) => handleSelectChange("starRating", value)}
                  >
                    <SelectTrigger id="starRating">
                      <SelectValue placeholder="Select rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Not Applicable</SelectItem>
                      <SelectItem value="1">1 Star</SelectItem>
                      <SelectItem value="2">2 Stars</SelectItem>
                      <SelectItem value="3">3 Stars</SelectItem>
                      <SelectItem value="4">4 Stars</SelectItem>
                      <SelectItem value="5">5 Stars</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" asChild>
                  <Link href="/admin/chains">Cancel</Link>
                </Button>
                <Button type="button" onClick={() => setActiveTab("branding")}>
                  Next: Branding
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

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

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Document Prefixes</h3>
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
                          Use {`{prefix}`} and {`{number}`} as placeholders
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
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setActiveTab("basic")}>
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

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Override Settings</h3>
                  <p className="text-sm text-muted-foreground">
                    Allow individual hotels to override chain-wide settings
                  </p>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="overrideBranding"
                        checked={formData.overrideSettings.branding}
                        onChange={(e) => handleOverrideSettingChange("branding", e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="overrideBranding">Allow branding override</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="overrideDocumentPrefixes"
                        checked={formData.overrideSettings.documentPrefixes}
                        onChange={(e) => handleOverrideSettingChange("documentPrefixes", e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="overrideDocumentPrefixes">Allow document prefix override</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="overrideSystemSettings"
                        checked={formData.overrideSettings.systemSettings}
                        onChange={(e) => handleOverrideSettingChange("systemSettings", e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="overrideSystemSettings">Allow system settings override</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setActiveTab("branding")}>
                  Back
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Building2 className="mr-2 h-4 w-4" />
                      Create Hotel Chain
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
