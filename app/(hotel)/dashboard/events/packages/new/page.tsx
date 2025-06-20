"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { ArrowLeft, Save, Plus, Trash2, Star } from "lucide-react"
import { useEventPackages, type CreatePackageData } from "@/hooks/use-event-packages"
import { useEventTypes } from "@/hooks/use-event-types"
import { useEventServices } from "@/hooks/use-event-services"
import { useVenues } from "@/hooks/use-venues"

export default function NewPackagePage() {
  const router = useRouter()
  const { createPackage, isLoading } = useEventPackages()
  const { eventTypes } = useEventTypes()
  const { services } = useEventServices()
  const { venues } = useVenues()

  const [activeTab, setActiveTab] = useState("basic")
  const [packageData, setPackageData] = useState<CreatePackageData>({
    name: "",
    description: "",
    hotel: "", // This should be set from current hotel context
    eventTypes: [],
    venueTypes: [],
    duration: 4,
    minCapacity: 10,
    maxCapacity: 100,
    basePrice: 0,
    pricePerPerson: 0,
    includedServices: [],
    includedAmenities: [],
    additionalOptions: [],
    images: [],
    terms: "",
    cancellationPolicy: "moderate",
    isActive: true,
    isPromoted: false,
    promotionDetails: {
      startDate: "",
      endDate: "",
      discountPercentage: 0,
      discountAmount: 0,
      promotionCode: "",
      description: "",
    },
  })

  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([])
  const [selectedVenueTypes, setSelectedVenueTypes] = useState<string[]>([])

  const handleInputChange = (field: keyof CreatePackageData, value: any) => {
    setPackageData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handlePromotionChange = (field: string, value: any) => {
    setPackageData((prev) => ({
      ...prev,
      promotionDetails: {
        ...prev.promotionDetails!,
        [field]: value,
      },
    }))
  }

  const addAmenity = () => {
    setPackageData((prev) => ({
      ...prev,
      includedAmenities: [...prev.includedAmenities!, { name: "", description: "" }],
    }))
  }

  const updateAmenity = (index: number, field: string, value: string) => {
    setPackageData((prev) => ({
      ...prev,
      includedAmenities: prev.includedAmenities!.map((amenity, i) =>
        i === index ? { ...amenity, [field]: value } : amenity,
      ),
    }))
  }

  const removeAmenity = (index: number) => {
    setPackageData((prev) => ({
      ...prev,
      includedAmenities: prev.includedAmenities!.filter((_, i) => i !== index),
    }))
  }

  const addOption = () => {
    setPackageData((prev) => ({
      ...prev,
      additionalOptions: [...prev.additionalOptions!, { name: "", description: "", price: 0 }],
    }))
  }

  const updateOption = (index: number, field: string, value: any) => {
    setPackageData((prev) => ({
      ...prev,
      additionalOptions: prev.additionalOptions!.map((option, i) =>
        i === index ? { ...option, [field]: value } : option,
      ),
    }))
  }

  const removeOption = (index: number) => {
    setPackageData((prev) => ({
      ...prev,
      additionalOptions: prev.additionalOptions!.filter((_, i) => i !== index),
    }))
  }

  const handleServiceToggle = (serviceId: string, checked: boolean) => {
    if (checked) {
      setSelectedServices((prev) => [...prev, serviceId])
    } else {
      setSelectedServices((prev) => prev.filter((id) => id !== serviceId))
    }
  }

  const handleEventTypeToggle = (typeId: string, checked: boolean) => {
    if (checked) {
      setSelectedEventTypes((prev) => [...prev, typeId])
    } else {
      setSelectedEventTypes((prev) => prev.filter((id) => id !== typeId))
    }
  }

  const handleVenueTypeToggle = (venueId: string, checked: boolean) => {
    if (checked) {
      setSelectedVenueTypes((prev) => [...prev, venueId])
    } else {
      setSelectedVenueTypes((prev) => prev.filter((id) => id !== venueId))
    }
  }

  const handleSave = async () => {
    try {
      // Prepare services data
      const servicesData = selectedServices.map((serviceId) => {
        const service = services.find((s) => s._id === serviceId)
        return {
          service: serviceId,
          quantity: 1,
          details: service?.description || "",
        }
      })

      const finalData: CreatePackageData = {
        ...packageData,
        eventTypes: selectedEventTypes,
        venueTypes: selectedVenueTypes,
        includedServices: servicesData,
        hotel: "current-hotel-id", // This should come from context
      }

      const newPackage = await createPackage(finalData)
      toast.success("Package created successfully")
      router.push(`/dashboard/events/packages/${newPackage._id}`)
    } catch (error) {
      console.error("Failed to create package:", error)
      toast.error("Failed to create package")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 dark:border-slate-700/20">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
                Create Event Package
              </h1>
              <p className="text-slate-600 dark:text-slate-300 mt-1">
                Set up a new event package with services and pricing
              </p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={isLoading} size="lg">
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? "Creating..." : "Create Package"}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="types">Types</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="amenities">Amenities</TabsTrigger>
            <TabsTrigger value="options">Options</TabsTrigger>
            <TabsTrigger value="promotion">Promotion</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Essential package details and pricing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Package Name</Label>
                    <Input
                      id="name"
                      value={packageData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Enter package name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (hours)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="1"
                      value={packageData.duration}
                      onChange={(e) => handleInputChange("duration", Number.parseInt(e.target.value) || 1)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={packageData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Describe the package"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="minCapacity">Minimum Capacity</Label>
                    <Input
                      id="minCapacity"
                      type="number"
                      min="1"
                      value={packageData.minCapacity}
                      onChange={(e) => handleInputChange("minCapacity", Number.parseInt(e.target.value) || 1)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxCapacity">Maximum Capacity</Label>
                    <Input
                      id="maxCapacity"
                      type="number"
                      min="1"
                      value={packageData.maxCapacity}
                      onChange={(e) => handleInputChange("maxCapacity", Number.parseInt(e.target.value) || 1)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="basePrice">Base Price ($)</Label>
                    <Input
                      id="basePrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={packageData.basePrice}
                      onChange={(e) => handleInputChange("basePrice", Number.parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pricePerPerson">Price Per Person ($)</Label>
                    <Input
                      id="pricePerPerson"
                      type="number"
                      min="0"
                      step="0.01"
                      value={packageData.pricePerPerson}
                      onChange={(e) => handleInputChange("pricePerPerson", Number.parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cancellationPolicy">Cancellation Policy</Label>
                  <Select
                    value={packageData.cancellationPolicy}
                    onValueChange={(value) => handleInputChange("cancellationPolicy", value)}
                  >
                    <SelectTrigger id="cancellationPolicy">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flexible">Flexible - Free cancellation</SelectItem>
                      <SelectItem value="moderate">Moderate - 48h notice required</SelectItem>
                      <SelectItem value="strict">Strict - No refunds</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="terms">Terms & Conditions</Label>
                  <Textarea
                    id="terms"
                    value={packageData.terms}
                    onChange={(e) => handleInputChange("terms", e.target.value)}
                    placeholder="Enter terms and conditions"
                    rows={4}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isActive"
                    checked={packageData.isActive}
                    onCheckedChange={(checked) => handleInputChange("isActive", !!checked)}
                  />
                  <Label htmlFor="isActive">Package is active</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="types" className="space-y-4">
            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle>Event & Venue Types</CardTitle>
                <CardDescription>Select applicable event and venue types</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-base font-semibold">Event Types</Label>
                  <div className="grid grid-cols-1 gap-3 mt-3 sm:grid-cols-2">
                    {eventTypes.map((type) => (
                      <div key={type._id} className="flex items-center space-x-3 border rounded-lg p-3">
                        <Checkbox
                          id={`event-${type._id}`}
                          checked={selectedEventTypes.includes(type._id)}
                          onCheckedChange={(checked) => handleEventTypeToggle(type._id, !!checked)}
                        />
                        <div className="flex items-center space-x-2 flex-1">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: type.color }} />
                          <Label htmlFor={`event-${type._id}`} className="cursor-pointer">
                            {type.name}
                          </Label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-base font-semibold">Venue Types</Label>
                  <div className="grid grid-cols-1 gap-3 mt-3 sm:grid-cols-2">
                    {venues.map((venue) => (
                      <div key={venue._id} className="flex items-center space-x-3 border rounded-lg p-3">
                        <Checkbox
                          id={`venue-${venue._id}`}
                          checked={selectedVenueTypes.includes(venue._id)}
                          onCheckedChange={(checked) => handleVenueTypeToggle(venue._id, !!checked)}
                        />
                        <div className="flex-1">
                          <Label htmlFor={`venue-${venue._id}`} className="cursor-pointer font-medium">
                            {venue.name}
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Capacity: {venue.capacity} | {venue.location}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="space-y-4">
            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle>Included Services</CardTitle>
                <CardDescription>Select services included in this package</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {services.map((service) => (
                    <div key={service._id} className="flex items-start space-x-3 border rounded-lg p-3">
                      <Checkbox
                        id={`service-${service._id}`}
                        checked={selectedServices.includes(service._id)}
                        onCheckedChange={(checked) => handleServiceToggle(service._id, !!checked)}
                      />
                      <div className="space-y-1 flex-1">
                        <Label htmlFor={`service-${service._id}`} className="font-medium cursor-pointer">
                          {service.name}
                        </Label>
                        <p className="text-sm text-muted-foreground">{service.description}</p>
                        <div className="flex justify-between items-center">
                          <Badge variant="secondary">{service.category}</Badge>
                          <span className="text-sm font-medium">${service.price}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="amenities" className="space-y-4">
            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle>Package Amenities</CardTitle>
                <CardDescription>Add amenities included in this package</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {packageData.includedAmenities?.map((amenity, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 border rounded-lg">
                    <div className="flex-1 space-y-2">
                      <Input
                        placeholder="Amenity name"
                        value={amenity.name}
                        onChange={(e) => updateAmenity(index, "name", e.target.value)}
                      />
                      <Input
                        placeholder="Description (optional)"
                        value={amenity.description || ""}
                        onChange={(e) => updateAmenity(index, "description", e.target.value)}
                      />
                    </div>
                    <Button variant="outline" size="icon" onClick={() => removeAmenity(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <Button onClick={addAmenity} variant="outline" className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Amenity
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="options" className="space-y-4">
            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle>Additional Options</CardTitle>
                <CardDescription>Add optional extras that can be purchased</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {packageData.additionalOptions?.map((option, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 border rounded-lg">
                    <div className="flex-1 space-y-2">
                      <Input
                        placeholder="Option name"
                        value={option.name}
                        onChange={(e) => updateOption(index, "name", e.target.value)}
                      />
                      <Input
                        placeholder="Description (optional)"
                        value={option.description || ""}
                        onChange={(e) => updateOption(index, "description", e.target.value)}
                      />
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Price"
                        value={option.price}
                        onChange={(e) => updateOption(index, "price", Number.parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <Button variant="outline" size="icon" onClick={() => removeOption(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <Button onClick={addOption} variant="outline" className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Option
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="promotion" className="space-y-4">
            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle>Promotion Settings</CardTitle>
                <CardDescription>Set up promotional pricing and details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isPromoted"
                    checked={packageData.isPromoted}
                    onCheckedChange={(checked) => handleInputChange("isPromoted", !!checked)}
                  />
                  <Label htmlFor="isPromoted" className="flex items-center">
                    <Star className="mr-2 h-4 w-4" />
                    This is a promoted package
                  </Label>
                </div>

                {packageData.isPromoted && (
                  <>
                    <Separator />

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="promotionCode">Promotion Code</Label>
                        <Input
                          id="promotionCode"
                          value={packageData.promotionDetails?.promotionCode || ""}
                          onChange={(e) => handlePromotionChange("promotionCode", e.target.value)}
                          placeholder="Enter promotion code"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="discountPercentage">Discount Percentage (%)</Label>
                        <Input
                          id="discountPercentage"
                          type="number"
                          min="0"
                          max="100"
                          value={packageData.promotionDetails?.discountPercentage || ""}
                          onChange={(e) =>
                            handlePromotionChange("discountPercentage", Number.parseInt(e.target.value) || 0)
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="startDate">Start Date</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={packageData.promotionDetails?.startDate || ""}
                          onChange={(e) => handlePromotionChange("startDate", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="endDate">End Date</Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={packageData.promotionDetails?.endDate || ""}
                          onChange={(e) => handlePromotionChange("endDate", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="promotionDescription">Promotion Description</Label>
                      <Textarea
                        id="promotionDescription"
                        value={packageData.promotionDetails?.description || ""}
                        onChange={(e) => handlePromotionChange("description", e.target.value)}
                        placeholder="Describe the promotion"
                        rows={3}
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
