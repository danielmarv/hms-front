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
import { toast } from "sonner"
import { ArrowLeft, Calendar, Clock, User, AlertTriangle } from "lucide-react"
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
    const roomsData = await fetchRooms({ limit: 200 })
    const roomsList = Array.isArray(roomsData) ? roomsData : roomsData?.data || []
    setRooms(roomsList)
  }

  const loadStaff = async () => {
    const staffData = await fetchUsers({ department: "housekeeping", limit: 100 })
    const staffList = Array.isArray(staffData) ? staffData : staffData?.data || []
    setStaff(staffList)
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
      ...(formData.assigned_to && { assigned_to: formData.assigned_to }),
    }

    const result = await createSchedule(scheduleData)

    if (result.data) {
      toast.success("Housekeeping schedule created successfully")
      router.push("/frontdesk/housekeeping")
    } else if (result.error) {
      toast.error(result.error)
    }
  }

  const getSelectedRoom = () => {
    return rooms.find((room) => room._id === formData.room)
  }

  const getSelectedStaff = () => {
    return staff.find((member) => member._id === formData.assigned_to)
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
                            <span>Room {room.number}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              Floor {room.floor} • {room.status}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                          {member.full_name} - {member.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Priority */}
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Priority</SelectItem>
                      <SelectItem value="medium">Medium Priority</SelectItem>
                      <SelectItem value="high">High Priority</SelectItem>
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
                  <Calendar className="h-5 w-5" />
                  Room Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const selectedRoom = getSelectedRoom()
                  return selectedRoom ? (
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium">Room {selectedRoom.number}</p>
                        <p className="text-xs text-muted-foreground">
                          Floor {selectedRoom.floor} • {selectedRoom.building}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Current Status</p>
                        <p className="text-sm font-medium capitalize">{selectedRoom.status}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Room Type</p>
                        <p className="text-sm font-medium">{selectedRoom.room_type?.name || "Standard"}</p>
                      </div>
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
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Scheduled Date</p>
                  <p className="text-sm font-medium">
                    {formData.schedule_date
                      ? format(new Date(formData.schedule_date), "MMMM dd, yyyy")
                      : "Not selected"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Priority Level</p>
                  <div className="flex items-center gap-2">
                    {formData.priority === "high" && <AlertTriangle className="h-4 w-4 text-red-500" />}
                    <p className="text-sm font-medium capitalize">{formData.priority}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Assigned Staff</p>
                  <p className="text-sm font-medium">
                    {(() => {
                      const selectedStaff = getSelectedStaff()
                      return selectedStaff ? selectedStaff.full_name : "Unassigned"
                    })()}
                  </p>
                </div>
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
