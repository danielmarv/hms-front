"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
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
import { ArrowLeft, Star, Plus, MessageSquare, TrendingUp, Users, ThumbsUp, ThumbsDown } from "lucide-react"
import { format } from "date-fns"
import { useEvents } from "@/hooks/use-events"
import { toast } from "sonner"

interface EventFeedbackPageProps {
  params: {
    id: string
  }
}

// Mock feedback data - in real app, this would come from API
const mockFeedback = [
  {
    id: "fb001",
    customer: {
      name: "Sarah Johnson",
      email: "sarah@example.com",
      avatar: "/placeholder.svg",
    },
    rating: 5,
    category: "overall",
    comment:
      "Absolutely fantastic event! Everything was perfectly organized and the venue was beautiful. The staff was incredibly helpful and professional throughout the entire event.",
    date: new Date("2024-01-15"),
    helpful: 12,
    verified: true,
  },
  {
    id: "fb002",
    customer: {
      name: "Michael Chen",
      email: "michael@example.com",
      avatar: "/placeholder.svg",
    },
    rating: 4,
    category: "venue",
    comment:
      "Great venue with excellent facilities. The only minor issue was the parking situation, but overall very satisfied with the experience.",
    date: new Date("2024-01-16"),
    helpful: 8,
    verified: true,
  },
  {
    id: "fb003",
    customer: {
      name: "Emily Davis",
      email: "emily@example.com",
      avatar: "/placeholder.svg",
    },
    rating: 5,
    category: "service",
    comment:
      "Outstanding service from start to finish. The event coordinator was amazing and made sure every detail was perfect.",
    date: new Date("2024-01-17"),
    helpful: 15,
    verified: false,
  },
  {
    id: "fb004",
    customer: {
      name: "David Wilson",
      email: "david@example.com",
      avatar: "/placeholder.svg",
    },
    rating: 3,
    category: "food",
    comment:
      "Food was decent but could have been better. The presentation was nice but some dishes were a bit cold when served.",
    date: new Date("2024-01-18"),
    helpful: 5,
    verified: true,
  },
  {
    id: "fb005",
    customer: {
      name: "Lisa Anderson",
      email: "lisa@example.com",
      avatar: "/placeholder.svg",
    },
    rating: 5,
    category: "overall",
    comment: "Perfect wedding venue! Everything exceeded our expectations. Highly recommend for any special occasion.",
    date: new Date("2024-01-19"),
    helpful: 20,
    verified: true,
  },
]

export default function EventFeedbackPage({ params }: EventFeedbackPageProps) {
  const router = useRouter()
  const { getEvent } = useEvents()

  const [event, setEvent] = useState<any>(null)
  const [feedback, setFeedback] = useState(mockFeedback)
  const [filteredFeedback, setFilteredFeedback] = useState(mockFeedback)
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [ratingFilter, setRatingFilter] = useState("all")
  const [showNewFeedbackDialog, setShowNewFeedbackDialog] = useState(false)

  const [newFeedback, setNewFeedback] = useState({
    customer: {
      name: "",
      email: "",
    },
    rating: 5,
    category: "overall",
    comment: "",
  })

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventData = await getEvent(params.id)
        setEvent(eventData)
      } catch (error) {
        console.error("Failed to fetch event:", error)
        toast.error("Failed to load event details")
      }
    }

    fetchEvent()
  }, [params.id, getEvent])

  useEffect(() => {
    let filtered = feedback

    if (categoryFilter !== "all") {
      filtered = filtered.filter((fb) => fb.category === categoryFilter)
    }

    if (ratingFilter !== "all") {
      const rating = Number.parseInt(ratingFilter)
      filtered = filtered.filter((fb) => fb.rating === rating)
    }

    setFilteredFeedback(filtered)
  }, [feedback, categoryFilter, ratingFilter])

  const handleAddFeedback = () => {
    const feedbackData = {
      id: `fb${Date.now()}`,
      customer: {
        ...newFeedback.customer,
        avatar: "/placeholder.svg",
      },
      rating: newFeedback.rating,
      category: newFeedback.category,
      comment: newFeedback.comment,
      date: new Date(),
      helpful: 0,
      verified: false,
    }

    setFeedback([feedbackData, ...feedback])
    setShowNewFeedbackDialog(false)
    setNewFeedback({
      customer: { name: "", email: "" },
      rating: 5,
      category: "overall",
      comment: "",
    })
    toast.success("Feedback added successfully")
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
  const averageRating = feedback.reduce((sum, fb) => sum + fb.rating, 0) / totalFeedback
  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: feedback.filter((fb) => fb.rating === rating).length,
    percentage: (feedback.filter((fb) => fb.rating === rating).length / totalFeedback) * 100,
  }))

  const categoryStats = ["overall", "venue", "service", "food", "staff"].map((category) => ({
    category,
    count: feedback.filter((fb) => fb.category === category).length,
    averageRating: feedback
      .filter((fb) => fb.category === category)
      .reduce((sum, fb, _, arr) => (arr.length > 0 ? sum + fb.rating / arr.length : 0), 0),
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Event Feedback</h1>
            <p className="text-muted-foreground">{event ? `Customer feedback for ${event.title}` : "Loading..."}</p>
          </div>
        </div>
        <Button onClick={() => setShowNewFeedbackDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Feedback
        </Button>
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
            <CardTitle className="text-sm font-medium">Satisfaction Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((feedback.filter((fb) => fb.rating >= 4).length / totalFeedback) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">4+ star ratings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Reviews</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{feedback.filter((fb) => fb.verified).length}</div>
            <p className="text-xs text-muted-foreground">Out of {totalFeedback} total</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Rating Distribution */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Rating Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 w-16">
                  <span className="text-sm">{rating}</span>
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                </div>
                <Progress value={percentage} className="flex-1" />
                <span className="text-sm text-muted-foreground w-8">{count}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Category Ratings */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Category Ratings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {categoryStats.map(({ category, count, averageRating }) => (
                <div key={category} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium capitalize">{category}</div>
                    <div className="text-sm text-muted-foreground">{count} reviews</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{averageRating.toFixed(1)}</div>
                    {renderStars(Math.round(averageRating), "w-3 h-3")}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feedback List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <CardTitle>Customer Reviews</CardTitle>
            <div className="flex space-x-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="overall">Overall</SelectItem>
                  <SelectItem value="venue">Venue</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                  <SelectItem value="food">Food</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                </SelectContent>
              </Select>

              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger className="w-[120px]">
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
            </div>
          </div>
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
                <div key={fb.id} className="border rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={fb.customer.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {fb.customer.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold">{fb.customer.name}</h4>
                          {fb.verified && (
                            <Badge variant="secondary" className="text-xs">
                              Verified
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{fb.customer.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">{format(fb.date, "MMM d, yyyy")}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 mb-3">
                    {renderStars(fb.rating)}
                    {getCategoryBadge(fb.category)}
                  </div>

                  <p className="text-gray-700 mb-4">{fb.comment}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button className="flex items-center space-x-1 text-sm text-muted-foreground hover:text-green-600">
                        <ThumbsUp className="w-4 h-4" />
                        <span>Helpful ({fb.helpful})</span>
                      </button>
                      <button className="flex items-center space-x-1 text-sm text-muted-foreground hover:text-red-600">
                        <ThumbsDown className="w-4 h-4" />
                        <span>Not helpful</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Feedback Dialog */}
      <Dialog open={showNewFeedbackDialog} onOpenChange={setShowNewFeedbackDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Customer Feedback</DialogTitle>
            <DialogDescription>Record feedback from a customer about this event</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name</Label>
                <Input
                  id="customerName"
                  value={newFeedback.customer.name}
                  onChange={(e) =>
                    setNewFeedback({
                      ...newFeedback,
                      customer: { ...newFeedback.customer, name: e.target.value },
                    })
                  }
                  placeholder="Enter customer name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerEmail">Email</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={newFeedback.customer.email}
                  onChange={(e) =>
                    setNewFeedback({
                      ...newFeedback,
                      customer: { ...newFeedback.customer, email: e.target.value },
                    })
                  }
                  placeholder="Enter email address"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="rating">Rating</Label>
                <Select
                  value={newFeedback.rating.toString()}
                  onValueChange={(value) => setNewFeedback({ ...newFeedback, rating: Number.parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 Stars - Excellent</SelectItem>
                    <SelectItem value="4">4 Stars - Good</SelectItem>
                    <SelectItem value="3">3 Stars - Average</SelectItem>
                    <SelectItem value="2">2 Stars - Poor</SelectItem>
                    <SelectItem value="1">1 Star - Terrible</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newFeedback.category}
                  onValueChange={(value) => setNewFeedback({ ...newFeedback, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="overall">Overall Experience</SelectItem>
                    <SelectItem value="venue">Venue</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="food">Food & Beverage</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Comment</Label>
              <Textarea
                id="comment"
                value={newFeedback.comment}
                onChange={(e) => setNewFeedback({ ...newFeedback, comment: e.target.value })}
                placeholder="Enter customer feedback..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewFeedbackDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddFeedback}>Add Feedback</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
