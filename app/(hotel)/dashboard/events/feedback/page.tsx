"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, MessageSquare, ThumbsUp, Search, Filter, Download, BarChart3, Calendar, Reply } from "lucide-react"
import { format } from "date-fns"
import { useEventFeedback } from "@/hooks/use-event-feedback"
import { useEvents } from "@/hooks/use-events"
import { useCurrentHotel } from "@/hooks/use-current-hotel"
import { toast } from "sonner"

export default function EventFeedbackPage() {
  const router = useRouter()
  const { currentHotel } = useCurrentHotel()
  const {
    feedback,
    analytics,
    statistics,
    loading,
    error,
    fetchFeedback,
    getFeedbackAnalytics,
    getFeedbackStatistics,
    respondToFeedback,
    bulkExportFeedback,
    calculateAverageRating,
    getRatingDistribution,
    getResponseRate,
    getRecommendationRate,
    filterFeedbackByRating,
    searchFeedback,
  } = useEventFeedback()

  const { events, fetchEvents } = useEvents()

  const [filteredFeedback, setFilteredFeedback] = useState(feedback)
  const [searchTerm, setSearchTerm] = useState("")
  const [ratingFilter, setRatingFilter] = useState("all")
  const [responseFilter, setResponseFilter] = useState("all")
  const [eventFilter, setEventFilter] = useState("all")
  const [showResponseDialog, setShowResponseDialog] = useState(false)
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null)
  const [responseText, setResponseText] = useState("")
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [exportFormat, setExportFormat] = useState("csv")

  useEffect(() => {
    if (currentHotel) {
      fetchFeedback({ hotel: currentHotel.id })
      fetchEvents({ hotel: currentHotel.id })
      getFeedbackAnalytics({ hotel: currentHotel.id })
      getFeedbackStatistics(currentHotel.id)
    }
  }, [currentHotel])

  useEffect(() => {
    let filtered = feedback

    // Apply search filter
    if (searchTerm) {
      filtered = searchFeedback(filtered, searchTerm)
    }

    // Apply rating filter
    if (ratingFilter !== "all") {
      const rating = Number.parseInt(ratingFilter)
      filtered = filterFeedbackByRating(filtered, rating, rating)
    }

    // Apply response filter
    if (responseFilter !== "all") {
      const isResponded = responseFilter === "responded"
      filtered = filtered.filter((fb) => fb.isResponded === isResponded)
    }

    // Apply event filter - fix to use correct property name
    if (eventFilter !== "all") {
      filtered = filtered.filter((fb) => fb.event === eventFilter) // Changed from fb.booking to fb.event
    }

    setFilteredFeedback(filtered)
  }, [feedback, searchTerm, ratingFilter, responseFilter, eventFilter, searchFeedback, filterFeedbackByRating])

  const handleRespondToFeedback = async () => {
    if (!selectedFeedback || !responseText.trim()) return

    try {
      await respondToFeedback(selectedFeedback._id, { response: responseText })
      setShowResponseDialog(false)
      setSelectedFeedback(null)
      setResponseText("")
      toast.success("Response sent successfully")
    } catch (error) {
      toast.error("Failed to send response")
    }
  }

  const handleBulkExport = async () => {
    if (!currentHotel) return

    try {
      const filters = {
        hotel: currentHotel.id,
        ...(ratingFilter !== "all" && {
          rating_min: Number.parseInt(ratingFilter),
          rating_max: Number.parseInt(ratingFilter),
        }),
        ...(eventFilter !== "all" && { event: eventFilter }),
      }

      const exportData = await bulkExportFeedback(filters, exportFormat)

      // Create and download file
      const blob = new Blob([JSON.stringify(exportData.data, null, 2)], {
        type: exportFormat === "csv" ? "text/csv" : "application/json",
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `feedback-export-${format(new Date(), "yyyy-MM-dd")}.${exportFormat}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setShowExportDialog(false)
      toast.success("Feedback exported successfully")
    } catch (error) {
      toast.error("Failed to export feedback")
    }
  }

  const renderStars = (rating: number, size = "w-4 h-4") => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
          />
        ))}
      </div>
    )
  }

  const getCategoryBadge = (category: string) => {
    const colors = {
      overall: "bg-blue-100 text-blue-800",
      venue: "bg-green-100 text-green-800",
      service: "bg-purple-100 text-purple-800",
      food: "bg-orange-100 text-orange-800",
      staff: "bg-pink-100 text-pink-800",
    }

    return (
      <Badge className={colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </Badge>
    )
  }

  // Calculate statistics
  const totalFeedback = feedback.length
  const averageRating = calculateAverageRating(feedback)
  const responseRate = getResponseRate(feedback)
  const recommendationRate = getRecommendationRate(feedback)
  const ratingDistribution = getRatingDistribution(feedback)

  // Add loading and error display
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading feedback...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error loading feedback</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Event Feedback</h1>
          <p className="text-muted-foreground">Manage and analyze customer feedback for events</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setShowExportDialog(true)}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => router.push("/dashboard/events/feedback/analytics")}>
            <BarChart3 className="mr-2 h-4 w-4" />
            Analytics
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFeedback}</div>
            <p className="text-xs text-muted-foreground">Customer reviews</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
            <div className="flex items-center mt-1">{renderStars(Math.round(averageRating))}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <Reply className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{responseRate}%</div>
            <p className="text-xs text-muted-foreground">Feedback responded to</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recommendation Rate</CardTitle>
            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recommendationRate}%</div>
            <p className="text-xs text-muted-foreground">Would recommend</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="feedback" className="space-y-4">
        <TabsList>
          <TabsTrigger value="feedback">All Feedback</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="feedback" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search feedback..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>

                <Select value={ratingFilter} onValueChange={setRatingFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ratings</SelectItem>
                    <SelectItem value="5">5 Stars</SelectItem>
                    <SelectItem value="4">4 Stars</SelectItem>
                    <SelectItem value="3">3 Stars</SelectItem>
                    <SelectItem value="2">2 Stars</SelectItem>
                    <SelectItem value="1">1 Star</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={responseFilter} onValueChange={setResponseFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Response Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Feedback</SelectItem>
                    <SelectItem value="responded">Responded</SelectItem>
                    <SelectItem value="pending">Pending Response</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={eventFilter} onValueChange={setEventFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Event" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Events</SelectItem>
                    {events.map((event) => (
                      <SelectItem key={event._id} value={event._id}>
                        {event.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("")
                    setRatingFilter("all")
                    setResponseFilter("all")
                    setEventFilter("all")
                  }}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Feedback List */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Feedback ({filteredFeedback.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {filteredFeedback.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No feedback found</h3>
                    <p className="text-muted-foreground">No feedback matches your current filters.</p>
                  </div>
                ) : (
                  filteredFeedback.map((fb) => (
                    <div key={fb._id} className="border rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src="/placeholder.svg" />
                            <AvatarFallback>
                              {fb.customer.firstName[0]}
                              {fb.customer.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-semibold">
                                {fb.customer.firstName} {fb.customer.lastName}
                              </h4>
                              {fb.isResponded && (
                                <Badge variant="secondary" className="text-xs">
                                  Responded
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{fb.customer.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(fb.createdAt), "MMM d, yyyy")}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 mb-3">
                        {renderStars(fb.rating)}
                        <span className="text-sm text-muted-foreground">{fb.eventType?.name}</span>
                      </div>

                      {fb.comments && <p className="text-gray-700 mb-4">{fb.comments}</p>}

                      {fb.categories && fb.categories.length > 0 && (
                        <div className="mb-4">
                          <h5 className="text-sm font-medium mb-2">Category Ratings:</h5>
                          <div className="grid gap-2 sm:grid-cols-2">
                            {fb.categories.map((cat, index) => (
                              <div key={index} className="flex items-center justify-between">
                                <span className="text-sm capitalize">{cat.name}</span>
                                {renderStars(cat.rating, "w-3 h-3")}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {fb.wouldRecommend !== undefined && (
                        <div className="mb-4">
                          <span className="text-sm">Would recommend: {fb.wouldRecommend ? "Yes" : "No"}</span>
                        </div>
                      )}

                      {fb.improvements && (
                        <div className="mb-4">
                          <h5 className="text-sm font-medium mb-1">Suggested Improvements:</h5>
                          <p className="text-sm text-gray-600">{fb.improvements}</p>
                        </div>
                      )}

                      {fb.response && (
                        <div className="bg-blue-50 p-4 rounded-lg mb-4">
                          <h5 className="text-sm font-medium mb-2">Our Response:</h5>
                          <p className="text-sm">{fb.response}</p>
                          {fb.responseDate && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Responded on {format(new Date(fb.responseDate), "MMM d, yyyy")}
                            </p>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-muted-foreground">Submitted via {fb.submissionMethod}</span>
                          {fb.attendeeCount && (
                            <span className="text-sm text-muted-foreground">{fb.attendeeCount} attendees</span>
                          )}
                        </div>
                        {!fb.isResponded && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedFeedback(fb)
                              setShowResponseDialog(true)
                            }}
                          >
                            <Reply className="mr-2 h-4 w-4" />
                            Respond
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Rating Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Rating Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {ratingDistribution.map((count, index) => {
                  const rating = index + 1
                  const percentage = totalFeedback > 0 ? (count / totalFeedback) * 100 : 0
                  return (
                    <div key={rating} className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1 w-16">
                        <span className="text-sm">{rating}</span>
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      </div>
                      <Progress value={percentage} className="flex-1" />
                      <span className="text-sm text-muted-foreground w-8">{count}</span>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Category Analytics */}
            {analytics?.categoryAverages && (
              <Card>
                <CardHeader>
                  <CardTitle>Category Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.categoryAverages.map((cat) => (
                      <div key={cat.name} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium capitalize">{cat.name}</div>
                          <div className="text-sm text-muted-foreground">{cat.count} reviews</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{cat.averageRating.toFixed(1)}</div>
                          {renderStars(Math.round(cat.averageRating), "w-3 h-3")}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feedback Trends</CardTitle>
              <p className="text-sm text-muted-foreground">Track feedback patterns over time</p>
            </CardHeader>
            <CardContent>
              {statistics?.trend ? (
                <div className="space-y-4">
                  {statistics.trend.map((trend) => (
                    <div key={trend._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{trend._id}</div>
                        <div className="text-sm text-muted-foreground">{trend.count} reviews</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{trend.averageRating.toFixed(1)}</div>
                        {renderStars(Math.round(trend.averageRating), "w-3 h-3")}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No trend data available</h3>
                  <p className="text-muted-foreground">Trend data will appear as more feedback is collected.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Response Dialog */}
      <Dialog open={showResponseDialog} onOpenChange={setShowResponseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Respond to Feedback</DialogTitle>
            <DialogDescription>
              Send a response to {selectedFeedback?.customer.firstName} {selectedFeedback?.customer.lastName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                {selectedFeedback && renderStars(selectedFeedback.rating)}
              </div>
              <p className="text-sm">{selectedFeedback?.comments}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Response</label>
              <textarea
                className="w-full p-3 border rounded-lg resize-none"
                rows={4}
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Write your response to the customer..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResponseDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRespondToFeedback} disabled={!responseText.trim()}>
              Send Response
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Feedback</DialogTitle>
            <DialogDescription>Export feedback data with current filters applied</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Export Format</label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">
              This will export {filteredFeedback.length} feedback entries with current filters applied.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
