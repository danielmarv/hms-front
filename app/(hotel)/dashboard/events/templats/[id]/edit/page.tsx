"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Save, Loader2, Plus, X, Clock, Users, DollarSign } from "lucide-react"
import { useEventTemplates, type EventTemplate } from "@/hooks/use-event-templates"
import { useEventTypes } from "@/hooks/use-event-types"
import { useVenues } from "@/hooks/use-venues"
import { useEventServices } from "@/hooks/use-event-services"
import { toast } from "sonner"

interface StaffingRole {
  role: string
  count: number
  hourlyRate?: number
}

export default function EditTemplatePage() {
  const params = useParams()
  const router = useRouter()
  const templateId = params.id as string

  const { getTemplateById, updateTemplate } = useEventTemplates()
  const { eventTypes } = useEventTypes()
  const { venues } = useVenues()
  const { services } = useEventServices()

  const [template, setTemplate] = useState<EventTemplate | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    eventType: "",
    venue: "",
    duration: "",
    capacity: "",
    basePrice: "",
    setupTime: "30",
    teardownTime: "30",
    terms: "",
    isActive: true,
  })

  const [staffing, setStaffing] = useState<StaffingRole[]>([{ role: "", count: 1 }])
  const [includedItems, setIncludedItems] = useState<string[]>([""])

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

        // Populate form data
        setFormData({
          name: templateData.name,
          description: templateData.description || "",
          eventType: templateData.eventType._id,
          venue: templateData.venue._id,
          duration: templateData.duration.toString(),
          capacity: templateData.capacity?.toString() || "",
          basePrice: templateData.basePrice.toString(),
          setupTime: templateData.setupTime.toString(),
          teardownTime: templateData.teardownTime.toString(),
          terms: templateData.terms || "",
          isActive: templateData.isActive,
        })

        // Populate staffing
        if (templateData.staffing && templateData.staffing.length > 0) {
          setStaffing(
            templateData.staffing.map((s) => ({
              role: s.role,
              count: s.count,
              hourlyRate: s.hourlyRate,
            })),
          )
        }

        // Populate included items
        if (templateData.includedItems && templateData.includedItems.length > 0) {
          setIncludedItems(templateData.includedItems)
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
  }, [templateId, getTemplateById, router])

  // Handle form input changes
  const handleInputChange = (field: string, value: string | boolean | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Handle staffing changes
  const addStaffingRole = () => {
    setStaffing((prev) => [...prev, { role: "", count: 1 }])
  }

  const removeStaffingRole = (index: number) => {
    setStaffing((prev) => prev.filter((_, i) => i !== index))
  }

  const updateStaffingRole = (index: number, field: keyof StaffingRole, value: string | number) => {
    setStaffing((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)))
  }

  // Handle included items changes
  const addIncludedItem = () => {
    setIncludedItems((prev) => [...prev, ""])
  }

  const removeIncludedItem = (index: number) => {
    setIncludedItems((prev) => prev.filter((_, i) => i !== index))
  }

  const updateIncludedItem = (index: number, value: string) => {
    setIncludedItems((prev) => prev.map((item, i) => (i === index ? value : item)))
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error("Template name is required")
      return
    }

    if (!formData.eventType) {
      toast.error("Event type is required")
      return
    }

    if (!formData.venue) {
      toast.error("Venue is required")
      return
    }

    if (!formData.duration || Number.parseInt(formData.duration) < 1) {
      toast.error("Duration must be at least 1 minute")
      return
    }

    if (!formData.basePrice || Number.parseFloat(formData.basePrice) < 0) {
      toast.error("Base price must be 0 or greater")
      return
    }

    try {
      setIsSubmitting(true)

      const templateData = {
        ...formData,
        duration: Number.parseInt(formData.duration),
        capacity: formData.capacity ? Number.parseInt(formData.capacity) : undefined,
        basePrice: Number.parseFloat(formData.basePrice),
        setupTime: Number.parseInt(formData.setupTime),
        teardownTime: Number.parseInt(formData.teardownTime),
        staffing: staffing.filter((s) => s.role.trim()),
        includedItems: includedItems.filter((item) => item.trim()),
      }

      const result = await updateTemplate(templateId, templateData)

      if (result) {
        toast.success("Template updated successfully!")
        router.push(`/dashboard/events/templats/${templateId}`)
      }
    } catch (error: any) {
      console.error("Failed to update template:", error)
      toast.error(error.message || "Failed to update template")
    } finally {
      setIsSubmitting(false)
    }
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
      <div className="max-w-4xl mx-auto space-y-8">
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
                Edit Template
              </h1>
              <p className="text-slate-600 dark:text-slate-300 mt-1">Update template: {template.name}</p>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl text-slate-800 dark:text-slate-200">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-700 dark:text-slate-300">
                    Template Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter template name"
                    required
                    className="bg-white/80 dark:bg-slate-700/80"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eventType" className="text-slate-700 dark:text-slate-300">
                    Event Type *
                  </Label>
                  <Select
                    value={formData.eventType}
                    onValueChange={(value) => handleInputChange("eventType", value)}
                    required
                  >
                    <SelectTrigger className="bg-white/80 dark:bg-slate-700/80">
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventTypes.map((type) => (
                        <SelectItem key={type._id} value={type._id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-slate-700 dark:text-slate-300">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Enter template description"
                  rows={3}
                  className="bg-white/80 dark:bg-slate-700/80"
                />
              </div>
            </CardContent>
          </Card>

          {/* Event Details */}
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl text-slate-800 dark:text-slate-200">Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="venue" className="text-slate-700 dark:text-slate-300">
                    Venue *
                  </Label>
                  <Select value={formData.venue} onValueChange={(value) => handleInputChange("venue", value)} required>
                    <SelectTrigger className="bg-white/80 dark:bg-slate-700/80">
                      <SelectValue placeholder="Select venue" />
                    </SelectTrigger>
                    <SelectContent>
                      {venues.map((venue) => (
                        <SelectItem key={venue._id} value={venue._id}>
                          {venue.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-slate-700 dark:text-slate-300">
                    Duration (minutes) *
                  </Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="duration"
                      type="number"
                      min="1"
                      value={formData.duration}
                      onChange={(e) => handleInputChange("duration", e.target.value)}
                      placeholder="120"
                      required
                      className="pl-10 bg-white/80 dark:bg-slate-700/80"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capacity" className="text-slate-700 dark:text-slate-300">
                    Capacity
                  </Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="capacity"
                      type="number"
                      min="1"
                      value={formData.capacity}
                      onChange={(e) => handleInputChange("capacity", e.target.value)}
                      placeholder="50"
                      className="pl-10 bg-white/80 dark:bg-slate-700/80"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="setupTime" className="text-slate-700 dark:text-slate-300">
                    Setup Time (minutes)
                  </Label>
                  <Input
                    id="setupTime"
                    type="number"
                    min="0"
                    value={formData.setupTime}
                    onChange={(e) => handleInputChange("setupTime", e.target.value)}
                    className="bg-white/80 dark:bg-slate-700/80"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teardownTime" className="text-slate-700 dark:text-slate-300">
                    Teardown Time (minutes)
                  </Label>
                  <Input
                    id="teardownTime"
                    type="number"
                    min="0"
                    value={formData.teardownTime}
                    onChange={(e) => handleInputChange("teardownTime", e.target.value)}
                    className="bg-white/80 dark:bg-slate-700/80"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="basePrice" className="text-slate-700 dark:text-slate-300">
                  Base Price *
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="basePrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.basePrice}
                    onChange={(e) => handleInputChange("basePrice", e.target.value)}
                    placeholder="0.00"
                    required
                    className="pl-10 bg-white/80 dark:bg-slate-700/80"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Staffing */}
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl text-slate-800 dark:text-slate-200">Staffing Requirements</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addStaffingRole}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Role
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {staffing.map((staff, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 border rounded-lg bg-slate-50 dark:bg-slate-700/50"
                >
                  <div className="flex-1">
                    <Input
                      value={staff.role}
                      onChange={(e) => updateStaffingRole(index, "role", e.target.value)}
                      placeholder="Staff role (e.g., Waiter, Manager)"
                      className="bg-white dark:bg-slate-700"
                    />
                  </div>
                  <div className="w-24">
                    <Input
                      type="number"
                      min="1"
                      value={staff.count}
                      onChange={(e) => updateStaffingRole(index, "count", Number.parseInt(e.target.value) || 1)}
                      className="bg-white dark:bg-slate-700"
                    />
                  </div>
                  <div className="w-32">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={staff.hourlyRate || ""}
                      onChange={(e) =>
                        updateStaffingRole(index, "hourlyRate", Number.parseFloat(e.target.value) || undefined)
                      }
                      placeholder="Hourly rate"
                      className="bg-white dark:bg-slate-700"
                    />
                  </div>
                  {staffing.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeStaffingRole(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Included Items */}
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl text-slate-800 dark:text-slate-200">Included Items</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addIncludedItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {includedItems.map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="flex-1">
                    <Input
                      value={item}
                      onChange={(e) => updateIncludedItem(index, e.target.value)}
                      placeholder="Enter included item"
                      className="bg-white/80 dark:bg-slate-700/80"
                    />
                  </div>
                  {includedItems.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeIncludedItem(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Terms and Status */}
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl text-slate-800 dark:text-slate-200">Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="terms" className="text-slate-700 dark:text-slate-300">
                  Terms & Conditions
                </Label>
                <Textarea
                  id="terms"
                  value={formData.terms}
                  onChange={(e) => handleInputChange("terms", e.target.value)}
                  placeholder="Enter terms and conditions"
                  rows={4}
                  className="bg-white/80 dark:bg-slate-700/80"
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-slate-700 dark:text-slate-300">Template Status</Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Active templates can be used to create events
                  </p>
                </div>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleInputChange("isActive", checked)}
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
                  Updating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Update Template
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
