"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { useRoomTypes } from "@/hooks/use-room-types"
import { ArrowLeft, Plus, Minus, Trash } from "lucide-react"

export default function NewRoomTypePage() {
  const router = useRouter()
  const { createRoomType } = useRoomTypes()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    basePrice: 0,
    bedConfiguration: "",
    size: 0,
    maxOccupancy: 2,
    capacity: {
      adults: 2,
      children: 0,
    },
    amenities: ["Wi-Fi"],
    isActive: true,
  })

  const [amenity, setAmenity] = useState("")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: Number(value) || 0 }))
  }

  const handleCapacityChange = (type: "adults" | "children", value: number) => {
    setFormData((prev) => ({
      ...prev,
      capacity: {
        ...prev.capacity,
        [type]: value,
      },
      // Update maxOccupancy when adults or children change
      maxOccupancy: type === "adults" ? value + prev.capacity.children : prev.capacity.adults + value,
    }))
  }

  const handleAddAmenity = () => {
    if (amenity.trim() && !formData.amenities.includes(amenity.trim())) {
      setFormData((prev) => ({
        ...prev,
        amenities: [...prev.amenities, amenity.trim()],
      }))
      setAmenity("")
    }
  }

  const handleRemoveAmenity = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const { data, error } = await createRoomType(formData)

      if (data && !error) {
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Room Type</h1>
          <p className="text-muted-foreground">Add a new room category to your hotel</p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Enter the basic details for this room type</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Deluxe Room"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="A spacious room with modern amenities..."
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="basePrice">Base Price (per night) *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5">$</span>
                    <Input
                      id="basePrice"
                      name="basePrice"
                      type="number"
                      min="0"
                      step="0.01"
                      className="pl-7"
                      value={formData.basePrice}
                      onChange={handleNumberChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="size">Room Size (sq ft) *</Label>
                  <Input
                    id="size"
                    name="size"
                    type="number"
                    min="0"
                    value={formData.size}
                    onChange={handleNumberChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bedConfiguration">Bed Configuration *</Label>
                <Select
                  value={formData.bedConfiguration}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, bedConfiguration: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select bed configuration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1 King Bed">1 King Bed</SelectItem>
                    <SelectItem value="1 Queen Bed">1 Queen Bed</SelectItem>
                    <SelectItem value="2 Queen Beds">2 Queen Beds</SelectItem>
                    <SelectItem value="2 Twin Beds">2 Twin Beds</SelectItem>
                    <SelectItem value="1 King Bed + Sofa Bed">1 King Bed + Sofa Bed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="isActive">Active and available for booking</Label>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Capacity</CardTitle>
                <CardDescription>Set the occupancy limits for this room type</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label>Adults *</Label>
                    <div className="flex items-center mt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleCapacityChange("adults", Math.max(1, formData.capacity.adults - 1))}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <div className="w-12 text-center">{formData.capacity.adults}</div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleCapacityChange("adults", formData.capacity.adults + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label>Children</Label>
                    <div className="flex items-center mt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleCapacityChange("children", Math.max(0, formData.capacity.children - 1))}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <div className="w-12 text-center">{formData.capacity.children}</div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleCapacityChange("children", formData.capacity.children + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Label>Maximum Occupancy</Label>
                    <div className="text-2xl font-bold mt-1">{formData.maxOccupancy} persons</div>
                    <p className="text-sm text-muted-foreground">Total of adults and children allowed in this room</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Amenities</CardTitle>
                <CardDescription>Add features and amenities available in this room type</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add amenity (e.g., Wi-Fi, TV)"
                    value={amenity}
                    onChange={(e) => setAmenity(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleAddAmenity()
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddAmenity}>
                    Add
                  </Button>
                </div>

                {formData.amenities.length > 0 ? (
                  <div className="space-y-2">
                    {formData.amenities.map((item, index) => (
                      <div key={index} className="flex items-center justify-between bg-muted p-2 rounded-md">
                        <span>{item}</span>
                        <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveAmenity(index)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No amenities added yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <Button variant="outline" type="button" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Room Type"}
          </Button>
        </div>
      </form>
    </div>
  )
}
