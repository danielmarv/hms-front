"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft,
  Calendar,
  Loader2,
  FileIcon as FileTemplate,
  Clock,
  Users,
  DollarSign,
  MapPin,
  CheckCircle,
} from "lucide-react"
import { useEventTemplates, type EventTemplate, type TemplatePreview } from "@/hooks/use-event-templates"
import { useGuests } from "@/hooks/use-guests"
import { toast } from "sonner"

export default function CreateEventFromTemplatePage() {
  const params = useParams()
  const router = useRouter()
  const templateId = params.id as string

  const { getTemplateById, createEventFromTemplate, previewTemplate } = useEventTemplates()
  const { guests } = useGuests()

  const [template, setTemplate] = useState<EventTemplate | null>(null)
  const [preview, setPreview] = useState<TemplatePreview | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    customName: "",
    customPrice: "",
    guestId: "",
    notes: "",
  })

  // Load template data
  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        setLoading(true)
        const templateData = await getTemplateById(templateId)

        if (!templateData) {
          toast.error("Template not found")
          router.push("/dashboard/events/templats")
          return
        }

        setTemplate(templateData)

        // Set default dates (today + template duration)
        const now = new Date()
        const endDate = new Date(now.getTime() + templateData.duration * 60000)

        setFormData((prev) => ({
          ...prev,
          startDate: now.toISOString().slice(0, 16),
          endDate: endDate.toISOString().slice(0, 16),
          customName: templateData.name,
        }))

        // Fetch preview with cost calculations
        const previewData = await previewTemplate(templateId)
        if (previewData) {
          setPreview(previewData)
        }
      } catch (error) {
        console.error("Failed to fetch template:", error)
        toast.error("Failed to load template")
        router.push("/dashboard/events/templats")
      } finally {
        setLoading(false)
      }
    }

    if (templateId) {
      fetchTemplate()
    }
  }, [templateId, getTemplateById, previewTemplate, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.startDate) {
      toast.error("Start date is required")
      return
    }

    if (!formData.endDate) {
      toast.error("End date is required")
      return
    }

    const startDate = new Date(formData.startDate)
    const endDate = new Date(formData.endDate)

    if (endDate <= startDate) {
      toast.error("End date must be after start date")
      return
    }

    try {
      setIsSubmitting(true)

      const eventData = {
        startDate: formData.startDate,
        endDate: formData.endDate,
        customName: formData.customName.trim() || undefined,
        customPrice: formData.customPrice ? Number.parseFloat(formData.customPrice) : undefined,
        guestId: formData.guestId || undefined,
        notes: formData.notes.trim() || undefined,
      }

      const result = await createEventFromTemplate(templateId, eventData)

      if (result.success && result.data) {
        toast.success("Event created successfully from template!")
        router.push(`/dashboard/events/${result.data._id}`)
      }
    } catch (error: any) {
      console.error("Failed to create event:", error)
      toast.error(error.message || "Failed to create event")
    } finally {
      setIsSubmitting(false)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-slate-900 dark:via-blue-900 dark:to-cyan-900">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400" />
          <p className="text-lg font-medium text-slate-700 dark:text-slate-300">Loading template...</p>
        </div>
      </div>
    )
  }

  if (!template) {
    return null
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
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 dark:from-blue-400 dark:via-cyan-400 dark:to-teal-400 bg-clip-text text-transparent">
                Create Event from Template
              </h1>
              <p className="text-slate-600 dark:text-slate-300 mt-1">Using template: {template.name}</p>
            </div>
          </div>
          <Calendar className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Template Preview */}
          <div className="space-y-6">
            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl text-slate-800 dark:text-slate-200 flex items-center">
                  <FileTemplate className="h-5 w-5 mr-2" />
                  Template Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <div>
                        <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Duration</p>
                        <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                          {formatDuration(template.duration)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <div>
                        <p className="text-xs font-medium text-green-600 dark:text-green-400">Capacity</p>
                        <p className="text-sm font-semibold text-green-900 dark:text-green-100">
                          {template.capacity || "Flexible"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      <div>
                        <p className="text-xs font-medium text-purple-600 dark:text-purple-400">Base Price</p>
                        <p className="text-sm font-semibold text-purple-900 dark:text-purple-100">
                          {formatPrice(template.basePrice)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                      <div>
                        <p className="text-xs font-medium text-orange-600 dark:text-orange-400">Venue</p>
                        <p className="text-sm font-semibold text-orange-900 dark:text-orange-100">
                          {template.venue.name}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Badge variant="outline" className="text-sm">
                    {template.eventType.name}
                  </Badge>
                  {template.isActive && (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active Template
                    </Badge>
                  )}
                </div>

                {template.description && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <p className="text-sm text-slate-700 dark:text-slate-300">{template.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Cost Breakdown */}
            {preview && preview.estimatedCosts && (
              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-800 dark:text-slate-200">Estimated Costs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 dark:text-slate-400">Base Price</span>
                      <span className="font-medium">{formatPrice(preview.estimatedCosts.basePrice)}</span>
                    </div>
                    {preview.estimatedCosts.servicesCost > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 dark:text-slate-400">Services</span>
                        <span className="font-medium">{formatPrice(preview.estimatedCosts.servicesCost)}</span>
                      </div>
                    )}
                    {preview.estimatedCosts.staffingCost > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 dark:text-slate-400">Staffing</span>
                        <span className="font-medium">{formatPrice(preview.estimatedCosts.staffingCost)}</span>
                      </div>
                    )}
                    <div className="border-t pt-2">
                      <div className="flex justify-between items-center text-lg font-semibold">
                        <span>Total Estimated</span>
                        <span className="text-blue-600 dark:text-blue-400">
                          {formatPrice(preview.estimatedCosts.totalEstimatedCost)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Event Creation Form */}
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-800 dark:text-slate-200">Event Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate" className="text-slate-700 dark:text-slate-300">
                        Start Date & Time *
                      </Label>
                      <Input
                        id="startDate"
                        type="datetime-local"
                        value={formData.startDate}
                        onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                        required
                        className="bg-white/80 dark:bg-slate-700/80"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate" className="text-slate-700 dark:text-slate-300">
                        End Date & Time *
                      </Label>
                      <Input
                        id="endDate"
                        type="datetime-local"
                        value={formData.endDate}
                        onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                        required
                        className="bg-white/80 dark:bg-slate-700/80"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customName" className="text-slate-700 dark:text-slate-300">
                      Event Name
                    </Label>
                    <Input
                      id="customName"
                      value={formData.customName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, customName: e.target.value }))}
                      placeholder="Leave empty to use template name"
                      className="bg-white/80 dark:bg-slate-700/80"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customPrice" className="text-slate-700 dark:text-slate-300">
                      Custom Price (Optional)
                    </Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="customPrice"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.customPrice}
                        onChange={(e) => setFormData((prev) => ({ ...prev, customPrice: e.target.value }))}
                        placeholder="Override template price"
                        className="pl-10 bg-white/80 dark:bg-slate-700/80"
                      />
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Leave empty to use template pricing</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="guestId" className="text-slate-700 dark:text-slate-300">
                      Assign to Guest (Optional)
                    </Label>
                    <Select
                      value={formData.guestId}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, guestId: value }))}
                    >
                      <SelectTrigger className="bg-white/80 dark:bg-slate-700/80">
                        <SelectValue placeholder="Select a guest" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No guest assigned</SelectItem>
                        {guests.map((guest) => (
                          <SelectItem key={guest._id} value={guest._id}>
                            {guest.firstName} {guest.lastName}
                            {guest.email && ` (${guest.email})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-slate-700 dark:text-slate-300">
                      Additional Notes
                    </Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                      placeholder="Any special requirements or notes..."
                      rows={3}
                      className="bg-white/80 dark:bg-slate-700/80"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                  className="border-slate-300 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-700"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 dark:from-blue-600 dark:to-cyan-700 dark:hover:from-blue-700 dark:hover:to-cyan-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Event...
                    </>
                  ) : (
                    <>
                      <Calendar className="mr-2 h-4 w-4" />
                      Create Event
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
