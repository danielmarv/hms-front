"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Plus,
  MoreHorizontal,
  Mail,
  Phone,
  User,
  Users,
  UserCheck,
  UserX,
  Clock,
  Search,
  Download,
  Upload,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
} from "lucide-react"
import { format } from "date-fns"
import { useEvents, type Event, type EventAttendee } from "@/hooks/use-events"
import { toast } from "sonner"

export default function EventAttendeesPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string

  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedAttendee, setSelectedAttendee] = useState<EventAttendee | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  const [newAttendee, setNewAttendee] = useState({
    name: "",
    email: "",
    phone: "",
    type: "guest" as const,
    status: "pending" as const,
  })

  const { getEventById, addAttendee, removeAttendee, updateAttendeeStatus } = useEvents()

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

  const attendees = event?.attendees?.list || []

  // Filter attendees
  const filteredAttendees = attendees.filter((attendee) => {
    const matchesSearch =
      attendee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attendee.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || attendee.status === statusFilter
    const matchesType = typeFilter === "all" || attendee.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="w-3 h-3 mr-1" />
            Confirmed
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <AlertCircle className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
      case "declined":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <XCircle className="w-3 h-3 mr-1" />
            Declined
          </Badge>
        )
      case "no_show":
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            <XCircle className="w-3 h-3 mr-1" />
            No Show
          </Badge>
        )
      default:
        return <Badge>{status}</Badge>
    }
  }

  // Get type badge
  const getTypeBadge = (type: string) => {
    switch (type) {
      case "vip":
        return <Badge className="bg-purple-100 text-purple-800">VIP</Badge>
      case "staff":
        return <Badge className="bg-blue-100 text-blue-800">Staff</Badge>
      case "vendor":
        return <Badge className="bg-orange-100 text-orange-800">Vendor</Badge>
      default:
        return <Badge variant="secondary">Guest</Badge>
    }
  }

  // Handle add attendee
  const handleAddAttendee = async () => {
    try {
      if (!newAttendee.name || !newAttendee.email) {
        toast.error("Name and email are required")
        return
      }

      const updatedEvent = await addAttendee(eventId, newAttendee)
      setEvent(updatedEvent)
      setIsAddDialogOpen(false)
      setNewAttendee({
        name: "",
        email: "",
        phone: "",
        type: "guest",
        status: "pending",
      })
      toast.success("Attendee added successfully")
    } catch (error) {
      console.error("Failed to add attendee:", error)
      toast.error("Failed to add attendee")
    }
  }

  // Handle remove attendee
  const handleRemoveAttendee = async (attendeeId: string) => {
    try {
      const updatedEvent = await removeAttendee(eventId, attendeeId)
      setEvent(updatedEvent)
      toast.success("Attendee removed successfully")
    } catch (error) {
      console.error("Failed to remove attendee:", error)
      toast.error("Failed to remove attendee")
    }
  }

  // Handle status update
  const handleStatusUpdate = async (attendeeId: string, status: string) => {
    try {
      const updatedEvent = await updateAttendeeStatus(eventId, attendeeId, status)
      setEvent(updatedEvent)
      toast.success("Attendee status updated successfully")
    } catch (error) {
      console.error("Failed to update attendee status:", error)
      toast.error("Failed to update attendee status")
    }
  }

  // Calculate statistics
  const stats = {
    total: attendees.length,
    confirmed: attendees.filter((a) => a.status === "confirmed").length,
    pending: attendees.filter((a) => a.status === "pending").length,
    declined: attendees.filter((a) => a.status === "declined").length,
    noShow: attendees.filter((a) => a.status === "no_show").length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg font-medium">Loading attendees...</p>
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
            <h1 className="text-3xl font-bold tracking-tight">Event Attendees</h1>
            <p className="text-muted-foreground">{event.title}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Attendee
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Attendee</DialogTitle>
                <DialogDescription>Add a new attendee to this event.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newAttendee.name}
                    onChange={(e) => setNewAttendee({ ...newAttendee, name: e.target.value })}
                    placeholder="Enter attendee name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newAttendee.email}
                    onChange={(e) => setNewAttendee({ ...newAttendee, email: e.target.value })}
                    placeholder="Enter email address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (Optional)</Label>
                  <Input
                    id="phone"
                    value={newAttendee.phone}
                    onChange={(e) => setNewAttendee({ ...newAttendee, phone: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={newAttendee.type}
                      onValueChange={(value: any) => setNewAttendee({ ...newAttendee, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="guest">Guest</SelectItem>
                        <SelectItem value="vip">VIP</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="vendor">Vendor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={newAttendee.status}
                      onValueChange={(value: any) => setNewAttendee({ ...newAttendee, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="declined">Declined</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddAttendee}>Add Attendee</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <UserCheck className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Confirmed</p>
                <p className="text-2xl font-bold">{stats.confirmed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <UserX className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Declined</p>
                <p className="text-2xl font-bold">{stats.declined}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-gray-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">No Show</p>
                <p className="text-2xl font-bold">{stats.noShow}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Attendee Management</CardTitle>
          <CardDescription>Manage attendees for {event.title}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 md:items-end">
            <div className="flex-1">
              <Label htmlFor="search">Search Attendees</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Label htmlFor="status-filter">Filter by Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                  <SelectItem value="no_show">No Show</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <Label htmlFor="type-filter">Filter by Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="guest">Guest</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="vendor">Vendor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Attendees Table */}
          {filteredAttendees.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {attendees.length === 0 ? "No attendees added yet." : "No attendees match your filters."}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Attendee</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAttendees.map((attendee) => (
                    <TableRow key={attendee._id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src="/placeholder.svg" />
                            <AvatarFallback>
                              {attendee.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{attendee.name}</div>
                            <div className="text-sm text-muted-foreground">{attendee.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Mail className="h-3 w-3 mr-1" />
                            {attendee.email}
                          </div>
                          {attendee.phone && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Phone className="h-3 w-3 mr-1" />
                              {attendee.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getTypeBadge(attendee.type)}</TableCell>
                      <TableCell>{getStatusBadge(attendee.status)}</TableCell>
                      <TableCell>
                        <div className="text-sm">{format(new Date(attendee.added_date), "MMM d, yyyy")}</div>
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
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedAttendee(attendee)
                                setIsViewDialogOpen(true)
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => handleStatusUpdate(attendee._id, "confirmed")}
                              disabled={attendee.status === "confirmed"}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Mark Confirmed
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleStatusUpdate(attendee._id, "pending")}
                              disabled={attendee.status === "pending"}
                            >
                              <Clock className="mr-2 h-4 w-4" />
                              Mark Pending
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleStatusUpdate(attendee._id, "declined")}
                              disabled={attendee.status === "declined"}
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Mark Declined
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleStatusUpdate(attendee._id, "no_show")}
                              disabled={attendee.status === "no_show"}
                            >
                              <UserX className="mr-2 h-4 w-4" />
                              Mark No Show
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                                  <UserX className="mr-2 h-4 w-4" />
                                  Remove Attendee
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remove Attendee</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to remove {attendee.name} from this event? This action cannot
                                    be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleRemoveAttendee(attendee._id)}
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
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Attendee Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Attendee Details</DialogTitle>
          </DialogHeader>
          {selectedAttendee && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="text-lg">
                    {selectedAttendee.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{selectedAttendee.name}</h3>
                  <div className="flex items-center space-x-2">
                    {getTypeBadge(selectedAttendee.type)}
                    {getStatusBadge(selectedAttendee.status)}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{selectedAttendee.email}</span>
                </div>
                {selectedAttendee.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedAttendee.phone}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Added by {selectedAttendee.added_by}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Added on {format(new Date(selectedAttendee.added_date), "MMMM d, yyyy 'at' h:mm a")}
                  </span>
                </div>
                {selectedAttendee.status_updated_date && (
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Status updated on{" "}
                      {format(new Date(selectedAttendee.status_updated_date), "MMMM d, yyyy 'at' h:mm a")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
