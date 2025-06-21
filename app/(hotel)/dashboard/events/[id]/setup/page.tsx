"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Plus, MoreHorizontal, Package, Trash2, Edit, Search, Loader2, Calculator } from "lucide-react"
import { useEvents, type Event } from "@/hooks/use-events"
import { useEventServices, type EventService } from "@/hooks/use-event-services"
import { toast } from "sonner"

export default function EventServicesPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string

  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<EventService | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState("")

  const { getEventById, addServiceToEvent, removeServiceFromEvent } = useEvents()
  const { services: availableServices, loading: servicesLoading } = useEventServices()

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true)
        const eventData = await getEventById(eventId)
        setEvent(eventData.event)
      } catch (error) {
        console.error("Failed to fetch event:", error)
        toast.error("Failed to load event details")
        router.push("/dashboard/events")
      } finally {
        setLoading(false)
      }
    }

    if (eventId) {
      fetchEvent()
    }
  }, [eventId, getEventById, router])

  const eventServices = event?.services || []

  // Filter available services (exclude already added ones)
  const filteredAvailableServices = availableServices.filter((service) => {
    const isAlreadyAdded = eventServices.some((es) => es.service_id === service._id)
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase())
    return !isAlreadyAdded && matchesSearch
  })

  // Calculate total cost
  const totalCost = eventServices.reduce((total, service) => total + service.total_price, 0)

  // Handle add service
  const handleAddService = async () => {
    try {
      if (!selectedService) {
        toast.error("Please select a service")
        return
      }

      const updatedEvent = await addServiceToEvent(eventId, selectedService._id, quantity, notes)
      setEvent(updatedEvent)
      setIsAddDialogOpen(false)
      setSelectedService(null)
      setQuantity(1)
      setNotes("")
      toast.success("Service added successfully")
    } catch (error) {
      console.error("Failed to add service:", error)
      toast.error("Failed to add service")
    }
  }

  // Handle remove service
  const handleRemoveService = async (serviceId: string) => {
    try {
      const updatedEvent = await removeServiceFromEvent(eventId, serviceId)
      setEvent(updatedEvent)
      toast.success("Service removed successfully")
    } catch (error) {
      console.error("Failed to remove service:", error)
      toast.error("Failed to remove service")
    }
  }

  // Get service details
  const getServiceDetails = (serviceId: string) => {
    return availableServices.find((s) => s._id === serviceId)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg font-medium">Loading services...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Event not found</h2>
          <p className="text-muted-foreground mt-2">The event you're looking for doesn't exist.</p>
          <Button asChild className="mt-4">
            <a href="/dashboard/events">Back to Events</a>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Event Services</h1>
            <p className="text-muted-foreground">{event.title}</p>
          </div>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Service to Event</DialogTitle>
              <DialogDescription>Select a service to add to this event.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search Services</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search services..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {servicesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto border rounded-lg">
                  {filteredAvailableServices.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {availableServices.length === 0 ? "No services available" : "No services match your search"}
                    </div>
                  ) : (
                    <div className="space-y-2 p-2">
                      {filteredAvailableServices.map((service) => (
                        <div
                          key={service._id}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedService?._id === service._id
                              ? "border-primary bg-primary/5"
                              : "hover:border-primary/50"
                          }`}
                          onClick={() => setSelectedService(service)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{service.name}</h4>
                              <p className="text-sm text-muted-foreground">{service.description}</p>
                              <Badge variant="secondary" className="mt-1">
                                {service.category}
                              </Badge>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">${service.price}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {selectedService && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(Number.parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add any special instructions or notes"
                        rows={3}
                      />
                    </div>
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Total Cost:</span>
                        <span className="font-bold text-lg">${(selectedService.price * quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddService} disabled={!selectedService}>
                Add Service
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calculator className="mr-2 h-5 w-5" />
            Services Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{eventServices.length}</div>
              <div className="text-sm text-muted-foreground">Services Added</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {eventServices.reduce((total, service) => total + service.quantity, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Quantity</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">${totalCost.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">Total Cost</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services List */}
      <Card>
        <CardHeader>
          <CardTitle>Event Services</CardTitle>
          <CardDescription>Services added to {event.title}</CardDescription>
        </CardHeader>
        <CardContent>
          {eventServices.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No services added to this event yet.</p>
              <Button variant="outline" className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Service
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Total Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {eventServices.map((service) => {
                    const serviceDetails = getServiceDetails(service.service_id)
                    return (
                      <TableRow key={service.service_id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{serviceDetails?.name || "Unknown Service"}</div>
                            {serviceDetails?.description && (
                              <div className="text-sm text-muted-foreground">{serviceDetails.description}</div>
                            )}
                            {service.notes && <div className="text-sm text-blue-600 mt-1">Note: {service.notes}</div>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{serviceDetails?.category || "Unknown"}</Badge>
                        </TableCell>
                        <TableCell>{service.quantity}</TableCell>
                        <TableCell>${service.unit_price.toFixed(2)}</TableCell>
                        <TableCell className="font-medium">${service.total_price.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              service.status === "confirmed"
                                ? "bg-green-100 text-green-800"
                                : service.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                            }
                          >
                            {service.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Quantity
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Notes
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Remove Service
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Remove Service</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to remove this service from the event? This action cannot be
                                      undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleRemoveService(service.service_id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Remove
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
