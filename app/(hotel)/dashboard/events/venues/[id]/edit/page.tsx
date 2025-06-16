"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { ArrowLeft, Save, MapPin, Users, DollarSign, Clock, Plus, X, Loader2 } from "lucide-react"
import { useVenues } from "@/hooks/use-venues"
// Replace the useAuth import with:
import { useCurrentHotel } from "@/hooks/use-current-hotel"

const venueTypes = [
  { value: "ballroom", label: "Ballroom" },
  { value: "conference_room", label: "Conference Room" },
  { value: "outdoor", label: "Outdoor Space" },
  { value: "banquet_hall", label: "Banquet Hall" },
  { value: "meeting_room", label: "Meeting Room" },
  { value: "garden", label: "Garden" },
  { value: "rooftop", label: "Rooftop" },
  { value: "lounge", label: "Lounge" },
]

const amenityOptions = [
  "Air Conditioning",
  "Audio System",
  "Video Projector",
  "Microphone",
  "Stage",
  "Dance Floor",
  "Bar",
  "Kitchen Access",
  "Parking",
  "WiFi",
  "Lighting System",
  "Sound System",
  "Catering Facilities",
  "Restrooms",
  "Wheelchair Access",
  "Security",
  "Valet Service",
]

export default function EditVenuePage() {
  const router = useRouter()
  const params = useParams()
  const venueId = params.id as string
  const { getVenue, updateVenue, loading } = useVenues()
  // Replace the useAuth hook with:
  const { hotelId } = useCurrentHotel()

  const [venueData, setVenueData] = useState({
    name: "",
    description: "",
    type: "",
    capacity: 0,
    area: 0,
    location: "",
    amenities: [] as string[],
    features: [] as string[],
    pricing: {
      base_price: 0,
      price_per_hour: 0,
      currency: "USD",
    },
    availability: {
      days_of_week: [] as number[],
      start_time: "09:00",
      end_time: "22:00",
    },
    setup_time: 60,
    teardown_time: 60,
    minimum_hours: 2,
    cancellation_policy: "",
    status: "active",
  })

  const [newFeature, setNewFeature] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)

  const daysOfWeek = [
    { value: 0, label: "Sunday" },
    { value: 1, label: "Monday" },
    { value: 2, label: "Tuesday" },
    { value: 3, label: "Wednesday" },
    { value: 4, label: "Thursday" },
    { value: 5, label: "Friday" },
    { value: 6, label: "Saturday" },
  ]

  useEffect(() => {
    const fetchVenue = async () => {
      try {
        const venue = await getVenue(venueId)
        if (venue) {
          setVenueData({
            name: venue.name || "",
            description: venue.description || "",
            type: venue.type || "",
            capacity: venue.capacity || 0,
            area: venue.area || 0,
            location: venue.location || "",
            amenities: venue.amenities || [],
            features: venue.features || [],
            pricing: {
              base_price: venue.pricing?.base_price || 0,
              price_per_hour: venue.pricing?.price_per_hour || 0,
              currency: venue.pricing?.currency || "USD",
            },
            availability: {
              days_of_week: venue.availability?.days_of_week || [],
              start_time: venue.availability?.start_time || "09:00",
              end_time: venue.availability?.end_time || "22:00",
            },
            setup_time: venue.setup_time || 60,
            teardown_time: venue.teardown_time || 60,
            minimum_hours: venue.minimum_hours || 2,
            cancellation_policy: venue.cancellation_policy || "",
            status: venue.status || "active",
          })
        }
      } catch (error) {
        toast.error("Failed to load venue details")
        router.push("/dashboard/events/venues")
      } finally {
        setIsLoading(false)
      }
    }

    if (venueId) {
      fetchVenue()
    }
  }, [venueId, getVenue, router])

  const handleInputChange = (field: string, value: any) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".")
      setVenueData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value,
        },
      }))
    } else {
      setVenueData((prev) => ({ ...prev, [field]: value }))
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    if (checked) {
      setVenueData((prev) => ({
        ...prev,
        amenities: [...prev.amenities, amenity],
      }))
    } else {
      setVenueData((prev) => ({
        ...prev,
        amenities: prev.amenities.filter((a) => a !== amenity),
      }))
    }
  }

  const handleDayChange = (day: number, checked: boolean) => {
    if (checked) {
      setVenueData((prev) => ({
        ...prev,
        availability: {
          ...prev.availability,
          days_of_week: [...prev.availability.days_of_week, day],
        },
      }))
    } else {
      setVenueData((prev) => ({
        ...prev,
        availability: {
          ...prev.availability,
          days_of_week: prev.availability.days_of_week.filter((d) => d !== day),
        },
      }))
    }
  }

  const addFeature = () => {
    if (newFeature.trim() && !venueData.features.includes(newFeature.trim())) {
      setVenueData((prev) => ({
        ...prev,
        features: [...prev.features, newFeature.trim()],
      }))
      setNewFeature("")
    }
  }

  const removeFeature = (feature: string) => {
    setVenueData((prev) => ({
      ...prev,
      features: prev.features.filter((f) => f !== feature),
    }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!venueData.name.trim()) newErrors.name = "Venue name is required"
    if (!venueData.type) newErrors.type = "Venue type is required"
    if (venueData.capacity <= 0) newErrors.capacity = "Capacity must be greater than 0"
    if (venueData.pricing.base_price < 0) newErrors.base_price = "Base price cannot be negative"
    if (venueData.pricing.price_per_hour < 0) newErrors.price_per_hour = "Hourly price cannot be negative"
    if (venueData.availability.days_of_week.length === 0) newErrors.days_of_week = "Select at least one available day"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Update the handleSubmit function:
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error("Please fix the errors before submitting")
      return
    }

    if (!hotelId) {
      toast.error("Hotel ID not found. Please contact support.")
      return
    }

    try {
      await updateVenue(venueId, venueData, hotelId)
      toast.success("Venue updated successfully!")
      router.push("/dashboard/events/venues")
    } catch (error) {
      toast.error("Failed to update venue")
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-purple-900 dark:to-indigo-900">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 dark:text-purple-400" />
          <p className="text-lg font-medium text-slate-700 dark:text-slate-300">Loading venue details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-purple-900 dark:to-indigo-900 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 dark:border-slate-700/20">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 dark:from-purple-400 dark:via-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Edit Venue
            </h1>
            <p className="text-slate-600 dark:text-slate-300 mt-2">Update venue information and settings</p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="hover:bg-purple-50 dark:hover:bg-purple-900"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-600 dark:from-purple-600 dark:to-blue-700 text-white rounded-t-lg">
              <CardTitle className="flex items-center text-xl">
                <MapPin className="mr-2 h-5 w-5" />
                Basic Information
              </CardTitle>
              <CardDescription className="text-purple-100 dark:text-purple-200">
                Update the basic details of the venue
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Venue Name *</Label>
                  <Input
                    id="name"
                    value={venueData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter venue name"
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Venue Type *</Label>
                  <Select value={venueData.type} onValueChange={(value) => handleInputChange("type", value)}>
                    <SelectTrigger className={errors.type ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select venue type" />
                    </SelectTrigger>
                    <SelectContent>
                      {venueTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.type && <p className="text-sm text-red-500">{errors.type}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={venueData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Describe the venue..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity *</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="capacity"
                      type="number"
                      min="1"
                      value={venueData.capacity || ""}
                      onChange={(e) => handleInputChange("capacity", Number.parseInt(e.target.value) || 0)}
                      placeholder="Max guests"
                      className={`pl-10 ${errors.capacity ? "border-red-500" : ""}`}
                    />
                  </div>
                  {errors.capacity && <p className="text-sm text-red-500">{errors.capacity}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="area">Area (sq ft)</Label>
                  <Input
                    id="area"
                    type="number"
                    min="0"
                    value={venueData.area || ""}
                    onChange={(e) => handleInputChange("area", Number.parseInt(e.target.value) || 0)}
                    placeholder="Square footage"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={venueData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    placeholder="Floor, Wing, etc."
                  />
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
                Update the pricing structure for this venue
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="base_price">Base Price</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="base_price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={venueData.pricing.base_price || ""}
                      onChange={(e) => handleInputChange("pricing.base_price", Number.parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className={`pl-10 ${errors.base_price ? "border-red-500" : ""}`}
                    />
                  </div>
                  {errors.base_price && <p className="text-sm text-red-500">{errors.base_price}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price_per_hour">Price per Hour</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="price_per_hour"
                      type="number"
                      min="0"
                      step="0.01"
                      value={venueData.pricing.price_per_hour || ""}
                      onChange={(e) =>
                        handleInputChange("pricing.price_per_hour", Number.parseFloat(e.target.value) || 0)
                      }
                      placeholder="0.00"
                      className={`pl-10 ${errors.price_per_hour ? "border-red-500" : ""}`}
                    />
                  </div>
                  {errors.price_per_hour && <p className="text-sm text-red-500">{errors.price_per_hour}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={venueData.pricing.currency}
                    onValueChange={(value) => handleInputChange("pricing.currency", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="JPY">JPY (¥)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="setup_time">Setup Time (minutes)</Label>
                  <Input
                    id="setup_time"
                    type="number"
                    min="0"
                    value={venueData.setup_time || ""}
                    onChange={(e) => handleInputChange("setup_time", Number.parseInt(e.target.value) || 0)}
                    placeholder="60"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="teardown_time">Teardown Time (minutes)</Label>
                  <Input
                    id="teardown_time"
                    type="number"
                    min="0"
                    value={venueData.teardown_time || ""}
                    onChange={(e) => handleInputChange("teardown_time", Number.parseInt(e.target.value) || 0)}
                    placeholder="60"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minimum_hours">Minimum Hours</Label>
                  <Input
                    id="minimum_hours"
                    type="number"
                    min="1"
                    value={venueData.minimum_hours || ""}
                    onChange={(e) => handleInputChange("minimum_hours", Number.parseInt(e.target.value) || 1)}
                    placeholder="2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Availability */}
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-600 dark:from-blue-600 dark:to-cyan-700 text-white rounded-t-lg">
              <CardTitle className="flex items-center text-xl">
                <Clock className="mr-2 h-5 w-5" />
                Availability
              </CardTitle>
              <CardDescription className="text-blue-100 dark:text-blue-200">
                Update the availability schedule
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label>Available Days *</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {daysOfWeek.map((day) => (
                    <div key={day.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`day-${day.value}`}
                        checked={venueData.availability.days_of_week.includes(day.value)}
                        onCheckedChange={(checked) => handleDayChange(day.value, !!checked)}
                      />
                      <Label htmlFor={`day-${day.value}`} className="text-sm">
                        {day.label}
                      </Label>
                    </div>
                  ))}
                </div>
                {errors.days_of_week && <p className="text-sm text-red-500">{errors.days_of_week}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_time">Start Time</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={venueData.availability.start_time}
                    onChange={(e) => handleInputChange("availability.start_time", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_time">End Time</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={venueData.availability.end_time}
                    onChange={(e) => handleInputChange("availability.end_time", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Amenities & Features */}
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-red-600 dark:from-orange-600 dark:to-red-700 text-white rounded-t-lg">
              <CardTitle className="text-xl">Amenities & Features</CardTitle>
              <CardDescription className="text-orange-100 dark:text-orange-200">
                Update amenities and custom features
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-3">
                <Label>Amenities</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {amenityOptions.map((amenity) => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <Checkbox
                        id={`amenity-${amenity}`}
                        checked={venueData.amenities.includes(amenity)}
                        onCheckedChange={(checked) => handleAmenityChange(amenity, !!checked)}
                      />
                      <Label htmlFor={`amenity-${amenity}`} className="text-sm">
                        {amenity}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Custom Features</Label>
                <div className="flex gap-2">
                  <Input
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="Add a custom feature..."
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
                  />
                  <Button type="button" onClick={addFeature} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {venueData.features.map((feature) => (
                    <Badge key={feature} variant="secondary" className="flex items-center gap-1">
                      {feature}
                      <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => removeFeature(feature)} />
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Policies */}
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-slate-600 to-slate-700 dark:from-slate-700 dark:to-slate-800 text-white rounded-t-lg">
              <CardTitle className="text-xl">Policies & Status</CardTitle>
              <CardDescription className="text-slate-200 dark:text-slate-300">
                Update cancellation policies and venue status
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cancellation_policy">Cancellation Policy</Label>
                <Textarea
                  id="cancellation_policy"
                  value={venueData.cancellation_policy}
                  onChange={(e) => handleInputChange("cancellation_policy", e.target.value)}
                  placeholder="Describe the cancellation policy..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={venueData.status} onValueChange={(value) => handleInputChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="maintenance">Under Maintenance</SelectItem>
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
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Update Venue
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
