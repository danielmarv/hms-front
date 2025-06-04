"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, CalendarIcon, Save } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useHousekeeping } from "@/hooks/use-housekeeping"
import { useRooms } from "@/hooks/use-rooms"
import { useUsers } from "@/hooks/use-users"
import { toast } from "sonner"

interface User {
  _id: string
  full_name: string
}

interface Room {
  _id: string
  number: string
  floor: string
  building: string
}

export default function NewHousekeepingSchedulePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [date, setDate] = useState<Date>(new Date())
  const [updateRoomStatus, setUpdateRoomStatus] = useState(true)
  const [formData, setFormData] = useState({
    room: "",
    assigned_to: "",
    priority: "medium",
    notes: "",
  })

  const { createSchedule } = useHousekeeping()
  const { rooms, fetchRooms } = useRooms()
  const { users, fetchUsers } = useUsers()

  useEffect(() => {
    fetchRooms({ status: "available" })
    fetchUsers({ role: "housekeeping" })
  }, [fetchRooms, fetchUsers])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.room) {
      toast.error("Please select a room")
      return
    }

    setIsLoading(true)
    try {
      const { data, error } = await createSchedule({
        ...formData,
        schedule_date: date.toISOString(),
        status: "pending",
        updateRoomStatus,
      })

      if (error) {
        toast.error("Failed to create schedule")
      } else {
        toast.success("Schedule created successfully")
        router.push("/dashboard/housekeeping")
      }
    } catch (error) {
      toast.error("Failed to create schedule")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Housekeeping Schedule</h1>
          <p className="text-muted-foreground">Create a new cleaning schedule for a room</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Schedule Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="room">Room *</Label>
                <Select value={formData.room} onValueChange={(value) => setFormData({ ...formData, room: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a room" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map((room: Room) => (
                      <SelectItem key={room._id} value={room._id}>
                        {room.number} - Floor {room.floor} ({room.building})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assigned_to">Assign To</Label>
                <Select
                  value={formData.assigned_to}
                  onValueChange={(value) => setFormData({ ...formData, assigned_to: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select housekeeper (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Unassigned</SelectItem>
                    {users.map((user: User) => (
                      <SelectItem key={user._id} value={user._id}>
                        {user.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Schedule Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={date} onSelect={(date) => date && setDate(date)} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add any special instructions or notes..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="updateRoomStatus" checked={updateRoomStatus} onCheckedChange={setUpdateRoomStatus} />
              <Label htmlFor="updateRoomStatus">Update room status to "Cleaning"</Label>
            </div>

            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? "Creating..." : "Create Schedule"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
