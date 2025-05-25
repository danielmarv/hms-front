"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import {
  ArrowLeft,
  Building2,
  Edit,
  Hotel,
  Mail,
  MapPin,
  Phone,
  Star,
  Users,
  Settings,
  Globe,
  Calendar,
  Activity,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useHotels, type Hotel as HotelType } from "@/hooks/use-hotels"

export default function HotelDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const hotelId = params.id as string
  const { getHotelById, isLoading } = useHotels()

  const [hotel, setHotel] = useState<HotelType | null>(null)
  const [isLoadingHotel, setIsLoadingHotel] = useState(true)

  useEffect(() => {
    const fetchHotelDetails = async () => {
      try {
        setIsLoadingHotel(true)
        const response = await getHotelById(hotelId)
        if (response.data) {
          setHotel(response.data.data)
        } else {
          toast.error("Failed to load hotel details")
        }
      } catch (error) {
        console.error("Error fetching hotel details:", error)
        toast.error("Failed to load hotel details")
      } finally {
        setIsLoadingHotel(false)
      }
    }

    if (hotelId) {
      fetchHotelDetails()
    }
  }, [hotelId, getHotelById])

  const renderStarRating = (rating: number) => {
    if (rating === 0) return <span className="text-muted-foreground">Not Rated</span>

    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: rating }).map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        ))}
        <span className="ml-1 text-sm text-muted-foreground">
          ({rating} star{rating !== 1 ? "s" : ""})
        </span>
      </div>
    )
  }

  if (isLoadingHotel) {
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
        <Hotel className="h-16 w-16 text-muted-foreground" />
        <h2 className="mt-4 text-2xl font-bold">Hotel Not Found</h2>
        <p className="mt-2 text-muted-foreground">The hotel you're looking for doesn't exist</p>
        <Button className="mt-6" onClick={() => router.push("/admin/hotels")}>
          Back to Hotels
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/hotels">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">{hotel.name}</h1>
              {hotel.isHeadquarters && <Badge variant="outline">Headquarters</Badge>}
              <Badge variant={hotel.active ? "default" : "destructive"}>{hotel.active ? "Active" : "Inactive"}</Badge>
            </div>
            <p className="text-muted-foreground">Hotel Code: {hotel.code}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/admin/hotels/${hotel._id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Hotel
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/admin/hotels/${hotel._id}/settings`}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Basic Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hotel className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Type</label>
                  <p className="capitalize">{hotel.type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Rating</label>
                  <div>{renderStarRating(hotel.starRating || 0)}</div>
                </div>
                {hotel.chainCode && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Chain</label>
                    <Link href={`/admin/chains/${hotel.chainCode}`} className="text-primary hover:underline">
                      {hotel.chainCode}
                    </Link>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <Badge variant={hotel.active ? "default" : "destructive"} className="ml-2">
                    {hotel.active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Location Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {hotel.address ? (
                  <>
                    {hotel.address.street && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Address</label>
                        <p>{hotel.address.street}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      {hotel.address.city && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">City</label>
                          <p>{hotel.address.city}</p>
                        </div>
                      )}
                      {hotel.address.state && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">State</label>
                          <p>{hotel.address.state}</p>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {hotel.address.country && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Country</label>
                          <p>{hotel.address.country}</p>
                        </div>
                      )}
                      {hotel.address.zipCode && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">ZIP Code</label>
                          <p>{hotel.address.zipCode}</p>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground">No address information available</p>
                )}
              </CardContent>
            </Card>

            {/* Contact Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {hotel.contactInfo ? (
                  <>
                    {hotel.contactInfo.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <a href={`tel:${hotel.contactInfo.phone}`} className="hover:underline">
                          {hotel.contactInfo.phone}
                        </a>
                      </div>
                    )}
                    {hotel.contactInfo.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a href={`mailto:${hotel.contactInfo.email}`} className="hover:underline">
                          {hotel.contactInfo.email}
                        </a>
                      </div>
                    )}
                    {hotel.contactInfo.website && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <a
                          href={hotel.contactInfo.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          Website
                        </a>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-muted-foreground">No contact information available</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common management tasks for this hotel</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
                <Button variant="outline" className="justify-start" asChild>
                  <Link href={`/admin/hotels/${hotel._id}/users`}>
                    <Users className="mr-2 h-4 w-4" />
                    Manage Users
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <Link href={`/admin/hotels/${hotel._id}/rooms`}>
                    <Building2 className="mr-2 h-4 w-4" />
                    Manage Rooms
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <Link href={`/admin/hotels/${hotel._id}/settings`}>
                    <Settings className="mr-2 h-4 w-4" />
                    Hotel Settings
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <Link href={`/admin/hotels/${hotel._id}/reports`}>
                    <Activity className="mr-2 h-4 w-4" />
                    View Reports
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hotel Description</CardTitle>
            </CardHeader>
            <CardContent>
              {hotel.description ? (
                <p className="text-muted-foreground leading-relaxed">{hotel.description}</p>
              ) : (
                <p className="text-muted-foreground italic">No description available</p>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Hotel ID</label>
                  <p className="font-mono text-sm">{hotel._id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created</label>
                  <p>{hotel.createdAt ? new Date(hotel.createdAt).toLocaleDateString() : "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                  <p>{hotel.updatedAt ? new Date(hotel.updatedAt).toLocaleDateString() : "N/A"}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Headquarters Hotel</span>
                  <Badge variant={hotel.isHeadquarters ? "success" : "secondary"}>
                    {hotel.isHeadquarters ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Active Status</span>
                  <Badge variant={hotel.active ? "success" : "destructive"}>
                    {hotel.active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                {hotel.chainCode && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Part of Chain</span>
                    <Badge variant="outline">{hotel.chainCode}</Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest events and changes for this hotel</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Hotel created</p>
                    <p className="text-xs text-muted-foreground">
                      {hotel.createdAt ? new Date(hotel.createdAt).toLocaleString() : "Unknown date"}
                    </p>
                  </div>
                </div>

                {hotel.updatedAt && hotel.updatedAt !== hotel.createdAt && (
                  <div className="flex items-center gap-3 p-3 rounded-lg border">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <Edit className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Hotel information updated</p>
                      <p className="text-xs text-muted-foreground">{new Date(hotel.updatedAt).toLocaleString()}</p>
                    </div>
                  </div>
                )}

                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">More activity logs will appear here as the hotel is used</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
