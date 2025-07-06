"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { ArrowLeft, Calendar, Clock, AlertTriangle } from "lucide-react"
import { useHousekeeping } from "@/hooks/use-housekeeping"
import { useRooms } from "@/hooks/use-rooms"
import { useUsers } from "@/hooks/use-users"
import { format } from "date-fns"

export default function NewHousekeepingSchedulePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const roomId = searchParams.get("roomId")

  const { createSchedule, isLoading } = useHousekeeping()
  const { fetchRooms } = useRooms()
  const { fetchUsers } = useUsers()

  const [formData, setFormData] = useState({
    room: roomId || "",
    schedule_date: format(new Date(), "yyyy-MM-dd"),
    assigned_to: "",
    priority: "medium",
    notes: "",
    status: "pending",
    updateRoomStatus: true,
  })

  const [rooms, setRooms] = useState<any[]>([])
  const [staff, setStaff] = useState<any[]>([])
  const [selectedRoom, setSelectedRoom] = useState<any>(null)

  useEffect(() => {
    loadRooms()
    loadStaff()
  }, [])

  useEffect(() => {
    if (formData.room && rooms.length > 0) {
      const room = rooms.find((r) => r._id === formData.room)
      setSelectedRoom(room)
    }
  }, [formData.room, rooms])

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

  const handleInputChange = (field: string, value: any) => {
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

    const result = await createSchedule(formData)
    if (result.data) {
      toast.success("Cleaning schedule created successfully")
      router.push("/frontdesk/housekeeping")
    } else if (result.error) {
      toast.error(result.error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/frontdesk/housekeeping">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Housekeeping
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Schedule Cleaning</h1>
          <p className="text-muted-foreground">Create a new housekeeping schedule</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Schedule Details</CardTitle>
              <CardDescription>Fill in the cleaning schedule information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Room Selection */}
                <div className="space-y-2">
                  <Label htmlFor="room">Room *</Label>
                  <Select value={formData.room} onValueChange={(value) => handleInputChange("room", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a room" />
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
                      <SelectValue placeholder="Select staff member" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {staff.map((member) => (
                        <SelectItem key={member._id} value={member._id}>
                          {member.full_name}
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
                      <SelectItem value="low">
                        <span className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          Low Priority
                        </span>
                      </SelectItem>
                      <SelectItem value="medium">
                        <span className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                          Medium Priority
                        </span>
                      </SelectItem>
                      <SelectItem value="high">
                        <span className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                          High Priority
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any special instructions or notes..."
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
                      onCheckedChange={(checked) => handleInputChange("updateRoomStatus", checked)}
                    />
                    <Label htmlFor="updateRoomStatus" className="text-sm">
                      Update room status to "Cleaning" when schedule is created
                    </Label>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-4 pt-4">
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

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Selected Room Info */}
          {selectedRoom && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Room Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium">Room {selectedRoom.number}</h3>
                  <p className="text-sm text-muted-foreground">
                    Floor {selectedRoom.floor} • {selectedRoom.building}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Current Status</Label>
                  <p className="text-sm font-medium">{selectedRoom.status}</p>
                </div>
                {selectedRoom.roomType && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Room Type</Label>
                    <p className="text-sm">{selectedRoom.roomType.name}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Priority Guide */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Priority Guide
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div>
                  <p className="text-sm font-medium">High Priority</p>
                  <p className="text-xs text-muted-foreground">Urgent cleaning needed</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <div>
                  <p className="text-sm font-medium">Medium Priority</p>
                  <p className="text-xs text-muted-foreground">Standard cleaning</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <div>
                  <p className="text-sm font-medium">Low Priority</p>
                  <p className="text-xs text-muted-foreground">Routine maintenance</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Quick Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Assign staff for immediate scheduling</p>
              <p>• Leave unassigned for later assignment</p>
              <p>• High priority tasks appear first</p>
              <p>• Room status updates automatically</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
