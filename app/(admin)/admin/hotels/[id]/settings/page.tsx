"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
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
import { useHotels } from "@/hooks/use-hotels"
import {
  useHotelConfiguration,
  type HotelConfiguration,
  type EffectiveConfiguration,
} from "@/hooks/use-hotel-configuration"
import {
  Loader2,
  Save,
  Settings,
  Palette,
  FileText,
  CreditCard,
  Bell,
  Shield,
  LinkIcon,
  AlertTriangle,
  ArrowLeft,
  Building,
  Plus,
} from "lucide-react"

export default function HotelSettingsPage() {
  const params = useParams()
  const router = useRouter()
  const hotelId = params.id as string
  const { getHotelById } = useHotels()
  const {
    getHotelConfiguration,
    createHotelConfiguration,
    updateHotelConfiguration,
    updateInheritanceSettings,
    updateBranding,
    updateBanking,
    isLoading,
  } = useHotelConfiguration()

  const [configuration, setConfiguration] = useState<HotelConfiguration | null>(null)
  const [effectiveConfiguration, setEffectiveConfiguration] = useState<EffectiveConfiguration | null>(null)
  const [hotel, setHotel] = useState<any>(null)
  const [isSaving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("general")
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [isNewConfiguration, setIsNewConfiguration] = useState(false)
  const [dataFetched, setDataFetched] = useState(false) // Add flag to prevent refetching

  // Memoize the fetch function to prevent recreating it on every render
  const fetchData = useCallback(async () => {
    if (!hotelId || dataFetched) return // Prevent multiple calls

    setDataFetched(true) // Set flag immediately to prevent duplicate calls

    try {
      // Get hotel information first
      const hotelResponse = await getHotelById(hotelId, false, true)
      if (hotelResponse.data) {
        setHotel(hotelResponse.data)
      }

      // Get hotel configuration
      const configResponse = await getHotelConfiguration(hotelId)
      if (configResponse.data) {
        // Transform the API response to match the expected structure
        const apiConfig = configResponse.data.configuration
        const transformedConfig: HotelConfiguration = {
          ...apiConfig,
          // Transform address structure
          address: {
            street: apiConfig.contact?.address?.street || "",
            city: apiConfig.contact?.address?.city || "",
            state: apiConfig.contact?.address?.state || "",
            postalCode: apiConfig.contact?.address?.postal_code || "",
            country: apiConfig.contact?.address?.country || "",
          },
          // Transform contact structure
          contact: {
            phone: apiConfig.contact?.phone?.primary || "",
            email: apiConfig.contact?.email?.primary || "",
            website: apiConfig.contact?.website || "",
          },
          // Transform other fields to match interface
          legalName: apiConfig.legal_name || apiConfig.name,
          taxId: apiConfig.tax_id || "",
          // Transform branding structure
          branding: {
            logoUrl: apiConfig.branding?.logo_url,
            faviconUrl: apiConfig.branding?.favicon_url,
            primaryColor: apiConfig.branding?.primary_color || "#1a73e8",
            secondaryColor: apiConfig.branding?.secondary_color || "#f8f9fa",
            accentColor: apiConfig.branding?.accent_color || "#fbbc04",
            fonts: {
              primary: apiConfig.branding?.fonts?.primary?.name || "Roboto",
              secondary: apiConfig.branding?.fonts?.secondary?.name || "Open Sans",
            },
          },
          // Transform financial structure
          financial: {
            currency: {
              code: apiConfig.financial?.currency?.code || "USD",
              symbol: apiConfig.financial?.currency?.symbol || "$",
              position: apiConfig.financial?.currency?.position || "before",
            },
            taxRates: apiConfig.financial?.tax_rates || [],
            documentPrefixes: {
              invoice: apiConfig.financial?.document_prefixes?.invoice || "INV",
              receipt: apiConfig.financial?.document_prefixes?.receipt || "RCP",
              quotation: apiConfig.financial?.document_prefixes?.quotation || "QUO",
              folio: apiConfig.financial?.document_prefixes?.folio || "FOL",
            },
          },
          // Transform operational structure
          operational: {
            checkInTime: apiConfig.operational?.check_in_time || "15:00",
            checkOutTime: apiConfig.operational?.check_out_time || "11:00",
            timeZone: apiConfig.operational?.time_zone || "UTC",
            dateFormat: apiConfig.operational?.date_format || "MM/DD/YYYY",
            timeFormat: apiConfig.operational?.time_format || "12h",
            cancellationPolicy: apiConfig.operational?.cancellation_policy || "",
            noShowPolicy: apiConfig.operational?.no_show_policy || "",
          },
          // Transform features structure
          features: {
            onlineBooking: apiConfig.features?.enable_online_booking || false,
            mobileCheckin: apiConfig.features?.enable_mobile_checkin || false,
            keylessEntry: apiConfig.features?.enable_keyless_entry || false,
            loyaltyProgram: apiConfig.features?.enable_loyalty_program || false,
            multiLanguage: apiConfig.features?.enable_multi_language || false,
            paymentGateway: apiConfig.features?.enable_payment_gateway || false,
          },
          // Transform notifications structure
          notifications: {
            emailNotifications: apiConfig.notifications?.email?.new_booking || false,
            smsNotifications: apiConfig.notifications?.sms?.new_booking || false,
            pushNotifications: false,
            bookingConfirmations: apiConfig.notifications?.email?.booking_confirmation || false,
            paymentReminders: apiConfig.notifications?.email?.payment_confirmation || false,
            marketingEmails: false,
          },
          // Transform banking structure
          banking: {
            primaryAccount: {
              bankName: apiConfig.banking?.accounts?.[0]?.bank_name || "",
              accountName: apiConfig.banking?.accounts?.[0]?.account_name || "",
              accountNumber: apiConfig.banking?.accounts?.[0]?.account_number || "",
              routingNumber: apiConfig.banking?.accounts?.[0]?.routing_number || "",
              swiftCode: apiConfig.banking?.accounts?.[0]?.swift_code,
            },
            paymentMethods: {
              acceptedCards: apiConfig.banking?.payment_methods?.accepted_cards || [],
              onlinePayments: apiConfig.banking?.payment_methods?.accepts_cards || false,
              cashPayments: apiConfig.banking?.payment_methods?.accepts_cash || false,
              bankTransfers: apiConfig.banking?.payment_methods?.accepts_bank_transfer || false,
            },
          },
          // Add these fields to the existing transformedConfig
          document_templates: {
            invoice: {
              show_logo: apiConfig.document_templates?.invoice?.show_logo || true,
              show_watermark: apiConfig.document_templates?.invoice?.show_watermark || false,
              payment_terms: apiConfig.document_templates?.invoice?.payment_terms || "Payment due within 30 days",
            },
            receipt: {
              show_logo: apiConfig.document_templates?.receipt?.show_logo || true,
              show_watermark: apiConfig.document_templates?.receipt?.show_watermark || false,
            },
            folio: {
              show_logo: apiConfig.document_templates?.folio?.show_logo || true,
              show_watermark: apiConfig.document_templates?.folio?.show_watermark || false,
            },
          },
          legal: {
            business_type: apiConfig.legal?.business_type || "",
          },
          // Also add the raw server fields for compatibility
          legal_name: apiConfig.legal_name || apiConfig.name,
          tax_id: apiConfig.tax_id || "",
          __v: apiConfig.__v,
          // Keep other fields as they are
          _id: apiConfig._id,
          hotel: apiConfig.hotel?._id || hotelId,
          chainInheritance: apiConfig.chainInheritance,
          createdBy: apiConfig.createdBy,
          updatedBy: apiConfig.updatedBy,
          createdAt: apiConfig.createdAt,
          updatedAt: apiConfig.updatedAt,
        }

        setConfiguration(transformedConfig)
        setEffectiveConfiguration(configResponse.data.effectiveConfiguration)
      } else if (configResponse.error && configResponse.error.includes("not found")) {
        // Configuration doesn't exist, prepare for creation
        setIsNewConfiguration(true)
        if (hotelResponse.data) {
          // Create a default configuration template
          const defaultConfig: Partial<HotelConfiguration> = {
            hotel: hotelId,
            name: hotelResponse.data.name,
            legalName: hotelResponse.data.name,
            taxId: "",
            address: {
              street: "",
              city: "",
              state: "",
              postalCode: "",
              country: "",
            },
            contact: {
              phone: "",
              email: "",
              website: "",
            },
            branding: {
              primaryColor: "#1a73e8",
              secondaryColor: "#f8f9fa",
              accentColor: "#fbbc04",
              fonts: {
                primary: "Roboto",
                secondary: "Open Sans",
              },
            },
            financial: {
              currency: {
                code: "USD",
                symbol: "$",
                position: "before",
              },
              taxRates: [],
              documentPrefixes: {
                invoice: "INV",
                receipt: "RCP",
                quotation: "QUO",
                folio: "FOL",
              },
            },
            operational: {
              checkInTime: "15:00",
              checkOutTime: "11:00",
              timeZone: "UTC",
              dateFormat: "MM/DD/YYYY",
              timeFormat: "12h",
              cancellationPolicy: "",
              noShowPolicy: "",
            },
            features: {
              onlineBooking: false,
              mobileCheckin: false,
              keylessEntry: false,
              loyaltyProgram: false,
              multiLanguage: false,
              paymentGateway: false,
            },
            notifications: {
              emailNotifications: true,
              smsNotifications: false,
              pushNotifications: false,
              bookingConfirmations: true,
              paymentReminders: true,
              marketingEmails: false,
            },
            banking: {
              primaryAccount: {
                bankName: "",
                accountName: "",
                accountNumber: "",
                routingNumber: "",
              },
              paymentMethods: {
                acceptedCards: [],
                onlinePayments: false,
                cashPayments: true,
                bankTransfers: false,
              },
            },
            document_templates: {
              invoice: {
                show_logo: true,
                show_watermark: false,
                payment_terms: "Payment due within 30 days",
              },
              receipt: {
                show_logo: true,
                show_watermark: false,
              },
              folio: {
                show_logo: true,
                show_watermark: false,
              },
            },
            legal: {
              business_type: "",
            },
          }
          setConfiguration(defaultConfig as HotelConfiguration)
        }
      }
    } catch (error) {
      console.error("Error fetching hotel configuration:", error)
      toast.error("Failed to load hotel configuration")
      setDataFetched(false) // Reset flag on error to allow retry
    } finally {
      setIsInitialLoading(false)
    }
  }, [hotelId, getHotelById, getHotelConfiguration, dataFetched])

  useEffect(() => {
    if (hotelId && !dataFetched) {
      fetchData()
    }
  }, [hotelId, fetchData, dataFetched])

  const handleSave = async (section?: string) => {
    if (!configuration || !hotelId) return

    setSaving(true)
    try {
      let response

      if (isNewConfiguration) {
        // Create new configuration
        response = await createHotelConfiguration(configuration)
        if (response.data) {
          setConfiguration(response.data)
          setIsNewConfiguration(false)
          toast.success("Hotel configuration created successfully")
        }
      } else {
        // Update existing configuration
        switch (section) {
          case "branding":
            response = await updateBranding(hotelId, configuration.branding)
            break
          case "banking":
            response = await updateBanking(hotelId, configuration.banking)
            break
          default:
            response = await updateHotelConfiguration(hotelId, configuration)
            break
        }

        if (response.data) {
          if (section === "branding") {
            setConfiguration((prev) => (prev ? { ...prev, branding: response.data } : prev))
          } else if (section === "banking") {
            setConfiguration((prev) => (prev ? { ...prev, banking: response.data } : prev))
          } else {
            setConfiguration(response.data)
          }
          toast.success("Configuration updated successfully")
        }
      }

      if (response.error) {
        throw new Error(response.error)
      }
    } catch (error) {
      console.error("Error saving configuration:", error)
      toast.error(error instanceof Error ? error.message : "Failed to save configuration")
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (section: string, field: string, value: any) => {
    if (!configuration) return

    setConfiguration((prev) => {
      if (!prev) return prev

      const newConfig = { ...prev }
      if (section === "root") {
        newConfig[field as keyof HotelConfiguration] = value
      } else {
        newConfig[section as keyof HotelConfiguration] = {
          ...newConfig[section as keyof HotelConfiguration],
          [field]: value,
        }
      }
      return newConfig
    })
  }

  const handleNestedChange = (section: string, subsection: string, field: string, value: any) => {
    if (!configuration) return

    setConfiguration((prev) => {
      if (!prev) return prev

      const newConfig = { ...prev }

      if (subsection === "") {
        // Direct nested field (e.g., address.street, contact.phone)
        newConfig[section as keyof HotelConfiguration] = {
          ...newConfig[section as keyof HotelConfiguration],
          [field]: value,
        }
      } else {
        // Double nested field (e.g., financial.currency.code, banking.primaryAccount.bankName)
        const sectionData = newConfig[section as keyof HotelConfiguration] as any
        newConfig[section as keyof HotelConfiguration] = {
          ...sectionData,
          [subsection]: {
            ...sectionData[subsection],
            [field]: value,
          },
        }
      }

      return newConfig
    })
  }

  const handleInputChangeDebug = (section: string, field: string, value: any) => {
    console.log(`Updating ${section}.${field} to:`, value)
    handleInputChange(section, field, value)
  }

  const handleNestedChangeDebug = (section: string, subsection: string, field: string, value: any) => {
    console.log(`Updating ${section}.${subsection}.${field} to:`, value)
    handleNestedChange(section, subsection, field, value)
  }

  const handleInheritanceChange = async (setting: string, inherit: boolean) => {
    if (!configuration || !configuration.chainInheritance) return

    try {
      const newInheritance = {
        ...configuration.chainInheritance,
        [setting]: inherit,
      }

      const response = await updateInheritanceSettings(hotelId, newInheritance)
      if (response.data) {
        setConfiguration(response.data)
        toast.success("Inheritance settings updated")
      }
    } catch (error) {
      toast.error("Failed to update inheritance settings")
    }
  }

  if (isInitialLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!hotel) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <Building className="h-16 w-16 text-muted-foreground" />
        <h2 className="mt-4 text-2xl font-bold">Hotel Not Found</h2>
        <p className="mt-2 text-muted-foreground">The hotel you're looking for doesn't exist</p>
        <Button className="mt-6" onClick={() => router.push("/admin/hotels")}>
          Back to Hotels
        </Button>
      </div>
    )
  }

  if (!configuration) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <Settings className="h-16 w-16 text-muted-foreground" />
        <h2 className="mt-4 text-2xl font-bold">Configuration Not Found</h2>
        <p className="mt-2 text-muted-foreground">This hotel has not been configured yet</p>
        <Button className="mt-6" onClick={() => router.push(`/admin/hotels/${hotelId}/setup`)}>
          Start Setup
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/admin/hotels/${hotelId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Hotel Configuration</h1>
            <p className="text-muted-foreground">
              {hotel.name} ({hotel.code})
            </p>
            {hotel.chainCode && (
              <Badge variant="outline" className="mt-2">
                <LinkIcon className="mr-1 h-3 w-3" />
                Chain: {hotel.chainCode}
              </Badge>
            )}
            {isNewConfiguration && (
              <Badge variant="secondary" className="mt-2">
                <Plus className="mr-1 h-3 w-3" />
                New Configuration
              </Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => handleSave()} disabled={isSaving || isLoading}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isNewConfiguration ? "Creating..." : "Saving..."}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {isNewConfiguration ? "Create Configuration" : "Save Changes"}
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-9">
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
          <TabsTrigger value="documents">
            <FileText className="mr-2 h-4 w-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="legal">
            <Shield className="mr-2 h-4 w-4" />
            Legal
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
                    value={configuration.name}
                    onChange={(e) => handleInputChangeDebug("root", "name", e.target.value)}
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

              <Separator />

              <h3 className="text-lg font-semibold">Address</h3>

              <div className="space-y-2">
                <Label htmlFor="street">Street Address</Label>
                <Textarea
                  id="street"
                  value={configuration.address.street}
                  onChange={(e) => handleNestedChangeDebug("address", "", "street", e.target.value)}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={configuration.address.city}
                    onChange={(e) => handleNestedChange("address", "", "city", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State / Province</Label>
                  <Input
                    id="state"
                    value={configuration.address.state}
                    onChange={(e) => handleNestedChange("address", "", "state", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    value={configuration.address.postalCode}
                    onChange={(e) => handleNestedChange("address", "", "postalCode", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={configuration.address.country}
                  onChange={(e) => handleNestedChange("address", "", "country", e.target.value)}
                />
              </div>

              <Separator />

              <h3 className="text-lg font-semibold">Contact Information</h3>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={configuration.contact.phone}
                    onChange={(e) => handleNestedChange("contact", "", "phone", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={configuration.contact.email}
                    onChange={(e) => handleNestedChange("contact", "", "email", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={configuration.contact.website || ""}
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
              {configuration.chainInheritance?.branding && (
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="w-fit">
                    <AlertTriangle className="mr-1 h-3 w-3" />
                    Inherited from Chain
                  </Badge>
                  <Button variant="outline" size="sm" onClick={() => handleInheritanceChange("branding", false)}>
                    Override
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="logoUrl">Logo URL</Label>
                  <Input
                    id="logoUrl"
                    value={configuration.branding.logoUrl || ""}
                    onChange={(e) => handleNestedChange("branding", "", "logoUrl", e.target.value)}
                    disabled={configuration.chainInheritance?.branding}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="faviconUrl">Favicon URL</Label>
                  <Input
                    id="faviconUrl"
                    value={configuration.branding.faviconUrl || ""}
                    onChange={(e) => handleNestedChange("branding", "", "faviconUrl", e.target.value)}
                    disabled={configuration.chainInheritance?.branding}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      value={configuration.branding.primaryColor}
                      onChange={(e) => handleNestedChangeDebug("branding", "", "primaryColor", e.target.value)}
                      disabled={configuration.chainInheritance?.branding}
                    />
                    <div
                      className="h-10 w-10 rounded border"
                      style={{ backgroundColor: configuration.branding.primaryColor }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondaryColor"
                      value={configuration.branding.secondaryColor}
                      onChange={(e) => handleNestedChange("branding", "", "secondaryColor", e.target.value)}
                      disabled={configuration.chainInheritance?.branding}
                    />
                    <div
                      className="h-10 w-10 rounded border"
                      style={{ backgroundColor: configuration.branding.secondaryColor }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accentColor">Accent Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="accentColor"
                      value={configuration.branding.accentColor}
                      onChange={(e) => handleNestedChange("branding", "", "accentColor", e.target.value)}
                      disabled={configuration.chainInheritance?.branding}
                    />
                    <div
                      className="h-10 w-10 rounded border"
                      style={{ backgroundColor: configuration.branding.accentColor }}
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
              {configuration.chainInheritance?.financial && (
                <Badge variant="outline" className="w-fit">
                  <AlertTriangle className="mr-1 h-3 w-3" />
                  Inherited from Chain
                </Badge>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-semibold">Currency</h3>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="currencyCode">Currency Code</Label>
                  <Input
                    id="currencyCode"
                    value={configuration.financial.currency.code}
                    onChange={(e) => handleNestedChange("financial", "currency", "code", e.target.value)}
                    disabled={configuration.chainInheritance?.financial}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currencySymbol">Symbol</Label>
                  <Input
                    id="currencySymbol"
                    value={configuration.financial.currency.symbol}
                    onChange={(e) => handleNestedChange("financial", "currency", "symbol", e.target.value)}
                    disabled={configuration.chainInheritance?.financial}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currencyPosition">Position</Label>
                  <Select
                    value={configuration.financial.currency.position}
                    onValueChange={(value) => handleNestedChange("financial", "currency", "position", value)}
                    disabled={configuration.chainInheritance?.financial}
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
                  <Label htmlFor="invoicePrefix">Invoice Prefix</Label>
                  <Input
                    id="invoicePrefix"
                    value={configuration.financial.documentPrefixes.invoice}
                    onChange={(e) => handleNestedChange("financial", "documentPrefixes", "invoice", e.target.value)}
                    placeholder="INV"
                    disabled={configuration.chainInheritance?.financial}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="receiptPrefix">Receipt Prefix</Label>
                  <Input
                    id="receiptPrefix"
                    value={configuration.financial.documentPrefixes.receipt}
                    onChange={(e) => handleNestedChange("financial", "documentPrefixes", "receipt", e.target.value)}
                    placeholder="RCP"
                    disabled={configuration.chainInheritance?.financial}
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
                  <Label htmlFor="checkInTime">Check-in Time</Label>
                  <Input
                    id="checkInTime"
                    type="time"
                    value={configuration.operational.checkInTime}
                    onChange={(e) => handleNestedChange("operational", "", "checkInTime", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="checkOutTime">Check-out Time</Label>
                  <Input
                    id="checkOutTime"
                    type="time"
                    value={configuration.operational.checkOutTime}
                    onChange={(e) => handleNestedChange("operational", "", "checkOutTime", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cancellationPolicy">Cancellation Policy</Label>
                <Textarea
                  id="cancellationPolicy"
                  value={configuration.operational.cancellationPolicy}
                  onChange={(e) => handleNestedChange("operational", "", "cancellationPolicy", e.target.value)}
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
                    checked={configuration.features.onlineBooking}
                    onCheckedChange={(checked) => handleNestedChange("features", "", "onlineBooking", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Mobile Check-in</Label>
                    <p className="text-sm text-muted-foreground">Enable mobile check-in</p>
                  </div>
                  <Switch
                    checked={configuration.features.mobileCheckin}
                    onCheckedChange={(checked) => handleNestedChange("features", "", "mobileCheckin", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Keyless Entry</Label>
                    <p className="text-sm text-muted-foreground">Enable keyless room entry</p>
                  </div>
                  <Switch
                    checked={configuration.features.keylessEntry}
                    onCheckedChange={(checked) => handleNestedChange("features", "", "keylessEntry", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Loyalty Program</Label>
                    <p className="text-sm text-muted-foreground">Enable loyalty program</p>
                  </div>
                  <Switch
                    checked={configuration.features.loyaltyProgram}
                    onCheckedChange={(checked) => handleNestedChange("features", "", "loyaltyProgram", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Multi-Language</Label>
                    <p className="text-sm text-muted-foreground">Support multiple languages</p>
                  </div>
                  <Switch
                    checked={configuration.features.multiLanguage}
                    onCheckedChange={(checked) => handleNestedChange("features", "", "multiLanguage", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Payment Gateway</Label>
                    <p className="text-sm text-muted-foreground">Integrated payment processing</p>
                  </div>
                  <Switch
                    checked={configuration.features.paymentGateway}
                    onCheckedChange={(checked) => handleNestedChange("features", "", "paymentGateway", checked)}
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
                    checked={configuration.notifications.emailNotifications}
                    onCheckedChange={(checked) =>
                      handleNestedChange("notifications", "", "emailNotifications", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Booking Confirmations</Label>
                    <p className="text-sm text-muted-foreground">Auto-send booking confirmations</p>
                  </div>
                  <Switch
                    checked={configuration.notifications.bookingConfirmations}
                    onCheckedChange={(checked) =>
                      handleNestedChange("notifications", "", "bookingConfirmations", checked)
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
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    value={configuration.banking.primaryAccount.bankName}
                    onChange={(e) => handleNestedChange("banking", "primaryAccount", "bankName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountName">Account Name</Label>
                  <Input
                    id="accountName"
                    value={configuration.banking.primaryAccount.accountName}
                    onChange={(e) => handleNestedChange("banking", "primaryAccount", "accountName", e.target.value)}
                  />
                </div>
              </div>

              <Separator />

              <h3 className="text-lg font-semibold">Payment Methods</h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Accepted Cards</Label>
                  <div className="flex flex-wrap gap-2">
                    {["visa", "mastercard", "amex", "discover", "jcb", "diners"].map((card) => (
                      <div key={card} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={card}
                          checked={configuration.banking.paymentMethods.acceptedCards.includes(card)}
                          onChange={(e) => {
                            const currentCards = configuration.banking.paymentMethods.acceptedCards
                            const newCards = e.target.checked
                              ? [...currentCards, card]
                              : currentCards.filter((c) => c !== card)
                            handleNestedChange("banking", "paymentMethods", "acceptedCards", newCards)
                          }}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor={card} className="capitalize">
                          {card}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Online Payments</Label>
                      <p className="text-sm text-muted-foreground">Accept online payments</p>
                    </div>
                    <Switch
                      checked={configuration.banking.paymentMethods.onlinePayments}
                      onCheckedChange={(checked) =>
                        handleNestedChange("banking", "paymentMethods", "onlinePayments", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Cash Payments</Label>
                      <p className="text-sm text-muted-foreground">Accept cash payments</p>
                    </div>
                    <Switch
                      checked={configuration.banking.paymentMethods.cashPayments}
                      onCheckedChange={(checked) =>
                        handleNestedChange("banking", "paymentMethods", "cashPayments", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Bank Transfers</Label>
                      <p className="text-sm text-muted-foreground">Accept bank transfers</p>
                    </div>
                    <Switch
                      checked={configuration.banking.paymentMethods.bankTransfers}
                      onCheckedChange={(checked) =>
                        handleNestedChange("banking", "paymentMethods", "bankTransfers", checked)
                      }
                    />
                  </div>
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

        <TabsContent value="documents" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Document Templates</CardTitle>
              <CardDescription>Configure document template settings</CardDescription>
              {configuration.chainInheritance?.document_templates && (
                <Badge variant="outline" className="w-fit">
                  <AlertTriangle className="mr-1 h-3 w-3" />
                  Inherited from Chain
                </Badge>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Invoice Template</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show Logo</Label>
                      <p className="text-sm text-muted-foreground">Display logo on invoices</p>
                    </div>
                    <Switch
                      checked={configuration.document_templates?.invoice?.show_logo || false}
                      onCheckedChange={(checked) =>
                        handleNestedChange("document_templates", "invoice", "show_logo", checked)
                      }
                      disabled={configuration.chainInheritance?.document_templates}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show Watermark</Label>
                      <p className="text-sm text-muted-foreground">Display watermark on invoices</p>
                    </div>
                    <Switch
                      checked={configuration.document_templates?.invoice?.show_watermark || false}
                      onCheckedChange={(checked) =>
                        handleNestedChange("document_templates", "invoice", "show_watermark", checked)
                      }
                      disabled={configuration.chainInheritance?.document_templates}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentTerms">Payment Terms</Label>
                  <Textarea
                    id="paymentTerms"
                    value={configuration.document_templates?.invoice?.payment_terms || ""}
                    onChange={(e) =>
                      handleNestedChange("document_templates", "invoice", "payment_terms", e.target.value)
                    }
                    placeholder="Payment due within 30 days"
                    disabled={configuration.chainInheritance?.document_templates}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Receipt Template</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show Logo</Label>
                      <p className="text-sm text-muted-foreground">Display logo on receipts</p>
                    </div>
                    <Switch
                      checked={configuration.document_templates?.receipt?.show_logo || false}
                      onCheckedChange={(checked) =>
                        handleNestedChange("document_templates", "receipt", "show_logo", checked)
                      }
                      disabled={configuration.chainInheritance?.document_templates}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show Watermark</Label>
                      <p className="text-sm text-muted-foreground">Display watermark on receipts</p>
                    </div>
                    <Switch
                      checked={configuration.document_templates?.receipt?.show_watermark || false}
                      onCheckedChange={(checked) =>
                        handleNestedChange("document_templates", "receipt", "show_watermark", checked)
                      }
                      disabled={configuration.chainInheritance?.document_templates}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Folio Template</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show Logo</Label>
                      <p className="text-sm text-muted-foreground">Display logo on folios</p>
                    </div>
                    <Switch
                      checked={configuration.document_templates?.folio?.show_logo || false}
                      onCheckedChange={(checked) =>
                        handleNestedChange("document_templates", "folio", "show_logo", checked)
                      }
                      disabled={configuration.chainInheritance?.document_templates}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show Watermark</Label>
                      <p className="text-sm text-muted-foreground">Display watermark on folios</p>
                    </div>
                    <Switch
                      checked={configuration.document_templates?.folio?.show_watermark || false}
                      onCheckedChange={(checked) =>
                        handleNestedChange("document_templates", "folio", "show_watermark", checked)
                      }
                      disabled={configuration.chainInheritance?.document_templates}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="legal" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Legal Information</CardTitle>
              <CardDescription>Legal entity and business information</CardDescription>
              {configuration.chainInheritance?.legal && (
                <Badge variant="outline" className="w-fit">
                  <AlertTriangle className="mr-1 h-3 w-3" />
                  Inherited from Chain
                </Badge>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="businessType">Business Type</Label>
                <Select
                  value={configuration.legal?.business_type || ""}
                  onValueChange={(value) => handleNestedChange("legal", "", "business_type", value)}
                  disabled={configuration.chainInheritance?.legal}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select business type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="corporation">Corporation</SelectItem>
                    <SelectItem value="llc">Limited Liability Company (LLC)</SelectItem>
                    <SelectItem value="partnership">Partnership</SelectItem>
                    <SelectItem value="sole_proprietorship">Sole Proprietorship</SelectItem>
                    <SelectItem value="non_profit">Non-Profit Organization</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
