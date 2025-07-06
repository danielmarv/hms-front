"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { ArrowLeft, Calendar, Clock, User, AlertTriangle, MapPin, Bed } from "lucide-react"
import Link from "next/link"
import { useHousekeeping } from "@/hooks/use-housekeeping"
import { useRooms } from "@/hooks/use-rooms"
import { useUsers } from "@/hooks/use-users"
import { format } from "date-fns"

export default function NewHousekeepingSchedulePage() {
  const router = useRouter()
  const { createSchedule, isLoading } = useHousekeeping()
  const { fetchRooms } = useRooms()
  const { fetchUsers } = useUsers()

  const [rooms, setRooms] = useState<any[]>([])
  const [staff, setStaff] = useState<any[]>([])
  const [formData, setFormData] = useState({
    room: "",
    schedule_date: format(new Date(), "yyyy-MM-dd"),
    assigned_to: "",
    priority: "medium",
    notes: "",
    updateRoomStatus: true,
  })

  useEffect(() => {
    loadRooms()
    loadStaff()
  }, [])

  const loadRooms = async () => {
    try {
      const roomsData = await fetchRooms({ limit: 200 })
      console.log("Rooms data:", roomsData)

      // Handle the response structure you provided
      let roomsList = []
      if (roomsData?.data && Array.isArray(roomsData.data)) {
        roomsList = roomsData.data
      } else if (Array.isArray(roomsData)) {
        roomsList = roomsData
      }

      setRooms(roomsList)
    } catch (error) {
      console.error("Error loading rooms:", error)
      toast.error("Failed to load rooms")
    }
  }

  const loadStaff = async () => {
    try {
      const staffData = await fetchUsers({ department: "housekeeping", limit: 100 })
      console.log("Staff data:", staffData)

      let staffList = []
      if (staffData?.data && Array.isArray(staffData.data)) {
        staffList = staffData.data
      } else if (Array.isArray(staffData)) {
        staffList = staffData
      }

      setStaff(staffList)
    } catch (error) {
      console.error("Error loading staff:", error)
      toast.error("Failed to load staff")
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.room) {
      toast.error("Please select a room")
      return
    }

    if (!formData.schedule_date) {
      toast.error("Please select a date")
      return
    }

    const scheduleData = {
      room: formData.room,
      schedule_date: formData.schedule_date,
      priority: formData.priority,
      notes: formData.notes,
      updateRoomStatus: formData.updateRoomStatus,
      ...(formData.assigned_to && formData.assigned_to !== "unassigned" && { assigned_to: formData.assigned_to }),
    }

    try {
      const result = await createSchedule(scheduleData)
      if (result.data) {
        toast.success("Housekeeping schedule created successfully")
        router.push("/frontdesk/housekeeping")
      } else if (result.error) {
        toast.error(result.error)
      }
    } catch (error) {
      console.error("Error creating schedule:", error)
      toast.error("Failed to create schedule")
    }
  }

  const getSelectedRoom = () => {
    return rooms.find((room) => room._id === formData.room)
  }

  const getSelectedStaff = () => {
    return staff.find((member) => member._id === formData.assigned_to)
  }

  const getRoomStatusBadge = (status: string) => {
    const variants = {
      available: "bg-green-100 text-green-800",
      occupied: "bg-red-100 text-red-800",
      cleaning: "bg-blue-100 text-blue-800",
      maintenance: "bg-orange-100 text-orange-800",
      out_of_order: "bg-gray-100 text-gray-800",
    }

    return (
      <Badge variant="outline" className={variants[status as keyof typeof variants] || variants.available}>
        {status?.replace("_", " ").toUpperCase()}
      </Badge>
    )
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: "text-red-600",
      medium: "text-orange-600",
      low: "text-green-600",
    }
    return colors[priority as keyof typeof colors] || colors.medium
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/frontdesk/housekeeping">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Schedule Cleaning</h1>
          <p className="text-muted-foreground">Create a new housekeeping schedule for room cleaning</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Schedule Details</CardTitle>
              <CardDescription>Fill in the details for the cleaning schedule</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Room Selection */}
                <div className="space-y-2">
                  <Label htmlFor="room">Room *</Label>
                  <Select value={formData.room} onValueChange={(value) => handleInputChange("room", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a room to clean" />
                    </SelectTrigger>
                    <SelectContent>
                      {rooms.map((room) => (
                        <SelectItem key={room._id} value={room._id}>
                          <div className="flex items-center justify-between w-full">
                            <span>Room {room.roomNumber}</span>
                            <div className="flex items-center gap-2 ml-2">
                              <span className="text-xs text-muted-foreground">Floor {room.floor}</span>
                              {getRoomStatusBadge(room.status)}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {rooms.length === 0 && (
                    <p className="text-sm text-muted-foreground">No rooms available. Please check your room data.</p>
                  )}
                </div>

                {/* Date Selection */}
                <div className="space-y-2">
                  <Label htmlFor="schedule_date">Schedule Date *</Label>
                  <Input
                    id="schedule_date"
                    type="date"
                    value={formData.schedule_date}
                    onChange={(e) => handleInputChange("schedule_date", e.target.value)}
                    min={format(new Date(), "yyyy-MM-dd")}
                    required
                  />
                </div>

                {/* Staff Assignment */}
                <div className="space-y-2">
                  <Label htmlFor="assigned_to">Assign to Staff (Optional)</Label>
                  <Select
                    value={formData.assigned_to}
                    onValueChange={(value) => handleInputChange("assigned_to", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select staff member (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Leave Unassigned</SelectItem>
                      {staff.map((member) => (
                        <SelectItem key={member._id} value={member._id}>
                          <div className="flex flex-col">
                            <span>{member.full_name}</span>
                            <span className="text-xs text-muted-foreground">{member.email}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {staff.length === 0 && <p className="text-sm text-muted-foreground">No housekeeping staff found.</p>}
                </div>

                {/* Priority */}
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          Low Priority
                        </div>
                      </SelectItem>
                      <SelectItem value="medium">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                          Medium Priority
                        </div>
                      </SelectItem>
                      <SelectItem value="high">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                          High Priority
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Special Instructions</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any special cleaning instructions or notes..."
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Options */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="updateRoomStatus"
                      checked={formData.updateRoomStatus}
                      onCheckedChange={(checked) => handleInputChange("updateRoomStatus", checked as boolean)}
                    />
                    <Label htmlFor="updateRoomStatus" className="text-sm">
                      Update room status to "cleaning" when schedule is created
                    </Label>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-6">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Creating..." : "Create Schedule"}
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link href="/frontdesk/housekeeping">Cancel</Link>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel */}
        <div className="space-y-6">
          {/* Selected Room Info */}
          {formData.room && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bed className="h-5 w-5" />
                  Room Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const selectedRoom = getSelectedRoom()
                  return selectedRoom ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <MapPin className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Room {selectedRoom.roomNumber}</p>
                          <p className="text-sm text-muted-foreground">Floor {selectedRoom.floor}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Current Status</p>
                          <div className="mt-1">{getRoomStatusBadge(selectedRoom.status)}</div>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Room Type</p>
                          <p className="text-sm font-medium mt-1">{selectedRoom.roomType?.name || "Standard"}</p>
                        </div>
                      </div>

                      {selectedRoom.roomType?.basePrice && (
                        <div>
                          <p className="text-xs text-muted-foreground">Base Price</p>
                          <p className="text-sm font-medium">${selectedRoom.roomType.basePrice}</p>
                        </div>
                      )}

                      {selectedRoom.amenities && selectedRoom.amenities.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground">Amenities</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedRoom.amenities.map((amenity: string, index: number) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {amenity}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedRoom.lastCleaned && (
                        <div>
                          <p className="text-xs text-muted-foreground">Last Cleaned</p>
                          <p className="text-sm font-medium">
                            {format(new Date(selectedRoom.lastCleaned), "MMM dd, yyyy")}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : null
                })()}
              </CardContent>
            </Card>
          )}

          {/* Schedule Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Schedule Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {formData.schedule_date
                        ? format(new Date(formData.schedule_date), "MMMM dd, yyyy")
                        : "Not selected"}
                    </p>
                    <p className="text-xs text-muted-foreground">Scheduled Date</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <AlertTriangle className={`h-4 w-4 ${getPriorityColor(formData.priority)}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium capitalize">{formData.priority} Priority</p>
                    <p className="text-xs text-muted-foreground">Cleaning Priority</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {(() => {
                        const selectedStaff = getSelectedStaff()
                        return selectedStaff ? selectedStaff.full_name : "Unassigned"
                      })()}
                    </p>
                    <p className="text-xs text-muted-foreground">Assigned Staff</p>
                  </div>
                </div>

                {formData.notes && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Special Instructions:</p>
                    <p className="text-sm">{formData.notes}</p>
                  </div>
                )}

                {formData.updateRoomStatus && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      ✓ Room status will be updated to "cleaning" when this schedule is created
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• High priority schedules will be highlighted for staff</p>
                <p>• Unassigned schedules can be picked up by any housekeeping staff</p>
                <p>• Room status will automatically update when cleaning starts</p>
                <p>• Add special instructions for specific cleaning requirements</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
