"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  ArrowLeft,
  Edit,
  Trash2,
  Package,
  DollarSign,
  Clock,
  Users,
  Calendar,
  Star,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  ImageIcon,
} from "lucide-react"
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
import { useEventServices, type EventService } from "@/hooks/use-event-services"
import { toast } from "sonner"

interface EventServiceDetailsPageProps {
  params: {
    id: string
  }
}

export default function EventServiceDetailsPage({ params }: EventServiceDetailsPageProps) {
  const router = useRouter()
  const { getServiceById, deleteService, checkServiceAvailability } = useEventServices()

  const [service, setService] = useState<EventService | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [availabilityCheck, setAvailabilityCheck] = useState<{
    isAvailable: boolean
    reason?: string
  } | null>(null)

  // Load service details
  useEffect(() => {
    const loadService = async () => {
      try {
        setLoading(true)
        setError(null)
        const serviceData = await getServiceById(params.id)

        if (serviceData) {
          setService(serviceData)
          // Check current availability
          const availability = await checkServiceAvailability(params.id, new Date().toISOString())
          setAvailabilityCheck(availability)
        } else {
          setError("Service not found")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load service")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      loadService()
    }
  }, [params.id, getServiceById, checkServiceAvailability])

  // Handle service deletion
  const handleDelete = async () => {
    if (!service) return

    try {
      await deleteService(service._id)
      toast.success(`Service "${service.name}" deleted successfully`)
      router.push("/dashboard/events/services")
    } catch (error) {
      toast.error("Failed to delete service")
    }
  }

  // Get status badge
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
            <AlertTriangle className="h-3 w-3 mr-1" />
            Seasonal
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Get category badge
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

  // Format price
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

  // Format duration
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
    }
    return `${mins}m`
  }

  if (loading) {
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
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="flex flex-col items-center justify-center h-64">
              <Package className="h-12 w-12 text-slate-400 dark:text-slate-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-slate-700 dark:text-slate-300">Service Not Found</h3>
              <p className="text-slate-500 dark:text-slate-400 text-center mb-4">
                {error || "The requested service could not be found."}
              </p>
              <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 dark:from-slate-900 dark:via-purple-900 dark:to-pink-900 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 dark:border-slate-700/20">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.back()}
              className="border-purple-200 hover:bg-purple-50 dark:border-purple-700 dark:hover:bg-purple-900"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 dark:from-purple-400 dark:via-pink-400 dark:to-red-400 bg-clip-text text-transparent">
                {service.name}
              </h1>
              <div className="flex items-center space-x-2 mt-2">
                {getCategoryBadge(service.category)}
                {getStatusBadge(service.status)}
                {service.isExternalService && (
                  <Badge variant="outline">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    External
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="border-purple-200 hover:bg-purple-50 dark:border-purple-700 dark:hover:bg-purple-900"
            >
              <Link href={`/dashboard/events/services/${service._id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-200 hover:bg-red-50 text-red-600 dark:border-red-700 dark:hover:bg-red-900 dark:text-red-400"
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

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="pricing">Pricing</TabsTrigger>
                <TabsTrigger value="availability">Availability</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Package className="mr-2 h-5 w-5" />
                      Service Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {service.description && (
                      <div>
                        <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Description</h4>
                        <p className="text-slate-600 dark:text-slate-400">{service.description}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Category</h4>
                        <div className="flex items-center space-x-2">
                          {getCategoryBadge(service.category)}
                          {service.subcategory && <Badge variant="outline">{service.subcategory}</Badge>}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Lead Time</h4>
                        <div className="flex items-center text-slate-600 dark:text-slate-400">
                          <Clock className="h-4 w-4 mr-2" />
                          {service.leadTime} hours
                        </div>
                      </div>

                      {service.duration && (
                        <div>
                          <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Duration</h4>
                          <div className="flex items-center text-slate-600 dark:text-slate-400">
                            <Clock className="h-4 w-4 mr-2" />
                            {formatDuration(service.duration)}
                          </div>
                        </div>
                      )}

                      <div>
                        <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Setup/Cleanup</h4>
                        <div className="text-slate-600 dark:text-slate-400">
                          Setup: {formatDuration(service.setupTime)} | Cleanup: {formatDuration(service.cleanupTime)}
                        </div>
                      </div>
                    </div>

                    {service.options && service.options.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Service Options</h4>
                        <div className="space-y-2">
                          {service.options.map((option, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg"
                            >
                              <div>
                                <div className="font-medium text-slate-900 dark:text-slate-100">{option.name}</div>
                                {option.description && (
                                  <div className="text-sm text-slate-600 dark:text-slate-400">{option.description}</div>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="font-semibold text-slate-900 dark:text-slate-100">
                                  +${option.additionalPrice.toFixed(2)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Images */}
                {service.images && service.images.length > 0 && (
                  <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <ImageIcon className="mr-2 h-5 w-5" />
                        Service Images
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {service.images.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image.url || "/placeholder.svg"}
                              alt={image.caption || service.name}
                              className="w-full h-48 object-cover rounded-lg"
                            />
                            {image.isDefault && (
                              <Badge className="absolute top-2 left-2 bg-purple-600 text-white">Default</Badge>
                            )}
                            {image.caption && (
                              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 rounded-b-lg">
                                <p className="text-sm">{image.caption}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Pricing Tab */}
              <TabsContent value="pricing" className="space-y-6">
                <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <DollarSign className="mr-2 h-5 w-5" />
                      Pricing Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Base Price</h4>
                          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                            {formatPrice(service.price, service.priceType)}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Price Type</h4>
                          <Badge variant="outline" className="text-sm">
                            {service.priceType.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                          </Badge>
                        </div>

                        {service.customPriceDetails && (
                          <div>
                            <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">
                              Custom Pricing Details
                            </h4>
                            <p className="text-slate-600 dark:text-slate-400">{service.customPriceDetails}</p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Quantity Limits</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-slate-600 dark:text-slate-400">Minimum:</span>
                              <span className="font-medium">{service.minimumQuantity}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600 dark:text-slate-400">Maximum:</span>
                              <span className="font-medium">{service.maximumQuantity || "No limit"}</span>
                            </div>
                          </div>
                        </div>

                        {service.inventory?.isLimited && (
                          <div>
                            <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Inventory</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-slate-600 dark:text-slate-400">Total:</span>
                                <span className="font-medium">{service.inventory.totalQuantity}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-600 dark:text-slate-400">Available:</span>
                                <span className="font-medium">{service.inventory.availableQuantity}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-600 dark:text-slate-400">Low Stock Alert:</span>
                                <span className="font-medium">{service.inventory.lowStockThreshold}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Availability Tab */}
              <TabsContent value="availability" className="space-y-6">
                <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="mr-2 h-5 w-5" />
                      Availability & Restrictions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Current Availability Status */}
                    {availabilityCheck && (
                      <div className="p-4 rounded-lg border-2 border-dashed">
                        <div className="flex items-center space-x-2 mb-2">
                          {availabilityCheck.isAvailable ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                          <h4 className="font-semibold">
                            {availabilityCheck.isAvailable ? "Currently Available" : "Currently Unavailable"}
                          </h4>
                        </div>
                        {availabilityCheck.reason && (
                          <p className="text-sm text-slate-600 dark:text-slate-400">{availabilityCheck.reason}</p>
                        )}
                      </div>
                    )}

                    {/* Available Days */}
                    <div>
                      <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-3">Available Days</h4>
                      <div className="grid grid-cols-7 gap-2">
                        {Object.entries(service.restrictions.availableDays).map(([day, isAvailable]) => (
                          <div
                            key={day}
                            className={`p-2 text-center rounded-lg text-sm font-medium ${
                              isAvailable
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            }`}
                          >
                            {day.charAt(0).toUpperCase() + day.slice(1, 3)}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Venue & Event Type Restrictions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {service.restrictions.venueTypes.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Applicable Venues</h4>
                          <div className="space-y-1">
                            {service.restrictions.venueTypes.map((venueType, index) => (
                              <Badge key={index} variant="outline" className="mr-1 mb-1">
                                {venueType.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {service.restrictions.eventTypes.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            Applicable Event Types
                          </h4>
                          <div className="space-y-1">
                            {service.restrictions.eventTypes.map((eventType, index) => (
                              <Badge key={index} variant="outline" className="mr-1 mb-1">
                                {eventType}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Capacity Restrictions */}
                    {(service.restrictions.minCapacity || service.restrictions.maxCapacity) && (
                      <div>
                        <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          Event Capacity Requirements
                        </h4>
                        <div className="flex items-center space-x-4">
                          {service.restrictions.minCapacity && (
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-1 text-slate-400" />
                              <span className="text-sm">Min: {service.restrictions.minCapacity}</span>
                            </div>
                          )}
                          {service.restrictions.maxCapacity && (
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-1 text-slate-400" />
                              <span className="text-sm">Max: {service.restrictions.maxCapacity}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Seasonal Availability */}
                    <div>
                      <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Seasonal Availability</h4>
                      {service.seasonalAvailability.isAvailable ? (
                        <div className="flex items-center text-green-600 dark:text-green-400">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Available year-round
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center text-orange-600 dark:text-orange-400">
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            Seasonal availability
                          </div>
                          {service.seasonalAvailability.startDate && service.seasonalAvailability.endDate && (
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                              Available from {new Date(service.seasonalAvailability.startDate).toLocaleDateString()} to{" "}
                              {new Date(service.seasonalAvailability.endDate).toLocaleDateString()}
                            </div>
                          )}
                          {service.seasonalAvailability.description && (
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {service.seasonalAvailability.description}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Reviews Tab */}
              <TabsContent value="reviews" className="space-y-6">
                <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Star className="mr-2 h-5 w-5" />
                        Reviews & Ratings
                      </div>
                      {service.averageRating > 0 && (
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < Math.floor(service.averageRating)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="font-semibold">{service.averageRating.toFixed(1)}</span>
                        </div>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {service.reviews && service.reviews.length > 0 ? (
                      <div className="space-y-4">
                        {service.reviews.map((review, index) => (
                          <div
                            key={review._id || index}
                            className="border-b border-slate-200 dark:border-slate-700 pb-4 last:border-b-0"
                          >
                            <div className="flex items-start space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>{review.reviewer.charAt(0).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <h5 className="font-medium text-slate-900 dark:text-slate-100">{review.reviewer}</h5>
                                  <div className="flex items-center space-x-2">
                                    <div className="flex items-center">
                                      {Array.from({ length: 5 }).map((_, i) => (
                                        <Star
                                          key={i}
                                          className={`h-3 w-3 ${
                                            i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                          }`}
                                        />
                                      ))}
                                    </div>
                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                      {new Date(review.date).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400">{review.comment}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Star className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-500 dark:text-slate-400">No reviews yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Quick Info Card */}
            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg">Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Status</span>
                  {getStatusBadge(service.status)}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Price</span>
                  <span className="font-semibold">{formatPrice(service.price, service.priceType)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Lead Time</span>
                  <span className="font-semibold">{service.leadTime}h</span>
                </div>

                {service.duration && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Duration</span>
                    <span className="font-semibold">{formatDuration(service.duration)}</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Provider</span>
                  <span className="font-semibold">{service.isExternalService ? "External" : "In-house"}</span>
                </div>

                {service.averageRating > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Rating</span>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{service.averageRating.toFixed(1)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* External Provider Info */}
            {service.isExternalService && service.externalProvider && (
              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    External Provider
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                      {service.externalProvider.name}
                    </h4>
                    {service.externalProvider.contactPerson && (
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Contact: {service.externalProvider.contactPerson}
                      </p>
                    )}
                  </div>

                  {service.externalProvider.phone && (
                    <div className="text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Phone: </span>
                      <span className="font-medium">{service.externalProvider.phone}</span>
                    </div>
                  )}

                  {service.externalProvider.email && (
                    <div className="text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Email: </span>
                      <span className="font-medium">{service.externalProvider.email}</span>
                    </div>
                  )}

                  {service.externalProvider.commissionRate && (
                    <div className="text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Commission: </span>
                      <span className="font-medium">{service.externalProvider.commissionRate}%</span>
                    </div>
                  )}

                  {service.externalProvider.contractDetails && (
                    <div className="text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Contract: </span>
                      <p className="text-slate-600 dark:text-slate-400 mt-1">
                        {service.externalProvider.contractDetails}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Metadata */}
            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg">Metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <span className="text-slate-600 dark:text-slate-400">Created: </span>
                  <span className="font-medium">{new Date(service.created_at).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-slate-600 dark:text-slate-400">Updated: </span>
                  <span className="font-medium">{new Date(service.updated_at).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-slate-600 dark:text-slate-400">Service ID: </span>
                  <span className="font-mono text-xs">{service._id}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
