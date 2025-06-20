"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Save, Loader2, Package, CheckCircleIcon, Plus, X, DollarSign, Clock } from "lucide-react"
import { useEventServices, type EventService } from "@/hooks/use-event-services"
import { toast } from "sonner"

// Service categories
const serviceCategories = [
  { value: "catering", label: "Catering" },
  { value: "decoration", label: "Decoration" },
  { value: "equipment", label: "Equipment" },
  { value: "entertainment", label: "Entertainment" },
  { value: "staffing", label: "Staffing" },
  { value: "photography", label: "Photography" },
  { value: "transportation", label: "Transportation" },
  { value: "security", label: "Security" },
  { value: "cleaning", label: "Cleaning" },
  { value: "other", label: "Other" },
]

// Price types
const priceTypes = [
  { value: "flat", label: "Flat Rate" },
  { value: "per_person", label: "Per Person" },
  { value: "per_hour", label: "Per Hour" },
  { value: "per_day", label: "Per Day" },
  { value: "custom", label: "Custom" },
]

interface ServiceOption {
  name: string
  description: string
  additionalPrice: number
}

interface ServiceImage {
  url: string
  caption: string
  isDefault: boolean
}

interface EditEventServicePageProps {
  params: {
    id: string
  }
}

export default function EditEventServicePage({ params }: EditEventServicePageProps) {
  const router = useRouter()
  const { getServiceById, updateService } = useEventServices()

  // Loading states
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Service data
  const [service, setService] = useState<EventService | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    subcategory: "",
    price: "",
    priceType: "flat",
    customPriceDetails: "",
    minimumQuantity: "1",
    maximumQuantity: "",
    leadTime: "24",
    duration: "",
    setupTime: "30",
    cleanupTime: "30",
    status: "active",
    isExternalService: false,
  })

  // External provider state
  const [externalProvider, setExternalProvider] = useState({
    name: "",
    contactPerson: "",
    phone: "",
    email: "",
    contractDetails: "",
    commissionRate: "",
  })

  // Inventory state
  const [inventory, setInventory] = useState({
    isLimited: false,
    totalQuantity: "",
    availableQuantity: "",
    lowStockThreshold: "",
  })

  // Restrictions state
  const [restrictions, setRestrictions] = useState({
    venueTypes: [] as string[],
    eventTypes: [] as string[],
    minCapacity: "",
    maxCapacity: "",
    availableDays: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: true,
      sunday: true,
    },
  })

  // Seasonal availability state
  const [seasonalAvailability, setSeasonalAvailability] = useState({
    isAvailable: true,
    startDate: "",
    endDate: "",
    description: "",
  })

  // Service options state
  const [options, setOptions] = useState<ServiceOption[]>([])

  // Images state
  const [images, setImages] = useState<ServiceImage[]>([])

  const [activeTab, setActiveTab] = useState("basic")

  // Load service data
  useEffect(() => {
    const loadService = async () => {
      try {
        setLoading(true)
        setError(null)
        const serviceData = await getServiceById(params.id)

        if (serviceData) {
          setService(serviceData)

          // Populate form data
          setFormData({
            name: serviceData.name || "",
            description: serviceData.description || "",
            category: serviceData.category || "",
            subcategory: serviceData.subcategory || "",
            price: serviceData.price?.toString() || "",
            priceType: serviceData.priceType || "flat",
            customPriceDetails: serviceData.customPriceDetails || "",
            minimumQuantity: serviceData.minimumQuantity?.toString() || "1",
            maximumQuantity: serviceData.maximumQuantity?.toString() || "",
            leadTime: serviceData.leadTime?.toString() || "24",
            duration: serviceData.duration?.toString() || "",
            setupTime: serviceData.setupTime?.toString() || "30",
            cleanupTime: serviceData.cleanupTime?.toString() || "30",
            status: serviceData.status || "active",
            isExternalService: serviceData.isExternalService || false,
          })

          // Populate external provider
          if (serviceData.externalProvider) {
            setExternalProvider({
              name: serviceData.externalProvider.name || "",
              contactPerson: serviceData.externalProvider.contactPerson || "",
              phone: serviceData.externalProvider.phone || "",
              email: serviceData.externalProvider.email || "",
              contractDetails: serviceData.externalProvider.contractDetails || "",
              commissionRate: serviceData.externalProvider.commissionRate?.toString() || "",
            })
          }

          // Populate inventory
          if (serviceData.inventory) {
            setInventory({
              isLimited: serviceData.inventory.isLimited || false,
              totalQuantity: serviceData.inventory.totalQuantity?.toString() || "",
              availableQuantity: serviceData.inventory.availableQuantity?.toString() || "",
              lowStockThreshold: serviceData.inventory.lowStockThreshold?.toString() || "",
            })
          }

          // Populate restrictions
          if (serviceData.restrictions) {
            setRestrictions({
              venueTypes: serviceData.restrictions.venueTypes || [],
              eventTypes: serviceData.restrictions.eventTypes || [],
              minCapacity: serviceData.restrictions.minCapacity?.toString() || "",
              maxCapacity: serviceData.restrictions.maxCapacity?.toString() || "",
              availableDays: serviceData.restrictions.availableDays || {
                monday: true,
                tuesday: true,
                wednesday: true,
                thursday: true,
                friday: true,
                saturday: true,
                sunday: true,
              },
            })
          }

          // Populate seasonal availability
          if (serviceData.seasonalAvailability) {
            setSeasonalAvailability({
              isAvailable: serviceData.seasonalAvailability.isAvailable ?? true,
              startDate: serviceData.seasonalAvailability.startDate || "",
              endDate: serviceData.seasonalAvailability.endDate || "",
              description: serviceData.seasonalAvailability.description || "",
            })
          }

          // Populate options
          setOptions(serviceData.options || [])

          // Populate images
          setImages(serviceData.images || [])
        } else {
          setError("Service not found")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load service")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      loadService()
    }
  }, [params.id, getServiceById])

  // Handle form input changes
  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Handle external provider changes
  const handleExternalProviderChange = (field: string, value: string) => {
    setExternalProvider((prev) => ({ ...prev, [field]: value }))
  }

  // Handle inventory changes
  const handleInventoryChange = (field: string, value: string | boolean) => {
    setInventory((prev) => ({ ...prev, [field]: value }))
  }

  // Handle restrictions changes
  const handleRestrictionsChange = (field: string, value: any) => {
    setRestrictions((prev) => ({ ...prev, [field]: value }))
  }

  // Handle available days changes
  const handleDayChange = (day: string, value: boolean) => {
    setRestrictions((prev) => ({
      ...prev,
      availableDays: {
        ...prev.availableDays,
        [day]: value,
      },
    }))
  }

  // Handle seasonal availability changes
  const handleSeasonalChange = (field: string, value: string | boolean) => {
    setSeasonalAvailability((prev) => ({ ...prev, [field]: value }))
  }

  // Handle service options
  const addOption = () => {
    setOptions((prev) => [...prev, { name: "", description: "", additionalPrice: 0 }])
  }

  const removeOption = (index: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== index))
  }

  const updateOption = (index: number, field: keyof ServiceOption, value: string | number) => {
    setOptions((prev) => prev.map((option, i) => (i === index ? { ...option, [field]: value } : option)))
  }

  // Handle images
  const addImage = () => {
    setImages((prev) => [...prev, { url: "", caption: "", isDefault: false }])
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const updateImage = (index: number, field: keyof ServiceImage, value: string | boolean) => {
    setImages((prev) =>
      prev.map((image, i) => {
        if (i === index) {
          // If setting this image as default, unset others
          if (field === "isDefault" && value === true) {
            return { ...image, isDefault: true }
          }
          return { ...image, [field]: value }
        } else {
          // If setting another image as default, unset this one
          if (field === "isDefault" && value === true) {
            return { ...image, isDefault: false }
          }
          return image
        }
      }),
    )
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!service) {
      toast.error("Service data not loaded")
      return
    }

    if (!formData.name.trim()) {
      toast.error("Service name is required")
      setActiveTab("basic")
      return
    }

    if (!formData.category) {
      toast.error("Category is required")
      setActiveTab("basic")
      return
    }

    if (!formData.price || Number.parseFloat(formData.price) < 0) {
      toast.error("Price must be 0 or greater")
      setActiveTab("basic")
      return
    }

    try {
      setIsSubmitting(true)

      // Prepare service data
      const serviceData: Partial<EventService> = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        subcategory: formData.subcategory || undefined,
        price: Number.parseFloat(formData.price),
        priceType: formData.priceType,
        customPriceDetails: formData.customPriceDetails || undefined,
        minimumQuantity: formData.minimumQuantity ? Number.parseInt(formData.minimumQuantity) : 1,
        maximumQuantity: formData.maximumQuantity ? Number.parseInt(formData.maximumQuantity) : undefined,
        leadTime: formData.leadTime ? Number.parseInt(formData.leadTime) : 24,
        duration: formData.duration ? Number.parseInt(formData.duration) : undefined,
        setupTime: formData.setupTime ? Number.parseInt(formData.setupTime) : 30,
        cleanupTime: formData.cleanupTime ? Number.parseInt(formData.cleanupTime) : 30,
        status: formData.status,
        isExternalService: formData.isExternalService,

        // Only include external provider if it's an external service
        ...(formData.isExternalService && {
          externalProvider: {
            name: externalProvider.name,
            contactPerson: externalProvider.contactPerson,
            phone: externalProvider.phone,
            email: externalProvider.email,
            contractDetails: externalProvider.contractDetails,
            commissionRate: externalProvider.commissionRate
              ? Number.parseFloat(externalProvider.commissionRate)
              : undefined,
          },
        }),

        // Only include inventory if it's limited
        ...(inventory.isLimited && {
          inventory: {
            isLimited: true,
            totalQuantity: inventory.totalQuantity ? Number.parseInt(inventory.totalQuantity) : undefined,
            availableQuantity: inventory.availableQuantity ? Number.parseInt(inventory.availableQuantity) : undefined,
            lowStockThreshold: inventory.lowStockThreshold ? Number.parseInt(inventory.lowStockThreshold) : undefined,
          },
        }),

        // Include restrictions
        restrictions: {
          venueTypes: restrictions.venueTypes,
          eventTypes: restrictions.eventTypes,
          minCapacity: restrictions.minCapacity ? Number.parseInt(restrictions.minCapacity) : undefined,
          maxCapacity: restrictions.maxCapacity ? Number.parseInt(restrictions.maxCapacity) : undefined,
          availableDays: restrictions.availableDays,
        },

        // Include seasonal availability
        seasonalAvailability: {
          isAvailable: seasonalAvailability.isAvailable,
          startDate: seasonalAvailability.startDate || undefined,
          endDate: seasonalAvailability.endDate || undefined,
          description: seasonalAvailability.description,
        },

        // Include options and images if they have values
        options: options
          .filter((option) => option.name.trim())
          .map((option) => ({
            name: option.name,
            description: option.description,
            additionalPrice: Number(option.additionalPrice),
          })),

        images: images.filter((image) => image.url.trim()),
      }

      // Call API to update service
      const result = await updateService(service._id, serviceData)

      if (result) {
        toast.success("Event service updated successfully!")
        router.push(`/dashboard/events/services/${service._id}`)
      } else {
        throw new Error("Failed to update service")
      }
    } catch (error) {
      console.error("Failed to update service:", error)
      toast.error("Failed to update service")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 dark:from-slate-900 dark:via-purple-900 dark:to-pink-900">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 dark:text-purple-400" />
          <p className="text-lg font-medium text-slate-700 dark:text-slate-300">Loading service...</p>
        </div>
      </div>
    )
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 dark:from-slate-900 dark:via-purple-900 dark:to-pink-900 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="flex flex-col items-center justify-center h-64">
              <Package className="h-12 w-12 text-slate-400 dark:text-slate-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-slate-700 dark:text-slate-300">Service Not Found</h3>
              <p className="text-slate-500 dark:text-slate-400 text-center mb-4">
                {error || "The requested service could not be found."}
              </p>
              <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 dark:from-slate-900 dark:via-purple-900 dark:to-pink-900 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 dark:border-slate-700/20">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.back()}
              className="border-purple-200 hover:bg-purple-50 dark:border-purple-700 dark:hover:bg-purple-900"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 dark:from-purple-400 dark:via-pink-400 dark:to-red-400 bg-clip-text text-transparent">
                Edit Event Service
              </h1>
              <p className="text-slate-600 dark:text-slate-300 mt-1">Update service details and settings</p>
            </div>
          </div>
          <Package className="h-8 w-8 text-purple-600 dark:text-purple-400" />
        </div>

        {/* Service Info */}
        <Card className="border-2 border-dashed border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-50/80 to-pink-50/80 dark:from-purple-900/20 dark:to-pink-900/20 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <CardTitle className="text-lg text-purple-900 dark:text-purple-100">Editing Service</CardTitle>
              </div>
              <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">{service.name}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {service.category} • {service.status} • Created {new Date(service.created_at).toLocaleDateString()}
                </p>
              </div>
              <Badge variant="outline" className="text-xs">
                ID: {service._id}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="details">Details & Options</TabsTrigger>
              <TabsTrigger value="availability">Availability</TabsTrigger>
              <TabsTrigger value="media">Media & Provider</TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic">
              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-800 dark:text-slate-200">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-slate-700 dark:text-slate-300">
                        Service Name *
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Enter service name"
                        required
                        className="bg-white/80 dark:bg-slate-700/80"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-slate-700 dark:text-slate-300">
                        Category *
                      </Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => handleInputChange("category", value)}
                        required
                      >
                        <SelectTrigger className="bg-white/80 dark:bg-slate-700/80">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {serviceCategories.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subcategory" className="text-slate-700 dark:text-slate-300">
                      Subcategory
                    </Label>
                    <Input
                      id="subcategory"
                      value={formData.subcategory}
                      onChange={(e) => handleInputChange("subcategory", e.target.value)}
                      placeholder="Enter subcategory (optional)"
                      className="bg-white/80 dark:bg-slate-700/80"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-slate-700 dark:text-slate-300">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Enter service description"
                      rows={3}
                      className="bg-white/80 dark:bg-slate-700/80"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price" className="text-slate-700 dark:text-slate-300">
                        Price *
                      </Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          id="price"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => handleInputChange("price", e.target.value)}
                          placeholder="0.00"
                          required
                          className="pl-10 bg-white/80 dark:bg-slate-700/80"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priceType" className="text-slate-700 dark:text-slate-300">
                        Price Type
                      </Label>
                      <Select
                        value={formData.priceType}
                        onValueChange={(value) => handleInputChange("priceType", value)}
                      >
                        <SelectTrigger className="bg-white/80 dark:bg-slate-700/80">
                          <SelectValue placeholder="Select price type" />
                        </SelectTrigger>
                        <SelectContent>
                          {priceTypes.map((type) => (
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
                      <Label htmlFor="customPriceDetails" className="text-slate-700 dark:text-slate-300">
                        Custom Price Details
                      </Label>
                      <Textarea
                        id="customPriceDetails"
                        value={formData.customPriceDetails}
                        onChange={(e) => handleInputChange("customPriceDetails", e.target.value)}
                        placeholder="Explain custom pricing structure"
                        rows={2}
                        className="bg-white/80 dark:bg-slate-700/80"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4">
                    <div className="space-y-1">
                      <Label className="text-slate-700 dark:text-slate-300">Service Status</Label>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Set the current availability status</p>
                    </div>
                    <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                      <SelectTrigger className="w-[180px] bg-white/80 dark:bg-slate-700/80">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="seasonal">Seasonal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Details & Options Tab */}
            <TabsContent value="details">
              <div className="space-y-6">
                {/* Quantity & Timing */}
                <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-xl text-slate-800 dark:text-slate-200">Quantity & Timing</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="minimumQuantity" className="text-slate-700 dark:text-slate-300">
                          Minimum Quantity
                        </Label>
                        <Input
                          id="minimumQuantity"
                          type="number"
                          min="1"
                          value={formData.minimumQuantity}
                          onChange={(e) => handleInputChange("minimumQuantity", e.target.value)}
                          className="bg-white/80 dark:bg-slate-700/80"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="maximumQuantity" className="text-slate-700 dark:text-slate-300">
                          Maximum Quantity
                        </Label>
                        <Input
                          id="maximumQuantity"
                          type="number"
                          min="1"
                          value={formData.maximumQuantity}
                          onChange={(e) => handleInputChange("maximumQuantity", e.target.value)}
                          placeholder="No limit"
                          className="bg-white/80 dark:bg-slate-700/80"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="leadTime" className="text-slate-700 dark:text-slate-300">
                          Lead Time (hours)
                        </Label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <Input
                            id="leadTime"
                            type="number"
                            min="0"
                            value={formData.leadTime}
                            onChange={(e) => handleInputChange("leadTime", e.target.value)}
                            className="pl-10 bg-white/80 dark:bg-slate-700/80"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="setupTime" className="text-slate-700 dark:text-slate-300">
                          Setup Time (minutes)
                        </Label>
                        <Input
                          id="setupTime"
                          type="number"
                          min="0"
                          value={formData.setupTime}
                          onChange={(e) => handleInputChange("setupTime", e.target.value)}
                          className="bg-white/80 dark:bg-slate-700/80"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cleanupTime" className="text-slate-700 dark:text-slate-300">
                          Cleanup Time (minutes)
                        </Label>
                        <Input
                          id="cleanupTime"
                          type="number"
                          min="0"
                          value={formData.cleanupTime}
                          onChange={(e) => handleInputChange("cleanupTime", e.target.value)}
                          className="bg-white/80 dark:bg-slate-700/80"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration" className="text-slate-700 dark:text-slate-300">
                        Service Duration (minutes)
                      </Label>
                      <Input
                        id="duration"
                        type="number"
                        min="1"
                        value={formData.duration}
                        onChange={(e) => handleInputChange("duration", e.target.value)}
                        placeholder="Leave empty if not applicable"
                        className="bg-white/80 dark:bg-slate-700/80"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Service Options */}
                <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl text-slate-800 dark:text-slate-200">Service Options</CardTitle>
                      <Button type="button" variant="outline" size="sm" onClick={addOption}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Option
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {options.length === 0 ? (
                      <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                        No service options added yet. Click "Add Option" to create one.
                      </div>
                    ) : (
                      options.map((option, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-4 p-4 border rounded-lg bg-slate-50 dark:bg-slate-700/50"
                        >
                          <div className="flex-1 space-y-2">
                            <Input
                              value={option.name}
                              onChange={(e) => updateOption(index, "name", e.target.value)}
                              placeholder="Option name"
                              className="bg-white dark:bg-slate-700"
                            />
                            <Textarea
                              value={option.description}
                              onChange={(e) => updateOption(index, "description", e.target.value)}
                              placeholder="Option description"
                              rows={2}
                              className="bg-white dark:bg-slate-700"
                            />
                          </div>
                          <div className="w-32">
                            <Label className="text-xs text-slate-600 dark:text-slate-400">Additional Price</Label>
                            <div className="relative">
                              <DollarSign className="absolute left-2 top-2.5 h-3 w-3 text-slate-400" />
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={option.additionalPrice}
                                onChange={(e) =>
                                  updateOption(index, "additionalPrice", Number.parseFloat(e.target.value) || 0)
                                }
                                className="pl-6 bg-white dark:bg-slate-700"
                              />
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeOption(index)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                {/* Inventory Management */}
                <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-xl text-slate-800 dark:text-slate-200">Inventory Management</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-slate-700 dark:text-slate-300">Limited Inventory</Label>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Track inventory for this service</p>
                      </div>
                      <Switch
                        checked={inventory.isLimited}
                        onCheckedChange={(checked) => handleInventoryChange("isLimited", checked)}
                      />
                    </div>

                    {inventory.isLimited && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                        <div className="space-y-2">
                          <Label htmlFor="totalQuantity" className="text-slate-700 dark:text-slate-300">
                            Total Quantity
                          </Label>
                          <Input
                            id="totalQuantity"
                            type="number"
                            min="0"
                            value={inventory.totalQuantity}
                            onChange={(e) => handleInventoryChange("totalQuantity", e.target.value)}
                            className="bg-white/80 dark:bg-slate-700/80"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="availableQuantity" className="text-slate-700 dark:text-slate-300">
                            Available Quantity
                          </Label>
                          <Input
                            id="availableQuantity"
                            type="number"
                            min="0"
                            value={inventory.availableQuantity}
                            onChange={(e) => handleInventoryChange("availableQuantity", e.target.value)}
                            className="bg-white/80 dark:bg-slate-700/80"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lowStockThreshold" className="text-slate-700 dark:text-slate-300">
                            Low Stock Alert
                          </Label>
                          <Input
                            id="lowStockThreshold"
                            type="number"
                            min="0"
                            value={inventory.lowStockThreshold}
                            onChange={(e) => handleInventoryChange("lowStockThreshold", e.target.value)}
                            className="bg-white/80 dark:bg-slate-700/80"
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Availability Tab */}
            <TabsContent value="availability">
              <div className="space-y-6">
                {/* Available Days */}
                <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-xl text-slate-800 dark:text-slate-200">Available Days</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(restrictions.availableDays).map(([day, isAvailable]) => (
                        <div key={day} className="flex items-center space-x-2">
                          <Switch checked={isAvailable} onCheckedChange={(checked) => handleDayChange(day, checked)} />
                          <Label className="capitalize text-slate-700 dark:text-slate-300">{day}</Label>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Seasonal Availability */}
                <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-xl text-slate-800 dark:text-slate-200">Seasonal Availability</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-slate-700 dark:text-slate-300">Available Year Round</Label>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Service is available throughout the year
                        </p>
                      </div>
                      <Switch
                        checked={seasonalAvailability.isAvailable}
                        onCheckedChange={(checked) => handleSeasonalChange("isAvailable", checked)}
                      />
                    </div>

                    {!seasonalAvailability.isAvailable && (
                      <div className="space-y-4 pt-4 border-t">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="startDate" className="text-slate-700 dark:text-slate-300">
                              Available From
                            </Label>
                            <Input
                              id="startDate"
                              type="date"
                              value={seasonalAvailability.startDate}
                              onChange={(e) => handleSeasonalChange("startDate", e.target.value)}
                              className="bg-white/80 dark:bg-slate-700/80"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="endDate" className="text-slate-700 dark:text-slate-300">
                              Available Until
                            </Label>
                            <Input
                              id="endDate"
                              type="date"
                              value={seasonalAvailability.endDate}
                              onChange={(e) => handleSeasonalChange("endDate", e.target.value)}
                              className="bg-white/80 dark:bg-slate-700/80"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="seasonalDescription" className="text-slate-700 dark:text-slate-300">
                            Seasonal Description
                          </Label>
                          <Textarea
                            id="seasonalDescription"
                            value={seasonalAvailability.description}
                            onChange={(e) => handleSeasonalChange("description", e.target.value)}
                            placeholder="Explain seasonal availability"
                            rows={2}
                            className="bg-white/80 dark:bg-slate-700/80"
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Capacity Restrictions */}
                <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-xl text-slate-800 dark:text-slate-200">
                      Event Capacity Requirements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="minCapacity" className="text-slate-700 dark:text-slate-300">
                          Minimum Event Capacity
                        </Label>
                        <Input
                          id="minCapacity"
                          type="number"
                          min="1"
                          value={restrictions.minCapacity}
                          onChange={(e) => handleRestrictionsChange("minCapacity", e.target.value)}
                          placeholder="No minimum"
                          className="bg-white/80 dark:bg-slate-700/80"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="maxCapacity" className="text-slate-700 dark:text-slate-300">
                          Maximum Event Capacity
                        </Label>
                        <Input
                          id="maxCapacity"
                          type="number"
                          min="1"
                          value={restrictions.maxCapacity}
                          onChange={(e) => handleRestrictionsChange("maxCapacity", e.target.value)}
                          placeholder="No maximum"
                          className="bg-white/80 dark:bg-slate-700/80"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Media & Provider Tab */}
            <TabsContent value="media">
              <div className="space-y-6">
                {/* External Service Provider */}
                <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-xl text-slate-800 dark:text-slate-200">Service Provider</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-slate-700 dark:text-slate-300">External Service Provider</Label>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          This service is provided by an external vendor
                        </p>
                      </div>
                      <Switch
                        checked={formData.isExternalService}
                        onCheckedChange={(checked) => handleInputChange("isExternalService", checked)}
                      />
                    </div>

                    {formData.isExternalService && (
                      <div className="space-y-4 pt-4 border-t">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="providerName" className="text-slate-700 dark:text-slate-300">
                              Provider Name
                            </Label>
                            <Input
                              id="providerName"
                              value={externalProvider.name}
                              onChange={(e) => handleExternalProviderChange("name", e.target.value)}
                              placeholder="Provider company name"
                              className="bg-white/80 dark:bg-slate-700/80"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="contactPerson" className="text-slate-700 dark:text-slate-300">
                              Contact Person
                            </Label>
                            <Input
                              id="contactPerson"
                              value={externalProvider.contactPerson}
                              onChange={(e) => handleExternalProviderChange("contactPerson", e.target.value)}
                              placeholder="Contact person name"
                              className="bg-white/80 dark:bg-slate-700/80"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="providerPhone" className="text-slate-700 dark:text-slate-300">
                              Phone Number
                            </Label>
                            <Input
                              id="providerPhone"
                              value={externalProvider.phone}
                              onChange={(e) => handleExternalProviderChange("phone", e.target.value)}
                              placeholder="Provider phone number"
                              className="bg-white/80 dark:bg-slate-700/80"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="providerEmail" className="text-slate-700 dark:text-slate-300">
                              Email Address
                            </Label>
                            <Input
                              id="providerEmail"
                              type="email"
                              value={externalProvider.email}
                              onChange={(e) => handleExternalProviderChange("email", e.target.value)}
                              placeholder="Provider email address"
                              className="bg-white/80 dark:bg-slate-700/80"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="commissionRate" className="text-slate-700 dark:text-slate-300">
                            Commission Rate (%)
                          </Label>
                          <Input
                            id="commissionRate"
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={externalProvider.commissionRate}
                            onChange={(e) => handleExternalProviderChange("commissionRate", e.target.value)}
                            placeholder="0.0"
                            className="bg-white/80 dark:bg-slate-700/80"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="contractDetails" className="text-slate-700 dark:text-slate-300">
                            Contract Details
                          </Label>
                          <Textarea
                            id="contractDetails"
                            value={externalProvider.contractDetails}
                            onChange={(e) => handleExternalProviderChange("contractDetails", e.target.value)}
                            placeholder="Contract terms and details"
                            rows={3}
                            className="bg-white/80 dark:bg-slate-700/80"
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Service Images */}
                <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl text-slate-800 dark:text-slate-200">Service Images</CardTitle>
                      <Button type="button" variant="outline" size="sm" onClick={addImage}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Image
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {images.length === 0 ? (
                      <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                        No images added yet. Click "Add Image" to upload service photos.
                      </div>
                    ) : (
                      images.map((image, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-4 p-4 border rounded-lg bg-slate-50 dark:bg-slate-700/50"
                        >
                          <div className="flex-1 space-y-2">
                            <Input
                              value={image.url}
                              onChange={(e) => updateImage(index, "url", e.target.value)}
                              placeholder="Image URL"
                              className="bg-white dark:bg-slate-700"
                            />
                            <Input
                              value={image.caption}
                              onChange={(e) => updateImage(index, "caption", e.target.value)}
                              placeholder="Image caption"
                              className="bg-white dark:bg-slate-700"
                            />
                          </div>
                          <div className="flex flex-col items-center gap-2">
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={image.isDefault}
                                onCheckedChange={(checked) => updateImage(index, "isDefault", checked)}
                              />
                              <Label className="text-xs">Default</Label>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => removeImage(index)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
              className="border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 dark:from-purple-600 dark:to-pink-700 dark:hover:from-purple-700 dark:hover:to-pink-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating Service...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Update Service
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
