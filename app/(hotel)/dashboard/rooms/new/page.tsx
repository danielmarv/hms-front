"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"
import { useRooms } from "@/hooks/use-rooms"
import { useRoomTypes } from "@/hooks/use-room-types"

export default function NewRoomPage() {
  const router = useRouter()
  const { createRoom } = useRooms()
  const { roomTypes, fetchRoomTypes, isLoading: isLoadingRoomTypes } = useRoomTypes()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    number: "",
    floor: "",
    building: "Main Building",
    room_type: "",
    status: "available",
    view: "",
    is_smoking_allowed: false,
    is_accessible: false,
    has_smart_lock: false,
    amenities: "",
    notes: "",
  })

  useEffect(() => {
    fetchRoomTypes()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name) => (checked) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSelectChange = (name) => (value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Process amenities from comma-separated string to array
      const processedData = {
        ...formData,
        amenities: formData.amenities ? formData.amenities.split(",").map((item) => item.trim()) : [],
      }

      const { data, error } = await createRoom(processedData)

      if (data) {
        toast.success("Room created successfully")
        router.push(`/dashboard/rooms/${data._id}`)
      } else {
        toast.error(`Failed to create room: ${error}`)
      }
    } catch (error) {
      toast.error(`An error occurred: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="sm" className="mr-2" asChild>
          <Link href="/dashboard/rooms">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Room</h1>
          <p className="text-muted-foreground">Create a new room in your hotel</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Room Details</CardTitle>
          <CardDescription>Enter the basic information about the room</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="number">Room Number *</Label>
                <Input
                  id="number"
                  name="number"
                  value={formData.number}
                  onChange={handleChange}
                  placeholder="e.g. 101"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="room_type">Room Type *</Label>
                <Select value={formData.room_type} onValueChange={handleSelectChange("room_type")} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select room type" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingRoomTypes ? (
                      <SelectItem value="" disabled>
                        Loading room types...
                      </SelectItem>
                    ) : roomTypes.length === 0 ? (
                      <SelectItem value="" disabled>
                        No room types available
                      </SelectItem>
                    ) : (
                      roomTypes.map((type) => (
                        <SelectItem key={type._id} value={type._id}>
                          {type.name} (${type.base_price}/night)
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="floor">Floor *</Label>
                <Input
                  id="floor"
                  name="floor"
                  value={formData.floor}
                  onChange={handleChange}
                  placeholder="e.g. 1"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="building">Building *</Label>
                <Input
                  id="building"
                  name="building"
                  value={formData.building}
                  onChange={handleChange}
                  placeholder="e.g. Main Building"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select value={formData.status} onValueChange={handleSelectChange("status")} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="occupied">Occupied</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="cleaning">Cleaning</SelectItem>
                    <SelectItem value="reserved">Reserved</SelectItem>
                    <SelectItem value="out_of_order">Out of Order</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="view">View (Optional)</Label>
                <Input
                  id="view"
                  name="view"
                  value={formData.view}
                  onChange={handleChange}
                  placeholder="e.g. Ocean, Garden, City"
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Features</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_smoking_allowed"
                    checked={formData.is_smoking_allowed}
                    onCheckedChange={handleSwitchChange("is_smoking_allowed")}
                  />
                  <Label htmlFor="is_smoking_allowed">Smoking Allowed</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_accessible"
                    checked={formData.is_accessible}
                    onCheckedChange={handleSwitchChange("is_accessible")}
                  />
                  <Label htmlFor="is_accessible">Accessible</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="has_smart_lock"
                    checked={formData.has_smart_lock}
                    onCheckedChange={handleSwitchChange("has_smart_lock")}
                  />
                  <Label htmlFor="has_smart_lock">Smart Lock</Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amenities">Amenities (Optional, comma-separated)</Label>
              <Input
                id="amenities"
                name="amenities"
                value={formData.amenities}
                onChange={handleChange}
                placeholder="e.g. Wi-Fi, TV, Mini Bar, Safe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any additional information about this room"
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" type="button" asChild>
                <Link href="/dashboard/rooms">Cancel</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Room"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
