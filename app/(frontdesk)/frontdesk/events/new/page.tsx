"use client"

import type React from "react"

import { useState } from "react"
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
import { toast } from "sonner"
import { ArrowLeft, CalendarIcon, Clock, MapPin, Save, Users, Plus } from "lucide-react"
import { addHours, format } from "date-fns"

// Mock data for event types
const eventTypes = [
  { id: "et001", name: "Conference", color: "#3498db" },
  { id: "et002", name: "Wedding", color: "#e74c3c" },
  { id: "et003", name: "Corporate", color: "#2ecc71" },
  { id: "et004", name: "Gala", color: "#9b59b6" },
  { id: "et005", name: "Birthday", color: "#f39c12" },
  { id: "et006", name: "Anniversary", color: "#34495e" },
]

// Mock data for venues
const venues = [
  { id: "v001", name: "Grand Ballroom", capacity: 300 },
  { id: "v002", name: "Garden Terrace", capacity: 150 },
  { id: "v003", name: "Crystal Hall", capacity: 250 },
  { id: "v004", name: "Skyview Lounge", capacity: 80 },
  { id: "v005", name: "Executive Boardroom", capacity: 20 },
]

// Mock data for services
const services = [
  { id: "s001", name: "Catering - Standard", price: 45, category: "Catering" },
  { id: "s002", name: "Catering - Premium", price: 75, category: "Catering" },
  { id: "s003", name: "Audio/Visual Equipment", price: 250, category: "Equipment" },
  { id: "s004", name: "Decoration Package", price: 350, category: "Decoration" },
  { id: "s005", name: "Photography", price: 500, category: "Services" },
  { id: "s006", name: "DJ Services", price: 400, category: "Entertainment" },
  { id: "s007", name: "Valet Parking", price: 200, category: "Services" },
  { id: "s008", name: "Floral Arrangements", price: 300, category: "Decoration" },
]

// Mock data for templates
const templates = [
  { id: "t001", name: "Corporate Meeting", eventType: "et003", description: "Standard corporate meeting setup" },
  { id: "t002", name: "Wedding Reception", eventType: "et002", description: "Elegant wedding reception package" },
  { id: "t003", name: "Birthday Party", eventType: "et005", description: "Fun birthday celebration setup" },
  { id: "t004", name: "Conference", eventType: "et001", description: "Full-day conference with all amenities" },
]

export default function NewEventPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("details")

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
      const selectedType = eventTypes.find((type) => type.id === value)
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
    const template = templates.find((t) => t.id === templateId)
    if (template) {
      setSelectedTemplate(templateId)

      // Pre-fill form with template data
      setEventData({
        ...eventData,
        title: template.name,
        description: template.description,
        eventType: template.eventType,
        color: eventTypes.find((type) => type.id === template.eventType)?.color || "",
      })
    }
  }

  // Calculate total price
  const calculateTotalPrice = () => {
    const selectedServiceItems = services.filter((service) => selectedServices.includes(service.id))
    return selectedServiceItems.reduce((total, service) => total + service.price, 0)
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
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

    // Create event object with selected services
    const eventWithServices = {
      ...eventData,
      services: selectedServices.map((serviceId) => {
        const service = services.find((s) => s.id === serviceId)
        return {
          id: serviceId,
          name: service?.name || "",
          price: service?.price || 0,
        }
      }),
    }

    // In a real app, you would send this to your API
    console.log("Creating event:", eventWithServices)

    toast.success("Event created successfully")
    router.push("/dashboard/events")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">Create New Event</h2>
          <p className="text-muted-foreground">Schedule a new event at your hotel</p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

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
              <CardDescription>Start with a pre-configured event template or create from scratch</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {templates.map((template) => {
                  const eventType = eventTypes.find((type) => type.id === template.eventType)

                  return (
                    <div
                      key={template.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedTemplate === template.id ? "border-primary bg-primary/5" : "hover:border-primary/50"
                      }`}
                      onClick={() => handleTemplateSelect(template.id)}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: eventType?.color || "#ccc" }} />
                        <h3 className="font-medium">{template.name}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                    </div>
                  )
                })}

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
              <CardDescription>Enter the basic information for your event</CardDescription>
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
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: type.color }} />
                            {type.name}
                          </div>
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
                      <SelectValue placeholder="Select venue" />
                    </SelectTrigger>
                    <SelectContent>
                      {venues.map((venue) => (
                        <SelectItem key={venue.id} value={venue.id}>
                          {venue.name} (Capacity: {venue.capacity})
                        </SelectItem>
                      ))}
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
              <CardDescription>Select additional services for your event</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {services.map((service) => (
                  <div key={service.id} className="flex items-start space-x-3 border rounded-lg p-3">
                    <Checkbox
                      id={service.id}
                      checked={selectedServices.includes(service.id)}
                      onCheckedChange={(checked) => handleServiceChange(service.id, !!checked)}
                    />
                    <div className="space-y-1">
                      <Label htmlFor={service.id} className="font-medium cursor-pointer">
                        {service.name}
                      </Label>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">{service.category}</span>
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
              <CardDescription>Assign staff to your event</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border rounded-lg p-6 text-center">
                <div className="flex flex-col items-center justify-center space-y-2">
                  <Users className="h-12 w-12 text-muted-foreground mb-2" />
                  <h3 className="font-medium text-lg">Staff Assignment</h3>
                  <p className="text-muted-foreground">
                    Staff assignment will be available after the event is created.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("services")}>
                Back to Services
              </Button>
              <Button onClick={handleSubmit}>
                <Save className="mr-2 h-4 w-4" />
                Create Event
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="bg-muted/40">
        <CardHeader>
          <CardTitle>Event Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Event Type</p>
                <p className="text-sm text-muted-foreground">
                  {eventData.eventType ? eventTypes.find((t) => t.id === eventData.eventType)?.name : "Not selected"}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Venue</p>
                <p className="text-sm text-muted-foreground">
                  {eventData.venue ? venues.find((v) => v.id === eventData.venue)?.name : "Not selected"}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Date & Time</p>
                <p className="text-sm text-muted-foreground">
                  {eventData.startDate ? format(eventData.startDate, "MMM d, yyyy h:mm a") : "Not set"}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Attendees</p>
                <p className="text-sm text-muted-foreground">
                  {eventData.attendees > 0 ? eventData.attendees : "Not specified"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
