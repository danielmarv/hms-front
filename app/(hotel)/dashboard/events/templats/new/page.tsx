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
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Save,
  Loader2,
  FileIcon as FileTemplate,
  BuildingIcon,
  StarIcon,
  CheckCircleIcon,
  Plus,
  X,
  Clock,
  Users,
  DollarSign,
} from "lucide-react"
import { useHotels, type Hotel } from "@/hooks/use-hotels"
import { useEventTypes } from "@/hooks/use-event-types"
import { useVenues } from "@/hooks/use-venues"
import { useEventServices } from "@/hooks/use-event-services"
import { toast } from "sonner"
import { useEventTemplates } from "@/hooks/use-event-templates"

interface StaffingRole {
  role: string
  count: number
}

export default function NewEventTemplatePage() {
  const router = useRouter()
  const { getAllHotels } = useHotels()
  const { createTemplate } = useEventTemplates()

  // Hotel selection state
  const [selectedHotelId, setSelectedHotelId] = useState<string>("")
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [hotelsLoading, setHotelsLoading] = useState(true)
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null)

  // Get data for selected hotel
  const { eventTypes } = useEventTypes(selectedHotelId)
  const { venues } = useVenues(selectedHotelId)
  const { services } = useEventServices(selectedHotelId)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    eventType: "",
    venue: "",
    duration: "",
    capacity: "",
    basePrice: "",
    setupTime: "30",
    teardownTime: "30",
    terms: "",
    isActive: true,
  })

  const [staffing, setStaffing] = useState<StaffingRole[]>([{ role: "", count: 1 }])
  const [includedItems, setIncludedItems] = useState<string[]>([""])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch hotels on component mount
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setHotelsLoading(true)
        const savedHotelId = localStorage.getItem("selectedHotelId")

        const response = await getAllHotels({ active: true })
        console.log("Hotels API response:", response)

        let hotelsData = []
        if (response?.data?.data) {
          hotelsData = response.data.data
        } else if (response?.data && Array.isArray(response.data)) {
          hotelsData = response.data
        } else if (response && Array.isArray(response)) {
          hotelsData = response
        }

        setHotels(hotelsData)

        if (hotelsData.length === 0) {
          toast.error("No hotels available. Please contact your administrator.")
          router.push("/dashboard")
          return
        }

        if (hotelsData.length > 0) {
          let hotelToSelect = hotelsData[0]

          if (savedHotelId) {
            const savedHotel = hotelsData.find((h: Hotel) => h._id === savedHotelId)
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

  // Handle form input changes
  const handleInputChange = (field: string, value: string | boolean | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Handle staffing changes
  const addStaffingRole = () => {
    setStaffing((prev) => [...prev, { role: "", count: 1 }])
  }

  const removeStaffingRole = (index: number) => {
    setStaffing((prev) => prev.filter((_, i) => i !== index))
  }

  const updateStaffingRole = (index: number, field: keyof StaffingRole, value: string | number) => {
    setStaffing((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)))
  }

  // Handle included items changes
  const addIncludedItem = () => {
    setIncludedItems((prev) => [...prev, ""])
  }

  const removeIncludedItem = (index: number) => {
    setIncludedItems((prev) => prev.filter((_, i) => i !== index))
  }

  const updateIncludedItem = (index: number, value: string) => {
    setIncludedItems((prev) => prev.map((item, i) => (i === index ? value : item)))
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedHotelId) {
      toast.error("Please select a hotel")
      return
    }

    if (!formData.name.trim()) {
      toast.error("Template name is required")
      return
    }

    if (!formData.eventType) {
      toast.error("Event type is required")
      return
    }

    if (!formData.venue) {
      toast.error("Venue is required")
      return
    }

    if (!formData.duration || Number.parseInt(formData.duration) < 1) {
      toast.error("Duration must be at least 1 minute")
      return
    }

    if (!formData.basePrice || Number.parseFloat(formData.basePrice) < 0) {
      toast.error("Base price must be 0 or greater")
      return
    }

    try {
      setIsSubmitting(true)

      const templateData = {
        ...formData,
        hotelId: selectedHotelId,
        duration: Number.parseInt(formData.duration),
        capacity: formData.capacity ? Number.parseInt(formData.capacity) : undefined,
        basePrice: Number.parseFloat(formData.basePrice),
        setupTime: Number.parseInt(formData.setupTime),
        teardownTime: Number.parseInt(formData.teardownTime),
        staffing: staffing.filter((s) => s.role.trim()),
        includedItems: includedItems.filter((item) => item.trim()),
      }

      console.log("Creating template:", templateData)

      const response = await createTemplate(templateData)

      if (!response.success) {
        throw new Error(response.message || "Failed to create template")
      }

      const result = response.data
      console.log("Template created:", result)

      toast.success("Event template created successfully!")
      router.push("/dashboard/events/templats")
    } catch (error: any) {
      console.error("Failed to create template:", error)
      toast.error(error.message || "Failed to create template")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (hotelsLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-slate-900 dark:via-blue-900 dark:to-cyan-900">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400" />
          <p className="text-lg font-medium text-slate-700 dark:text-slate-300">Loading hotels...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-slate-900 dark:via-blue-900 dark:to-cyan-900 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 dark:border-slate-700/20">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.back()}
              className="border-blue-200 hover:bg-blue-50 dark:border-blue-700 dark:hover:bg-blue-900"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 dark:from-blue-400 dark:via-cyan-400 dark:to-teal-400 bg-clip-text text-transparent">
                Create Event Template
              </h1>
              <p className="text-slate-600 dark:text-slate-300 mt-1">Create a reusable template for events</p>
            </div>
          </div>
          <FileTemplate className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        </div>

        {/* Hotel Selection */}
        <Card className="border-2 border-dashed border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50/80 to-cyan-50/80 dark:from-blue-900/20 dark:to-cyan-900/20 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-2">
              <BuildingIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <CardTitle className="text-lg text-blue-900 dark:text-blue-100">Select Hotel</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-slate-300">Choose Hotel *</Label>
                <Select value={selectedHotelId} onValueChange={handleHotelChange} required>
                  <SelectTrigger className="w-full bg-white/80 dark:bg-slate-800/80">
                    <SelectValue placeholder="Select a hotel for this template" />
                  </SelectTrigger>
                  <SelectContent>
                    {hotels.length === 0 ? (
                      <SelectItem value="no-hotels" disabled>
                        No hotels available
                      </SelectItem>
                    ) : (
                      hotels.map((hotel) => (
                        <SelectItem key={hotel._id} value={hotel._id}>
                          <div className="flex items-center space-x-2">
                            <BuildingIcon className="h-4 w-4" />
                            <span>{hotel.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {hotel.code}
                            </Badge>
                            {hotel.isHeadquarters && (
                              <Badge className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                <StarIcon className="h-3 w-3 mr-1" />
                                HQ
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {selectedHotel && (
                <div className="bg-white/60 dark:bg-slate-800/60 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-sm text-slate-700 dark:text-slate-300">Selected Hotel</h3>
                    <CheckCircleIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{selectedHotel.name}</p>
                    <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                      <Badge variant="outline">{selectedHotel.code}</Badge>
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
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl text-slate-800 dark:text-slate-200">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-700 dark:text-slate-300">
                    Template Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter template name"
                    required
                    className="bg-white/80 dark:bg-slate-700/80"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eventType" className="text-slate-700 dark:text-slate-300">
                    Event Type *
                  </Label>
                  <Select
                    value={formData.eventType}
                    onValueChange={(value) => handleInputChange("eventType", value)}
                    required
                  >
                    <SelectTrigger className="bg-white/80 dark:bg-slate-700/80">
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventTypes.map((type) => (
                        <SelectItem key={type._id} value={type._id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-slate-700 dark:text-slate-300">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Enter template description"
                  rows={3}
                  className="bg-white/80 dark:bg-slate-700/80"
                />
              </div>
            </CardContent>
          </Card>

          {/* Event Details */}
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl text-slate-800 dark:text-slate-200">Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="venue" className="text-slate-700 dark:text-slate-300">
                    Venue *
                  </Label>
                  <Select value={formData.venue} onValueChange={(value) => handleInputChange("venue", value)} required>
                    <SelectTrigger className="bg-white/80 dark:bg-slate-700/80">
                      <SelectValue placeholder="Select venue" />
                    </SelectTrigger>
                    <SelectContent>
                      {venues.map((venue) => (
                        <SelectItem key={venue._id} value={venue._id}>
                          {venue.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-slate-700 dark:text-slate-300">
                    Duration (minutes) *
                  </Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="duration"
                      type="number"
                      min="1"
                      value={formData.duration}
                      onChange={(e) => handleInputChange("duration", e.target.value)}
                      placeholder="120"
                      required
                      className="pl-10 bg-white/80 dark:bg-slate-700/80"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capacity" className="text-slate-700 dark:text-slate-300">
                    Capacity
                  </Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="capacity"
                      type="number"
                      min="1"
                      value={formData.capacity}
                      onChange={(e) => handleInputChange("capacity", e.target.value)}
                      placeholder="50"
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
                  <Label htmlFor="teardownTime" className="text-slate-700 dark:text-slate-300">
                    Teardown Time (minutes)
                  </Label>
                  <Input
                    id="teardownTime"
                    type="number"
                    min="0"
                    value={formData.teardownTime}
                    onChange={(e) => handleInputChange("teardownTime", e.target.value)}
                    className="bg-white/80 dark:bg-slate-700/80"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="basePrice" className="text-slate-700 dark:text-slate-300">
                  Base Price *
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="basePrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.basePrice}
                    onChange={(e) => handleInputChange("basePrice", e.target.value)}
                    placeholder="0.00"
                    required
                    className="pl-10 bg-white/80 dark:bg-slate-700/80"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Staffing */}
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl text-slate-800 dark:text-slate-200">Staffing Requirements</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addStaffingRole}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Role
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {staffing.map((staff, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 border rounded-lg bg-slate-50 dark:bg-slate-700/50"
                >
                  <div className="flex-1">
                    <Input
                      value={staff.role}
                      onChange={(e) => updateStaffingRole(index, "role", e.target.value)}
                      placeholder="Staff role (e.g., Waiter, Manager)"
                      className="bg-white dark:bg-slate-700"
                    />
                  </div>
                  <div className="w-24">
                    <Input
                      type="number"
                      min="1"
                      value={staff.count}
                      onChange={(e) => updateStaffingRole(index, "count", Number.parseInt(e.target.value) || 1)}
                      className="bg-white dark:bg-slate-700"
                    />
                  </div>
                  {staffing.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeStaffingRole(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Included Items */}
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl text-slate-800 dark:text-slate-200">Included Items</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addIncludedItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {includedItems.map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="flex-1">
                    <Input
                      value={item}
                      onChange={(e) => updateIncludedItem(index, e.target.value)}
                      placeholder="Enter included item"
                      className="bg-white/80 dark:bg-slate-700/80"
                    />
                  </div>
                  {includedItems.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeIncludedItem(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Terms and Status */}
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl text-slate-800 dark:text-slate-200">Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="terms" className="text-slate-700 dark:text-slate-300">
                  Terms & Conditions
                </Label>
                <Textarea
                  id="terms"
                  value={formData.terms}
                  onChange={(e) => handleInputChange("terms", e.target.value)}
                  placeholder="Enter terms and conditions"
                  rows={4}
                  className="bg-white/80 dark:bg-slate-700/80"
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-slate-700 dark:text-slate-300">Template Status</Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Active templates can be used to create events
                  </p>
                </div>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleInputChange("isActive", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
              className="border-slate-300 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !selectedHotelId}
              className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 dark:from-blue-600 dark:to-cyan-700 dark:hover:from-blue-700 dark:hover:to-cyan-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Create Template
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
