"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Clock,
  Calendar,
  DollarSign,
  Star,
  AlertCircle,
  User,
} from "lucide-react"
import Link from "next/link"
import { useEventStaffing, type EventStaffing } from "@/hooks/use-event-staffing"
import { useCurrentHotel } from "@/hooks/use-current-hotel"
import { format } from "date-fns"
import { toast } from "sonner"

export default function StaffingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { currentHotel } = useCurrentHotel()
  const { getStaffingById, checkInStaff, checkOutStaff, deleteStaffing, getStaffTimesheet, recordPerformance } =
    useEventStaffing(currentHotel?._id)

  const [staffing, setStaffing] = useState<EventStaffing | null>(null)
  const [timesheet, setTimesheet] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const staffingId = params.id as string

  // Load staffing details
  useEffect(() => {
    const loadStaffingDetails = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const staffingData = await getStaffingById(staffingId)
        setStaffing(staffingData)

        // Load timesheet if staff is checked in or completed
        if (staffingData.status === "checked-in" || staffingData.status === "completed") {
          try {
            const timesheetData = await getStaffTimesheet(staffingId)
            setTimesheet(timesheetData)
          } catch (timesheetError) {
            console.error("Failed to load timesheet:", timesheetError)
          }
        }
      } catch (err) {
        console.error("Failed to load staffing details:", err)
        setError(err instanceof Error ? err.message : "Failed to load staffing details")
      } finally {
        setIsLoading(false)
      }
    }

    if (staffingId) {
      loadStaffingDetails()
    }
  }, [staffingId, getStaffingById, getStaffTimesheet])

  // Handle check in/out
  const handleCheckIn = async () => {
    try {
      const updatedStaffing = await checkInStaff(staffingId)
      setStaffing(updatedStaffing)
      toast.success("Staff checked in successfully")
    } catch (error) {
      console.error("Failed to check in staff:", error)
      toast.error("Failed to check in staff")
    }
  }

  const handleCheckOut = async () => {
    try {
      const updatedStaffing = await checkOutStaff(staffingId)
      setStaffing(updatedStaffing)
      toast.success("Staff checked out successfully")
    } catch (error) {
      console.error("Failed to check out staff:", error)
      toast.error("Failed to check out staff")
    }
  }

  // Handle delete
  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this staffing assignment?")) {
      try {
        await deleteStaffing(staffingId)
        toast.success("Staffing assignment deleted successfully")
        router.push("/dashboard/events/staffing")
      } catch (error) {
        console.error("Failed to delete staffing:", error)
        toast.error("Failed to delete staffing assignment")
      }
    }
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    const variants = {
      scheduled: { variant: "outline" as const, className: "bg-blue-50 text-blue-700 border-blue-200" },
      confirmed: { variant: "outline" as const, className: "bg-green-50 text-green-700 border-green-200" },
      "checked-in": { variant: "outline" as const, className: "bg-purple-50 text-purple-700 border-purple-200" },
      completed: { variant: "outline" as const, className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
      cancelled: { variant: "outline" as const, className: "bg-red-50 text-red-700 border-red-200" },
      "no-show": { variant: "outline" as const, className: "bg-orange-50 text-orange-700 border-orange-200" },
    }

    const config = variants[status as keyof typeof variants] || variants.scheduled
    return <Badge {...config}>{status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ")}</Badge>
  }

  // Get staff name
  const getStaffName = (staff: any) => {
    if (typeof staff === "object" && staff.firstName && staff.lastName) {
      return `${staff.firstName} ${staff.lastName}`
    }
    return "Unknown Staff"
  }

  // Get event title
  const getEventTitle = (event: any) => {
    if (typeof event === "object" && event.title) {
      return event.title
    }
    return "Unknown Event"
  }

  // Calculate hours worked
  const calculateHoursWorked = () => {
    if (!staffing?.checkedInAt || !staffing?.checkedOutAt) return 0
    const diff = new Date(staffing.checkedOutAt).getTime() - new Date(staffing.checkedInAt).getTime()
    return Math.round((diff / (1000 * 60 * 60)) * 100) / 100
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/events/staffing">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Staffing
            </Link>
          </Button>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (error || !staffing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/events/staffing">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Staffing
            </Link>
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <div className="text-center">
            <h2 className="text-xl font-semibold">Error Loading Staffing Details</h2>
            <p className="text-muted-foreground mt-2">{error || "Staffing assignment not found"}</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/events/staffing">Back to Staffing</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/events/staffing">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Staffing
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Staffing Assignment Details</h1>
            <p className="text-muted-foreground">View and manage staff assignment information</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {(staffing.status === "scheduled" || staffing.status === "confirmed") && (
            <Button onClick={handleCheckIn}>
              <UserCheck className="mr-2 h-4 w-4" />
              Check In
            </Button>
          )}
          {staffing.status === "checked-in" && (
            <Button onClick={handleCheckOut}>
              <UserX className="mr-2 h-4 w-4" />
              Check Out
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link href={`/dashboard/events/staffing/${staffingId}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Overview Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src="/placeholder.svg?height=64&width=64" />
                <AvatarFallback className="text-lg">
                  {getStaffName(staffing.staff)
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">{getStaffName(staffing.staff)}</h2>
                <p className="text-muted-foreground">{staffing.role}</p>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusBadge(staffing.status)}
                  {staffing.hourlyRate && (
                    <Badge variant="outline">
                      <DollarSign className="h-3 w-3 mr-1" />${staffing.hourlyRate}/hr
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{getEventTitle(staffing.event)}</div>
              <p className="text-muted-foreground">{format(staffing.date, "EEEE, MMMM dd, yyyy")}</p>
              <p className="text-sm text-muted-foreground">
                {staffing.startTime} - {staffing.endTime}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Detailed Information */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timesheet">Timesheet</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Staff Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium">{getStaffName(staffing.staff)}</span>
                </div>
                <Separator />
                {typeof staffing.staff === "object" && staffing.staff.email && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium">{staffing.staff.email}</span>
                    </div>
                    <Separator />
                  </>
                )}
                {typeof staffing.staff === "object" && staffing.staff.phone && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone:</span>
                      <span className="font-medium">{staffing.staff.phone}</span>
                    </div>
                    <Separator />
                  </>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Role:</span>
                  <span className="font-medium">{staffing.role}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Assignment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Event:</span>
                  <span className="font-medium">{getEventTitle(staffing.event)}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-medium">{format(staffing.date, "MMM dd, yyyy")}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time:</span>
                  <span className="font-medium">
                    {staffing.startTime} - {staffing.endTime}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  {getStatusBadge(staffing.status)}
                </div>
                {staffing.hourlyRate && (
                  <>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Hourly Rate:</span>
                      <span className="font-medium">${staffing.hourlyRate}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {staffing.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{staffing.notes}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="timesheet" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Time Tracking
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {staffing.checkedInAt && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Check In:</span>
                      <span className="font-medium">{format(staffing.checkedInAt, "MMM dd, yyyy 'at' h:mm a")}</span>
                    </div>
                    <Separator />
                  </>
                )}
                {staffing.checkedOutAt && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Check Out:</span>
                      <span className="font-medium">{format(staffing.checkedOutAt, "MMM dd, yyyy 'at' h:mm a")}</span>
                    </div>
                    <Separator />
                  </>
                )}
                {staffing.checkedInAt && staffing.checkedOutAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Hours Worked:</span>
                    <span className="font-medium">{calculateHoursWorked()} hours</span>
                  </div>
                )}
                {!staffing.checkedInAt && (
                  <p className="text-muted-foreground text-center py-4">Staff has not checked in yet</p>
                )}
              </CardContent>
            </Card>

            {timesheet && (
              <Card>
                <CardHeader>
                  <CardTitle>Timesheet Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Scheduled Hours:</span>
                    <span className="font-medium">{timesheet.scheduled_hours}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Actual Hours:</span>
                    <span className="font-medium">{timesheet.actual_hours}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Overtime Hours:</span>
                    <span className="font-medium">{timesheet.overtime_hours}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Break Time:</span>
                    <span className="font-medium">{timesheet.total_break_minutes} minutes</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Performance Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              {staffing.performance ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Overall Rating:</span>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < (staffing.performance?.rating || 0)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className="ml-2 font-medium">{staffing.performance.rating}/5</span>
                      </div>
                    </div>
                  </div>
                  {staffing.performance.feedback && (
                    <>
                      <Separator />
                      <div>
                        <span className="text-muted-foreground">Feedback:</span>
                        <p className="mt-2 text-sm">{staffing.performance.feedback}</p>
                      </div>
                    </>
                  )}
                  {staffing.performance.recordedAt && (
                    <>
                      <Separator />
                      <div className="text-sm text-muted-foreground">
                        Recorded on {format(new Date(staffing.performance.recordedAt), "MMM dd, yyyy 'at' h:mm a")}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No performance review available</p>
                  {staffing.status === "completed" && (
                    <Button className="mt-4" asChild>
                      <Link href={`/dashboard/events/staffing/${staffingId}/performance`}>Add Performance Review</Link>
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
