"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { DateTimePicker } from "@/components/ui/date-time-picker"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  ArrowLeft,
  CalendarIcon,
  Clock,
  MapPin,
  Save,
  Users,
  Plus,
  Loader2,
  X,
  DollarSign,
  FileText,
  Briefcase,
  RefreshCw,
  AlertTriangle,
  Building2,
} from "lucide-react"
import { addHours, format } from "date-fns"
import { useEventTypes } from "@/hooks/use-event-types"
import { useVenues } from "@/hooks/use-venues"
import { useEventServices } from "@/hooks/use-event-services"
import { useEventTemplates } from "@/hooks/use-event-templates"
import { useUsers } from "@/hooks/use-users"
import { useEvents } from "@/hooks/use-events"
import { useCurrentHotel } from "@/hooks/use-current-hotel"

export default function NewEventPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("details")

  // Get current hotel data
  const { hotel, hotelId, isLoading: hotelLoading, error: hotelError } = useCurrentHotel()

  // Fetch data using hooks with proper hotel ID - all hotel-specific
  const { eventTypes, loading: loadingEventTypes, fetchEventTypes } = useEventTypes(hotelId)
  const { venues, loading: loadingVenues, fetchVenues } = useVenues(hotelId)
  const { services, loading: loadingServices, fetchServices } = useEventServices(hotelId)
  const { templates, loading: loadingTemplates, fetchTemplates } = useEventTemplates(hotelId)
  const { users, isLoading: loadingUsers, fetchUsers } = useUsers()
  const { createEvent } = useEvents()

  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    eventType: "",
    venue: "",
    startDate: addHours(new Date(), 1),
    endDate: addHours(new Date(), 3),
    allDay: false,
    attendees: 0,
    status: "pending",
    visibility: "public",
    color: "",
    notes: "",
    services: [],
    staffing: [],
  })

  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [staffing, setStaffing] = useState<{ userId: string; role: string; notes?: string }[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hotelUsers, setHotelUsers] = useState<any[]>([])

  // Debug logging
  useEffect(() => {
    console.log("Hotel data:", { hotel, hotelId, hotelLoading })
    console.log("Event Types:", eventTypes?.length || 0)
    console.log("Venues:", venues?.length || 0)
    console.log("Services:", services?.length || 0)
    console.log("Templates:", templates?.length || 0)
    console.log("Users:", users?.length || 0)
    console.log("services for the hotel:", services)
  }, [hotel, hotelId, hotelLoading, eventTypes, venues, services, templates, users])

  // Fetch data when hotel ID is available
  useEffect(() => {
    if (hotelId && !hotelLoading) {
      console.log("Fetching hotel-specific data for hotel:", hotelId)

      // Fetch hotel-specific data
      if (fetchEventTypes) {
        console.log("Fetching event types for hotel:", hotelId)
        fetchEventTypes()
      }
      if (fetchVenues) {
        console.log("Fetching venues for hotel:", hotelId)
        fetchVenues()
      }
      if (fetchServices) {
        console.log("Fetching services for hotel:", hotelId)
        fetchServices()
      }
      if (fetchTemplates) {
        console.log("Fetching templates for hotel:", hotelId)
        fetchTemplates()
      }

      // Fetch users with hotel access filtering
      if (fetchUsers) {
        console.log("Fetching users with access to hotel:", hotelId)
        // You can add hotel-specific filtering here if your API supports it
        fetchUsers({ hotelAccess: hotelId }).then((data) => {
          setHotelUsers(data)
        })
      }
    }
  }, [hotelId, hotelLoading, fetchEventTypes, fetchVenues, fetchServices, fetchTemplates, fetchUsers])

  // Filter users who have access to the current hotel
  const getHotelUsers = useCallback(() => {
    if (!users || !hotelId) return []

    // Filter users who have access to this hotel
    // This assumes users have a hotelAccess field or similar
    return users.filter(
      (user) =>
        user.status === "active" &&
        (user.hotelAccess === hotelId || user.role === "admin" || user.role === "super_admin"),
    )
  }, [users, hotelId])

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEventData({ ...eventData, [name]: value })
  }

  // Handle number input change
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEventData({ ...eventData, [name]: Number.parseInt(value) || 0 })
  }

  // Handle select change
  const handleSelectChange = (name: string, value: string) => {
    if (name === "eventType") {
      const selectedType = eventTypes?.find((type) => type._id === value)
      setEventData({
        ...eventData,
        [name]: value,
        color: selectedType ? selectedType.color : eventData.color,
      })
    } else {
      setEventData({ ...eventData, [name]: value })
    }
  }

  // Handle date change
  const handleDateChange = (name: string, date: Date) => {
    setEventData({ ...eventData, [name]: date })
  }

  // Handle checkbox change
  const handleCheckboxChange = (name: string, checked: boolean) => {
    setEventData({ ...eventData, [name]: checked })
  }

  // Handle service selection
  const handleServiceChange = (serviceId: string, checked: boolean) => {
    if (checked) {
      setSelectedServices([...selectedServices, serviceId])
    } else {
      setSelectedServices(selectedServices.filter((id) => id !== serviceId))
    }
  }

  // Handle template selection
  const handleTemplateSelect = (templateId: string) => {
    const template = templates?.find((t) => t._id === templateId)
    if (template) {
      setSelectedTemplate(templateId)

      // Pre-fill form with template data
      setEventData({
        ...eventData,
        title: template.name,
        description: template.description,
        eventType: template.eventType,
        color: eventTypes?.find((type) => type._id === template.eventType)?.color || "",
      })
    }
  }

  // Handle staffing
  const addStaffMember = () => {
    setStaffing([...staffing, { userId: "", role: "", notes: "" }])
  }

  const removeStaffMember = (index: number) => {
    setStaffing(staffing.filter((_, i) => i !== index))
  }

  const updateStaffMember = (index: number, field: string, value: string) => {
    const updatedStaffing = [...staffing]
    updatedStaffing[index] = { ...updatedStaffing[index], [field]: value }
    setStaffing(updatedStaffing)
  }

  // Calculate total price
  const calculateTotalPrice = () => {
    const selectedServiceItems = services?.filter((service) => selectedServices.includes(service._id))
    return selectedServiceItems?.reduce((total, service) => total + service.price, 0) || 0
  }

  // Get selected items for summary
  const getSelectedTemplate = () => {
    return templates?.find((t) => t._id === selectedTemplate)
  }

  const getSelectedServices = () => {
    return services?.filter((service) => selectedServices.includes(service._id)) || []
  }

  const getAssignedStaff = () => {
    return staffing.filter((staff) => staff.userId && staff.role)
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!eventData.title) {
      toast.error("Please enter an event title")
      return
    }

    if (!eventData.eventType) {
      toast.error("Please select an event type")
      return
    }

    if (!eventData.venue) {
      toast.error("Please select a venue")
      return
    }

    if (eventData.attendees <= 0) {
      toast.error("Please enter a valid number of attendees")
      return
    }

    if (!hotelId) {
      toast.error("No hotel selected. Please select a hotel first.")
      return
    }

    console.log("Creating event with hotel ID:", hotelId)

    setIsSubmitting(true)

    const eventWithServices = {
      ...eventData,
      hotel_id: hotelId,
      event_type_id: eventData.eventType,
      venue_id: eventData.venue,
      start_date: eventData.startDate,
      end_date: eventData.endDate,
      template_id: selectedTemplate || undefined,
      services: selectedServices.map((serviceId) => {
        const service = services?.find((s) => s._id === serviceId)
        return {
          service_id: serviceId,
          name: service?.name || "",
          price: service?.price || 0,
        }
      }),
      staffing: staffing.filter((staff) => staff.userId && staff.role),
    }

    console.log("Event data being sent:", eventWithServices)

    try {
      await createEvent(eventWithServices)
      toast.success("Event created successfully")
      router.push("/dashboard/events")
    } catch (error) {
      console.error("Error creating event:", error)
      toast.error("Failed to create event")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Loading state - wait for hotel data first
  if (hotelLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-20" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  // No hotel selected
  if (!hotelLoading && !hotelId && !hotelError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight">Create New Event</h2>
            <p className="text-muted-foreground">Please select a hotel to continue</p>
          </div>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <h3 className="text-lg font-medium">No Hotel Selected</h3>
              <p className="text-muted-foreground">Please select a hotel from your dashboard to create events.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">Create New Event</h2>
          <p className="text-muted-foreground">
            Schedule a new event at <span className="font-medium">{hotel?.name || "your hotel"}</span>
          </p>
          {hotelId && <p className="text-xs text-muted-foreground">Hotel ID: {hotelId}</p>}
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Hotel Information Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-blue-900">Current Hotel</h3>
              <p className="text-sm text-blue-700">{hotel?.name || "Loading hotel information..."}</p>
              {hotel?.address && <p className="text-xs text-blue-600">{hotel.address}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="template">Template</TabsTrigger>
          <TabsTrigger value="details">Event Details</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="staffing">Staffing</TabsTrigger>
        </TabsList>

        <TabsContent value="template" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Event Templates</CardTitle>
              <CardDescription>
                Start with a pre-configured event template for {hotel?.name} or create from scratch
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingTemplates ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {templates && templates.length > 0 ? (
                    templates.map((template) => {
                      const eventType = eventTypes?.find((type) => type._id === template.eventType)

                      return (
                        <div
                          key={template._id}
                          className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                            selectedTemplate === template._id
                              ? "border-primary bg-primary/5"
                              : "hover:border-primary/50"
                          }`}
                          onClick={() => handleTemplateSelect(template._id)}
                        >
                          <div className="flex items-center space-x-2 mb-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: eventType?.color || "#ccc" }}
                            />
                            <h3 className="font-medium">{template.name}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground">{template.description}</p>
                        </div>
                      )
                    })
                  ) : (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                      No templates available for {hotel?.name}
                    </div>
                  )}

                  <div
                    className="border border-dashed rounded-lg p-4 cursor-pointer hover:border-primary/50 flex flex-col items-center justify-center text-center"
                    onClick={() => {
                      setSelectedTemplate("")
                      setActiveTab("details")
                    }}
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                      <Plus className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-medium">Create from Scratch</h3>
                    <p className="text-sm text-muted-foreground">Configure all event details manually</p>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button onClick={() => setActiveTab("details")}>Continue to Details</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
              <CardDescription>Enter the basic information for your event at {hotel?.name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={eventData.title}
                    onChange={handleInputChange}
                    placeholder="Enter event title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eventType">Event Type</Label>
                  <Select value={eventData.eventType} onValueChange={(value) => handleSelectChange("eventType", value)}>
                    <SelectTrigger id="eventType">
                      <SelectValue placeholder={loadingEventTypes ? "Loading..." : "Select event type"} />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingEventTypes ? (
                        <SelectItem value="loading" disabled>
                          Loading event types...
                        </SelectItem>
                      ) : eventTypes && eventTypes.length > 0 ? (
                        eventTypes.map((type) => (
                          <SelectItem key={type._id} value={type._id}>
                            <div className="flex items-center">
                              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: type.color }} />
                              {type.name}
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-types" disabled>
                          No event types available for {hotel?.name}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={eventData.description}
                  onChange={handleInputChange}
                  placeholder="Enter event description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="venue">Venue</Label>
                  <Select value={eventData.venue} onValueChange={(value) => handleSelectChange("venue", value)}>
                    <SelectTrigger id="venue">
                      <SelectValue placeholder={loadingVenues ? "Loading..." : "Select venue"} />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingVenues ? (
                        <SelectItem value="loading" disabled>
                          Loading venues...
                        </SelectItem>
                      ) : venues && venues.length > 0 ? (
                        venues.map((venue) => (
                          <SelectItem key={venue._id} value={venue._id}>
                            {venue.name} (Capacity: {venue.capacity})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-venues" disabled>
                          No venues available for {hotel?.name}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="attendees">Expected Attendees</Label>
                  <Input
                    id="attendees"
                    name="attendees"
                    type="number"
                    min="1"
                    value={eventData.attendees || ""}
                    onChange={handleNumberChange}
                    placeholder="Enter number of attendees"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date & Time</Label>
                  <DateTimePicker date={eventData.startDate} setDate={(date) => handleDateChange("startDate", date)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date & Time</Label>
                  <DateTimePicker date={eventData.endDate} setDate={(date) => handleDateChange("endDate", date)} />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="allDay"
                  checked={eventData.allDay}
                  onCheckedChange={(checked) => handleCheckboxChange("allDay", !!checked)}
                />
                <Label htmlFor="allDay">All-day event</Label>
              </div>

              <Separator />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={eventData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="visibility">Visibility</Label>
                  <Select
                    value={eventData.visibility}
                    onValueChange={(value) => handleSelectChange("visibility", value)}
                  >
                    <SelectTrigger id="visibility">
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="staff_only">Staff Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={eventData.notes}
                  onChange={handleInputChange}
                  placeholder="Enter any additional notes"
                  rows={3}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("template")}>
                Back to Templates
              </Button>
              <Button onClick={() => setActiveTab("services")}>Continue to Services</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Event Services</CardTitle>
              <CardDescription>Select additional services available at {hotel?.name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingServices ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : services && services.length > 0 ? (
                <>
                  <div className="text-sm text-muted-foreground mb-4">
                    {services.length} service{services.length !== 1 ? "s" : ""} available at {hotel?.name}
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {services.map((service) => (
                      <div
                        key={service._id}
                        className="flex items-start space-x-3 border rounded-lg p-3 hover:bg-muted/50 transition-colors"
                      >
                        <Checkbox
                          id={service._id}
                          checked={selectedServices.includes(service._id)}
                          onCheckedChange={(checked) => handleServiceChange(service._id, !!checked)}
                        />
                        <div className="space-y-1 flex-1">
                          <Label htmlFor={service._id} className="font-medium cursor-pointer">
                            {service.name}
                          </Label>
                          {service.description && (
                            <p className="text-sm text-muted-foreground">{service.description}</p>
                          )}
                          <div className="flex justify-between">
                            <Badge variant="outline">{service.category}</Badge>
                            <span className="text-sm font-medium">${service.price}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Services:</span>
                    <span className="font-bold">${calculateTotalPrice()}</span>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="flex flex-col items-center space-y-2">
                    <Briefcase className="h-12 w-12 text-muted-foreground" />
                    <h3 className="font-medium">No Services Available</h3>
                    <p className="text-sm">No event services have been configured for {hotel?.name} yet.</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => fetchServices && fetchServices()}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh Services
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("details")}>
                Back to Details
              </Button>
              <Button onClick={() => setActiveTab("staffing")}>Continue to Staffing</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="staffing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Event Staffing</CardTitle>
              <CardDescription>Assign staff members to your event at {hotel?.name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingUsers ? (
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : (
                <>
                  {hotelUsers && hotelUsers.length > 0 ? (
                    <div className="text-sm text-muted-foreground mb-4">
                      {hotelUsers.length} staff member{hotelUsers.length !== 1 ? "s" : ""} available to assign to this
                      event at {hotel?.name}
                    </div>
                  ) : (
                    <div className="text-sm text-amber-500 mb-4 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      No staff members with access to {hotel?.name} found
                    </div>
                  )}

                  {staffing.length === 0 ? (
                    <div className="border rounded-lg p-6 text-center">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Users className="h-12 w-12 text-muted-foreground mb-2" />
                        <h3 className="font-medium text-lg">No Staff Assigned</h3>
                        <p className="text-muted-foreground">Add staff members to assign them to this event.</p>
                        {hotelUsers && hotelUsers.length > 0 ? (
                          <Button onClick={addStaffMember} className="mt-4">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Staff Member
                          </Button>
                        ) : (
                          <p className="text-sm text-muted-foreground mt-2">
                            No users available in the system. Please add users first.
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <>
                      {staffing.map((staff, index) => (
                        <div key={index} className="border rounded-lg p-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">Staff Member {index + 1}</h4>
                            <Button variant="outline" size="sm" onClick={() => removeStaffMember(index)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label>Staff Member</Label>
                              <Select
                                value={staff.userId}
                                onValueChange={(value) => updateStaffMember(index, "userId", value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select staff member" />
                                </SelectTrigger>
                                <SelectContent>
                                  {hotelUsers && hotelUsers.length > 0 ? (
                                    hotelUsers.map((user) => (
                                      <SelectItem key={user._id} value={user._id}>
                                        <div className="flex items-center">
                                          {user.full_name}
                                          {user.role && (
                                            <Badge variant="outline" className="ml-2 text-xs">
                                              {user.role}
                                            </Badge>
                                          )}
                                        </div>
                                      </SelectItem>
                                    ))
                                  ) : (
                                    <SelectItem value="no-users" disabled>
                                      No users available
                                    </SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label>Role for Event</Label>
                              <Input
                                value={staff.role}
                                onChange={(e) => updateStaffMember(index, "role", e.target.value)}
                                placeholder="e.g., Event Coordinator, Waiter"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Notes</Label>
                            <Textarea
                              value={staff.notes || ""}
                              onChange={(e) => updateStaffMember(index, "notes", e.target.value)}
                              placeholder="Additional notes for this staff member"
                              rows={2}
                            />
                          </div>
                        </div>
                      ))}

                      {hotelUsers && hotelUsers.length > 0 && (
                        <Button onClick={addStaffMember} variant="outline" className="w-full">
                          <Plus className="mr-2 h-4 w-4" />
                          Add Another Staff Member
                        </Button>
                      )}
                    </>
                  )}
                </>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("services")}>
                Back to Services
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Create Event
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Event Summary */}
      <Card className="bg-muted/40">
        <CardHeader>
          <CardTitle>Event Summary</CardTitle>
          <CardDescription>Review your event details before creating</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Basic Event Info */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Basic Information</h4>

              <div className="flex items-center space-x-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Hotel</p>
                  <p className="text-sm text-muted-foreground">{hotel?.name || "Not selected"}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Event Type</p>
                  <p className="text-sm text-muted-foreground">
                    {eventData.eventType
                      ? eventTypes?.find((t) => t._id === eventData.eventType)?.name
                      : "Not selected"}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Venue</p>
                  <p className="text-sm text-muted-foreground">
                    {eventData.venue ? venues?.find((v) => v._id === eventData.venue)?.name : "Not selected"}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Date & Time</p>
                  <p className="text-sm text-muted-foreground">
                    {eventData.startDate ? format(eventData.startDate, "MMM d, yyyy h:mm a") : "Not set"}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Attendees</p>
                  <p className="text-sm text-muted-foreground">
                    {eventData.attendees > 0 ? eventData.attendees : "Not specified"}
                  </p>
                </div>
              </div>
            </div>

            {/* Selected Items */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Selected Items</h4>

              {/* Template */}
              <div className="flex items-start space-x-2">
                <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Template</p>
                  <p className="text-sm text-muted-foreground">
                    {getSelectedTemplate()?.name || "No template selected"}
                  </p>
                </div>
              </div>

              {/* Services */}
              <div className="flex items-start space-x-2">
                <Briefcase className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Services ({getSelectedServices().length})</p>
                  {getSelectedServices().length > 0 ? (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {getSelectedServices().map((service) => (
                        <Badge key={service._id} variant="secondary" className="text-xs">
                          {service.name} (${service.price})
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No services selected</p>
                  )}
                </div>
              </div>

              {/* Staff */}
              <div className="flex items-start space-x-2">
                <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Staff ({getAssignedStaff().length})</p>
                  {getAssignedStaff().length > 0 ? (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {getAssignedStaff().map((staff, index) => {
                        const user = hotelUsers.find((u) => u._id === staff.userId)
                        return (
                          <Badge key={index} variant="outline" className="text-xs">
                            {user?.full_name} - {staff.role}
                          </Badge>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No staff assigned</p>
                  )}
                </div>
              </div>

              {/* Total Cost */}
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Total Cost</p>
                  <p className="text-sm font-bold text-green-600">${calculateTotalPrice()}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
