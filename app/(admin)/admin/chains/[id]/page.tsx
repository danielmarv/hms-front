"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Building, Hotel, Users, Edit, FolderSyncIcon as Sync, Plus, ArrowLeft } from "lucide-react"

export default function HotelChainDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const chainId = params.id as string
  const [chain, setChain] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    const fetchChainDetails = async () => {
      try {
        // In a real app, you would fetch this data from your API
        // const response = await fetch(`/api/chains/${chainId}`)
        // const data = await response.json()

        // For now, we'll use mock data
        setChain({
          _id: chainId,
          chainCode: "LUXE",
          name: "Luxe Hotels International",
          code: "LHI",
          description:
            "Luxury hotel chain with global presence offering premium accommodations and exceptional service across major cities worldwide.",
          type: "hotel",
          starRating: 5,
          active: true,
          headquarters: {
            _id: "hq1",
            name: "Luxe Hotels International HQ",
            code: "LHI-HQ",
            location: "New York, USA",
          },
          hotels: [
            { _id: "h1", name: "Luxe New York", code: "LHI-NY", active: true, type: "hotel" },
            { _id: "h2", name: "Luxe London", code: "LHI-LON", active: true, type: "hotel" },
            { _id: "h3", name: "Luxe Paris", code: "LHI-PAR", active: true, type: "hotel" },
            { _id: "h4", name: "Luxe Tokyo", code: "LHI-TKY", active: true, type: "hotel" },
            { _id: "h5", name: "Luxe Sydney", code: "LHI-SYD", active: true, type: "hotel" },
            { _id: "h6", name: "Luxe Dubai", code: "LHI-DXB", active: false, type: "resort" },
          ],
          sharedConfiguration: {
            branding: {
              primaryColor: "#1a73e8",
              secondaryColor: "#f8f9fa",
              accentColor: "#fbbc04",
            },
            systemSettings: {
              dateFormat: "MM/DD/YYYY",
              timeFormat: "12h",
              currency: {
                code: "USD",
                symbol: "$",
              },
            },
          },
          stats: {
            totalHotels: 6,
            activeHotels: 5,
            totalRooms: 1250,
            totalUsers: 120,
          },
        })
      } catch (error) {
        console.error("Error fetching chain details:", error)
        toast.error("Failed to load chain details")
      } finally {
        setIsLoading(false)
      }
    }

    fetchChainDetails()
  }, [chainId])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/chains">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-[600px] w-full" />
      </div>
    )
  }

  if (!chain) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <h2 className="text-xl font-semibold">Hotel chain not found</h2>
        <p className="text-muted-foreground">The requested hotel chain could not be found.</p>
        <Button className="mt-4" asChild>
          <Link href="/admin/chains">Back to Chains</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/chains">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{chain.name}</h1>
            <div className="flex items-center gap-2">
              <p className="text-muted-foreground">Chain Code: {chain.chainCode}</p>
              <Badge variant={chain.active ? "default" : "outline"}>{chain.active ? "Active" : "Inactive"}</Badge>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/admin/chains/${chainId}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Chain
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/admin/chains/${chainId}/sync`}>
              <Sync className="mr-2 h-4 w-4" />
              Sync Configuration
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/admin/chains/${chainId}/hotels/new`}>
              <Plus className="mr-2 h-4 w-4" />
              Add Hotel
            </Link>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="hotels">Hotels</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 pt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Hotels</CardTitle>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <Hotel className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{chain.stats.totalHotels}</div>
                <p className="text-xs text-muted-foreground">
                  {chain.stats.activeHotels} active, {chain.stats.totalHotels - chain.stats.activeHotels} inactive
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <Building className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{chain.stats.totalRooms}</div>
                <p className="text-xs text-muted-foreground">Across all properties</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <Users className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{chain.stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">With access to chain hotels</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Chain Details</CardTitle>
              <CardDescription>Basic information about the hotel chain</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="text-sm font-medium">Chain Code</h3>
                  <p>{chain.chainCode}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Headquarters</h3>
                  <p>
                    {chain.headquarters.name} ({chain.headquarters.code})
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Type</h3>
                  <p className="capitalize">{chain.type}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Star Rating</h3>
                  <p>{chain.starRating > 0 ? `${chain.starRating} Stars` : "Not Applicable"}</p>
                </div>
                <div className="md:col-span-2">
                  <h3 className="text-sm font-medium">Description</h3>
                  <p>{chain.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hotels" className="space-y-4 pt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Hotels in Chain</CardTitle>
                <CardDescription>All properties in this hotel chain</CardDescription>
              </div>
              <Button asChild>
                <Link href={`/admin/chains/${chainId}/hotels/new`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Hotel
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {chain.hotels.map((hotel: any) => (
                  <Card key={hotel._id} className="overflow-hidden">
                    <CardHeader className="p-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{hotel.name}</CardTitle>
                        <Badge variant={hotel.active ? "default" : "outline"} className="ml-2">
                          {hotel.active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <CardDescription>{hotel.code}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-sm capitalize">Type: {hotel.type}</p>
                    </CardContent>
                    <div className="flex border-t p-2">
                      <Button variant="ghost" size="sm" className="w-full" asChild>
                        <Link href={`/admin/hotels/${hotel._id}`}>View Details</Link>
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuration" className="space-y-4 pt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Shared Configuration</CardTitle>
                <CardDescription>Settings shared across all hotels in the chain</CardDescription>
              </div>
              <Button asChild>
                <Link href={`/admin/chains/${chainId}/configuration/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Configuration
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Branding</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Primary Color</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div
                        className="h-6 w-6 rounded-full border"
                        style={{ backgroundColor: chain.sharedConfiguration.branding.primaryColor }}
                      />
                      <span>{chain.sharedConfiguration.branding.primaryColor}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Secondary Color</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div
                        className="h-6 w-6 rounded-full border"
                        style={{ backgroundColor: chain.sharedConfiguration.branding.secondaryColor }}
                      />
                      <span>{chain.sharedConfiguration.branding.secondaryColor}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Accent Color</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div
                        className="h-6 w-6 rounded-full border"
                        style={{ backgroundColor: chain.sharedConfiguration.branding.accentColor }}
                      />
                      <span>{chain.sharedConfiguration.branding.accentColor}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">System Settings</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Date Format</p>
                    <p>{chain.sharedConfiguration.systemSettings.dateFormat}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Time Format</p>
                    <p>{chain.sharedConfiguration.systemSettings.timeFormat}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Currency</p>
                    <p>
                      {chain.sharedConfiguration.systemSettings.currency.symbol} (
                      {chain.sharedConfiguration.systemSettings.currency.code})
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button variant="outline" asChild>
                  <Link href={`/admin/chains/${chainId}/sync`}>
                    <Sync className="mr-2 h-4 w-4" />
                    Sync Configuration to Hotels
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4 pt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Chain Users</CardTitle>
                <CardDescription>Users with access to this hotel chain</CardDescription>
              </div>
              <Button asChild>
                <Link href={`/admin/chains/${chainId}/users/add`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add User
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                This section shows users with access to multiple hotels in this chain.
              </p>

              {/* In a real app, you would fetch and display users here */}
              <div className="text-center py-8">
                <Button asChild>
                  <Link href={`/admin/chains/${chainId}/users/add`}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Chain-wide User Access
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
