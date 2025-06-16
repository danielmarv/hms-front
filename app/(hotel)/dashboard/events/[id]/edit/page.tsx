"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { DateTimePicker } from "@/components/ui/date-time-picker"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react"
import { useEvents } from "@/hooks/use-events"
import { useVenues } from "@/hooks/use-venues"
import { useEventTypes } from "@/hooks/use-event-types"
import { useEventServices } from "@/hooks/use-event-services"

interface EditEventPageProps {
  params: {
    id: string
  }
}

export default function EditEventPage({ params }: EditEventPageProps) {
  const router = useRouter()
  const { getEvent, updateEvent } = useEvents()
  const { venues } = useVenues()
  const { eventTypes } = useEventTypes()
  const { services } = useEventServices()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")

  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    event_type_id: "",
    venue_id: "",
    start_date: new Date(),
    end_date: new Date(),
    all_day: false,
    attendees: 0,
    status: "pending",
    visibility: "public",
    color: "",
    notes: "",
    organizer: {
      name: "",
      email: "",
      phone: "",
    },
    services: [] as any[],
    staffing: [] as any[],
    recurring: {
      is_recurring: false,
      pattern: "weekly",
      interval: 1,
      end_after: 10,
      end_date: undefined as Date | undefined,
    },
  })

  const [selectedServices, setSelectedServices] = useState<string[]>([])

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true)
        const event = await getEvent(params.id)

        setEventData({
          title: event.title,
          description: event.description || "",
          event_type_id: typeof event.event_type_id === "object" ? event.event_type_id._id : event.event_type_id,
          venue_id: typeof event.venue_id === "object" ? event.venue_id._id : event.venue_id,
          start_date: event.start_date,
          end_date: event.end_date,
          all_day: event.all_day,
          attendees: event.attendees,
          status: event.status,
          visibility: event.visibility,
          color: event.color || "",
          notes: event.notes || "",
          organizer: event.organizer || { name: "", email: "", phone: "" },
          services: event.services || [],
          staffing: event.staffing || [],
          recurring: event.recurring || {
            is_recurring: false,
            pattern: "weekly",
            interval: 1,
            end_after: 10,
            end_date: undefined,
          },
        })

        if (event.services) {
          setSelectedServices(event.services.map((s: any) => s.service_id))
        }
      } catch (error) {
        console.error("Failed to fetch event:", error)
        toast.error("Failed to load event details")
      } finally {
        setLoading(false)
      }
    }

    fetchEvent()
  }, [params.id, getEvent])

  const handleInputChange = (field: string, value: any) => {
    setEventData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleOrganizerChange = (field: string, value: string) => {
    setEventData((prev) => ({
      ...prev,
      organizer: {
        ...prev.organizer,
        [field]: value,
      },
    }))
  }

  const handleRecurringChange = (field: string, value: any) => {
    setEventData((prev) => ({
      ...prev,
      recurring: {
        ...prev.recurring,
        [field]: value,
      },
    }))
  }

  const handleServiceToggle = (serviceId: string, checked: boolean) => {
    if (checked) {
      setSelectedServices((prev) => [...prev, serviceId])
    } else {
      setSelectedServices((prev) => prev.filter((id) => id !== serviceId))
    }
  }

  const addStaffRole = () => {
    setEventData((prev) => ({
      ...prev,
      staffing: [...prev.staffing, { role: "", count: 1 }],
    }))
  }

  const updateStaffRole = (index: number, field: string, value: any) => {
    setEventData((prev) => ({
      ...prev,
      staffing: prev.staffing.map((staff, i) => (i === index ? { ...staff, [field]: value } : staff)),
    }))
  }

  const removeStaffRole = (index: number) => {
    setEventData((prev) => ({
      ...prev,
      staffing: prev.staffing.filter((_, i) => i !== index),
    }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      // Prepare services data
      const servicesData = selectedServices.map((serviceId) => {
        const service = services.find((s) => s._id === serviceId)
        return {
          service_id: serviceId,
          quantity: 1,
          price: service?.price || 0,
        }
      })

      const updateData = {
        ...eventData,
        services: servicesData,
      }

      await updateEvent(params.id, updateData)
      toast.success("Event updated successfully")
      router.push(`/dashboard/events/${params.id}`)
    } catch (error) {
      console.error("Failed to update event:", error)
      toast.error("Failed to update event")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Event</h1>
            <p className="text-muted-foreground">Modify event details and settings</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="basic">Basic Details</TabsTrigger>
          <TabsTrigger value="organizer">Organizer</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="staffing">Staffing</TabsTrigger>
          <TabsTrigger value="recurring">Recurring</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Essential event details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title</Label>
                  <Input
                    id="title"
                    value={eventData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Enter event title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="attendees">Expected Attendees</Label>
                  <Input
                    id="attendees"
                    type="number"
                    min="1"
                    value={eventData.attendees || ""}
                    onChange={(e) => handleInputChange("attendees", Number.parseInt(e.target.value) || 0)}
                    placeholder="Number of attendees"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={eventData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Enter event description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="eventType">Event Type</Label>
                  <Select
                    value={eventData.event_type_id}
                    onValueChange={(value) => handleInputChange("event_type_id", value)}
                  >
                    <SelectTrigger id="eventType">
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventTypes.map((type) => (
                        <SelectItem key={type._id} value={type._id}>
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: type.color }} />
                            {type.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="venue">Venue</Label>
                  <Select value={eventData.venue_id} onValueChange={(value) => handleInputChange("venue_id", value)}>
                    <SelectTrigger id="venue">
                      <SelectValue placeholder="Select venue" />
                    </SelectTrigger>
                    <SelectContent>
                      {venues.map((venue) => (
                        <SelectItem key={venue._id} value={venue._id}>
                          {venue.name} (Capacity: {venue.capacity})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date & Time</Label>
                  <DateTimePicker
                    date={eventData.start_date}
                    setDate={(date) => handleInputChange("start_date", date)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date & Time</Label>
                  <DateTimePicker date={eventData.end_date} setDate={(date) => handleInputChange("end_date", date)} />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="allDay"
                  checked={eventData.all_day}
                  onCheckedChange={(checked) => handleInputChange("all_day", !!checked)}
                />
                <Label htmlFor="allDay">All-day event</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="organizer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Organizer Information</CardTitle>
              <CardDescription>Contact details for the event organizer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="organizerName">Organizer Name</Label>
                <Input
                  id="organizerName"
                  value={eventData.organizer.name}
                  onChange={(e) => handleOrganizerChange("name", e.target.value)}
                  placeholder="Enter organizer name"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="organizerEmail">Email</Label>
                  <Input
                    id="organizerEmail"
                    type="email"
                    value={eventData.organizer.email}
                    onChange={(e) => handleOrganizerChange("email", e.target.value)}
                    placeholder="Enter email address"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organizerPhone">Phone</Label>
                  <Input
                    id="organizerPhone"
                    type="tel"
                    value={eventData.organizer.phone}
                    onChange={(e) => handleOrganizerChange("phone", e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Event Services</CardTitle>
              <CardDescription>Select additional services for this event</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {services.map((service) => (
                  <div key={service._id} className="flex items-start space-x-3 border rounded-lg p-3">
                    <Checkbox
                      id={service._id}
                      checked={selectedServices.includes(service._id)}
                      onCheckedChange={(checked) => handleServiceToggle(service._id, !!checked)}
                    />
                    <div className="space-y-1 flex-1">
                      <Label htmlFor={service._id} className="font-medium cursor-pointer">
                        {service.name}
                      </Label>
                      <p className="text-sm text-muted-foreground">{service.description}</p>
                      <div className="flex justify-between">
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

        <TabsContent value="staffing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Event Staffing</CardTitle>
              <CardDescription>Define staff roles and requirements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {eventData.staffing.map((staff, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="flex-1">
                    <Input
                      placeholder="Staff role (e.g., Server, Security)"
                      value={staff.role}
                      onChange={(e) => updateStaffRole(index, "role", e.target.value)}
                    />
                  </div>
                  <div className="w-24">
                    <Input
                      type="number"
                      min="1"
                      placeholder="Count"
                      value={staff.count}
                      onChange={(e) => updateStaffRole(index, "count", Number.parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <Button variant="outline" size="icon" onClick={() => removeStaffRole(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Button onClick={addStaffRole} variant="outline" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Staff Role
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recurring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recurring Event</CardTitle>
              <CardDescription>Set up recurring event schedule</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isRecurring"
                  checked={eventData.recurring.is_recurring}
                  onCheckedChange={(checked) => handleRecurringChange("is_recurring", !!checked)}
                />
                <Label htmlFor="isRecurring">This is a recurring event</Label>
              </div>

              {eventData.recurring.is_recurring && (
                <>
                  <Separator />

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="pattern">Repeat Pattern</Label>
                      <Select
                        value={eventData.recurring.pattern}
                        onValueChange={(value) => handleRecurringChange("pattern", value)}
                      >
                        <SelectTrigger id="pattern">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="interval">Repeat Every</Label>
                      <Input
                        id="interval"
                        type="number"
                        min="1"
                        value={eventData.recurring.interval}
                        onChange={(e) => handleRecurringChange("interval", Number.parseInt(e.target.value) || 1)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="endAfter">End After (occurrences)</Label>
                      <Input
                        id="endAfter"
                        type="number"
                        min="1"
                        value={eventData.recurring.end_after}
                        onChange={(e) => handleRecurringChange("end_after", Number.parseInt(e.target.value) || 1)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endDate">Or End Date</Label>
                      <DateTimePicker
                        date={eventData.recurring.end_date}
                        setDate={(date) => handleRecurringChange("end_date", date)}
                      />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>Additional event configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={eventData.status} onValueChange={(value) => handleInputChange("status", value)}>
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="visibility">Visibility</Label>
                  <Select
                    value={eventData.visibility}
                    onValueChange={(value) => handleInputChange("visibility", value)}
                  >
                    <SelectTrigger id="visibility">
                      <SelectValue />
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
                <Label htmlFor="color">Event Color</Label>
                <Input
                  id="color"
                  type="color"
                  value={eventData.color}
                  onChange={(e) => handleInputChange("color", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={eventData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="Enter any additional notes"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
