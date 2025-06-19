"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { useHotels } from "@/hooks/use-hotels"
import { useHotelSettings } from "@/hooks/use-hotel-settings"
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Loader2,
  Building,
  Settings,
  Palette,
  CreditCard,
  FileText,
  Shield,
} from "lucide-react"

const setupSchema = z.object({
  // Basic Information
  name: z.string().min(2, "Hotel name is required"),
  legal_name: z.string().min(2, "Legal name is required"),
  tax_id: z.string().optional(),

  // Contact Information
  contact: z.object({
    address: z.object({
      street: z.string().min(1, "Street address is required"),
      city: z.string().min(1, "City is required"),
      state: z.string().min(1, "State is required"),
      postal_code: z.string().min(1, "Postal code is required"),
      country: z.string().min(1, "Country is required"),
    }),
    phone: z.object({
      primary: z.string().min(1, "Primary phone is required"),
      secondary: z.string().optional(),
    }),
    email: z.object({
      primary: z.string().email("Valid email is required"),
      secondary: z.string().email().optional().or(z.literal("")),
      support: z.string().email().optional().or(z.literal("")),
    }),
    website: z.string().url().optional().or(z.literal("")),
  }),

  // Branding
  branding: z.object({
    primary_color: z.string().min(1, "Primary color is required"),
    secondary_color: z.string().min(1, "Secondary color is required"),
    accent_color: z.string().min(1, "Accent color is required"),
    logo_url: z.string().url().optional().or(z.literal("")),
    favicon_url: z.string().url().optional().or(z.literal("")),
  }),

  // Financial
  financial: z.object({
    currency: z.object({
      code: z.string().min(3, "Currency code is required"),
      symbol: z.string().min(1, "Currency symbol is required"),
      position: z.enum(["before", "after"]),
    }),
    document_prefixes: z.object({
      invoice: z.string().min(1, "Invoice prefix is required"),
      receipt: z.string().min(1, "Receipt prefix is required"),
      quotation: z.string().min(1, "Quotation prefix is required"),
      folio: z.string().min(1, "Folio prefix is required"),
    }),
  }),

  // Operational
  operational: z.object({
    check_in_time: z.string().min(1, "Check-in time is required"),
    check_out_time: z.string().min(1, "Check-out time is required"),
    time_zone: z.string().min(1, "Time zone is required"),
    date_format: z.string().min(1, "Date format is required"),
    time_format: z.string().min(1, "Time format is required"),
    cancellation_policy: z.string().min(10, "Cancellation policy is required"),
  }),

  // Features
  features: z.object({
    online_booking: z.boolean().default(true),
    mobile_checkin: z.boolean().default(true),
    keyless_entry: z.boolean().default(false),
    loyalty_program: z.boolean().default(false),
    multi_language: z.boolean().default(false),
    payment_gateway: z.boolean().default(true),
  }),
})

const SETUP_STEPS = [
  { id: "basic", title: "Basic Information", icon: Building },
  { id: "contact", title: "Contact Details", icon: FileText },
  { id: "branding", title: "Branding", icon: Palette },
  { id: "financial", title: "Financial", icon: CreditCard },
  { id: "operational", title: "Operations", icon: Settings },
  { id: "features", title: "Features", icon: Shield },
]

export default function HotelSetupPage() {
  const params = useParams()
  const router = useRouter()
  const hotelId = params.id as string
  const { getHotelById } = useHotels()
  const { createConfiguration } = useHotelSettings()

  const [hotel, setHotel] = useState<any>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  const form = useForm<z.infer<typeof setupSchema>>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      name: "",
      legal_name: "",
      tax_id: "",
      contact: {
        address: {
          street: "",
          city: "",
          state: "",
          postal_code: "",
          country: "",
        },
        phone: {
          primary: "",
          secondary: "",
        },
        email: {
          primary: "",
          secondary: "",
          support: "",
        },
        website: "",
      },
      branding: {
        primary_color: "#3b82f6",
        secondary_color: "#64748b",
        accent_color: "#f59e0b",
        logo_url: "",
        favicon_url: "",
      },
      financial: {
        currency: {
          code: "USD",
          symbol: "$",
          position: "before",
        },
        document_prefixes: {
          invoice: "INV-",
          receipt: "REC-",
          quotation: "QUO-",
          folio: "FOL-",
        },
      },
      operational: {
        check_in_time: "15:00",
        check_out_time: "11:00",
        time_zone: "UTC",
        date_format: "MM/DD/YYYY",
        time_format: "12",
        cancellation_policy: "Cancellation is allowed up to 24 hours before check-in without penalty.",
      },
      features: {
        online_booking: true,
        mobile_checkin: true,
        keyless_entry: false,
        loyalty_program: false,
        multi_language: false,
        payment_gateway: true,
      },
    },
  })

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const response = await getHotelById(hotelId)
        if (response.data) {
          setHotel(response.data)
          // Pre-fill form with hotel data
          form.setValue("name", response.data.name || "")
          form.setValue("legal_name", response.data.name || "")
          if (response.data.address) {
            form.setValue("contact.address.street", response.data.address.street || "")
            form.setValue("contact.address.city", response.data.address.city || "")
            form.setValue("contact.address.state", response.data.address.state || "")
            form.setValue("contact.address.postal_code", response.data.address.zipCode || "")
            form.setValue("contact.address.country", response.data.address.country || "")
          }
          if (response.data.contactInfo) {
            form.setValue("contact.phone.primary", response.data.contactInfo.phone || "")
            form.setValue("contact.email.primary", response.data.contactInfo.email || "")
            form.setValue("contact.website", response.data.contactInfo.website || "")
          }
        }
      } catch (error) {
        console.error("Error fetching hotel:", error)
        toast.error("Failed to load hotel information")
      } finally {
        setIsLoading(false)
      }
    }

    if (hotelId) {
      fetchHotel()
    }
  }, [hotelId, getHotelById, form])

  const validateCurrentStep = async () => {
    const stepFields = getStepFields(currentStep)
    const isValid = await form.trigger(stepFields)

    if (isValid && !completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep])
    }

    return isValid
  }

  const getStepFields = (step: number): (keyof z.infer<typeof setupSchema>)[] => {
    switch (step) {
      case 0:
        return ["name", "legal_name", "tax_id"]
      case 1:
        return ["contact"]
      case 2:
        return ["branding"]
      case 3:
        return ["financial"]
      case 4:
        return ["operational"]
      case 5:
        return ["features"]
      default:
        return []
    }
  }

  const handleNext = async () => {
    const isValid = await validateCurrentStep()
    if (isValid && currentStep < SETUP_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const onSubmit = async (values: z.infer<typeof setupSchema>) => {
    setIsSubmitting(true)
    try {
      const response = await createConfiguration(hotelId, {
        hotel: hotelId,
        ...values,
        notifications: {
          email_notifications: true,
          sms_notifications: false,
          push_notifications: true,
          booking_confirmations: true,
          payment_reminders: true,
          marketing_emails: false,
        },
        banking: {
          primary_account: {
            bank_name: "",
            account_name: "",
            account_number: "",
            routing_number: "",
          },
          payment_methods: {
            accepted_cards: ["visa", "mastercard", "amex"],
            online_payments: true,
            cash_payments: true,
            bank_transfers: false,
          },
        },
      })

      if (response.error) {
        throw new Error(response.error)
      }

      toast.success("Hotel setup completed successfully!")
      router.push(`/admin/hotels/${hotelId}/settings`)
    } catch (error) {
      console.error("Error completing setup:", error)
      toast.error(error instanceof Error ? error.message : "Failed to complete setup")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
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
        <p className="mt-2 text-muted-foreground">The hotel you're trying to set up doesn't exist</p>
        <Button className="mt-6" onClick={() => router.push("/admin/hotels")}>
          Back to Hotels
        </Button>
      </div>
    )
  }

  const progress = ((currentStep + 1) / SETUP_STEPS.length) * 100

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/admin/hotels/${hotelId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hotel Setup</h1>
          <p className="text-muted-foreground">
            Configure {hotel.name} ({hotel.code})
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Setup Progress</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />

            {/* Step Indicators */}
            <div className="flex justify-between">
              {SETUP_STEPS.map((step, index) => {
                const Icon = step.icon
                const isCompleted = completedSteps.includes(index)
                const isCurrent = currentStep === index

                return (
                  <div
                    key={step.id}
                    className={`flex flex-col items-center space-y-2 ${
                      isCurrent ? "text-primary" : isCompleted ? "text-green-600" : "text-muted-foreground"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                        isCurrent
                          ? "border-primary bg-primary/10"
                          : isCompleted
                            ? "border-green-600 bg-green-50"
                            : "border-muted-foreground/30"
                      }`}
                    >
                      {isCompleted ? <CheckCircle className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                    </div>
                    <span className="text-xs font-medium text-center">{step.title}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Step Content */}
          {currentStep === 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Basic Information
                </CardTitle>
                <CardDescription>Essential hotel details and identification</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hotel Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Grand Hotel & Resort" {...field} />
                      </FormControl>
                      <FormDescription>The public name of your hotel</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="legal_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Legal Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Grand Hotel & Resort LLC" {...field} />
                      </FormControl>
                      <FormDescription>The official legal name of your business</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tax_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax ID / VAT Number</FormLabel>
                      <FormControl>
                        <Input placeholder="12-3456789" {...field} />
                      </FormControl>
                      <FormDescription>Your business tax identification number</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Contact Information
                </CardTitle>
                <CardDescription>Hotel location and contact details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="contact.address.street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street Address</FormLabel>
                      <FormControl>
                        <Textarea placeholder="123 Main Street, Suite 100" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="contact.address.city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="New York" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contact.address.state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State / Province</FormLabel>
                        <FormControl>
                          <Input placeholder="NY" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="contact.address.postal_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal Code</FormLabel>
                        <FormControl>
                          <Input placeholder="10001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contact.address.country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input placeholder="United States" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="contact.phone.primary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 (555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contact.email.primary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="info@hotel.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Branding
                </CardTitle>
                <CardDescription>Visual identity and brand colors</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="branding.primary_color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Color</FormLabel>
                        <FormControl>
                          <div className="flex gap-2">
                            <Input type="color" {...field} className="w-16 h-10 p-1" />
                            <Input {...field} placeholder="#3b82f6" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="branding.secondary_color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Secondary Color</FormLabel>
                        <FormControl>
                          <div className="flex gap-2">
                            <Input type="color" {...field} className="w-16 h-10 p-1" />
                            <Input {...field} placeholder="#64748b" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="branding.accent_color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Accent Color</FormLabel>
                        <FormControl>
                          <div className="flex gap-2">
                            <Input type="color" {...field} className="w-16 h-10 p-1" />
                            <Input {...field} placeholder="#f59e0b" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="branding.logo_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Logo URL (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/logo.png" {...field} />
                        </FormControl>
                        <FormDescription>URL to your hotel logo</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="branding.favicon_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Favicon URL (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/favicon.ico" {...field} />
                        </FormControl>
                        <FormDescription>URL to your website favicon</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Financial Settings
                </CardTitle>
                <CardDescription>Currency and document configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="financial.currency.code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency Code</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="USD">USD - US Dollar</SelectItem>
                            <SelectItem value="EUR">EUR - Euro</SelectItem>
                            <SelectItem value="GBP">GBP - British Pound</SelectItem>
                            <SelectItem value="UGX">UGX - Ugandan Shilling</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="financial.currency.symbol"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency Symbol</FormLabel>
                        <FormControl>
                          <Input placeholder="$" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="financial.currency.position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Symbol Position</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="before">Before Amount ($100)</SelectItem>
                            <SelectItem value="after">After Amount (100$)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="financial.document_prefixes.invoice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Invoice Prefix</FormLabel>
                        <FormControl>
                          <Input placeholder="INV-" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="financial.document_prefixes.receipt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Receipt Prefix</FormLabel>
                        <FormControl>
                          <Input placeholder="REC-" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Operational Settings
                </CardTitle>
                <CardDescription>Check-in/out times and policies</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="operational.check_in_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Check-in Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="operational.check_out_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Check-out Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="operational.cancellation_policy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cancellation Policy</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe your cancellation policy..." {...field} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {currentStep === 5 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Features & Services
                </CardTitle>
                <CardDescription>Enable hotel features and services</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="features.online_booking"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Online Booking</FormLabel>
                          <FormDescription>Allow guests to book rooms online</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="features.mobile_checkin"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Mobile Check-in</FormLabel>
                          <FormDescription>Enable mobile check-in for guests</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="features.payment_gateway"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Payment Gateway</FormLabel>
                          <FormDescription>Accept online payments</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="features.loyalty_program"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Loyalty Program</FormLabel>
                          <FormDescription>Enable guest loyalty rewards</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={handlePrevious} disabled={currentStep === 0}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            {currentStep < SETUP_STEPS.length - 1 ? (
              <Button type="button" onClick={handleNext}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Completing Setup...
                  </>
                ) : (
                  "Complete Setup"
                )}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  )
}
