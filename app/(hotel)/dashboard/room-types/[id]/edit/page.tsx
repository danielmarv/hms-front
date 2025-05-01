"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { ArrowLeft, Plus, X } from "lucide-react"
import { useRoomTypes } from "@/hooks/use-room-types"

export default function EditRoomTypePage() {
  const params = useParams()
  const router = useRouter()
  const roomTypeId = params.id as string

  const { fetchRoomTypeById, updateRoomType } = useRoomTypes()

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    basePrice: "",
    category: "",
    bedConfiguration: "",
    size: "",
    maxOccupancy: "",
    capacity: {
      adults: "",
      children: "0",
    },
    amenities: [] as string[],
    isActive: true,
  })
  const [newAmenity, setNewAmenity] = useState("")

  useEffect(() => {
    const loadRoomType = async () => {
      setIsLoading(true)
      const roomType = await fetchRoomTypeById(roomTypeId)

      if (roomType) {
        setFormData({
          name: roomType.name,
          description: roomType.description || "",
          basePrice: roomType.basePrice?.toString() || roomType.basePrice?.toString() || "",
          category: roomType.category || "",
          bedConfiguration: roomType.bedConfiguration || "",
          size: roomType.size?.toString() || "",
          maxOccupancy: roomType.maxOccupancy?.toString() || roomType.maxOccupancy?.toString() || "",
          capacity: {
            adults: roomType.capacity?.adults?.toString() || "1",
            children: roomType.capacity?.children?.toString() || "0",
          },
          amenities: roomType.amenities || [],
          isActive: roomType.isActive !== false,
        })
      } else {
        toast.error("Room type not found")
        router.push("/dashboard/room-types")
      }

      setIsLoading(false)
    }

    loadRoomType()
  }, [roomTypeId])

  const handleChange = (e) => {
    const { name, value } = e.target

    if (name.includes(".")) {
      const [parent, child] = name.split(".")
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSelectChange = (name) => (value) => {
    if (name.includes(".")) {
      const [parent, child] = name.split(".")
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSwitchChange = (name) => (checked) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleAddAmenity = (e) => {
    e.preventDefault()
    if (newAmenity.trim() && !formData.amenities.includes(newAmenity.trim())) {
      setFormData((prev) => ({
        ...prev,
        amenities: [...prev.amenities, newAmenity.trim()],
      }))
      setNewAmenity("")
    }
  }

  const handleRemoveAmenity = (amenity) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.filter((a) => a !== amenity),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Convert string values to appropriate types
      const roomTypeData = {
        ...formData,
        basePrice: Number.parseFloat(formData.basePrice),
        size: Number.parseInt(formData.size),
        maxOccupancy: Number.parseInt(formData.maxOccupancy),
        capacity: {
          adults: Number.parseInt(formData.capacity.adults),
          children: Number.parseInt(formData.capacity.children),
        },
      }

      const { data, error } = await updateRoomType(roomTypeId, roomTypeData)

      if (data) {
        toast.success("Room type updated successfully")
        router.push("/dashboard/room-types")
      } else {
        toast.error(`Failed to update room type: ${error}`)
      }
    } catch (error) {
      toast.error(`An error occurred: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" className="mr-2" asChild>
            <Link href="/dashboard/room-types">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Room Type</h1>
            <p className="text-muted-foreground">Loading room type information...</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Room Type Details</CardTitle>
            <CardDescription>Loading...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array(4)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 w-20 bg-muted rounded" />
                      <div className="h-10 w-full bg-muted rounded" />
                    </div>
                  ))}
              </div>

              <div className="space-y-2">
                <div className="h-4 w-20 bg-muted rounded" />
                <div className="h-24 w-full bg-muted rounded" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="sm" className="mr-2" asChild>
          <Link href="/dashboard/room-types">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Room Type</h1>
          <p className="text-muted-foreground">Update room type information and features</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Room Type Details</CardTitle>
          <CardDescription>Edit the information about this room type</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Room Type Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Deluxe King Suite"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={handleSelectChange("category")} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="deluxe">Deluxe</SelectItem>
                    <SelectItem value="suite">Suite</SelectItem>
                    <SelectItem value="executive">Executive</SelectItem>
                    <SelectItem value="penthouse">Penthouse</SelectItem>
                    <SelectItem value="accessible">Accessible</SelectItem>
                    <SelectItem value="family">Family</SelectItem>
                    <SelectItem value="presidential">Presidential</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bedConfiguration">Bed Configuration *</Label>
                <Input
                  id="bedConfiguration"
                  name="bedConfiguration"
                  value={formData.bedConfiguration}
                  onChange={handleChange}
                  placeholder="e.g. 1 King Bed, 2 Queen Beds"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="basePrice">Base Price per Night ($) *</Label>
                <Input
                  id="basePrice"
                  name="basePrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.basePrice}
                  onChange={handleChange}
                  placeholder="e.g. 199.99"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="size">Room Size (sq ft) *</Label>
                <Input
                  id="size"
                  name="size"
                  type="number"
                  min="0"
                  value={formData.size}
                  onChange={handleChange}
                  placeholder="e.g. 400"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxOccupancy">Maximum Occupancy *</Label>
                <Select value={formData.maxOccupancy} onValueChange={handleSelectChange("maxOccupancy")} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select max occupancy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Person</SelectItem>
                    <SelectItem value="2">2 People</SelectItem>
                    <SelectItem value="3">3 People</SelectItem>
                    <SelectItem value="4">4 People</SelectItem>
                    <SelectItem value="5">5 People</SelectItem>
                    <SelectItem value="6">6 People</SelectItem>
                    <SelectItem value="8">8 People</SelectItem>
                    <SelectItem value="10">10 People</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity.adults">Adult Capacity *</Label>
                <Select value={formData.capacity.adults} onValueChange={handleSelectChange("capacity.adults")} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select adult capacity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Adult</SelectItem>
                    <SelectItem value="2">2 Adults</SelectItem>
                    <SelectItem value="3">3 Adults</SelectItem>
                    <SelectItem value="4">4 Adults</SelectItem>
                    <SelectItem value="5">5 Adults</SelectItem>
                    <SelectItem value="6">6 Adults</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity.children">Child Capacity</Label>
                <Select value={formData.capacity.children} onValueChange={handleSelectChange("capacity.children")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select child capacity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0 Children</SelectItem>
                    <SelectItem value="1">1 Child</SelectItem>
                    <SelectItem value="2">2 Children</SelectItem>
                    <SelectItem value="3">3 Children</SelectItem>
                    <SelectItem value="4">4 Children</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe this room type, its features, and benefits"
                rows={4}
                required
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <div>
                <Label>Amenities</Label>
                <p className="text-sm text-muted-foreground mb-2">Add amenities that come with this room type</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {formData.amenities.map((amenity, index) => (
                    <Badge key={index} variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
                      {amenity}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 rounded-full"
                        onClick={() => handleRemoveAmenity(amenity)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    value={newAmenity}
                    onChange={(e) => setNewAmenity(e.target.value)}
                    placeholder="e.g. Wi-Fi, Mini Bar, Ocean View"
                    className="flex-1"
                  />
                  <Button type="button" onClick={handleAddAmenity} size="sm">
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" type="button" asChild>
                <Link href="/dashboard/room-types">Cancel</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
