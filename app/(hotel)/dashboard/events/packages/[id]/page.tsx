"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  ArrowLeft,
  Edit,
  Star,
  Users,
  Clock,
  DollarSign,
  Package,
  Calendar,
  TrendingUp,
  BarChart3,
  Loader2,
} from "lucide-react"
import { useEventPackages } from "@/hooks/use-event-packages"
import { useEventTypes } from "@/hooks/use-event-types"
import { useEventServices } from "@/hooks/use-event-services"
import { useVenues } from "@/hooks/use-venues"
import { toast } from "sonner"
import { format } from "date-fns"

interface PackageDetailsPageProps {
  params: {
    id: string
  }
}

export default function PackageDetailsPage({ params }: PackageDetailsPageProps) {
  const router = useRouter()
  const {
    currentPackage,
    isLoading,
    error,
    getPackageById,
    getPackageStatistics,
    getPackageEvents,
    deletePackage,
    updatePackage,
  } = useEventPackages()
  const { eventTypes } = useEventTypes()
  const { services } = useEventServices()
  const { venues } = useVenues()

  const [statistics, setStatistics] = useState<any>(null)
  const [packageEvents, setPackageEvents] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    const fetchData = async () => {
      try {
        await getPackageById(params.id)

        // Fetch statistics and events
        const [stats, events] = await Promise.all([getPackageStatistics(params.id), getPackageEvents(params.id)])

        setStatistics(stats)
        setPackageEvents(events)
      } catch (error) {
        console.error("Failed to fetch package data:", error)
        toast.error("Failed to load package details")
      }
    }

    fetchData()
  }, [params.id, getPackageById, getPackageStatistics, getPackageEvents])

  const handleToggleStatus = async () => {
    if (!currentPackage) return

    try {
      await updatePackage(currentPackage._id, { isActive: !currentPackage.isActive })
      toast.success(`Package ${!currentPackage.isActive ? "activated" : "deactivated"} successfully`)
    } catch (error) {
      toast.error("Failed to update package status")
    }
  }

  const handleTogglePromotion = async () => {
    if (!currentPackage) return

    try {
      await updatePackage(currentPackage._id, { isPromoted: !currentPackage.isPromoted })
      toast.success(`Package ${!currentPackage.isPromoted ? "promoted" : "unpromoted"} successfully`)
    } catch (error) {
      toast.error("Failed to update package promotion")
    }
  }

  const handleDeletePackage = async () => {
    if (!currentPackage) return

    try {
      await deletePackage(currentPackage._id)
      toast.success("Package deleted successfully")
      router.push("/dashboard/events/packages")
    } catch (error) {
      toast.error("Failed to delete package")
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400" />
          <p className="text-lg font-medium text-slate-700 dark:text-slate-300">Loading package details...</p>
        </div>
      </div>
    )
  }

  if (error || !currentPackage) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-red-500 text-center">
          <p className="text-lg font-semibold">Package not found</p>
          <p className="text-sm">{error || "The requested package could not be found."}</p>
        </div>
        <Button onClick={() => router.push("/dashboard/events/packages")}>Back to Packages</Button>
      </div>
    )
  }

  const getStatusBadge = () => {
    if (!currentPackage.isActive) {
      return <Badge variant="secondary">Inactive</Badge>
    }
    if (currentPackage.isPromoted) {
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">Promoted</Badge>
    }
    return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
  }

  const getCancellationPolicyBadge = () => {
    const colors = {
      flexible: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      moderate: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      strict: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    }

    return (
      <Badge
        className={colors[currentPackage.cancellationPolicy as keyof typeof colors] || "bg-gray-100 text-gray-800"}
      >
        {currentPackage.cancellationPolicy.charAt(0).toUpperCase() + currentPackage.cancellationPolicy.slice(1)}
      </Badge>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 dark:border-slate-700/20">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{currentPackage.name}</h1>
                {getStatusBadge()}
              </div>
              <p className="text-slate-600 dark:text-slate-300 mt-1">{currentPackage.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={handleTogglePromotion}
              className={currentPackage.isPromoted ? "border-yellow-500 text-yellow-600" : ""}
            >
              <Star className="mr-2 h-4 w-4" />
              {currentPackage.isPromoted ? "Remove Promotion" : "Promote"}
            </Button>
            <Button
              variant="outline"
              onClick={handleToggleStatus}
              className={currentPackage.isActive ? "border-red-500 text-red-600" : "border-green-500 text-green-600"}
            >
              {currentPackage.isActive ? "Deactivate" : "Activate"}
            </Button>
            <Button asChild>
              <Link href={`/dashboard/events/packages/${currentPackage._id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Package
              </Link>
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Base Price</p>
                  <p className="text-3xl font-bold">${currentPackage.basePrice}</p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Capacity</p>
                  <p className="text-3xl font-bold">
                    {currentPackage.minCapacity}-{currentPackage.maxCapacity}
                  </p>
                </div>
                <Users className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Duration</p>
                  <p className="text-3xl font-bold">{currentPackage.duration}h</p>
                </div>
                <Clock className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Total Events</p>
                  <p className="text-3xl font-bold">{statistics?.overview?.totalEvents || 0}</p>
                </div>
                <Calendar className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Package Details */}
              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle>Package Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Duration</p>
                      <p className="text-lg font-semibold">{currentPackage.duration} hours</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Capacity</p>
                      <p className="text-lg font-semibold">
                        {currentPackage.minCapacity} - {currentPackage.maxCapacity} guests
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Event Types</p>
                    <div className="flex flex-wrap gap-2">
                      {currentPackage.eventTypes.map((typeId) => {
                        const eventType = eventTypes.find((t) => t._id === typeId)
                        return eventType ? (
                          <Badge key={typeId} variant="outline" className="flex items-center space-x-1">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: eventType.color }} />
                            <span>{eventType.name}</span>
                          </Badge>
                        ) : null
                      })}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Cancellation Policy</p>
                    {getCancellationPolicyBadge()}
                  </div>

                  {currentPackage.terms && (
                    <div>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Terms & Conditions</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-700 p-3 rounded-lg">
                        {currentPackage.terms}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Pricing Information */}
              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle>Pricing Structure</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <span className="font-medium">Base Price</span>
                      <span className="text-lg font-bold">${currentPackage.basePrice}</span>
                    </div>

                    {currentPackage.pricePerPerson > 0 && (
                      <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                        <span className="font-medium">Per Person</span>
                        <span className="text-lg font-bold">${currentPackage.pricePerPerson}</span>
                      </div>
                    )}
                  </div>

                  {currentPackage.isPromoted && currentPackage.promotionDetails && (
                    <>
                      <Separator />
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                        <div className="flex items-center space-x-2 mb-2">
                          <Star className="h-4 w-4 text-yellow-600" />
                          <span className="font-semibold text-yellow-800 dark:text-yellow-200">Promotion Active</span>
                        </div>
                        {currentPackage.promotionDetails.discountPercentage && (
                          <p className="text-sm text-yellow-700 dark:text-yellow-300">
                            {currentPackage.promotionDetails.discountPercentage}% discount
                          </p>
                        )}
                        {currentPackage.promotionDetails.description && (
                          <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                            {currentPackage.promotionDetails.description}
                          </p>
                        )}
                      </div>
                    </>
                  )}

                  {currentPackage.additionalOptions && currentPackage.additionalOptions.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <p className="font-medium mb-2">Additional Options</p>
                        <div className="space-y-2">
                          {currentPackage.additionalOptions.map((option, index) => (
                            <div key={index} className="flex justify-between items-center text-sm">
                              <span>{option.name}</span>
                              <span className="font-medium">${option.price}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Amenities */}
            {currentPackage.includedAmenities && currentPackage.includedAmenities.length > 0 && (
              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle>Included Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentPackage.includedAmenities.map((amenity, index) => (
                      <div key={index} className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                        <h4 className="font-medium text-slate-900 dark:text-slate-100">{amenity.name}</h4>
                        {amenity.description && (
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{amenity.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle>Included Services</CardTitle>
                <CardDescription>Services that are part of this package</CardDescription>
              </CardHeader>
              <CardContent>
                {currentPackage.includedServices && currentPackage.includedServices.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentPackage.includedServices.map((packageService, index) => {
                      const service = services.find((s) => s._id === packageService.service)
                      return service ? (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold">{service.name}</h4>
                            <Badge variant="secondary">{service.category}</Badge>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{service.description}</p>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Quantity: {packageService.quantity}</span>
                            <span className="font-medium">${service.price}</span>
                          </div>
                          {packageService.details && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 italic">
                              {packageService.details}
                            </p>
                          )}
                        </div>
                      ) : null
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-400">No services included in this package</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6">
            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle>Pricing Calculator</CardTitle>
                <CardDescription>Calculate total cost based on guest count</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Base Price</p>
                      <p className="text-2xl font-bold">${currentPackage.basePrice}</p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Per Person</p>
                      <p className="text-2xl font-bold">${currentPackage.pricePerPerson}</p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Capacity Range</p>
                      <p className="text-2xl font-bold">
                        {currentPackage.minCapacity}-{currentPackage.maxCapacity}
                      </p>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Pricing Formula</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Total Cost = Base Price (${currentPackage.basePrice}) + (Number of Guests × $
                      {currentPackage.pricePerPerson})
                    </p>
                    <div className="mt-3 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Minimum Cost ({currentPackage.minCapacity} guests):</span>
                        <span className="font-medium">
                          ${currentPackage.basePrice + currentPackage.minCapacity * currentPackage.pricePerPerson}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Maximum Cost ({currentPackage.maxCapacity} guests):</span>
                        <span className="font-medium">
                          ${currentPackage.basePrice + currentPackage.maxCapacity * currentPackage.pricePerPerson}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle>Events Using This Package</CardTitle>
                <CardDescription>Events that have been created with this package</CardDescription>
              </CardHeader>
              <CardContent>
                {packageEvents.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Event Name</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Guests</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Total Cost</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {packageEvents.map((event) => (
                          <TableRow key={event._id}>
                            <TableCell className="font-medium">{event.title}</TableCell>
                            <TableCell>{format(new Date(event.start_date), "MMM d, yyyy")}</TableCell>
                            <TableCell>{event.attendees}</TableCell>
                            <TableCell>
                              <Badge variant={event.status === "confirmed" ? "default" : "secondary"}>
                                {event.status}
                              </Badge>
                            </TableCell>
                            <TableCell>${event.totalCost || "N/A"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-400">No events have used this package yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {statistics ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-500">Total Events</p>
                          <p className="text-2xl font-bold">{statistics.overview.totalEvents}</p>
                        </div>
                        <Calendar className="h-8 w-8 text-slate-400" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-500">Total Revenue</p>
                          <p className="text-2xl font-bold">${statistics.overview.totalRevenue}</p>
                        </div>
                        <DollarSign className="h-8 w-8 text-slate-400" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-500">Avg. Guests</p>
                          <p className="text-2xl font-bold">{Math.round(statistics.overview.avgGuestCount)}</p>
                        </div>
                        <Users className="h-8 w-8 text-slate-400" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-500">Total Guests</p>
                          <p className="text-2xl font-bold">{statistics.overview.totalGuests}</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-slate-400" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {statistics.monthlyTrend.map((month: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg"
                        >
                          <span className="font-medium">
                            {new Date(month._id.year, month._id.month - 1).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                            })}
                          </span>
                          <div className="flex space-x-4">
                            <span className="text-sm text-slate-600 dark:text-slate-400">{month.events} events</span>
                            <span className="font-semibold">${month.revenue}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400">No analytics data available</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
