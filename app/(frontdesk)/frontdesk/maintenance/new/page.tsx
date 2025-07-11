"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { ArrowLeft, Plus, X } from "lucide-react"
import Link from "next/link"
import { useMaintenanceRequests } from "@/hooks/use-maintenance"
import { useRooms } from "@/hooks/use-rooms"

const maintenanceSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must be less than 500 characters"),
  category: z.string().min(1, "Category is required"),
  priority: z.enum(["low", "medium", "high", "critical"], {
    required_error: "Priority is required",
  }),
  room: z.string().optional(),
  estimatedCost: z.number().min(0, "Estimated cost must be positive").optional(),
  tags: z.array(z.string()).optional(),
  isRecurring: z.boolean().default(false),
  recurringFrequency: z.string().optional(),
  recurringInterval: z.number().optional(),
  recurringEndDate: z.string().optional(),
})

type MaintenanceFormData = z.infer<typeof maintenanceSchema>

const categories = [
  { value: "electrical", label: "Electrical" },
  { value: "plumbing", label: "Plumbing" },
  { value: "hvac", label: "HVAC" },
  { value: "cleaning", label: "Cleaning" },
  { value: "furniture", label: "Furniture" },
  { value: "appliances", label: "Appliances" },
  { value: "other", label: "Other" },
]

const priorities = [
  { value: "low", label: "Low", description: "Can be scheduled for later" },
  { value: "medium", label: "Medium", description: "Should be addressed soon" },
  { value: "high", label: "High", description: "Needs immediate attention" },
  { value: "critical", label: "Critical", description: "Emergency - affects safety or operations" },
]

const recurringFrequencies = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
]

export default function NewMaintenanceRequestPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tagInput, setTagInput] = useState("")
  const [tags, setTags] = useState<string[]>([])

  const { createMaintenanceRequest } = useMaintenanceRequests()
  const { rooms, fetchRooms } = useRooms()

  const form = useForm<MaintenanceFormData>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "electrical", // Updated default value to be a non-empty string
      priority: "medium",
      room: "",
      estimatedCost: undefined,
      tags: [],
      isRecurring: false,
      recurringFrequency: "",
      recurringInterval: 1,
      recurringEndDate: "",
    },
  })

  useEffect(() => {
    fetchRooms({ limit: 200 })
  }, [])

  const onSubmit = async (data: MaintenanceFormData) => {
    setIsSubmitting(true)
    try {
      const requestData = {
        ...data,
        tags,
        ...(data.isRecurring && {
          recurringSchedule: {
            frequency: data.recurringFrequency,
            interval: data.recurringInterval,
            endDate: data.recurringEndDate,
          },
        }),
      }

      const result = await createMaintenanceRequest(requestData)

      if (result) {
        toast.success("Maintenance request created successfully")
        router.push("/frontdesk/maintenance")
      } else {
        toast.error((result as any).message || "Failed to create maintenance request")
      }
    } catch (error) {
      console.error("Error creating maintenance request:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addTag()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/maintenance">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Maintenance
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Maintenance Request</h1>
          <p className="text-muted-foreground">Create a new maintenance request for your property</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Request Details</CardTitle>
                  <CardDescription>Provide details about the maintenance issue</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Brief description of the issue" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Detailed description of the maintenance issue..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Provide as much detail as possible to help maintenance staff understand the issue
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category.value} value={category.value}>
                                  {category.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {priorities.map((priority) => (
                                <SelectItem key={priority.value} value={priority.value}>
                                  <div className="flex flex-col">
                                    <span>{priority.label}</span>
                                    <span className="text-xs text-muted-foreground">{priority.description}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="room"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Room (Optional)</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select room" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="">No specific room</SelectItem>
                              {rooms.map((room) => (
                                <SelectItem key={room._id} value={room._id}>
                                  Room {room.roomNumber} - Floor {room.floor}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="estimatedCost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estimated Cost (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) =>
                                field.onChange(e.target.value ? Number.parseFloat(e.target.value) : undefined)
                              }
                            />
                          </FormControl>
                          <FormDescription>Rough estimate of repair costs</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Tags */}
                  <div className="space-y-2">
                    <FormLabel>Tags (Optional)</FormLabel>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add tag..."
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={handleTagKeyPress}
                      />
                      <Button type="button" variant="outline" onClick={addTag}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="ml-1 hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recurring Schedule */}
              <Card>
                <CardHeader>
                  <CardTitle>Recurring Schedule</CardTitle>
                  <CardDescription>Set up recurring maintenance if this is a regular task</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="isRecurring"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Make this a recurring maintenance task</FormLabel>
                          <FormDescription>This will create a schedule for regular maintenance</FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  {form.watch("isRecurring") && (
                    <div className="grid gap-4 md:grid-cols-3">
                      <FormField
                        control={form.control}
                        name="recurringFrequency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Frequency</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select frequency" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {recurringFrequencies.map((freq) => (
                                  <SelectItem key={freq.value} value={freq.value}>
                                    {freq.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="recurringInterval"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Interval</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                placeholder="1"
                                {...field}
                                onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 1)}
                              />
                            </FormControl>
                            <FormDescription>Every X {form.watch("recurringFrequency")}</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="recurringEndDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Date (Optional)</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormDescription>When to stop recurring</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Priority Guide</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {priorities.map((priority) => (
                    <div key={priority.value} className="flex items-start gap-3">
                      <Badge
                        variant={
                          priority.value === "critical"
                            ? "destructive"
                            : priority.value === "high"
                              ? "default"
                              : "outline"
                        }
                        className="mt-0.5"
                      >
                        {priority.label}
                      </Badge>
                      <div>
                        <p className="text-sm font-medium">{priority.label}</p>
                        <p className="text-xs text-muted-foreground">{priority.description}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    {categories.map((category) => (
                      <div key={category.value} className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {category.label}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" asChild>
              <Link href="/dashboard/maintenance">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Request"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
