"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { ArrowLeft, Save, Calendar, Clock } from "lucide-react"
import Link from "next/link"
import { useEventStaffing } from "@/hooks/use-event-staffing"
import { useCurrentHotel } from "@/hooks/use-current-hotel"
import { useEvents } from "@/hooks/use-events"
import { useUsers } from "@/hooks/use-users"
import { toast } from "sonner"

const staffingSchema = z.object({
  event: z.string().min(1, "Please select an event"),
  staff: z.string().min(1, "Please select a staff member"),
  role: z.string().min(1, "Please specify the role"),
  date: z.string().min(1, "Please select a date"),
  startTime: z.string().min(1, "Please specify start time"),
  endTime: z.string().min(1, "Please specify end time"),
  hourlyRate: z.number().min(0, "Hourly rate must be positive").optional(),
  notes: z.string().optional(),
})

type StaffingFormData = z.infer<typeof staffingSchema>

const staffRoles = [
  "Event Manager",
  "Event Coordinator",
  "Server",
  "Bartender",
  "Chef",
  "Kitchen Staff",
  "Security",
  "Technician",
  "Photographer",
  "DJ/Entertainment",
  "Decorator",
  "Cleaner",
  "Valet",
  "Reception",
]

export default function NewStaffingPage() {
  const router = useRouter()
  const { currentHotel } = useCurrentHotel()
  const { createStaffing } = useEventStaffing(currentHotel?._id)
  const { events, fetchEvents } = useEvents()
  const { users, fetchUsers } = useUsers()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<StaffingFormData>({
    resolver: zodResolver(staffingSchema),
    defaultValues: {
      event: "",
      staff: "",
      role: "",
      date: "",
      startTime: "",
      endTime: "",
      hourlyRate: 0,
      notes: "",
    },
  })

  // Load events and staff on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([fetchEvents(), fetchUsers()])
      } catch (error) {
        console.error("Failed to load data:", error)
        toast.error("Failed to load events and staff data")
      }
    }

    loadData()
  }, [fetchEvents, fetchUsers])

  const onSubmit = async (data: StaffingFormData) => {
    setIsLoading(true)
    try {
      await createStaffing({
        event: data.event,
        staff: data.staff,
        hotel: currentHotel?._id,
        role: data.role,
        date: new Date(data.date),
        startTime: data.startTime,
        endTime: data.endTime,
        hourlyRate: data.hourlyRate,
        notes: data.notes,
        status: "scheduled",
      })

      toast.success("Staff assignment created successfully")
      router.push("/dashboard/events/staffing")
    } catch (error) {
      console.error("Failed to create staffing:", error)
      toast.error("Failed to create staff assignment")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/events/staffing">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Staffing
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assign Staff to Event</h1>
          <p className="text-muted-foreground">Create a new staff assignment for an event</p>
        </div>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Event & Staff Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Event & Staff Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="event"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an event" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {events.map((event) => (
                            <SelectItem key={event._id} value={event._id}>
                              {event.title} - {new Date(event.start_date).toLocaleDateString()}
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
                  name="staff"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Staff Member *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a staff member" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {users.map((user) => (
                            <SelectItem key={user._id} value={user._id}>
                              {user.full_name} - {user.email}
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
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {staffRoles.map((role) => (
                            <SelectItem key={role} value={role}>
                              {role}
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

            {/* Schedule & Compensation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Schedule & Compensation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Time *</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Time *</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="hourlyRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hourly Rate ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any special instructions or notes for this assignment..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" asChild>
              <Link href="/dashboard/events/staffing">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isLoading}>
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? "Creating..." : "Create Assignment"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
