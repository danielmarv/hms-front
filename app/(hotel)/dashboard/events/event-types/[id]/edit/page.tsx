"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { ArrowLeft, Save, Loader2, Palette, Clock, DollarSign, Users, Tag } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useEventTypes } from "@/hooks/use-event-types"
import { useCurrentHotel } from "@/hooks/use-current-hotel"
import { toast } from "sonner"

const eventTypeSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  color: z.string().min(1, "Color is required"),
  icon: z.string().optional(),
  base_price: z.number().min(0, "Base price must be positive"),
  price_per_person: z.number().min(0, "Price per person must be positive").optional(),
  default_duration: z.number().min(15, "Duration must be at least 15 minutes"),
  max_attendees: z.number().min(1, "Max attendees must be at least 1"),
  min_attendees: z.number().min(1, "Min attendees must be at least 1"),
  default_capacity: z.number().min(1, "Default capacity must be at least 1").optional(),
  requires_approval: z.boolean().default(false),
  is_recurring: z.boolean().default(false),
  status: z.enum(["active", "inactive"]).default("active"),
  tags: z.array(z.string()).default([]),
  setup_time: z.number().min(0, "Setup time must be positive").default(0),
  cleanup_time: z.number().min(0, "Cleanup time must be positive").default(0),
  features: z.array(z.string()).default([]),
})

type EventTypeFormData = z.infer<typeof eventTypeSchema>

const predefinedColors = [
  "#3B82F6",
  "#EF4444",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#84CC16",
  "#F97316",
  "#6366F1",
]

const eventCategories = [
  "Conference",
  "Wedding",
  "Corporate",
  "Social",
  "Meeting",
  "Workshop",
  "Seminar",
  "Party",
  "Exhibition",
  "Training",
]

const eventIcons = ["Tag", "ImagePlus", "CheckCircle", "XCircle"]

interface EditEventTypePageProps {
  params: {
    id: string
  }
}

export default function EditEventTypePage({ params }: EditEventTypePageProps) {
  const router = useRouter()
  const { currentHotel } = useCurrentHotel()
  const { getEventTypeById, updateEventType } = useEventTypes(currentHotel?._id)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [tagInput, setTagInput] = useState("")
  const [featureInput, setFeatureInput] = useState("")

  const form = useForm<EventTypeFormData>({
    resolver: zodResolver(eventTypeSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      color: predefinedColors[0],
      icon: eventIcons[0],
      base_price: 0,
      price_per_person: 0,
      default_duration: 60,
      max_attendees: 100,
      min_attendees: 1,
      default_capacity: 50,
      requires_approval: false,
      is_recurring: false,
      status: "active",
      tags: [],
      setup_time: 30,
      cleanup_time: 30,
      features: [],
    },
  })

  const watchedTags = form.watch("tags")
  const watchedFeatures = form.watch("features")

  useEffect(() => {
    const fetchEventType = async () => {
      if (!currentHotel || !params.id) return

      try {
        setLoading(true)
        const eventType = await getEventTypeById(params.id)

        if (eventType) {
          form.reset({
            name: eventType.name || "",
            description: eventType.description || "",
            category: eventType.category || "",
            color: eventType.color || predefinedColors[0],
            icon: eventType.icon || eventIcons[0],
            base_price: eventType.base_price || 0,
            price_per_person: eventType.price_per_person || 0,
            default_duration: eventType.default_duration || 60,
            max_attendees: eventType.max_attendees || 100,
            min_attendees: eventType.min_attendees || 1,
            default_capacity: eventType.default_capacity || 50,
            requires_approval: eventType.requires_approval || false,
            is_recurring: eventType.is_recurring || false,
            status: eventType.status || "active",
            tags: eventType.tags || [],
            setup_time: eventType.setup_time || 30,
            cleanup_time: eventType.cleanup_time || 30,
            features: eventType.features || [],
          })
        }
      } catch (error) {
        console.error("Failed to fetch event type:", error)
        toast.error("Failed to load event type")
        router.push("/dashboard/events/event-types")
      } finally {
        setLoading(false)
      }
    }

    fetchEventType()
  }, [currentHotel, params.id, getEventTypeById, form, router])

  const handleAddTag = () => {
    if (tagInput.trim() && !watchedTags.includes(tagInput.trim())) {
      form.setValue("tags", [...watchedTags, tagInput.trim()])
      setTagInput("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    form.setValue(
      "tags",
      watchedTags.filter((tag) => tag !== tagToRemove),
    )
  }

  const handleAddFeature = () => {
    if (featureInput.trim() && !watchedFeatures.includes(featureInput.trim())) {
      form.setValue("features", [...watchedFeatures, featureInput.trim()])
      setFeatureInput("")
    }
  }

  const handleRemoveFeature = (featureToRemove: string) => {
    form.setValue(
      "features",
      watchedFeatures.filter((feature) => feature !== featureToRemove),
    )
  }

  const onSubmit = async (data: EventTypeFormData) => {
    if (!currentHotel) {
      toast.error("No hotel selected")
      return
    }

    setIsSubmitting(true)
    try {
      await updateEventType(params.id, {
        ...data,
        hotel_id: currentHotel._id,
      })
      toast.success("Event type updated successfully")
      router.push(`/dashboard/events/event-types/${params.id}`)
    } catch (error) {
      console.error("Failed to update event type:", error)
      toast.error("Failed to update event type")
    } finally {
      setIsSubmitting(false)
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

  if (!currentHotel) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">No Hotel Selected</h2>
          <p className="text-muted-foreground">Please select a hotel to edit event types.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-indigo-900 dark:to-purple-900 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
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
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                Edit Event Type
              </h1>
              <p className="text-slate-600 dark:text-slate-300 mt-1">Update event type for {currentHotel.name}</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Tag className="mr-2 h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Type Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Corporate Meeting" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {eventCategories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe this event type..." className="min-h-[100px]" {...field} />
                      </FormControl>
                      <FormDescription>Provide a detailed description of this event type</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <Palette className="mr-2 h-4 w-4" />
                          Color *
                        </FormLabel>
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-2">
                            {predefinedColors.map((color) => (
                              <button
                                key={color}
                                type="button"
                                className={`w-8 h-8 rounded-full border-2 ${
                                  field.value === color ? "border-slate-900 dark:border-slate-100" : "border-slate-300"
                                }`}
                                style={{ backgroundColor: color }}
                                onClick={() => field.onChange(color)}
                              />
                            ))}
                          </div>
                          <FormControl>
                            <Input type="color" {...field} className="w-20 h-10" />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Icon</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an icon" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {eventIcons.map((icon) => (
                            <SelectItem key={icon} value={icon}>
                              {icon}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <DollarSign className="mr-2 h-5 w-5" />
                  Pricing & Capacity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="base_price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Base Price ($) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price_per_person"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price Per Person ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="default_capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default Capacity</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            {...field}
                            onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 1)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="min_attendees"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <Users className="mr-2 h-4 w-4" />
                          Min Attendees *
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            {...field}
                            onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 1)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="max_attendees"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <Users className="mr-2 h-4 w-4" />
                          Max Attendees *
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            {...field}
                            onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 1)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Clock className="mr-2 h-5 w-5" />
                  Timing Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="default_duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default Duration (minutes) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="15"
                            step="15"
                            {...field}
                            onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 60)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="setup_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Setup Time (minutes)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="15"
                            {...field}
                            onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cleanup_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cleanup Time (minutes)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="15"
                            {...field}
                            onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle>Settings & Tags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="requires_approval"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Requires Approval</FormLabel>
                          <FormDescription>Events of this type need approval before confirmation</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="is_recurring"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Recurring Events</FormLabel>
                          <FormDescription>Allow this event type to be scheduled as recurring</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label>Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a tag..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          handleAddTag()
                        }
                      }}
                    />
                    <Button type="button" variant="outline" onClick={handleAddTag}>
                      Add
                    </Button>
                  </div>
                  {watchedTags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {watchedTags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => handleRemoveTag(tag)}
                        >
                          {tag} ×
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label>Features</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a feature..."
                      value={featureInput}
                      onChange={(e) => setFeatureInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          handleAddFeature()
                        }
                      }}
                    />
                    <Button type="button" variant="outline" onClick={handleAddFeature}>
                      Add
                    </Button>
                  </div>
                  {watchedFeatures.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {watchedFeatures.map((feature) => (
                        <Badge
                          key={feature}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => handleRemoveFeature(feature)}
                        >
                          {feature} ×
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Update Event Type
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
