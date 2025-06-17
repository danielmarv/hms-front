"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  ArrowLeft,
  Save,
  Tag,
  DollarSign,
  Clock,
  Users,
  Plus,
  X,
  BuildingIcon,
  StarIcon,
  CheckCircleIcon,
} from "lucide-react"
import { useEventTypes } from "@/hooks/use-event-types"
import { useHotels, type Hotel } from "@/hooks/use-hotels"
const eventCategories = [
  { value: "business", label: "Business" },
  { value: "social", label: "Social" },
  { value: "celebration", label: "celebration" },
  { value: "educational", label: "Educational" },
  { value: "other", label: "Other" },
]

const colorOptions = [
  "#3b82f6",
  "#ef4444",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
  "#f97316",
  "#6366f1",
]

export default function NewEventTypePage() {
  const router = useRouter()
  const { createEventType, loading } = useEventTypes()

  const [eventTypeData, setEventTypeData] = useState({
    name: "",
    description: "",
    category: "",
    color: "#3b82f6",
    default_duration: 120,
    default_capacity: 50,
    base_price: 0,
    price_per_person: 0,
    features: [] as string[],
    status: "active",
  })

  const { getAllHotels } = useHotels()
  const [selectedHotelId, setSelectedHotelId] = useState<string>("")
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [hotelsLoading, setHotelsLoading] = useState(true)
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null)

  // Fetch hotels on component mount
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setHotelsLoading(true)
        // Try to restore from localStorage
        const savedHotelId = localStorage.getItem("selectedHotelId")

        const response = await getAllHotels({ active: true })
        let hotelsData: Hotel[] = []

        if (response?.data?.data) {
          hotelsData = response.data.data
        } else if (response?.data && Array.isArray(response.data)) {
          hotelsData = response.data
        } else if (response && Array.isArray(response)) {
          hotelsData = response
        }

        setHotels(hotelsData)

        if (hotelsData.length > 0) {
          let hotelToSelect = hotelsData[0]

          // Try to restore saved hotel
          if (savedHotelId) {
            const savedHotel = hotelsData.find((h) => h._id === savedHotelId)
            if (savedHotel) {
              hotelToSelect = savedHotel
            }
          }

          setSelectedHotelId(hotelToSelect._id)
          setSelectedHotel(hotelToSelect)
          localStorage.setItem("selectedHotelId", hotelToSelect._id)
        }
      } catch (error) {
        console.error("Failed to fetch hotels:", error)
        toast.error("Failed to load hotels")
      } finally {
        setHotelsLoading(false)
      }
    }

    fetchHotels()
  }, [getAllHotels])

  // Handle hotel selection
  const handleHotelChange = (hotelId: string) => {
    setSelectedHotelId(hotelId)
    const hotel = hotels.find((h) => h._id === hotelId)
    setSelectedHotel(hotel || null)
    localStorage.setItem("selectedHotelId", hotelId)
  }

  const [newFeature, setNewFeature] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: string, value: any) => {
    setEventTypeData((prev) => ({ ...prev, [field]: value }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const addFeature = () => {
    if (newFeature.trim() && !eventTypeData.features.includes(newFeature.trim())) {
      setEventTypeData((prev) => ({
        ...prev,
        features: [...prev.features, newFeature.trim()],
      }))
      setNewFeature("")
    }
  }

  const removeFeature = (feature: string) => {
    setEventTypeData((prev) => ({
      ...prev,
      features: prev.features.filter((f) => f !== feature),
    }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!eventTypeData.name.trim()) newErrors.name = "Event type name is required"
    if (!eventTypeData.category) newErrors.category = "Category is required"
    if (eventTypeData.default_duration <= 0) newErrors.default_duration = "Duration must be greater than 0"
    if (eventTypeData.default_capacity <= 0) newErrors.default_capacity = "Capacity must be greater than 0"
    if (eventTypeData.base_price < 0) newErrors.base_price = "Base price cannot be negative"
    if (eventTypeData.price_per_person < 0) newErrors.price_per_person = "Price per person cannot be negative"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error("Please fix the errors before submitting")
      return
    }

    if (!selectedHotelId) {
      toast.error("Please select a hotel")
      return
    }

    try {
      const eventTypeWithHotel = {
        ...eventTypeData,
        hotel_id: selectedHotelId,
      }
      await createEventType(eventTypeWithHotel)
      toast.success("Event type created successfully!")
      router.push("/dashboard/events/event-types")
    } catch (error) {
      toast.error("Failed to create event type")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-indigo-900 dark:to-purple-900 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 dark:border-slate-700/20">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              Create Event Type
            </h1>
            <p className="text-slate-600 dark:text-slate-300 mt-2">Define a new type of event for your hotel</p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="hover:bg-indigo-50 dark:hover:bg-indigo-900"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>

        {/* Hotel Selection Section */}
        <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-600 dark:from-blue-600 dark:to-cyan-700 text-white rounded-t-lg">
            <CardTitle className="flex items-center text-xl">
              <BuildingIcon className="mr-2 h-5 w-5" />
              Select Hotel
            </CardTitle>
            <CardDescription className="text-blue-100 dark:text-blue-200">
              Choose the hotel for this event type
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hotel">Hotel *</Label>
                <Select value={selectedHotelId} onValueChange={handleHotelChange} disabled={hotelsLoading}>
                  <SelectTrigger className={!selectedHotelId ? "border-red-500" : ""}>
                    <SelectValue placeholder={hotelsLoading ? "Loading hotels..." : "Select a hotel"} />
                  </SelectTrigger>
                  <SelectContent>
                    {hotels.map((hotel) => (
                      <SelectItem key={hotel._id} value={hotel._id}>
                        <div className="flex items-center space-x-2">
                          <BuildingIcon className="h-4 w-4" />
                          <span>{hotel.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {hotel.code}
                          </Badge>
                          {hotel.isHeadquarters && (
                            <Badge className="text-xs bg-primary/10 text-primary">
                              <StarIcon className="h-3 w-3 mr-1" />
                              HQ
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!selectedHotelId && <p className="text-sm text-red-500">Please select a hotel</p>}
              </div>

              {selectedHotel && (
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-sm text-blue-900 dark:text-blue-100">Selected Hotel</h3>
                    <CheckCircleIcon className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-blue-900 dark:text-blue-100">{selectedHotel.name}</p>
                    <div className="flex items-center space-x-2 text-sm text-blue-700 dark:text-blue-300">
                      <Badge
                        variant="outline"
                        className="border-blue-300 text-blue-700 dark:border-blue-600 dark:text-blue-300"
                      >
                        {selectedHotel.code}
                      </Badge>
                      <span>•</span>
                      <span className="capitalize">{selectedHotel.type}</span>
                      {selectedHotel.starRating && (
                        <>
                          <span>•</span>
                          <div className="flex items-center">
                            {Array.from({ length: selectedHotel.starRating }).map((_, i) => (
                              <StarIcon key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                    {selectedHotel.description && (
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 line-clamp-2">
                        {selectedHotel.description}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 text-white rounded-t-lg">
              <CardTitle className="flex items-center text-xl">
                <Tag className="mr-2 h-5 w-5" />
                Basic Information
              </CardTitle>
              <CardDescription className="text-indigo-100 dark:text-indigo-200">
                Enter the basic details of the event type
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Event Type Name *</Label>
                  <Input
                    id="name"
                    value={eventTypeData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter event type name"
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={eventTypeData.category}
                    onValueChange={(value) => handleInputChange("category", value)}
                  >
                    <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={eventTypeData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Describe this event type..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Color Theme</Label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        eventTypeData.color === color
                          ? "border-slate-400 scale-110 shadow-lg"
                          : "border-slate-200 hover:scale-105"
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => handleInputChange("color", color)}
                    />
                  ))}
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <Input
                    type="color"
                    value={eventTypeData.color}
                    onChange={(e) => handleInputChange("color", e.target.value)}
                    className="w-16 h-8 p-1 border rounded"
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-400">Custom color</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Default Settings */}
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-600 dark:from-blue-600 dark:to-cyan-700 text-white rounded-t-lg">
              <CardTitle className="flex items-center text-xl">
                <Clock className="mr-2 h-5 w-5" />
                Default Settings
              </CardTitle>
              <CardDescription className="text-blue-100 dark:text-blue-200">
                Set default values for events of this type
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="default_duration">Default Duration (minutes) *</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="default_duration"
                      type="number"
                      min="1"
                      value={eventTypeData.default_duration || ""}
                      onChange={(e) => handleInputChange("default_duration", Number.parseInt(e.target.value) || 0)}
                      placeholder="120"
                      className={`pl-10 ${errors.default_duration ? "border-red-500" : ""}`}
                    />
                  </div>
                  {errors.default_duration && <p className="text-sm text-red-500">{errors.default_duration}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="default_capacity">Default Capacity *</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="default_capacity"
                      type="number"
                      min="1"
                      value={eventTypeData.default_capacity || ""}
                      onChange={(e) => handleInputChange("default_capacity", Number.parseInt(e.target.value) || 0)}
                      placeholder="50"
                      className={`pl-10 ${errors.default_capacity ? "border-red-500" : ""}`}
                    />
                  </div>
                  {errors.default_capacity && <p className="text-sm text-red-500">{errors.default_capacity}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700 text-white rounded-t-lg">
              <CardTitle className="flex items-center text-xl">
                <DollarSign className="mr-2 h-5 w-5" />
                Pricing
              </CardTitle>
              <CardDescription className="text-green-100 dark:text-green-200">
                Set default pricing for this event type
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="base_price">Base Price</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="base_price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={eventTypeData.base_price || ""}
                      onChange={(e) => handleInputChange("base_price", Number.parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className={`pl-10 ${errors.base_price ? "border-red-500" : ""}`}
                    />
                  </div>
                  {errors.base_price && <p className="text-sm text-red-500">{errors.base_price}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price_per_person">Price per Person</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="price_per_person"
                      type="number"
                      min="0"
                      step="0.01"
                      value={eventTypeData.price_per_person || ""}
                      onChange={(e) => handleInputChange("price_per_person", Number.parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className={`pl-10 ${errors.price_per_person ? "border-red-500" : ""}`}
                    />
                  </div>
                  {errors.price_per_person && <p className="text-sm text-red-500">{errors.price_per_person}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-red-600 dark:from-orange-600 dark:to-red-700 text-white rounded-t-lg">
              <CardTitle className="text-xl">Features</CardTitle>
              <CardDescription className="text-orange-100 dark:text-orange-200">
                Add features that are typically included with this event type
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="Add a feature..."
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
                />
                <Button type="button" onClick={addFeature} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {eventTypeData.features.map((feature) => (
                  <Badge key={feature} variant="secondary" className="flex items-center gap-1">
                    {feature}
                    <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => removeFeature(feature)} />
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Status */}
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-slate-600 to-slate-700 dark:from-slate-700 dark:to-slate-800 text-white rounded-t-lg">
              <CardTitle className="text-xl">Status</CardTitle>
              <CardDescription className="text-slate-200 dark:text-slate-300">
                Set the initial status for this event type
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={eventTypeData.status} onValueChange={(value) => handleInputChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !selectedHotelId}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Create Event Type
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
