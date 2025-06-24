"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ArrowLeft,
  Star,
  Reply,
  MessageSquare,
  User,
  Calendar,
  Phone,
  Mail,
  Users,
  ThumbsUp,
  ThumbsDown,
  Edit,
  Trash2,
} from "lucide-react"
import { format } from "date-fns"
import { useEventFeedback } from "@/hooks/use-event-feedback"
import { toast } from "sonner"

interface FeedbackDetailPageProps {
  params: {
    id: string
  }
}

export default function FeedbackDetailPage({ params }: FeedbackDetailPageProps) {
  const router = useRouter()
  const { currentFeedback, loading, error, getFeedbackById, respondToFeedback, updateFeedback, deleteFeedback } =
    useEventFeedback()

  const [showResponseDialog, setShowResponseDialog] = useState(false)
  const [responseText, setResponseText] = useState("")
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editData, setEditData] = useState({
    rating: 5,
    comments: "",
    wouldRecommend: true,
    improvements: "",
    isPublic: true,
  })

  useEffect(() => {
    loadFeedback()
  }, [params.id])

  useEffect(() => {
    if (currentFeedback) {
      setEditData({
        rating: currentFeedback.rating,
        comments: currentFeedback.comments || "",
        wouldRecommend: currentFeedback.wouldRecommend || false,
        improvements: currentFeedback.improvements || "",
        isPublic: currentFeedback.isPublic || false,
      })
    }
  }, [currentFeedback])

  const loadFeedback = async () => {
    try {
      await getFeedbackById(params.id)
    } catch (error) {
      toast.error("Failed to load feedback details")
    }
  }

  const handleRespondToFeedback = async () => {
    if (!responseText.trim()) return

    try {
      await respondToFeedback(params.id, { response: responseText })
      setShowResponseDialog(false)
      setResponseText("")
      toast.success("Response sent successfully")
    } catch (error) {
      toast.error("Failed to send response")
    }
  }

  const handleUpdateFeedback = async () => {
    try {
      await updateFeedback(params.id, editData)
      setShowEditDialog(false)
      toast.success("Feedback updated successfully")
    } catch (error) {
      toast.error("Failed to update feedback")
    }
  }

  const handleDeleteFeedback = async () => {
    if (!confirm("Are you sure you want to delete this feedback?")) return

    try {
      await deleteFeedback(params.id)
      router.push("/dashboard/events/feedback")
      toast.success("Feedback deleted successfully")
    } catch (error) {
      toast.error("Failed to delete feedback")
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

  const renderEditableStars = (rating: number, onChange: (rating: number) => void) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`w-6 h-6 ${star <= rating ? "text-yellow-400" : "text-gray-300"} hover:text-yellow-400`}
          >
            <Star className={`w-6 h-6 ${star <= rating ? "fill-current" : ""}`} />
          </button>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading feedback details...</p>
        </div>
      </div>
    )
  }

  if (error || !currentFeedback) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Feedback not found</h3>
          <p className="text-muted-foreground mb-4">The feedback you're looking for doesn't exist.</p>
          <Button onClick={() => router.push("/dashboard/events/feedback")}>Back to Feedback</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Feedback Details</h1>
            <p className="text-muted-foreground">
              Feedback from {currentFeedback.customer.firstName} {currentFeedback.customer.lastName}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setShowEditDialog(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="outline" onClick={handleDeleteFeedback}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
          {!currentFeedback.isResponded && (
            <Button onClick={() => setShowResponseDialog(true)}>
              <Reply className="mr-2 h-4 w-4" />
              Respond
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Feedback Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback>
                      {currentFeedback.customer.firstName[0]}
                      {currentFeedback.customer.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {currentFeedback.customer.firstName} {currentFeedback.customer.lastName}
                    </h3>
                    <p className="text-sm text-muted-foreground">{currentFeedback.customer.email}</p>
                    {currentFeedback.customer.phone && (
                      <p className="text-sm text-muted-foreground">{currentFeedback.customer.phone}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(currentFeedback.createdAt), "MMM d, yyyy 'at' h:mm a")}
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    {currentFeedback.isResponded && <Badge variant="secondary">Responded</Badge>}
                    {currentFeedback.isPublic && <Badge variant="outline">Public</Badge>}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Rating */}
              <div>
                <h4 className="font-medium mb-2">Overall Rating</h4>
                <div className="flex items-center space-x-2">
                  {renderStars(currentFeedback.rating, "w-5 h-5")}
                  <span className="text-lg font-semibold">{currentFeedback.rating}/5</span>
                </div>
              </div>

              {/* Comments */}
              {currentFeedback.comments && (
                <div>
                  <h4 className="font-medium mb-2">Comments</h4>
                  <p className="text-gray-700 leading-relaxed">{currentFeedback.comments}</p>
                </div>
              )}

              {/* Category Ratings */}
              {currentFeedback.categories && currentFeedback.categories.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Category Ratings</h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {currentFeedback.categories.map((cat, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <span className="text-sm font-medium capitalize">{cat.name}</span>
                        <div className="flex items-center space-x-2">
                          {renderStars(cat.rating, "w-4 h-4")}
                          <span className="text-sm font-semibold">{cat.rating}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendation */}
              {currentFeedback.wouldRecommend !== undefined && (
                <div>
                  <h4 className="font-medium mb-2">Would Recommend</h4>
                  <div className="flex items-center space-x-2">
                    {currentFeedback.wouldRecommend ? (
                      <ThumbsUp className="h-5 w-5 text-green-600" />
                    ) : (
                      <ThumbsDown className="h-5 w-5 text-red-600" />
                    )}
                    <span className={currentFeedback.wouldRecommend ? "text-green-600" : "text-red-600"}>
                      {currentFeedback.wouldRecommend ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              )}

              {/* Improvements */}
              {currentFeedback.improvements && (
                <div>
                  <h4 className="font-medium mb-2">Suggested Improvements</h4>
                  <p className="text-gray-700 leading-relaxed">{currentFeedback.improvements}</p>
                </div>
              )}

              {/* Response */}
              {currentFeedback.response && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Our Response</h4>
                  <p className="text-gray-700 leading-relaxed mb-3">{currentFeedback.response}</p>
                  {currentFeedback.responseDate && currentFeedback.respondedBy && (
                    <div className="text-sm text-muted-foreground">
                      Responded by {currentFeedback.respondedBy.firstName} {currentFeedback.respondedBy.lastName} on{" "}
                      {format(new Date(currentFeedback.responseDate), "MMM d, yyyy 'at' h:mm a")}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Event Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Event Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {currentFeedback.eventType && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Event Type</div>
                  <div className="font-medium">{currentFeedback.eventType.name}</div>
                  {currentFeedback.eventType.category && (
                    <Badge variant="outline" className="mt-1">
                      {currentFeedback.eventType.category}
                    </Badge>
                  )}
                </div>
              )}

              {currentFeedback.attendeeCount && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Attendee Count</div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span className="font-medium">{currentFeedback.attendeeCount} people</span>
                  </div>
                </div>
              )}

              <div>
                <div className="text-sm font-medium text-muted-foreground">Submission Method</div>
                <div className="font-medium capitalize">{currentFeedback.submissionMethod}</div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Customer Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{currentFeedback.customer.email}</span>
              </div>

              {currentFeedback.customer.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{currentFeedback.customer.phone}</span>
                </div>
              )}

              <div className="pt-2 border-t">
                <div className="text-sm font-medium text-muted-foreground">Customer ID</div>
                <div className="text-sm font-mono">{currentFeedback.customer._id}</div>
              </div>
            </CardContent>
          </Card>

          {/* Feedback Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Feedback Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Created</div>
                <div className="text-sm">{format(new Date(currentFeedback.createdAt), "PPpp")}</div>
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground">Last Updated</div>
                <div className="text-sm">{format(new Date(currentFeedback.updatedAt), "PPpp")}</div>
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground">Feedback ID</div>
                <div className="text-sm font-mono">{currentFeedback._id}</div>
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground">Event ID</div>
                <div className="text-sm font-mono">{currentFeedback.event}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Response Dialog */}
      <Dialog open={showResponseDialog} onOpenChange={setShowResponseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Respond to Feedback</DialogTitle>
            <DialogDescription>
              Send a response to {currentFeedback.customer.firstName} {currentFeedback.customer.lastName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                {renderStars(currentFeedback.rating)}
                <span className="font-semibold">{currentFeedback.rating}/5</span>
              </div>
              {currentFeedback.comments && <p className="text-sm">{currentFeedback.comments}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Response</label>
              <Textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Write your response to the customer..."
                rows={4}
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

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Feedback</DialogTitle>
            <DialogDescription>Update feedback details and settings</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Rating</label>
              {renderEditableStars(editData.rating, (rating) => setEditData({ ...editData, rating }))}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Comments</label>
              <Textarea
                value={editData.comments}
                onChange={(e) => setEditData({ ...editData, comments: e.target.value })}
                placeholder="Customer comments..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Suggested Improvements</label>
              <Textarea
                value={editData.improvements}
                onChange={(e) => setEditData({ ...editData, improvements: e.target.value })}
                placeholder="Suggested improvements..."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={editData.wouldRecommend}
                  onChange={(e) => setEditData({ ...editData, wouldRecommend: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Would recommend</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={editData.isPublic}
                  onChange={(e) => setEditData({ ...editData, isPublic: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Public feedback</span>
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateFeedback}>Update Feedback</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
