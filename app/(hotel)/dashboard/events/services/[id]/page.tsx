"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  ArrowLeft,
  Edit,
  Trash2,
  Package,
  DollarSign,
  Clock,
  Users,
  MapPin,
  Calendar,
  Settings,
  ExternalLink,
  Phone,
  Mail,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  Star,
  ImageIcon,
} from "lucide-react"
import { useEventServices, type EventService } from "@/hooks/use-event-services"
import { useCurrentHotel } from "@/hooks/use-current-hotel"
import { toast } from "sonner"

export default function EventServiceDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const serviceId = params.id as string

  // Get current hotel data
  const { hotel, hotelId, isLoading: hotelLoading } = useCurrentHotel()

  // Get service data
  const { getServiceById, deleteService } = useEventServices(hotelId)
  const [service, setService] = useState<EventService | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch service details
  useEffect(() => {
    const fetchService = async () => {
      if (!serviceId || !hotelId) return

      try {
        setLoading(true)
        const serviceData = await getServiceById(serviceId)

        if (serviceData) {
          // Verify service belongs to current hotel
          if (serviceData.hotel !== hotelId) {
            setError("Service not found or access denied")
            return
          }
          setService(serviceData)
        } else {
          setError("Service not found")
        }
      } catch (err) {
        setError("Failed to load service details")
        console.error("Error fetching service:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchService()
  }, [serviceId, hotelId, getServiceById])

  const handleDelete = async () => {
    if (!service) return

    try {
      const success = await deleteService(service._id)
      if (success) {
        toast.success(`Service "${service.name}" deleted successfully`)
        router.push("/dashboard/events/services")
      } else {
        toast.error("Failed to delete service")
      }
    } catch (error) {
      toast.error("Failed to delete service")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        )
      case "inactive":
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-200">
            <XCircle className="h-3 w-3 mr-1" />
            Inactive
          </Badge>
        )
      case "seasonal":
        return (
          <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100 dark:bg-orange-900 dark:text-orange-200">
            <Calendar className="h-3 w-3 mr-1" />
            Seasonal
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getCategoryBadge = (category: string) => {
    const categoryColors: Record<string, string> = {
      catering: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
      decoration: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
      equipment: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      entertainment: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      staffing: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
      photography: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
      transportation: "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200",
      security: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      cleaning: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
      other: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    }

    return (
      <Badge className={categoryColors[category] || "bg-gray-100 text-gray-800"}>
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </Badge>
    )
  }

  const formatPrice = (price: number, priceType: string) => {
    const formattedPrice = `$${price.toFixed(2)}`

    switch (priceType) {
      case "per_person":
        return `${formattedPrice} / person`
      case "per_hour":
        return `${formattedPrice} / hour`
      case "per_day":
        return `${formattedPrice} / day`
      case "custom":
        return `${formattedPrice} (custom)`
      default:
        return formattedPrice
    }
  }

  const formatDays = (days: Record<string, boolean>) => {
    const dayNames = {
      monday: "Mon",
      tuesday: "Tue",
      wednesday: "Wed",
      thursday: "Thu",
      friday: "Fri",
      saturday: "Sat",
      sunday: "Sun",
    }

    return Object.entries(days)
      .filter(([_, available]) => available)
      .map(([day, _]) => dayNames[day as keyof typeof dayNames])
      .join(", ")
  }

  if (hotelLoading || loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 dark:from-slate-900 dark:via-purple-900 dark:to-pink-900">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 dark:text-purple-400" />
          <p className="text-lg font-medium text-slate-700 dark:text-slate-300">Loading service details...</p>
        </div>
      </div>
    )
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 dark:from-slate-900 dark:via-purple-900 dark:to-pink-900 p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="flex flex-col items-center justify-center h-64">
              <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-slate-700 dark:text-slate-300">Service Not Found</h3>
              <p className="text-slate-500 dark:text-slate-400 text-center mb-4">
                {error || "The requested service could not be found."}
              </p>
              <Button asChild variant="outline">
                <Link href="/dashboard/events/services">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Services
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 dark:from-slate-900 dark:via-purple-900 dark:to-pink-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 dark:border-slate-700/20">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/events/services">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Services
              </Link>
            </Button>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 dark:from-purple-400 dark:via-pink-400 dark:to-red-400 bg-clip-text text-transparent">
                {service.name}
              </h1>
              <p className="text-slate-600 dark:text-slate-300 mt-2 text-lg">
                Event service for <span className="font-medium">{hotel?.name || "your hotel"}</span>
              </p>
              {hotelId && <p className="text-xs text-muted-foreground">Hotel ID: {hotelId}</p>}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/events/services/${service._id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Service
              </Link>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the service "{service.name}". This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                  >
                    Delete Service
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Service Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Package className="mr-2 h-5 w-5 text-purple-600" />
                Service Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Status</span>
                {getStatusBadge(service.status)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Category</span>
                {getCategoryBadge(service.category)}
              </div>
              {service.subcategory && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Subcategory</span>
                  <Badge variant="outline">{service.subcategory}</Badge>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Provider</span>
                <Badge variant={service.isExternalService ? "secondary" : "outline"}>
                  {service.isExternalService ? "External" : "In-house"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <DollarSign className="mr-2 h-5 w-5 text-green-600" />
                Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-2xl font-bold text-green-600">{formatPrice(service.price, service.priceType)}</div>
                {service.customPriceDetails && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{service.customPriceDetails}</p>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Min Quantity</span>
                  <span>{service.minimumQuantity}</span>
                </div>
                {service.maximumQuantity && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Max Quantity</span>
                    <span>{service.maximumQuantity}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Clock className="mr-2 h-5 w-5 text-blue-600" />
                Timing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Lead Time</span>
                  <span>{service.leadTime} hours</span>
                </div>
                {service.duration && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Duration</span>
                    <span>{service.duration} hours</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Setup Time</span>
                  <span>{service.setupTime} hours</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Cleanup Time</span>
                  <span>{service.cleanupTime} hours</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Information */}
        <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="p-0">
            <Tabs defaultValue="description" className="w-full">
              <div className="bg-gradient-to-r from-purple-700 to-pink-700 dark:from-purple-800 dark:to-pink-800 text-white rounded-t-lg">
                <TabsList className="bg-transparent border-none h-auto p-0">
                  <TabsTrigger
                    value="description"
                    className="bg-transparent text-white data-[state=active]:bg-white/20 data-[state=active]:text-white border-none rounded-none px-6 py-4"
                  >
                    Description
                  </TabsTrigger>
                  <TabsTrigger
                    value="restrictions"
                    className="bg-transparent text-white data-[state=active]:bg-white/20 data-[state=active]:text-white border-none rounded-none px-6 py-4"
                  >
                    Restrictions
                  </TabsTrigger>
                  {service.isExternalService && (
                    <TabsTrigger
                      value="provider"
                      className="bg-transparent text-white data-[state=active]:bg-white/20 data-[state=active]:text-white border-none rounded-none px-6 py-4"
                    >
                      Provider
                    </TabsTrigger>
                  )}
                  {service.inventory?.isLimited && (
                    <TabsTrigger
                      value="inventory"
                      className="bg-transparent text-white data-[state=active]:bg-white/20 data-[state=active]:text-white border-none rounded-none px-6 py-4"
                    >
                      Inventory
                    </TabsTrigger>
                  )}
                  {service.options.length > 0 && (
                    <TabsTrigger
                      value="options"
                      className="bg-transparent text-white data-[state=active]:bg-white/20 data-[state=active]:text-white border-none rounded-none px-6 py-4"
                    >
                      Options
                    </TabsTrigger>
                  )}
                  {service.images.length > 0 && (
                    <TabsTrigger
                      value="images"
                      className="bg-transparent text-white data-[state=active]:bg-white/20 data-[state=active]:text-white border-none rounded-none px-6 py-4"
                    >
                      Images
                    </TabsTrigger>
                  )}
                </TabsList>
              </div>

              <TabsContent value="description" className="p-6 space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Service Description</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {service.description || "No description provided."}
                  </p>
                </div>

                {service.seasonalAvailability.isAvailable && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center">
                      <Calendar className="mr-2 h-4 w-4" />
                      Seasonal Availability
                    </h4>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        {service.seasonalAvailability.description}
                      </p>
                      {service.seasonalAvailability.startDate && service.seasonalAvailability.endDate && (
                        <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                          Available from {new Date(service.seasonalAvailability.startDate).toLocaleDateString()}
                          to {new Date(service.seasonalAvailability.endDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="restrictions" className="p-6 space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-4">Service Restrictions</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2 flex items-center">
                        <MapPin className="mr-2 h-4 w-4" />
                        Venue Types
                      </h4>
                      <div className="space-y-1">
                        {service.restrictions.venueTypes.length > 0 ? (
                          service.restrictions.venueTypes.map((venue, index) => (
                            <Badge key={index} variant="outline" className="mr-1 mb-1">
                              {venue}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-sm text-slate-500">No venue restrictions</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2 flex items-center">
                        <Package className="mr-2 h-4 w-4" />
                        Event Types
                      </h4>
                      <div className="space-y-1">
                        {service.restrictions.eventTypes.length > 0 ? (
                          service.restrictions.eventTypes.map((event, index) => (
                            <Badge key={index} variant="outline" className="mr-1 mb-1">
                              {event}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-sm text-slate-500">No event type restrictions</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2 flex items-center">
                        <Users className="mr-2 h-4 w-4" />
                        Capacity Limits
                      </h4>
                      <div className="space-y-1 text-sm">
                        {service.restrictions.minCapacity && <p>Minimum: {service.restrictions.minCapacity} guests</p>}
                        {service.restrictions.maxCapacity && <p>Maximum: {service.restrictions.maxCapacity} guests</p>}
                        {!service.restrictions.minCapacity && !service.restrictions.maxCapacity && (
                          <p className="text-slate-500">No capacity restrictions</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2 flex items-center">
                        <Calendar className="mr-2 h-4 w-4" />
                        Available Days
                      </h4>
                      <p className="text-sm">
                        {formatDays(service.restrictions.availableDays) || "No specific day restrictions"}
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {service.isExternalService && service.externalProvider && (
                <TabsContent value="provider" className="p-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-4 flex items-center">
                      <ExternalLink className="mr-2 h-5 w-5" />
                      External Provider Details
                    </h3>

                    <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 space-y-4">
                      <div>
                        <h4 className="font-medium text-lg">{service.externalProvider.name}</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Contact: {service.externalProvider.contactPerson}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-slate-500" />
                          <span className="text-sm">{service.externalProvider.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-slate-500" />
                          <span className="text-sm">{service.externalProvider.email}</span>
                        </div>
                      </div>

                      {service.externalProvider.commissionRate && (
                        <div>
                          <span className="text-sm text-slate-600 dark:text-slate-400">Commission Rate: </span>
                          <span className="text-sm font-medium">{service.externalProvider.commissionRate}%</span>
                        </div>
                      )}

                      {service.externalProvider.contractDetails && (
                        <div>
                          <h5 className="font-medium mb-2">Contract Details</h5>
                          <p className="text-sm text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-700 p-3 rounded">
                            {service.externalProvider.contractDetails}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              )}

              {service.inventory?.isLimited && (
                <TabsContent value="inventory" className="p-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-4">Inventory Management</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-blue-600">{service.inventory.totalQuantity || 0}</div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Total Quantity</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {service.inventory.availableQuantity || 0}
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Available</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-orange-600">
                            {service.inventory.lowStockThreshold || 0}
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Low Stock Alert</p>
                        </CardContent>
                      </Card>
                    </div>

                    {service.inventory.availableQuantity !== undefined &&
                      service.inventory.lowStockThreshold !== undefined &&
                      service.inventory.availableQuantity <= service.inventory.lowStockThreshold && (
                        <div className="mt-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                          <div className="flex items-center">
                            <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
                            <span className="font-medium text-orange-800 dark:text-orange-200">Low Stock Alert</span>
                          </div>
                          <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                            This service is running low on inventory. Consider restocking soon.
                          </p>
                        </div>
                      )}
                  </div>
                </TabsContent>
              )}

              {service.options.length > 0 && (
                <TabsContent value="options" className="p-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-4">Service Options</h3>

                    <div className="space-y-4">
                      {service.options.map((option, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium">{option.name}</h4>
                            <Badge variant="outline">+${option.additionalPrice}</Badge>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{option.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              )}

              {service.images.length > 0 && (
                <TabsContent value="images" className="p-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-4 flex items-center">
                      <ImageIcon className="mr-2 h-5 w-5" />
                      Service Images
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {service.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
                            <img
                              src={image.url || "/placeholder.svg"}
                              alt={image.caption}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                          </div>
                          {image.isDefault && (
                            <Badge className="absolute top-2 left-2 bg-blue-600">
                              <Star className="h-3 w-3 mr-1" />
                              Default
                            </Badge>
                          )}
                          {image.caption && (
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{image.caption}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </CardContent>
        </Card>

        {/* Metadata */}
        <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Settings className="mr-2 h-5 w-5" />
              Service Metadata
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-600 dark:text-slate-400">Service ID:</span>
                <span className="ml-2 font-mono">{service._id}</span>
              </div>
              <div>
                <span className="text-slate-600 dark:text-slate-400">Hotel ID:</span>
                <span className="ml-2 font-mono">{service.hotel}</span>
              </div>
              <div>
                <span className="text-slate-600 dark:text-slate-400">Created:</span>
                <span className="ml-2">{new Date(service.created_at).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-600 dark:text-slate-400">Last Updated:</span>
                <span className="ml-2">{new Date(service.updated_at).toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
