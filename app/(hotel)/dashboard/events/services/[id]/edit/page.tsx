"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Save,
  Package,
  DollarSign,
  Clock,
  Settings,
  ExternalLink,
  Plus,
  Trash2,
  Loader2,
  AlertTriangle,
} from "lucide-react"
import { useEventServices, type EventService } from "@/hooks/use-event-services"
import { useCurrentHotel } from "@/hooks/use-current-hotel"
import { toast } from "sonner"

const CATEGORIES = [
  "catering",
  "decoration",
  "equipment",
  "entertainment",
  "staffing",
  "photography",
  "transportation",
  "security",
  "cleaning",
  "other",
]

const PRICE_TYPES = [
  { value: "fixed", label: "Fixed Price" },
  { value: "per_person", label: "Per Person" },
  { value: "per_hour", label: "Per Hour" },
  { value: "per_day", label: "Per Day" },
  { value: "custom", label: "Custom" },
]

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "seasonal", label: "Seasonal" },
]

export default function EditEventServicePage() {
  const params = useParams()
  const router = useRouter()
  const serviceId = params.id as string

  // Form state
  const [formData, setFormData] = useState<Partial<EventService>>({
    name: "",
    description: "",
    category: "",
    subcategory: "",
    price: 0,
    priceType: "fixed",
    customPriceDetails: "",
    minimumQuantity: 1,
    maximumQuantity: undefined,
    leadTime: 24,
    duration: undefined,
    setupTime: 1,
    cleanupTime: 1,
    status: "active",
    isExternalService: false,
    externalProvider: {
      name: "",
      contactPerson: "",
      phone: "",
      email: "",
      contractDetails: "",
      commissionRate: undefined,
    },
    inventory: {
      isLimited: false,
      totalQuantity: undefined,
      availableQuantity: undefined,
      lowStockThreshold: undefined,
    },
    restrictions: {
      venueTypes: [],
      eventTypes: [],
      minCapacity: undefined,
      maxCapacity: undefined,
      availableDays: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: true,
      },
    },
    seasonalAvailability: {
      isAvailable: false,
      startDate: "",
      endDate: "",
      description: "",
    },
    options: [],
    images: [],
  })

  // Get current hotel data
  const { hotel, hotelId, isLoading: hotelLoading } = useCurrentHotel()

  // Get service data
  const { getServiceById, updateService } = useEventServices(hotelId)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Debug information
  console.log("Edit component render:", {
    serviceId,
    hotelId,
    hotelLoading,
    loading,
    error,
    formData: formData.name ? "Form data loaded" : "No form data",
  })

  // Temporary bypass for testing - remove this after debugging
  if (!hotelLoading && !loading && !error && !formData.name && hotelId && serviceId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 dark:from-slate-900 dark:via-purple-900 dark:to-pink-900 p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Debug Information</h3>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Service ID:</strong> {serviceId}
                </p>
                <p>
                  <strong>Hotel ID:</strong> {hotelId}
                </p>
                <p>
                  <strong>Hotel Loading:</strong> {hotelLoading ? "Yes" : "No"}
                </p>
                <p>
                  <strong>Service Loading:</strong> {loading ? "Yes" : "No"}
                </p>
                <p>
                  <strong>Error:</strong> {error || "None"}
                </p>
                <p>
                  <strong>Form Data:</strong> {formData.name ? "Loaded" : "Not loaded"}
                </p>
              </div>
              <div className="mt-4 space-x-2">
                <Button onClick={() => window.location.reload()}>Reload Page</Button>
                <Button asChild variant="outline">
                  <Link href="/dashboard/events/services">Back to Services</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Fetch service details
  useEffect(() => {
    const fetchService = async () => {
      console.log("Fetch service called:", { serviceId, hotelId })

      if (!serviceId) {
        setError("Service ID is required")
        setLoading(false)
        return
      }

      if (!hotelId) {
        console.log("Waiting for hotel ID...")
        return // Wait for hotel ID to be available
      }

      try {
        setLoading(true)
        setError(null)
        console.log("Fetching service with ID:", serviceId)

        const serviceData = await getServiceById(serviceId)
        console.log("Service data received:", serviceData)

        if (serviceData) {
          // Verify service belongs to current hotel
          if (serviceData.hotel !== hotelId) {
            setError("Service not found or access denied")
            return
          }
          setFormData(serviceData)
        } else {
          setError("Service not found")
        }
      } catch (err) {
        console.error("Error fetching service:", err)
        setError("Failed to load service details")
      } finally {
        setLoading(false)
      }
    }

    fetchService()
  }, [serviceId, hotelId, getServiceById])

  // Handle input changes
  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Handle nested object changes
  const handleNestedChange = (parent: string, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof typeof prev] as any),
        [field]: value,
      },
    }))
  }

  // Handle array changes
  const handleArrayChange = (field: string, value: string[]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Add option
  const addOption = () => {
    setFormData((prev) => ({
      ...prev,
      options: [...(prev.options || []), { name: "", description: "", additionalPrice: 0 }],
    }))
  }

  // Remove option
  const removeOption = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options?.filter((_, i) => i !== index) || [],
    }))
  }

  // Update option
  const updateOption = (index: number, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options?.map((option, i) => (i === index ? { ...option, [field]: value } : option)) || [],
    }))
  }

  // Add image
  const addImage = () => {
    setFormData((prev) => ({
      ...prev,
      images: [...(prev.images || []), { url: "", caption: "", isDefault: false }],
    }))
  }

  // Remove image
  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index) || [],
    }))
  }

  // Update image
  const updateImage = (index: number, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images?.map((image, i) => (i === index ? { ...image, [field]: value } : image)) || [],
    }))
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    if (!formData.name?.trim()) {
      toast.error("Service name is required")
      return
    }

    if (!formData.category) {
      toast.error("Category is required")
      return
    }

    if (!formData.price || formData.price < 0) {
      toast.error("Valid price is required")
      return
    }

    try {
      setSaving(true)

      // Prepare data for submission
      const updateData = {
        ...formData,
        hotel: hotelId, // Ensure hotel ID is set
      }

      const result = await updateService(serviceId, updateData)

      if (result) {
        toast.success("Service updated successfully")
        router.push(`/dashboard/events/services/${serviceId}`)
      } else {
        toast.error("Failed to update service")
      }
    } catch (error) {
      console.error("Error updating service:", error)
      toast.error("Failed to update service")
    } finally {
      setSaving(false)
    }
  }

  if (hotelLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 dark:from-slate-900 dark:via-purple-900 dark:to-pink-900">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 dark:text-purple-400" />
          <p className="text-lg font-medium text-slate-700 dark:text-slate-300">Loading hotel information...</p>
          <p className="text-sm text-slate-500">Debug: Hotel loading</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 dark:from-slate-900 dark:via-purple-900 dark:to-pink-900">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 dark:text-purple-400" />
          <p className="text-lg font-medium text-slate-700 dark:text-slate-300">Loading service details...</p>
          <p className="text-sm text-slate-500">
            Debug: Service ID: {serviceId}, Hotel ID: {hotelId}
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 dark:from-slate-900 dark:via-purple-900 dark:to-pink-900 p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="flex flex-col items-center justify-center h-64">
              <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-slate-700 dark:text-slate-300">Service Not Found</h3>
              <p className="text-slate-500 dark:text-slate-400 text-center mb-4">{error}</p>
              <Button asChild variant="outline">
                <Link href="/dashboard/events/services">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Services
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 dark:from-slate-900 dark:via-purple-900 dark:to-pink-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 dark:border-slate-700/20">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/events/services/${serviceId}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Service
              </Link>
            </Button>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 dark:from-purple-400 dark:via-pink-400 dark:to-red-400 bg-clip-text text-transparent">
                Edit Service
              </h1>
              <p className="text-slate-600 dark:text-slate-300 mt-2 text-lg">
                Update service details for <span className="font-medium">{hotel?.name || "your hotel"}</span>
              </p>
              {hotelId && <p className="text-xs text-muted-foreground">Hotel ID: {hotelId}</p>}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="space-y-6">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 dark:border-slate-700/20">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="pricing">Pricing</TabsTrigger>
                <TabsTrigger value="timing">Timing</TabsTrigger>
                <TabsTrigger value="restrictions">Restrictions</TabsTrigger>
                <TabsTrigger value="provider">Provider</TabsTrigger>
                <TabsTrigger value="extras">Extras</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="basic" className="space-y-6">
              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="mr-2 h-5 w-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Service Name *</Label>
                      <Input
                        id="name"
                        value={formData.name || ""}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Enter service name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={formData.category || ""}
                        onValueChange={(value) => handleInputChange("category", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category.charAt(0).toUpperCase() + category.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="subcategory">Subcategory</Label>
                      <Input
                        id="subcategory"
                        value={formData.subcategory || ""}
                        onChange={(e) => handleInputChange("subcategory", e.target.value)}
                        placeholder="Enter subcategory (optional)"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status || "active"}
                        onValueChange={(value) => handleInputChange("status", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description || ""}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Enter service description"
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pricing" className="space-y-6">
              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="mr-2 h-5 w-5" />
                    Pricing Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price *</Label>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.price || ""}
                        onChange={(e) => handleInputChange("price", Number.parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="priceType">Price Type</Label>
                      <Select
                        value={formData.priceType || "fixed"}
                        onValueChange={(value) => handleInputChange("priceType", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PRICE_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {formData.priceType === "custom" && (
                    <div className="space-y-2">
                      <Label htmlFor="customPriceDetails">Custom Price Details</Label>
                      <Textarea
                        id="customPriceDetails"
                        value={formData.customPriceDetails || ""}
                        onChange={(e) => handleInputChange("customPriceDetails", e.target.value)}
                        placeholder="Explain the custom pricing structure"
                        rows={3}
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="minimumQuantity">Minimum Quantity</Label>
                      <Input
                        id="minimumQuantity"
                        type="number"
                        min="1"
                        value={formData.minimumQuantity || 1}
                        onChange={(e) => handleInputChange("minimumQuantity", Number.parseInt(e.target.value) || 1)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maximumQuantity">Maximum Quantity</Label>
                      <Input
                        id="maximumQuantity"
                        type="number"
                        min="1"
                        value={formData.maximumQuantity || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "maximumQuantity",
                            e.target.value ? Number.parseInt(e.target.value) : undefined,
                          )
                        }
                        placeholder="No limit"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timing" className="space-y-6">
              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="mr-2 h-5 w-5" />
                    Timing Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="leadTime">Lead Time (hours) *</Label>
                      <Input
                        id="leadTime"
                        type="number"
                        min="0"
                        value={formData.leadTime || 24}
                        onChange={(e) => handleInputChange("leadTime", Number.parseInt(e.target.value) || 24)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration (hours)</Label>
                      <Input
                        id="duration"
                        type="number"
                        min="0"
                        value={formData.duration || ""}
                        onChange={(e) =>
                          handleInputChange("duration", e.target.value ? Number.parseInt(e.target.value) : undefined)
                        }
                        placeholder="Not specified"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="setupTime">Setup Time (hours)</Label>
                      <Input
                        id="setupTime"
                        type="number"
                        min="0"
                        value={formData.setupTime || 1}
                        onChange={(e) => handleInputChange("setupTime", Number.parseInt(e.target.value) || 1)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cleanupTime">Cleanup Time (hours)</Label>
                      <Input
                        id="cleanupTime"
                        type="number"
                        min="0"
                        value={formData.cleanupTime || 1}
                        onChange={(e) => handleInputChange("cleanupTime", Number.parseInt(e.target.value) || 1)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="restrictions" className="space-y-6">
              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="mr-2 h-5 w-5" />
                    Service Restrictions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="minCapacity">Minimum Capacity</Label>
                      <Input
                        id="minCapacity"
                        type="number"
                        min="0"
                        value={formData.restrictions?.minCapacity || ""}
                        onChange={(e) =>
                          handleNestedChange(
                            "restrictions",
                            "minCapacity",
                            e.target.value ? Number.parseInt(e.target.value) : undefined,
                          )
                        }
                        placeholder="No minimum"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxCapacity">Maximum Capacity</Label>
                      <Input
                        id="maxCapacity"
                        type="number"
                        min="0"
                        value={formData.restrictions?.maxCapacity || ""}
                        onChange={(e) =>
                          handleNestedChange(
                            "restrictions",
                            "maxCapacity",
                            e.target.value ? Number.parseInt(e.target.value) : undefined,
                          )
                        }
                        placeholder="No maximum"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-base font-medium mb-3 block">Available Days</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {Object.entries(formData.restrictions?.availableDays || {}).map(([day, available]) => (
                        <div key={day} className="flex items-center space-x-2">
                          <Checkbox
                            id={day}
                            checked={available}
                            onCheckedChange={(checked) =>
                              handleNestedChange("restrictions", "availableDays", {
                                ...formData.restrictions?.availableDays,
                                [day]: checked,
                              })
                            }
                          />
                          <Label htmlFor={day} className="capitalize">
                            {day}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <Checkbox
                        id="seasonalAvailable"
                        checked={formData.seasonalAvailability?.isAvailable || false}
                        onCheckedChange={(checked) =>
                          handleNestedChange("seasonalAvailability", "isAvailable", checked)
                        }
                      />
                      <Label htmlFor="seasonalAvailable" className="text-base font-medium">
                        Seasonal Availability
                      </Label>
                    </div>

                    {formData.seasonalAvailability?.isAvailable && (
                      <div className="space-y-4 ml-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="seasonalStart">Start Date</Label>
                            <Input
                              id="seasonalStart"
                              type="date"
                              value={formData.seasonalAvailability?.startDate || ""}
                              onChange={(e) => handleNestedChange("seasonalAvailability", "startDate", e.target.value)}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="seasonalEnd">End Date</Label>
                            <Input
                              id="seasonalEnd"
                              type="date"
                              value={formData.seasonalAvailability?.endDate || ""}
                              onChange={(e) => handleNestedChange("seasonalAvailability", "endDate", e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="seasonalDescription">Seasonal Description</Label>
                          <Textarea
                            id="seasonalDescription"
                            value={formData.seasonalAvailability?.description || ""}
                            onChange={(e) => handleNestedChange("seasonalAvailability", "description", e.target.value)}
                            placeholder="Describe the seasonal availability"
                            rows={2}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="provider" className="space-y-6">
              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ExternalLink className="mr-2 h-5 w-5" />
                    Service Provider
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isExternalService"
                      checked={formData.isExternalService || false}
                      onCheckedChange={(checked) => handleInputChange("isExternalService", checked)}
                    />
                    <Label htmlFor="isExternalService">External Service Provider</Label>
                  </div>

                  {formData.isExternalService && (
                    <div className="space-y-4 ml-6 p-4 border rounded-lg bg-slate-50 dark:bg-slate-800">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="providerName">Provider Name</Label>
                          <Input
                            id="providerName"
                            value={formData.externalProvider?.name || ""}
                            onChange={(e) => handleNestedChange("externalProvider", "name", e.target.value)}
                            placeholder="Enter provider name"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="contactPerson">Contact Person</Label>
                          <Input
                            id="contactPerson"
                            value={formData.externalProvider?.contactPerson || ""}
                            onChange={(e) => handleNestedChange("externalProvider", "contactPerson", e.target.value)}
                            placeholder="Enter contact person"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="providerPhone">Phone</Label>
                          <Input
                            id="providerPhone"
                            value={formData.externalProvider?.phone || ""}
                            onChange={(e) => handleNestedChange("externalProvider", "phone", e.target.value)}
                            placeholder="Enter phone number"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="providerEmail">Email</Label>
                          <Input
                            id="providerEmail"
                            type="email"
                            value={formData.externalProvider?.email || ""}
                            onChange={(e) => handleNestedChange("externalProvider", "email", e.target.value)}
                            placeholder="Enter email address"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="commissionRate">Commission Rate (%)</Label>
                        <Input
                          id="commissionRate"
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={formData.externalProvider?.commissionRate || ""}
                          onChange={(e) =>
                            handleNestedChange(
                              "externalProvider",
                              "commissionRate",
                              e.target.value ? Number.parseFloat(e.target.value) : undefined,
                            )
                          }
                          placeholder="0.0"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="contractDetails">Contract Details</Label>
                        <Textarea
                          id="contractDetails"
                          value={formData.externalProvider?.contractDetails || ""}
                          onChange={(e) => handleNestedChange("externalProvider", "contractDetails", e.target.value)}
                          placeholder="Enter contract details and terms"
                          rows={3}
                        />
                      </div>
                    </div>
                  )}

                  <Separator />

                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <Checkbox
                        id="inventoryLimited"
                        checked={formData.inventory?.isLimited || false}
                        onCheckedChange={(checked) => handleNestedChange("inventory", "isLimited", checked)}
                      />
                      <Label htmlFor="inventoryLimited" className="text-base font-medium">
                        Limited Inventory
                      </Label>
                    </div>

                    {formData.inventory?.isLimited && (
                      <div className="space-y-4 ml-6 p-4 border rounded-lg bg-slate-50 dark:bg-slate-800">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="totalQuantity">Total Quantity</Label>
                            <Input
                              id="totalQuantity"
                              type="number"
                              min="0"
                              value={formData.inventory?.totalQuantity || ""}
                              onChange={(e) =>
                                handleNestedChange(
                                  "inventory",
                                  "totalQuantity",
                                  e.target.value ? Number.parseInt(e.target.value) : undefined,
                                )
                              }
                              placeholder="0"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="availableQuantity">Available Quantity</Label>
                            <Input
                              id="availableQuantity"
                              type="number"
                              min="0"
                              value={formData.inventory?.availableQuantity || ""}
                              onChange={(e) =>
                                handleNestedChange(
                                  "inventory",
                                  "availableQuantity",
                                  e.target.value ? Number.parseInt(e.target.value) : undefined,
                                )
                              }
                              placeholder="0"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="lowStockThreshold">Low Stock Alert</Label>
                            <Input
                              id="lowStockThreshold"
                              type="number"
                              min="0"
                              value={formData.inventory?.lowStockThreshold || ""}
                              onChange={(e) =>
                                handleNestedChange(
                                  "inventory",
                                  "lowStockThreshold",
                                  e.target.value ? Number.parseInt(e.target.value) : undefined,
                                )
                              }
                              placeholder="0"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="extras" className="space-y-6">
              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Plus className="mr-2 h-5 w-5" />
                    Service Options
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-base font-medium">Additional Options</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addOption}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Option
                    </Button>
                  </div>

                  {formData.options && formData.options.length > 0 ? (
                    <div className="space-y-4">
                      {formData.options.map((option, index) => (
                        <div key={index} className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-800">
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="font-medium">Option {index + 1}</h4>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeOption(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                            <div className="space-y-2">
                              <Label htmlFor={`option-name-${index}`}>Option Name</Label>
                              <Input
                                id={`option-name-${index}`}
                                value={option.name}
                                onChange={(e) => updateOption(index, "name", e.target.value)}
                                placeholder="Enter option name"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`option-price-${index}`}>Additional Price</Label>
                              <Input
                                id={`option-price-${index}`}
                                type="number"
                                min="0"
                                step="0.01"
                                value={option.additionalPrice}
                                onChange={(e) =>
                                  updateOption(index, "additionalPrice", Number.parseFloat(e.target.value) || 0)
                                }
                                placeholder="0.00"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`option-description-${index}`}>Description</Label>
                            <Textarea
                              id={`option-description-${index}`}
                              value={option.description}
                              onChange={(e) => updateOption(index, "description", e.target.value)}
                              placeholder="Describe this option"
                              rows={2}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                      <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No options added yet</p>
                      <p className="text-sm">Click "Add Option" to create additional service options</p>
                    </div>
                  )}

                  <Separator />

                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <Label className="text-base font-medium">Service Images</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addImage}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Image
                      </Button>
                    </div>

                    {formData.images && formData.images.length > 0 ? (
                      <div className="space-y-4">
                        {formData.images.map((image, index) => (
                          <div key={index} className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-800">
                            <div className="flex justify-between items-start mb-3">
                              <h4 className="font-medium">Image {index + 1}</h4>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeImage(index)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                              <div className="space-y-2">
                                <Label htmlFor={`image-url-${index}`}>Image URL</Label>
                                <Input
                                  id={`image-url-${index}`}
                                  type="url"
                                  value={image.url}
                                  onChange={(e) => updateImage(index, "url", e.target.value)}
                                  placeholder="https://example.com/image.jpg"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor={`image-caption-${index}`}>Caption</Label>
                                <Input
                                  id={`image-caption-${index}`}
                                  value={image.caption}
                                  onChange={(e) => updateImage(index, "caption", e.target.value)}
                                  placeholder="Enter image caption"
                                />
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`image-default-${index}`}
                                checked={image.isDefault}
                                onCheckedChange={(checked) => {
                                  // If setting as default, unset all others
                                  if (checked) {
                                    const updatedImages =
                                      formData.images?.map((img, i) => ({
                                        ...img,
                                        isDefault: i === index,
                                      })) || []
                                    handleInputChange("images", updatedImages)
                                  } else {
                                    updateImage(index, "isDefault", false)
                                  }
                                }}
                              />
                              <Label htmlFor={`image-default-${index}`}>Default Image</Label>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                        <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No images added yet</p>
                        <p className="text-sm">Click "Add Image" to upload service images</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 dark:border-slate-700/20">
              <Button type="button" variant="outline" asChild>
                <Link href={`/dashboard/events/services/${serviceId}`}>Cancel</Link>
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
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
          </Tabs>
        </form>
      </div>
    </div>
  )
}
