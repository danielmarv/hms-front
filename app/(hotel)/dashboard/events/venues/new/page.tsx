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
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { ArrowLeft, Save, MapPin, Users, DollarSign, Clock, Plus, X, Building2 } from "lucide-react"
import { useVenues } from "@/hooks/use-venues"
import { useHotels, type Hotel } from "@/hooks/use-hotels"

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

export default function NewVenuePage() {
  const router = useRouter()
  const { createVenue, loading } = useVenues()
  const { getAllHotels, isLoading: hotelsLoading } = useHotels()

  const [hotels, setHotels] = useState<Hotel[]>([])
  const [selectedHotelId, setSelectedHotelId] = useState<string>("")

  const [venueData, setVenueData] = useState({
    name: "",
    description: "",
    type: "",
    capacity: 0,
    area: 0,
    location: {
      floor: "",
      wing: "",
      room_number: "",
      address: "",
      coordinates: {
        latitude: 0,
        longitude: 0,
      },
    },
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

  const daysOfWeek = [
    { value: 0, label: "Sunday" },
    { value: 1, label: "Monday" },
    { value: 2, label: "Tuesday" },
    { value: 3, label: "Wednesday" },
    { value: 4, label: "Thursday" },
    { value: 5, label: "Friday" },
    { value: 6, label: "Saturday" },
  ]

  // Load hotels on component mount
  useEffect(() => {
    const loadHotels = async () => {
      try {
        const response = await getAllHotels({ active: true })
        if (response?.data) {
          setHotels(response.data)
        }
      } catch (error) {
        console.error("Failed to load hotels:", error)
        toast.error("Failed to load hotels")
      }
    }

    loadHotels()
  }, [getAllHotels])

  const handleInputChange = (field: string, value: any) => {
    if (field.includes(".")) {
      const fieldParts = field.split(".")
      if (fieldParts.length === 2) {
        const [parent, child] = fieldParts
        setVenueData((prev) => ({
          ...prev,
          [parent]: {
            ...prev[parent as keyof typeof prev],
            [child]: value,
          },
        }))
      } else if (fieldParts.length === 3) {
        const [parent, child, grandchild] = fieldParts
        setVenueData((prev) => ({
          ...prev,
          [parent]: {
            ...prev[parent as keyof typeof prev],
            [child]: {
              ...(prev[parent as keyof typeof prev] as any)[child],
              [grandchild]: value,
            },
          },
        }))
      }
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

    if (!selectedHotelId) newErrors.hotel = "Please select a hotel"
    if (!venueData.name.trim()) newErrors.name = "Venue name is required"
    if (!venueData.type) newErrors.type = "Venue type is required"
    if (venueData.capacity <= 0) newErrors.capacity = "Capacity must be greater than 0"
    if (venueData.pricing.base_price < 0) newErrors.base_price = "Base price cannot be negative"
    if (venueData.pricing.price_per_hour < 0) newErrors.price_per_hour = "Hourly price cannot be negative"
    if (venueData.availability.days_of_week.length === 0) newErrors.days_of_week = "Select at least one available day"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error("Please fix the errors before submitting")
      return
    }

    try {
      // Include hotel_id in the venue data
      const venueDataWithHotel = {
        ...venueData,
        hotel_id: selectedHotelId,
      }

      await createVenue(venueDataWithHotel)
      toast.success("Venue created successfully!")
      router.push("/dashboard/events/venues")
    } catch (error) {
      toast.error("Failed to create venue")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-purple-900 dark:to-indigo-900 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 dark:border-slate-700/20">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 dark:from-purple-400 dark:via-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Create New Venue
            </h1>
            <p className="text-slate-600 dark:text-slate-300 mt-2">Add a new event venue to your hotel</p>
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
          {/* Hotel Selection */}
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 text-white rounded-t-lg">
              <CardTitle className="flex items-center text-xl">
                <Building2 className="mr-2 h-5 w-5" />
                Hotel Selection
              </CardTitle>
              <CardDescription className="text-indigo-100 dark:text-indigo-200">
                Select the hotel for this venue
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-2">
                <Label htmlFor="hotel">Select Hotel *</Label>
                <Select value={selectedHotelId} onValueChange={setSelectedHotelId} disabled={hotelsLoading}>
                  <SelectTrigger className={errors.hotel ? "border-red-500" : ""}>
                    <SelectValue placeholder={hotelsLoading ? "Loading hotels..." : "Select a hotel"} />
                  </SelectTrigger>
                  <SelectContent>
                    {hotels.map((hotel) => (
                      <SelectItem key={hotel._id} value={hotel._id}>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{hotel.name}</span>
                          <span className="text-sm text-muted-foreground">({hotel.code})</span>
                          {hotel.isHeadquarters && (
                            <Badge variant="secondary" className="text-xs">
                              HQ
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.hotel && <p className="text-sm text-red-500">{errors.hotel}</p>}
                {selectedHotelId && (
                  <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        Selected: {hotels.find((h) => h._id === selectedHotelId)?.name}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-600 dark:from-purple-600 dark:to-blue-700 text-white rounded-t-lg">
              <CardTitle className="flex items-center text-xl">
                <MapPin className="mr-2 h-5 w-5" />
                Basic Information
              </CardTitle>
              <CardDescription className="text-purple-100 dark:text-purple-200">
                Enter the basic details of the venue
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>
            </CardContent>
          </Card>

          {/* Location Details */}
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-teal-500 to-cyan-600 dark:from-teal-600 dark:to-cyan-700 text-white rounded-t-lg">
              <CardTitle className="flex items-center text-xl">
                <MapPin className="mr-2 h-5 w-5" />
                Location Details
              </CardTitle>
              <CardDescription className="text-teal-100 dark:text-teal-200">
                Specify the venue location within the hotel
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="floor">Floor</Label>
                  <Input
                    id="floor"
                    value={venueData.location.floor}
                    onChange={(e) => handleInputChange("location.floor", e.target.value)}
                    placeholder="e.g., Ground Floor, 2nd Floor"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wing">Wing/Section</Label>
                  <Input
                    id="wing"
                    value={venueData.location.wing}
                    onChange={(e) => handleInputChange("location.wing", e.target.value)}
                    placeholder="e.g., East Wing, Main Building"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="room_number">Room Number</Label>
                  <Input
                    id="room_number"
                    value={venueData.location.room_number}
                    onChange={(e) => handleInputChange("location.room_number", e.target.value)}
                    placeholder="e.g., Room 101, Hall A"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Full Address</Label>
                <Textarea
                  id="address"
                  value={venueData.location.address}
                  onChange={(e) => handleInputChange("location.address", e.target.value)}
                  placeholder="Complete address of the venue..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude (Optional)</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={venueData.location.coordinates.latitude || ""}
                    onChange={(e) =>
                      handleInputChange("location.coordinates.latitude", Number.parseFloat(e.target.value) || 0)
                    }
                    placeholder="e.g., 40.7128"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude (Optional)</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={venueData.location.coordinates.longitude || ""}
                    onChange={(e) =>
                      handleInputChange("location.coordinates.longitude", Number.parseFloat(e.target.value) || 0)
                    }
                    placeholder="e.g., -74.0060"
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
                Set the pricing structure for this venue
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
                Set the default availability schedule
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
                Select amenities and add custom features
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
                Set cancellation policies and venue status
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
              disabled={loading || !selectedHotelId}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Create Venue
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
