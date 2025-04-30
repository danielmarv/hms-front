"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Save } from "lucide-react"
import { useHotelChains } from "@/hooks/use-hotel-chains"

export default function NewHotelChainPage() {
  const router = useRouter()
  const { createChain } = useHotelChains()
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    chainCode: "",
    description: "",
    type: "hotel",
    starRating: "0",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await createChain({
        name: formData.name,
        code: formData.code,
        chainCode: formData.chainCode,
        description: formData.description,
        type: formData.type,
        starRating: Number(formData.starRating),
      })

      if (response.data) {
        toast.success("Hotel chain created successfully")
        router.push("/admin/chains")
      } else {
        throw new Error("Failed to create hotel chain")
      }
    } catch (error) {
      console.error("Error creating hotel chain:", error)
      toast.error("Failed to create hotel chain")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Hotel Chain</h1>
        <p className="text-muted-foreground">Create a new hotel chain with headquarters</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Chain Information</CardTitle>
            <CardDescription>Basic information about the hotel chain</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Chain Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Luxe Hotels International"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Hotel Code</Label>
                <Input id="code" name="code" value={formData.code} onChange={handleChange} placeholder="LHI" required />
                <p className="text-xs text-muted-foreground">Unique code for headquarters hotel</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="chainCode">Chain Code</Label>
                <Input
                  id="chainCode"
                  name="chainCode"
                  value={formData.chainCode}
                  onChange={handleChange}
                  placeholder="LUXE"
                  required
                />
                <p className="text-xs text-muted-foreground">Unique identifier for the chain</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Hotel Type</Label>
                <Select value={formData.type} onValueChange={(value) => handleSelectChange("type", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hotel">Hotel</SelectItem>
                    <SelectItem value="resort">Resort</SelectItem>
                    <SelectItem value="motel">Motel</SelectItem>
                    <SelectItem value="boutique">Boutique</SelectItem>
                    <SelectItem value="apartment">Serviced Apartment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the hotel chain"
                  rows={3}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="starRating">Star Rating</Label>
                <Select value={formData.starRating} onValueChange={(value) => handleSelectChange("starRating", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Not Applicable</SelectItem>
                    <SelectItem value="1">1 Star</SelectItem>
                    <SelectItem value="2">2 Stars</SelectItem>
                    <SelectItem value="3">3 Stars</SelectItem>
                    <SelectItem value="4">4 Stars</SelectItem>
                    <SelectItem value="5">5 Stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.push("/admin/chains")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Create Chain
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
