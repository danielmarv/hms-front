"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Loader2, Save } from "lucide-react"
import { useApi } from "@/hooks/use-api"
import { useHotelChains, type Hotel } from "@/hooks/use-hotel-chains"

export default function EditHotelPage() {
  const params = useParams()
  const router = useRouter()
  const hotelId = params.id as string
  const { request, isLoading: isLoadingApi } = useApi()
  const { getChainDetails, isLoading: isLoadingChain } = useHotelChains()

  const [hotel, setHotel] = useState<Hotel | null>(null)
  const [chainHotels, setChainHotels] = useState<Hotel[]>([])
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    type: "hotel",
    starRating: "0",
    parentHotel: "",
    active: true,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchHotelDetails = async () => {
      try {
        setIsLoading(true)
        const response = await request<Hotel>(`/hotels/${hotelId}`)

        if (response.data) {
          setHotel(response.data)

          // Initialize form data
          setFormData({
            name: response.data.name || "",
            code: response.data.code || "",
            description: response.data.description || "",
            type: response.data.type || "hotel",
            starRating: String(response.data.starRating || 0),
            parentHotel: response.data.parentHotel || "",
            active: response.data.active !== undefined ? response.data.active : true,
          })

          // If hotel belongs to a chain, fetch chain details to get parent hotel options
          if (response.data.chainCode) {
            const chainResponse = await getChainDetails(response.data.chainCode)
            if (chainResponse.data && chainResponse.data.hotels) {
              // Filter out the current hotel from parent options
              setChainHotels(chainResponse.data.hotels.filter((h) => h._id !== hotelId))
            }
          }
        } else {
          toast.error("Failed to load hotel details")
        }
      } catch (error) {
        console.error("Error fetching hotel details:", error)
        toast.error("Failed to load hotel details")
      } finally {
        setIsLoading(false)
      }
    }

    if (hotelId) {
      fetchHotelDetails()
    }
  }, [hotelId, request, getChainDetails])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await request<Hotel>(`/hotels/${hotelId}`, "PUT", {
        name: formData.name,
        code: formData.code,
        description: formData.description,
        type: formData.type,
        starRating: Number(formData.starRating),
        parentHotel: formData.parentHotel || null,
        active: formData.active,
      })

      if (response.data) {
        toast.success("Hotel updated successfully")

        // Navigate back to the appropriate page
        if (hotel?.chainCode) {
          router.push(`/admin/chains/${hotel.chainCode}/hotels`)
        } else {
          router.push(`/admin/hotels`)
        }
      } else {
        throw new Error("Failed to update hotel")
      }
    } catch (error: any) {
      console.error("Error updating hotel:", error)
      toast.error(error.message || "Failed to update hotel")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading || isLoadingApi || isLoadingChain) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-[600px] w-full" />
      </div>
    )
  }

  if (!hotel) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <h2 className="text-xl font-semibold">Hotel not found</h2>
        <p className="text-muted-foreground">The requested hotel could not be found.</p>
        <Button className="mt-4" asChild>
          <Link href="/admin/hotels">Back to Hotels</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href={hotel.chainCode ? `/admin/chains/${hotel.chainCode}/hotels` : "/admin/hotels"}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Hotel</h1>
          <p className="text-muted-foreground">Update information for {hotel.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Hotel Information</CardTitle>
            <CardDescription>Basic information about the hotel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Hotel Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Luxe New York"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Hotel Code</Label>
                <Input
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="LHI-NY"
                  required
                />
                <p className="text-xs text-muted-foreground">Unique code for this hotel</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
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

            {hotel.chainCode && chainHotels.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="parentHotel">Parent Hotel</Label>
                <Select
                  value={formData.parentHotel}
                  onValueChange={(value) => handleSelectChange("parentHotel", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent hotel" />
                  </SelectTrigger>
                  <SelectContent>
                    {chainHotels.map((h) => (
                      <SelectItem key={h._id} value={h._id}>
                        {h.name} {h.isHeadquarters ? "(Headquarters)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">The parent hotel in the chain hierarchy</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the hotel"
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => handleSwitchChange("active", checked)}
              />
              <Label htmlFor="active">Hotel is active</Label>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(hotel.chainCode ? `/admin/chains/${hotel.chainCode}/hotels` : "/admin/hotels")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
