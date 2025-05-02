"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { useRooms } from "@/hooks/use-rooms"
import { useRoomTypes } from "@/hooks/use-room-types"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft } from "lucide-react"

export default function NewRoomPage() {
  const router = useRouter()
  const { createRoom } = useRooms()
  const { roomTypes, fetchRoomTypes, isLoading: roomTypesLoading } = useRoomTypes()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    roomNumber: "", // Changed from number
    floor: "1",
    roomType: "", // Changed from room_type
    building: "Main Building",
    status: "available",
    is_smoking_allowed: false,
    is_accessible: false,
    has_smart_lock: false,
    amenities: "",
    notes: "",
  })

  // Use useCallback to prevent the function from being recreated on each render
  const loadRoomTypes = useCallback(() => {
    fetchRoomTypes()
  }, [fetchRoomTypes])

  // Call fetchRoomTypes only once when the component mounts
  useEffect(() => {
    loadRoomTypes()
  }, [loadRoomTypes])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name) => (value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name) => (checked) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Process amenities from comma-separated string to array if needed
      const processedData = {
        ...formData,
        amenities: formData.amenities ? formData.amenities.split(",").map((item) => item.trim()) : [],
      }

      const { data, error } = await createRoom(processedData)

      if (data) {
        toast.success("Room created successfully")
        router.push("/dashboard/rooms")
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
          <p className="text-muted-foreground">Create a new room in your hotel inventory</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Room Details</CardTitle>
          <CardDescription>Enter the basic information about this room</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="roomNumber">Room Number *</Label>
                <Input
                  id="roomNumber"
                  name="roomNumber"
                  value={formData.roomNumber}
                  onChange={handleChange}
                  placeholder="e.g. 101"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="roomType">Room Type *</Label>
                <Select value={formData.roomType || "default"} onValueChange={handleSelectChange("roomType")} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select room type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default" disabled>
                      Select a room type
                    </SelectItem>
                    {roomTypesLoading ? (
                      <SelectItem value="loading">Loading room types...</SelectItem>
                    ) : roomTypes.length > 0 ? (
                      roomTypes.map((type) => (
                        <SelectItem key={type._id} value={type._id}>
                          {type.name} ({type.bedConfiguration})
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-types">No room types available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="floor">Floor *</Label>
                <Input
                  id="floor"
                  name="floor"
                  type="text"
                  value={formData.floor}
                  onChange={handleChange}
                  placeholder="e.g. 1"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="building">Building</Label>
                <Input
                  id="building"
                  name="building"
                  value={formData.building}
                  onChange={handleChange}
                  placeholder="e.g. Main Building"
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
              <Label htmlFor="amenities">Amenities (comma-separated)</Label>
              <Input
                id="amenities"
                name="amenities"
                value={formData.amenities}
                onChange={handleChange}
                placeholder="e.g. Wi-Fi, TV, Mini Bar, Safe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
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
