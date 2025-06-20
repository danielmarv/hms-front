"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
  MoreHorizontal,
  Trash2,
  Share2,
  Copy,
  Calendar,
  Clock,
  Users,
  DollarSign,
  MapPin,
  FileIcon as FileTemplate,
  Loader2,
  Star,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Eye,
} from "lucide-react"
import { useEventTemplates, type EventTemplate, type TemplatePreview } from "@/hooks/use-event-templates"
import { toast } from "sonner"
import Link from "next/link"

export default function TemplateDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const templateId = params.id as string

  const { getTemplateById, deleteTemplate, previewTemplate, getTemplateUsageStats } = useEventTemplates()

  const [template, setTemplate] = useState<EventTemplate | null>(null)
  const [preview, setPreview] = useState<TemplatePreview | null>(null)
  const [usageStats, setUsageStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch template data
  useEffect(() => {
    const fetchTemplateData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch template details
        const templateData = await getTemplateById(templateId)
        if (!templateData) {
          throw new Error("Template not found")
        }
        setTemplate(templateData)

        // Fetch preview with cost calculations
        const previewData = await previewTemplate(templateId)
        if (previewData) {
          setPreview(previewData)
        }

        // Fetch usage statistics
        const statsData = await getTemplateUsageStats(templateId)
        if (statsData) {
          setUsageStats(statsData)
        }
      } catch (err) {
        console.error("Failed to fetch template data:", err)
        setError(err instanceof Error ? err.message : "Failed to load template")
        toast.error("Failed to load template details")
      } finally {
        setLoading(false)
      }
    }

    if (templateId) {
      fetchTemplateData()
    }
  }, [templateId, getTemplateById, previewTemplate, getTemplateUsageStats])

  const handleDelete = async () => {
    if (!template) return

    try {
      const success = await deleteTemplate(template._id)
      if (success) {
        toast.success("Template deleted successfully")
        router.push("/dashboard/events/templats")
      }
    } catch (error) {
      toast.error("Failed to delete template")
    }
  }

  const formatPrice = (price: number | undefined) => {
    return price ? `$${price.toFixed(2)}` : "N/A"
  }

  const formatDuration = (minutes: number | undefined) => {
    if (!minutes) return "N/A"
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
        <CheckCircle className="h-3 w-3 mr-1" />
        Active
      </Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
        <AlertCircle className="h-3 w-3 mr-1" />
        Inactive
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-slate-900 dark:via-blue-900 dark:to-cyan-900">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400" />
          <p className="text-lg font-medium text-slate-700 dark:text-slate-300">Loading template details...</p>
        </div>
      </div>
    )
  }

  if (error || !template) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-slate-900 dark:via-blue-900 dark:to-cyan-900 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="flex flex-col items-center justify-center h-64">
              <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-slate-700 dark:text-slate-300">Template Not Found</h3>
              <p className="text-slate-500 dark:text-slate-400 text-center mb-4">
                {error || "The requested template could not be found."}
              </p>
              <Button onClick={() => router.push("/dashboard/events/templats")} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Templates
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-slate-900 dark:via-blue-900 dark:to-cyan-900 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 dark:border-slate-700/20">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.back()}
              className="border-blue-200 hover:bg-blue-50 dark:border-blue-700 dark:hover:bg-blue-900"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 rounded-lg p-3">
                <FileTemplate className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{template.name}</h1>
                <div className="flex items-center space-x-2 mt-1">
                  {getStatusBadge(template.isActive)}
                  <Badge variant="outline" className="text-xs">
                    {template.eventType.name}
                  </Badge>
                  {usageStats && (
                    <Badge variant="outline" className="text-xs">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {usageStats.totalUsage || 0} uses
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/events/templats/${template._id}/create-event`}>
                <Calendar className="h-4 w-4 mr-2" />
                Create Event
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/events/templats/${template._id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Template
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/events/templats/${template._id}/duplicate`}>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/events/templats/${template._id}/share`}>
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Template
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete the template "{template.name}". This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="services">Services & Staffing</TabsTrigger>
            <TabsTrigger value="costs">Cost Breakdown</TabsTrigger>
            <TabsTrigger value="usage">Usage & Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 dark:bg-blue-900 rounded-lg p-2">
                      <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Duration</p>
                      <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
                        {formatDuration(template.duration)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 dark:bg-green-900 rounded-lg p-2">
                      <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Capacity</p>
                      <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
                        {template.capacity || "Flexible"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="bg-purple-100 dark:bg-purple-900 rounded-lg p-2">
                      <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Base Price</p>
                      <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
                        {formatPrice(template.basePrice)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="bg-orange-100 dark:bg-orange-900 rounded-lg p-2">
                      <MapPin className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Venue</p>
                      <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{template.venue.name}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-800 dark:text-slate-200">Template Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {template.description && (
                    <div>
                      <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">Description</h4>
                      <p className="text-slate-600 dark:text-slate-400">{template.description}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">Setup Time</h4>
                      <p className="text-slate-600 dark:text-slate-400">{formatDuration(template.setupTime)}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">Teardown Time</h4>
                      <p className="text-slate-600 dark:text-slate-400">{formatDuration(template.teardownTime)}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">Event Type</h4>
                    <Badge variant="outline" className="text-sm">
                      {template.eventType.name}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-800 dark:text-slate-200">Included Items</CardTitle>
                </CardHeader>
                <CardContent>
                  {template.includedItems && template.includedItems.length > 0 ? (
                    <div className="space-y-2">
                      {template.includedItems.map((item, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                          <span className="text-slate-700 dark:text-slate-300">{item}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 dark:text-slate-400 italic">No included items specified</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {template.terms && (
              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-800 dark:text-slate-200">Terms & Conditions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{template.terms}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Services & Staffing Tab */}
          <TabsContent value="services" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-800 dark:text-slate-200">Services</CardTitle>
                </CardHeader>
                <CardContent>
                  {template.services && template.services.length > 0 ? (
                    <div className="space-y-3">
                      {template.services.map((service, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg"
                        >
                          <div>
                            <h4 className="font-medium text-slate-900 dark:text-slate-100">{service.name}</h4>
                            {service.description && (
                              <p className="text-sm text-slate-600 dark:text-slate-400">{service.description}</p>
                            )}
                            {service.category && (
                              <Badge variant="outline" className="text-xs mt-1">
                                {service.category}
                              </Badge>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-slate-900 dark:text-slate-100">
                              {formatPrice(service.price)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 dark:text-slate-400 italic">No services specified</p>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-800 dark:text-slate-200">Staffing Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  {template.staffing && template.staffing.length > 0 ? (
                    <div className="space-y-3">
                      {template.staffing.map((staff, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg"
                        >
                          <div>
                            <h4 className="font-medium text-slate-900 dark:text-slate-100">{staff.role}</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {staff.count} {staff.count === 1 ? "person" : "people"}
                            </p>
                          </div>
                          <div className="text-right">
                            {staff.hourlyRate && (
                              <p className="font-semibold text-slate-900 dark:text-slate-100">
                                {formatPrice(staff.hourlyRate)}/hr
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 dark:text-slate-400 italic">No staffing requirements specified</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Cost Breakdown Tab */}
          <TabsContent value="costs" className="space-y-6">
            {preview && preview.estimatedCosts ? (
              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-800 dark:text-slate-200">Estimated Costs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Base Price</p>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                        {formatPrice(preview.estimatedCosts.basePrice)}
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-sm font-medium text-green-600 dark:text-green-400">Services Cost</p>
                      <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                        {formatPrice(preview.estimatedCosts.servicesCost)}
                      </p>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Staffing Cost</p>
                      <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                        {formatPrice(preview.estimatedCosts.staffingCost)}
                      </p>
                    </div>
                    <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border-2 border-orange-200 dark:border-orange-700">
                      <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Total Estimated</p>
                      <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                        {formatPrice(preview.estimatedCosts.totalEstimatedCost)}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-medium text-slate-700 dark:text-slate-300">Cost Breakdown Details</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 dark:text-slate-400">Base Template Price</span>
                        <span className="font-medium">{formatPrice(preview.estimatedCosts.basePrice)}</span>
                      </div>
                      {preview.estimatedCosts.servicesCost > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600 dark:text-slate-400">Additional Services</span>
                          <span className="font-medium">{formatPrice(preview.estimatedCosts.servicesCost)}</span>
                        </div>
                      )}
                      {preview.estimatedCosts.staffingCost > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600 dark:text-slate-400">Staffing (estimated)</span>
                          <span className="font-medium">{formatPrice(preview.estimatedCosts.staffingCost)}</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between items-center text-lg font-semibold">
                        <span>Total Estimated Cost</span>
                        <span>{formatPrice(preview.estimatedCosts.totalEstimatedCost)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
                <CardContent className="flex flex-col items-center justify-center h-32">
                  <Eye className="h-8 w-8 text-slate-400 mb-2" />
                  <p className="text-slate-500 dark:text-slate-400">Cost breakdown not available</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Usage & Analytics Tab */}
          <TabsContent value="usage" className="space-y-6">
            {usageStats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 dark:bg-blue-900 rounded-lg p-2">
                        <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Usage</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                          {usageStats.totalUsage || 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <div className="bg-green-100 dark:bg-green-900 rounded-lg p-2">
                        <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">This Month</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                          {usageStats.thisMonth || 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <div className="bg-purple-100 dark:bg-purple-900 rounded-lg p-2">
                        <Star className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Average Rating</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                          {usageStats.averageRating ? `${usageStats.averageRating.toFixed(1)}/5` : "N/A"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
                <CardContent className="flex flex-col items-center justify-center h-32">
                  <TrendingUp className="h-8 w-8 text-slate-400 mb-2" />
                  <p className="text-slate-500 dark:text-slate-400">Usage statistics not available</p>
                </CardContent>
              </Card>
            )}

            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg text-slate-800 dark:text-slate-200">Template Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">Created</h4>
                    <p className="text-slate-600 dark:text-slate-400">
                      {new Date(template.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">Last Updated</h4>
                    <p className="text-slate-600 dark:text-slate-400">
                      {new Date(template.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {template.sharedWith && template.sharedWith.length > 0 && (
                  <div>
                    <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">Shared With</h4>
                    <div className="space-y-2">
                      {template.sharedWith.map((share, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700 rounded"
                        >
                          <span className="text-slate-600 dark:text-slate-400">{share.userId}</span>
                          <div className="flex space-x-1">
                            {share.permissions.map((permission, pIndex) => (
                              <Badge key={pIndex} variant="outline" className="text-xs">
                                {permission}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
