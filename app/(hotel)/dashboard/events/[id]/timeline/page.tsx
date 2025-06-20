"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft,
  Plus,
  Clock,
  User,
  MessageSquare,
  Calendar,
  CheckCircle,
  AlertCircle,
  XCircle,
  Loader2,
  Activity,
} from "lucide-react"
import { format } from "date-fns"
import { useEvents, type Event } from "@/hooks/use-events"
import { toast } from "sonner"

export default function EventTimelinePage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string

  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newEntry, setNewEntry] = useState({
    notes: "",
    status: "no_status", // Updated default value to be a non-empty string
  })

  const { getEventById, addTimelineEntry } = useEvents()

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

  const timeline = event?.timeline || []

  // Sort timeline entries by date (newest first)
  const sortedTimeline = [...timeline].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Handle add timeline entry
  const handleAddEntry = async () => {
    try {
      if (!newEntry.notes.trim()) {
        toast.error("Please enter notes for the timeline entry")
        return
      }

      const updatedEvent = await addTimelineEntry(
        eventId,
        newEntry.notes,
        newEntry.status === "no_status" ? undefined : newEntry.status,
      )
      setEvent(updatedEvent)
      setIsAddDialogOpen(false)
      setNewEntry({ notes: "", status: "no_status" }) // Reset status to default value
      toast.success("Timeline entry added successfully")
    } catch (error) {
      console.error("Failed to add timeline entry:", error)
      toast.error("Failed to add timeline entry")
    }
  }

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "pending":
      case "in_progress":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case "cancelled":
      case "declined":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Activity className="h-4 w-4 text-blue-600" />
    }
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    if (!status) return null

    switch (status.toLowerCase()) {
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>
      case "in_progress":
        return <Badge className="bg-purple-100 text-purple-800">In Progress</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg font-medium">Loading timeline...</p>
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
            <h1 className="text-3xl font-bold tracking-tight">Event Timeline</h1>
            <p className="text-muted-foreground">{event.title}</p>
          </div>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Entry
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Timeline Entry</DialogTitle>
              <DialogDescription>Add a new entry to the event timeline.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status (Optional)</Label>
                <Select value={newEntry.status} onValueChange={(value) => setNewEntry({ ...newEntry, status: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no_status">No status</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newEntry.notes}
                  onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
                  placeholder="Enter timeline notes..."
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddEntry}>Add Entry</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            Event Timeline
          </CardTitle>
          <CardDescription>Track the progress and updates for {event.title}</CardDescription>
        </CardHeader>
        <CardContent>
          {sortedTimeline.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No timeline entries yet.</p>
              <Button variant="outline" className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Entry
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {sortedTimeline.map((entry, index) => (
                <div key={index} className="flex space-x-4">
                  {/* Timeline indicator */}
                  <div className="flex flex-col items-center">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 border-2 border-primary/20">
                      {getStatusIcon(entry.status)}
                    </div>
                    {index < sortedTimeline.length - 1 && <div className="w-px h-16 bg-border mt-2" />}
                  </div>

                  {/* Timeline content */}
                  <div className="flex-1 pb-8">
                    <div className="bg-card border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="/placeholder.svg" />
                            <AvatarFallback>
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">System User</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(entry.date), "MMMM d, yyyy 'at' h:mm a")}
                            </p>
                          </div>
                        </div>
                        {entry.status && getStatusBadge(entry.status)}
                      </div>

                      <div className="flex items-start space-x-2">
                        <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <p className="text-sm leading-relaxed">{entry.notes}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Event Milestones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Event Milestones
          </CardTitle>
          <CardDescription>Key dates and milestones for this event</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-blue-600" />
                <div>
                  <p className="font-medium">Event Created</p>
                  <p className="text-sm text-muted-foreground">
                    {event.createdAt ? format(new Date(event.createdAt), "MMMM d, yyyy 'at' h:mm a") : "Unknown"}
                  </p>
                </div>
              </div>
              <Badge variant="secondary">Created</Badge>
            </div>

            {event.setup && (
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${event.setup.completed ? "bg-green-600" : "bg-yellow-600"}`} />
                  <div>
                    <p className="font-medium">Setup</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(event.setup.start_time), "MMMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                </div>
                <Badge
                  className={event.setup.completed ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
                >
                  {event.setup.completed ? "Completed" : "Pending"}
                </Badge>
              </div>
            )}

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-purple-600" />
                <div>
                  <p className="font-medium">Event Start</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(event.start_date), "MMMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
              </div>
              <Badge className="bg-purple-100 text-purple-800">Scheduled</Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-indigo-600" />
                <div>
                  <p className="font-medium">Event End</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(event.end_date), "MMMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
              </div>
              <Badge className="bg-indigo-100 text-indigo-800">Scheduled</Badge>
            </div>

            {event.teardown && (
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-2 h-2 rounded-full ${event.teardown.completed ? "bg-green-600" : "bg-gray-400"}`}
                  />
                  <div>
                    <p className="font-medium">Teardown</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(event.teardown.start_time), "MMMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                </div>
                <Badge
                  className={event.teardown.completed ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                >
                  {event.teardown.completed ? "Completed" : "Pending"}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
