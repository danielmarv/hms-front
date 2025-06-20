"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  Users,
  Clock,
  Tag,
  Settings,
  BarChart3,
  Loader2,
  ListChecks,
  FileIcon as FileTemplate,
} from "lucide-react"
import { useEventTypes } from "@/hooks/use-event-types"
import { useEventReports } from "@/hooks/use-event-reports"
import { useCurrentHotel } from "@/hooks/use-current-hotel"
import { toast } from "sonner"
import { Separator } from "@/components/ui/separator"
import { DataTable } from "@/components/data-table"
import { columns } from "./components/columns"
import { useEvents } from "@/hooks/use-events"

interface EventTypeDetailsPageProps {
  params: {
    id: string
  }
}

export default function EventTypeDetailsPage({ params }: EventTypeDetailsPageProps) {
  const router = useRouter()
  const { currentHotel } = useCurrentHotel()
  const { getEventTypeById, deleteEventType, getEventTypeStatistics, getEventTypeTemplate } = useEventTypes(
    currentHotel?._id,
  )
  const { getRevenueAnalysisReport } = useEventReports(currentHotel?._id)
  const { getEventsByType } = useEvents(currentHotel?._id)

  const [eventType, setEventType] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [statistics, setStatistics] = useState<any>(null)
  const [statisticsLoading, setStatisticsLoading] = useState(false)
  const [events, setEvents] = useState([])
  const [eventsLoading, setEventsLoading] = useState(false)
  const [template, setTemplate] = useState<any>(null)
  const [templateLoading, setTemplateLoading] = useState(false)

  useEffect(() => {
    const fetchEventType = async () => {
      if (!currentHotel || !params.id) return

      try {
        setLoading(true)
        const data = await getEventTypeById(params.id)
        setEventType(data)
      } catch (error) {
        console.error("Failed to fetch event type:", error)
        toast.error("Failed to load event type")
        router.push("/dashboard/events/event-types")
      } finally {
        setLoading(false)
      }
    }

    fetchEventType()
  }, [currentHotel, params.id, getEventTypeById, router])

  useEffect(() => {
    const fetchStatistics = async () => {
      if (!currentHotel || !params.id) return

      try {
        setStatisticsLoading(true)
        const data = await getEventTypeStatistics(params.id)
        setStatistics(data)
      } catch (error) {
        console.error("Failed to fetch event type statistics:", error)
        toast.error("Failed to load event type statistics")
      } finally {
        setStatisticsLoading(false)
      }
    }

    fetchStatistics()
  }, [currentHotel, params.id, getEventTypeStatistics])

  useEffect(() => {
    const fetchEvents = async () => {
      if (!currentHotel || !params.id) return

      try {
        setEventsLoading(true)
        const data = await getEventsByType(params.id)
        setEvents(data)
      } catch (error) {
        console.error("Failed to fetch events by type:", error)
        toast.error("Failed to load events by type")
      } finally {
        setEventsLoading(false)
      }
    }

    fetchEvents()
  }, [currentHotel, params.id, getEventsByType])

  useEffect(() => {
    const fetchTemplate = async () => {
      if (!currentHotel || !params.id) return

      try {
        setTemplateLoading(true)
        const data = await getEventTypeTemplate(params.id)
        setTemplate(data)
      } catch (error) {
        console.error("Failed to fetch event type template:", error)
        toast.error("Failed to load event type template")
      } finally {
        setTemplateLoading(false)
      }
    }

    fetchTemplate()
  }, [currentHotel, params.id, getEventTypeTemplate])

  const loadAnalytics = async () => {
    if (!currentHotel || !params.id) return

    setAnalyticsLoading(true)
    try {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setMonth(startDate.getMonth() - 6) // Last 6 months

      const revenueReport = await getRevenueAnalysisReport(currentHotel._id, startDate, endDate, "event_type")

      // Filter data for this specific event type
      const eventTypeData = revenueReport?.data?.find((item: any) => item.id === params.id)

      setAnalyticsData({
        revenue: revenueReport,
        eventTypeSpecific: eventTypeData,
      })
    } catch (error) {
      console.error("Failed to load analytics:", error)
      toast.error("Failed to load analytics data")
    } finally {
      setAnalyticsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!eventType) return

    try {
      await deleteEventType(eventType._id)
      toast.success(`Event type "${eventType.name}" deleted successfully`)
      router.push("/dashboard/events/event-types")
    } catch (error) {
      toast.error("Failed to delete event type")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-200">
            Active
          </Badge>
        )
      case "inactive":
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-200">
            Inactive
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600 dark:text-indigo-400" />
          <p className="text-lg font-medium text-slate-700 dark:text-slate-300">Loading event type...</p>
        </div>
      </div>
    )
  }

  if (!eventType) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Event Type Not Found</h2>
          <p className="text-muted-foreground mb-4">The requested event type could not be found.</p>
          <Button onClick={() => router.push("/dashboard/events/event-types")}>Back to Event Types</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-indigo-900 dark:to-purple-900 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 dark:border-slate-700/20">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="hover:bg-white/50 dark:hover:bg-slate-700/50"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-3">
              <div
                className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-700 shadow-sm"
                style={{ backgroundColor: eventType.color || "#6366f1" }}
              />
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                  {eventType.name}
                </h1>
                <p className="text-slate-600 dark:text-slate-300 mt-1">
                  {eventType.category} • {currentHotel?.name}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusBadge(eventType.status)}
            <Button variant="outline" size="sm" onClick={loadAnalytics} disabled={analyticsLoading}>
              <BarChart3 className={`h-4 w-4 mr-2 ${analyticsLoading ? "animate-pulse" : ""}`} />
              Analytics
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/dashboard/events/event-types/${eventType._id}/edit`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="template">Template</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">Base Price</p>
                      <p className="text-3xl font-bold">${eventType.base_price?.toFixed(2) || "0.00"}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-blue-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium">Duration</p>
                      <p className="text-3xl font-bold">{eventType.default_duration || 0}m</p>
                    </div>
                    <Clock className="h-8 w-8 text-green-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium">Max Attendees</p>
                      <p className="text-3xl font-bold">{eventType.max_attendees || 0}</p>
                    </div>
                    <Users className="h-8 w-8 text-purple-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm font-medium">Category</p>
                      <p className="text-xl font-bold">{eventType.category || "General"}</p>
                    </div>
                    <Tag className="h-8 w-8 text-orange-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">Price Per Person</p>
                      <p className="text-xl font-bold">${eventType.price_per_person?.toFixed(2) || "N/A"}</p>
                    </div>
                    <DollarSign className="h-6 w-6 text-blue-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium">Default Capacity</p>
                      <p className="text-xl font-bold">{eventType.default_capacity || "N/A"}</p>
                    </div>
                    <Users className="h-6 w-6 text-green-200" />
                  </div>
                </CardContent>
              </Card>

              {eventType.icon && (
                <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-sm font-medium">Icon</p>
                        <p className="text-xl font-bold">{eventType.icon || "N/A"}</p>
                      </div>
                      <ListChecks className="h-6 w-6 text-purple-200" />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {eventType.description || "No description provided."}
                </p>
              </CardContent>
            </Card>

            {eventType.tags && eventType.tags.length > 0 && (
              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {eventType.tags.map((tag: string) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {eventType.features && eventType.features.length > 0 && (
              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle>Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {eventType.features.map((feature: string) => (
                      <Badge key={feature} variant="secondary">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="mr-2 h-5 w-5" />
                  Event Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <div>
                        <h4 className="font-medium">Requires Approval</h4>
                        <p className="text-sm text-muted-foreground">Events need approval before confirmation</p>
                      </div>
                      <Badge variant={eventType.requires_approval ? "default" : "secondary"}>
                        {eventType.requires_approval ? "Yes" : "No"}
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <div>
                        <h4 className="font-medium">Recurring Events</h4>
                        <p className="text-sm text-muted-foreground">Allow recurring scheduling</p>
                      </div>
                      <Badge variant={eventType.is_recurring ? "default" : "secondary"}>
                        {eventType.is_recurring ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <h4 className="font-medium mb-2">Capacity Range</h4>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">Min:</span>
                        <Badge variant="outline">{eventType.min_attendees || 1}</Badge>
                        <span className="text-sm text-muted-foreground">Max:</span>
                        <Badge variant="outline">{eventType.max_attendees || 100}</Badge>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <h4 className="font-medium mb-2">Timing</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Setup Time:</span>
                          <span className="text-sm font-medium">{eventType.setup_time || 0} minutes</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Cleanup Time:</span>
                          <span className="text-sm font-medium">{eventType.cleanup_time || 0} minutes</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {analyticsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
                  <p className="text-lg font-medium text-slate-700 dark:text-slate-300">Loading analytics...</p>
                </div>
              </div>
            ) : analyticsData ? (
              <div className="space-y-6">
                {analyticsData.eventTypeSpecific && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-indigo-100 text-sm font-medium">Total Events</p>
                            <p className="text-3xl font-bold">{analyticsData.eventTypeSpecific.count || 0}</p>
                          </div>
                          <Calendar className="h-8 w-8 text-indigo-200" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-green-100 text-sm font-medium">Total Revenue</p>
                            <p className="text-3xl font-bold">
                              ${analyticsData.eventTypeSpecific.revenue?.toLocaleString() || 0}
                            </p>
                          </div>
                          <DollarSign className="h-8 w-8 text-green-200" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-purple-100 text-sm font-medium">Avg Revenue/Event</p>
                            <p className="text-3xl font-bold">
                              $
                              {analyticsData.eventTypeSpecific.count > 0
                                ? (
                                    analyticsData.eventTypeSpecific.revenue / analyticsData.eventTypeSpecific.count
                                  ).toFixed(0)
                                : 0}
                            </p>
                          </div>
                          <BarChart3 className="h-8 w-8 text-purple-200" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle>Performance Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        {analyticsData.eventTypeSpecific
                          ? "Detailed analytics charts and insights will be available here."
                          : "No analytics data available for this event type yet."}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Analytics Data</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Click the "Analytics" button above to load performance data for this event type.
                  </p>
                  <Button onClick={loadAnalytics} disabled={analyticsLoading}>
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Load Analytics
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            {eventsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
                  <p className="text-lg font-medium text-slate-700 dark:text-slate-300">Loading events...</p>
                </div>
              </div>
            ) : (
              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle>Events of Type {eventType.name}</CardTitle>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Here are the events of type {eventType.name} in your hotel.
                    </p>
                  </CardContent>
                </CardHeader>
                <Separator />
                <CardContent>
                  <DataTable columns={columns} data={events} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="template" className="space-y-6">
            {templateLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
                  <p className="text-lg font-medium text-slate-700 dark:text-slate-300">Loading template...</p>
                </div>
              </div>
            ) : template ? (
              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle>Template Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Template Name: {template.name}</p>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileTemplate className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Template Data</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    No template data available for this event type yet.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
