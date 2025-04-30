"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  Building2,
  Hotel,
  Users,
  Settings,
  ChevronRight,
  Star,
  Plus,
  BarChart3,
  FolderSyncIcon as Sync,
  Edit,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useHotelChains, type HotelChain, type Hotel as HotelType } from "@/hooks/use-hotel-chains"
import { toast } from "sonner"

export default function ChainDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const chainCode = params.id as string
  const { getChainDetails, getChainStatistics, isLoading } = useHotelChains()
  const [chain, setChain] = useState<HotelChain | null>(null)
  const [stats, setStats] = useState<any>(null)
  const [isLoadingChain, setIsLoadingChain] = useState(true)
  const [isLoadingStats, setIsLoadingStats] = useState(true)

  useEffect(() => {
    const fetchChainDetails = async () => {
      try {
        setIsLoadingChain(true)
        const response = await getChainDetails(chainCode)
        if (response.data) {
          setChain(response.data)
        }
      } catch (error) {
        console.error("Error fetching chain details:", error)
        toast.error("Failed to load chain details")
      } finally {
        setIsLoadingChain(false)
      }
    }

    const fetchChainStats = async () => {
      try {
        setIsLoadingStats(true)
        const response = await getChainStatistics(chainCode)
        if (response.data) {
          setStats(response.data)
        }
      } catch (error) {
        console.error("Error fetching chain statistics:", error)
        toast.error("Failed to load chain statistics")
      } finally {
        setIsLoadingStats(false)
      }
    }

    if (chainCode) {
      fetchChainDetails()
      fetchChainStats()
    }
  }, [chainCode, getChainDetails, getChainStatistics])

  const renderStarRating = (rating: number) => {
    if (rating === 0) return <span className="text-muted-foreground">N/A</span>

    return (
      <div className="flex items-center">
        {Array.from({ length: rating }).map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
    )
  }

  if (isLoadingChain) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-[250px]" />
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <Skeleton className="h-8 w-[150px]" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[120px] w-full" />
          ))}
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  if (!chain) {
    return (
      <div className="flex h-[600px] flex-col items-center justify-center">
        <Building2 className="h-16 w-16 text-muted-foreground" />
        <h2 className="mt-4 text-2xl font-bold">Chain Not Found</h2>
        <p className="mt-2 text-muted-foreground">The hotel chain you're looking for doesn't exist</p>
        <Button className="mt-6" onClick={() => router.push("/admin/chains")}>
          Back to Chains
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <div className="flex items-center space-x-2">
            <Link href="/admin/chains" className="text-muted-foreground hover:text-foreground">
              Hotel Chains
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{chain.name}</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{chain.name}</h1>
          <p className="text-muted-foreground">Chain Code: {chain.chainCode}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => router.push(`/admin/chains/${chainCode}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Chain
          </Button>
          <Button onClick={() => router.push(`/admin/chains/${chainCode}/hotels/new`)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Hotel
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="hotels">Hotels</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Hotels</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoadingStats ? <Skeleton className="h-8 w-16" /> : stats?.totalHotels || chain.hotels?.length || 1}
                </div>
                <p className="text-xs text-muted-foreground">
                  {isLoadingStats ? (
                    <Skeleton className="mt-1 h-4 w-24" />
                  ) : (
                    `${stats?.activeHotels || 0} active hotels`
                  )}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Rooms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoadingStats ? <Skeleton className="h-8 w-16" /> : stats?.totalRooms || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {isLoadingStats ? <Skeleton className="mt-1 h-4 w-24" /> : `Across all properties`}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoadingStats ? <Skeleton className="h-8 w-16" /> : stats?.activeBookings || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {isLoadingStats ? <Skeleton className="mt-1 h-4 w-24" /> : `Current occupancy`}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Guests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoadingStats ? <Skeleton className="h-8 w-16" /> : stats?.totalGuests || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {isLoadingStats ? <Skeleton className="mt-1 h-4 w-24" /> : `Registered in the system`}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Chain Information</CardTitle>
                <CardDescription>Basic details about this hotel chain</CardDescription>
              </CardHeader>
              <CardContent>
                <dl className="space-y-4">
                  <div className="flex flex-col space-y-1">
                    <dt className="text-sm font-medium text-muted-foreground">Chain Name</dt>
                    <dd>{chain.name}</dd>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <dt className="text-sm font-medium text-muted-foreground">Chain Code</dt>
                    <dd>{chain.chainCode}</dd>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <dt className="text-sm font-medium text-muted-foreground">Headquarters</dt>
                    <dd>{chain.headquarters?.name || "Not specified"}</dd>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <dt className="text-sm font-medium text-muted-foreground">Type</dt>
                    <dd className="capitalize">{chain.type}</dd>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <dt className="text-sm font-medium text-muted-foreground">Star Rating</dt>
                    <dd>{renderStarRating(chain.starRating)}</dd>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                    <dd>
                      <Badge variant={chain.active ? "default" : "destructive"}>
                        {chain.active ? "Active" : "Inactive"}
                      </Badge>
                    </dd>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <dt className="text-sm font-medium text-muted-foreground">Description</dt>
                    <dd className="text-sm">{chain.description || "No description provided"}</dd>
                  </div>
                </dl>
              </CardContent>
              <CardFooter>
                <Button variant="outline" onClick={() => router.push(`/admin/chains/${chainCode}/edit`)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Information
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks for this hotel chain</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push(`/admin/chains/${chainCode}/hotels/new`)}
                >
                  <Hotel className="mr-2 h-4 w-4" />
                  Add New Hotel
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push(`/admin/chains/${chainCode}/users/add`)}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Add Chain-wide User
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push(`/admin/chains/${chainCode}/sync`)}
                >
                  <Sync className="mr-2 h-4 w-4" />
                  Sync Configuration
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push(`/admin/chains/${chainCode}/reports`)}
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Reports
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="hotels" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Hotels in Chain</CardTitle>
                <CardDescription>All properties in the {chain.name} chain</CardDescription>
              </div>
              <Button onClick={() => router.push(`/admin/chains/${chainCode}/hotels/new`)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Hotel
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingChain ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : !chain.hotels || chain.hotels.length === 0 ? (
                <div className="flex h-[200px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
                  <Hotel className="h-10 w-10 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No hotels found</h3>
                  <p className="mt-2 text-sm text-muted-foreground">This chain doesn't have any hotels yet</p>
                  <Button onClick={() => router.push(`/admin/chains/${chainCode}/hotels/new`)} className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Hotel
                  </Button>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Hotel Name</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {chain.hotels.map((hotel: HotelType) => (
                        <TableRow key={hotel._id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              {hotel.isHeadquarters && (
                                <Badge variant="outline" className="mr-2">
                                  HQ
                                </Badge>
                              )}
                              <Link href={`/admin/hotels/${hotel._id}`} className="hover:underline">
                                {hotel.name}
                              </Link>
                            </div>
                          </TableCell>
                          <TableCell>{hotel.code}</TableCell>
                          <TableCell className="capitalize">{hotel.type}</TableCell>
                          <TableCell>{renderStarRating(hotel.starRating || 0)}</TableCell>
                          <TableCell>
                            <Badge variant={hotel.active ? "default" : "destructive"}>
                              {hotel.active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/hotels/${hotel._id}`)}>
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {chain.hierarchy && (
            <Card>
              <CardHeader>
                <CardTitle>Chain Hierarchy</CardTitle>
                <CardDescription>Organizational structure of hotels in this chain</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border p-4">
                  <ChainHierarchyTree node={chain.hierarchy} />
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="configuration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Shared Configuration</CardTitle>
              <CardDescription>Settings shared across all hotels in the chain</CardDescription>
            </CardHeader>
            <CardContent>
              {!chain.sharedConfiguration ? (
                <div className="flex h-[200px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
                  <Settings className="h-10 w-10 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No shared configuration</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    This chain doesn't have shared configuration set up yet
                  </p>
                  <Button className="mt-4">
                    <Settings className="mr-2 h-4 w-4" />
                    Set Up Configuration
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="mb-2 text-lg font-medium">Branding</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <div
                            className="h-6 w-6 rounded-full"
                            style={{ backgroundColor: chain.sharedConfiguration.branding.primaryColor }}
                          />
                          <span>Primary Color: {chain.sharedConfiguration.branding.primaryColor}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div
                            className="h-6 w-6 rounded-full"
                            style={{ backgroundColor: chain.sharedConfiguration.branding.secondaryColor }}
                          />
                          <span>Secondary Color: {chain.sharedConfiguration.branding.secondaryColor}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div
                            className="h-6 w-6 rounded-full"
                            style={{ backgroundColor: chain.sharedConfiguration.branding.accentColor }}
                          />
                          <span>Accent Color: {chain.sharedConfiguration.branding.accentColor}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div>Primary Font: {chain.sharedConfiguration.branding.font.primary}</div>
                        <div>Secondary Font: {chain.sharedConfiguration.branding.font.secondary}</div>
                        {chain.sharedConfiguration.branding.logo && <div>Logo: Available</div>}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="mb-2 text-lg font-medium">Document Prefixes</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <h4 className="font-medium">Invoice</h4>
                        <div className="text-sm">
                          <div>Prefix: {chain.sharedConfiguration.documentPrefixes.invoice.prefix}</div>
                          <div>
                            Starting Number: {chain.sharedConfiguration.documentPrefixes.invoice.startingNumber}
                          </div>
                          <div>Format: {chain.sharedConfiguration.documentPrefixes.invoice.format}</div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium">Receipt</h4>
                        <div className="text-sm">
                          <div>Prefix: {chain.sharedConfiguration.documentPrefixes.receipt.prefix}</div>
                          <div>
                            Starting Number: {chain.sharedConfiguration.documentPrefixes.receipt.startingNumber}
                          </div>
                          <div>Format: {chain.sharedConfiguration.documentPrefixes.receipt.format}</div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium">Booking</h4>
                        <div className="text-sm">
                          <div>Prefix: {chain.sharedConfiguration.documentPrefixes.booking.prefix}</div>
                          <div>
                            Starting Number: {chain.sharedConfiguration.documentPrefixes.booking.startingNumber}
                          </div>
                          <div>Format: {chain.sharedConfiguration.documentPrefixes.booking.format}</div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium">Guest</h4>
                        <div className="text-sm">
                          <div>Prefix: {chain.sharedConfiguration.documentPrefixes.guest.prefix}</div>
                          <div>Starting Number: {chain.sharedConfiguration.documentPrefixes.guest.startingNumber}</div>
                          <div>Format: {chain.sharedConfiguration.documentPrefixes.guest.format}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="mb-2 text-lg font-medium">System Settings</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-1">
                        <div>Date Format: {chain.sharedConfiguration.systemSettings.dateFormat}</div>
                        <div>Time Format: {chain.sharedConfiguration.systemSettings.timeFormat}</div>
                        <div>Language: {chain.sharedConfiguration.systemSettings.language}</div>
                      </div>
                      <div className="space-y-1">
                        <div>
                          Currency: {chain.sharedConfiguration.systemSettings.currency.symbol} (
                          {chain.sharedConfiguration.systemSettings.currency.code})
                        </div>
                        <div>Timezone: {chain.sharedConfiguration.systemSettings.timezone}</div>
                        <div>Measurement System: {chain.sharedConfiguration.systemSettings.measurementSystem}</div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="mb-2 text-lg font-medium">Override Settings</h3>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="rounded-md border p-3">
                        <div className="font-medium">Branding</div>
                        <Badge variant={chain.sharedConfiguration.overrideSettings.branding ? "outline" : "secondary"}>
                          {chain.sharedConfiguration.overrideSettings.branding
                            ? "Allow Override"
                            : "Enforce Chain Settings"}
                        </Badge>
                      </div>
                      <div className="rounded-md border p-3">
                        <div className="font-medium">Document Prefixes</div>
                        <Badge
                          variant={
                            chain.sharedConfiguration.overrideSettings.documentPrefixes ? "outline" : "secondary"
                          }
                        >
                          {chain.sharedConfiguration.overrideSettings.documentPrefixes
                            ? "Allow Override"
                            : "Enforce Chain Settings"}
                        </Badge>
                      </div>
                      <div className="rounded-md border p-3">
                        <div className="font-medium">System Settings</div>
                        <Badge
                          variant={chain.sharedConfiguration.overrideSettings.systemSettings ? "outline" : "secondary"}
                        >
                          {chain.sharedConfiguration.overrideSettings.systemSettings
                            ? "Allow Override"
                            : "Enforce Chain Settings"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => router.push(`/admin/chains/${chainCode}/configuration/edit`)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Configuration
                </Button>
                <Button onClick={() => router.push(`/admin/chains/${chainCode}/sync`)}>
                  <Sync className="mr-2 h-4 w-4" />
                  Sync Configuration
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Chain Users</CardTitle>
                <CardDescription>Users with access across multiple hotels in the chain</CardDescription>
              </div>
              <Button onClick={() => router.push(`/admin/chains/${chainCode}/users/add`)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Chain User
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Hotels</TableHead>
                      <TableHead>Access Level</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* This would be populated with actual user data from the API */}
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6">
                        <div className="flex flex-col items-center justify-center">
                          <Users className="h-8 w-8 text-muted-foreground mb-2" />
                          <p className="text-muted-foreground">Loading chain users...</p>
                          <Button
                            variant="link"
                            onClick={() => router.push(`/admin/chains/${chainCode}/users/add`)}
                            className="mt-2"
                          >
                            Add a user
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Helper component to render the chain hierarchy tree
function ChainHierarchyTree({ node }: { node: any }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        {node.isHeadquarters ? (
          <Building2 className="h-5 w-5 text-primary" />
        ) : (
          <Hotel className="h-5 w-5 text-primary" />
        )}
        <span className="font-medium">{node.name}</span>
        <span className="text-sm text-muted-foreground">({node.code})</span>
        {node.isHeadquarters && <Badge variant="outline">Headquarters</Badge>}
      </div>

      {node.children && node.children.length > 0 && (
        <div className="ml-6 border-l pl-6">
          {node.children.map((child: any) => (
            <ChainHierarchyTree key={child.id} node={child} />
          ))}
        </div>
      )}
    </div>
  )
}
