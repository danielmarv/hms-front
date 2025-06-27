"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
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
import { toast } from "sonner"
import { ArrowLeft, Edit, Trash2, CheckCircle, XCircle, AlertTriangle, Clock, Plus } from "lucide-react"
import { useRooms } from "@/hooks/use-rooms"
import { useHousekeeping } from "@/hooks/use-housekeeping"
import { useMaintenance } from "@/hooks/use-maintenance"

export default function RoomDetailPage() {
  const params = useParams()
  const router = useRouter()
  const roomId = params.id as string

  const { fetchRoomById, updateRoomStatus, deleteRoom } = useRooms()
  const [room, setRoom] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("details")

  const { fetchSchedules } = useHousekeeping()
  const { fetchRequests } = useMaintenance()
  const [housekeepingSchedules, setHousekeepingSchedules] = useState([])
  const [maintenanceRequests, setMaintenanceRequests] = useState([])

  useEffect(() => {
    const loadRoomData = async () => {
      setIsLoading(true)
      const roomData = await fetchRoomById(roomId)
      if (roomData) {
        setRoom(roomData)

        // Load related housekeeping schedules
        const schedules = await fetchSchedules({ room: roomId, limit: 5 })
        setHousekeepingSchedules(schedules || [])

        // Load related maintenance requests
        const requests = await fetchRequests({ room: roomId, limit: 5 })
        setMaintenanceRequests(requests || [])
      } else {
        toast.error("Room not found")
        router.push("/dashboard/rooms")
      }
      setIsLoading(false)
    }

    loadRoomData()
  }, [roomId])

  const handleStatusChange = async (newStatus) => {
    const result = await updateRoomStatus(roomId, newStatus)
    if (result.data) {
      setRoom({ ...room, status: newStatus })
      toast.success(`Room status updated to ${newStatus}`)
    }
  }

  const handleDeleteRoom = async () => {
    const result = await deleteRoom(roomId)
    if (result.success) {
      toast.success("Room deleted successfully")
      router.push("/dashboard/rooms")
    }
  }

  // Function to get badge variant based on status
  const getStatusBadge = (status) => {
    switch (status) {
      case "available":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="mr-1 h-3 w-3" /> Available
          </Badge>
        )
      case "occupied":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Clock className="mr-1 h-3 w-3" /> Occupied
          </Badge>
        )
      case "maintenance":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <AlertTriangle className="mr-1 h-3 w-3" /> Maintenance
          </Badge>
        )
      case "cleaning":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            <Clock className="mr-1 h-3 w-3" /> Cleaningg
          </Badge>
        )
      case "reserved":
        return (
          <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
            <Clock className="mr-1 h-3 w-3" /> Reserved
          </Badge>
        )
      case "out_of_order":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="mr-1 h-3 w-3" /> Out of Order
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" className="mr-2" asChild>
            <Link href="/dashboard/rooms">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <Skeleton className="h-8 w-48" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <h2 className="text-2xl font-bold mb-2">Room Not Found</h2>
        <p className="text-muted-foreground mb-4">The room you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <Link href="/dashboard/rooms">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Rooms
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" className="mr-2" asChild>
            <Link href="/dashboard/rooms">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Room {room.roomNumber}</h1>
            <p className="text-muted-foreground">
              {room.roomType?.name || "No room type"} • Floor {room.floor} • {room.building}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/rooms/${roomId}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete Room {room.roomNumber} and remove its data
                  from the server.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteRoom}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-flex">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="housekeeping">Housekeeping</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Room Information</CardTitle>
              <CardDescription>View and manage room details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                    <div className="mt-1">{getStatusBadge(room.status)}</div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Room Type</h3>
                    <p className="mt-1">{room.roomType?.name || "N/A"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Price per Night</h3>
                    <p className="mt-1">${room.roomType?.basePice || room.roomType?.basePrice || "N/A"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Location</h3>
                    <p className="mt-1">
                      Floor {room.floor}, {room.building}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Features</h3>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {room.is_smoking_allowed && <Badge variant="secondary">Smoking Allowed</Badge>}
                      {room.is_accessible && <Badge variant="secondary">Accessible</Badge>}
                      {room.has_smart_lock && <Badge variant="secondary">Smart Lock</Badge>}
                      {room.view && <Badge variant="secondary">{room.view} View</Badge>}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Amenities</h3>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {room.amenities && room.amenities.length > 0 ? (
                        room.amenities.map((amenity, index) => (
                          <Badge key={index} variant="outline">
                            {amenity}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No amenities listed</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Connected Rooms</h3>
                    <div className="mt-1">
                      {room.connected_rooms && room.connected_rooms.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {room.connected_rooms.map((connectedRoom) => (
                            <Badge key={connectedRoom._id} variant="outline">
                              Room {connectedRoom.number} ({connectedRoom.status})
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No connected rooms</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Change Status</h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={room.status === "available" ? "default" : "outline"}
                    onClick={() => handleStatusChange("available")}
                  >
                    Available
                  </Button>
                  <Button
                    size="sm"
                    variant={room.status === "occupied" ? "default" : "outline"}
                    onClick={() => handleStatusChange("occupied")}
                  >
                    Occupied
                  </Button>
                  <Button
                    size="sm"
                    variant={room.status === "maintenance" ? "default" : "outline"}
                    onClick={() => handleStatusChange("maintenance")}
                  >
                    Maintenance
                  </Button>
                  <Button
                    size="sm"
                    variant={room.status === "cleaning" ? "default" : "outline"}
                    onClick={() => handleStatusChange("cleaning")}
                  >
                    Cleaning
                  </Button>
                  <Button
                    size="sm"
                    variant={room.status === "reserved" ? "default" : "outline"}
                    onClick={() => handleStatusChange("reserved")}
                  >
                    Reserved
                  </Button>
                  <Button
                    size="sm"
                    variant={room.status === "out_of_order" ? "default" : "outline"}
                    onClick={() => handleStatusChange("out_of_order")}
                  >
                    Out of Order
                  </Button>
                </div>
              </div>

              {room.notes && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
                  <p className="mt-1 text-sm">{room.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="housekeeping" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Housekeeping History</CardTitle>
                <CardDescription>Recent housekeeping schedules for this room</CardDescription>
              </div>
              <Button asChild>
                <Link href={`/dashboard/housekeeping/new?roomId=${roomId}`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Schedule Cleaning
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {housekeepingSchedules.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No housekeeping schedules found for this room.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {housekeepingSchedules.map((schedule) => (
                    <div key={schedule._id} className="border rounded-md p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{new Date(schedule.schedule_date).toLocaleDateString()}</p>
                          <p className="text-sm text-muted-foreground">
                            {schedule.assigned_to ? `Assigned to: ${schedule.assigned_to.name}` : "Unassigned"}
                          </p>
                        </div>
                        <Badge
                          variant={
                            schedule.status === "completed"
                              ? "outline"
                              : schedule.status === "in_progress"
                                ? "secondary"
                                : "default"
                          }
                        >
                          {schedule.status.replace("_", " ")}
                        </Badge>
                      </div>
                      {schedule.notes && <p className="text-sm mt-2">{schedule.notes}</p>}
                    </div>
                  ))}
                  <div className="text-center pt-2">
                    <Button variant="link" asChild>
                      <Link href={`/dashboard/housekeeping?room=${roomId}`}>View All Housekeeping Records</Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Maintenance Requests</CardTitle>
                <CardDescription>Maintenance history and current issues</CardDescription>
              </div>
              <Button asChild>
                <Link href={`/dashboard/maintenance/new?roomId=${roomId}`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Report Issue
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {maintenanceRequests.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No maintenance requests found for this room.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {maintenanceRequests.map((request) => (
                    <div key={request._id} className="border rounded-md p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{request.title}</p>
                          <p className="text-sm text-muted-foreground">
                            Reported on {new Date(request.createdAt).toLocaleDateString()} by{" "}
                            {request.reported_by?.name || "Unknown"}
                          </p>
                        </div>
                        <Badge
                          variant={
                            request.status === "resolved"
                              ? "outline"
                              : request.status === "in_progress"
                                ? "secondary"
                                : request.status === "pending"
                                  ? "default"
                                  : "destructive"
                          }
                        >
                          {request.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <p className="text-sm mt-2">{request.description}</p>
                      {request.status === "resolved" && request.resolved_at && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Resolved on {new Date(request.resolved_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                  <div className="text-center pt-2">
                    <Button variant="link" asChild>
                      <Link href={`/dashboard/maintenance?room=${roomId}`}>View All Maintenance Records</Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
