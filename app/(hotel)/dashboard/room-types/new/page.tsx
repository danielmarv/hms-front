"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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

export default function NewRoomTypePage() {
  const router = useRouter()
  const { createRoomType } = useRoomTypes()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    base_price: "",
    category: "standard",
    max_occupancy: "2",
    amenities: [] as string[],
  })
  const [newAmenity, setNewAmenity] = useState("")

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name) => (value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
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
        base_price: Number.parseFloat(formData.base_price),
        max_occupancy: Number.parseInt(formData.max_occupancy),
      }

      const { data, error } = await createRoomType(roomTypeData)

      if (data) {
        toast.success("Room type created successfully")
        router.push("/dashboard/room-types")
      } else {
        toast.error(`Failed to create room type: ${error}`)
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
          <Link href="/dashboard/room-types">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Room Type</h1>
          <p className="text-muted-foreground">Create a new room category with pricing and features</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Room Type Details</CardTitle>
          <CardDescription>Enter the basic information about this room type</CardDescription>
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
                <Label htmlFor="base_price">Base Price per Night ($) *</Label>
                <Input
                  id="base_price"
                  name="base_price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.base_price}
                  onChange={handleChange}
                  placeholder="e.g. 199.99"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_occupancy">Maximum Occupancy *</Label>
                <Select value={formData.max_occupancy} onValueChange={handleSelectChange("max_occupancy")} required>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe this room type, its features, and benefits"
                rows={4}
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
                {isSubmitting ? "Creating..." : "Create Room Type"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
