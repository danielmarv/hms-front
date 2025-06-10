"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, CheckCircle, Clock, AlertCircle, Save } from "lucide-react"
import { useHousekeeping } from "@/hooks/use-housekeeping"
import { toast } from "sonner"

type HousekeepingStatus = "pending" | "in_progress" | "completed"

export default function HousekeepingScheduleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const scheduleId = params.id as string
  const [schedule, setSchedule] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notes, setNotes] = useState("")
  const [status, setStatus] = useState<HousekeepingStatus>("pending")
  const [isSaving, setIsSaving] = useState(false)
  const { fetchScheduleById, updateSchedule } = useHousekeeping()

  useEffect(() => {
    const loadSchedule = async () => {
      setIsLoading(true)
      try {
        const data = await fetchScheduleById(scheduleId)
        if (data) {
          setSchedule(data)
          setNotes(data.notes || "")
          setStatus(data.status as HousekeepingStatus)
        } else {
          toast.error("Schedule not found")
          router.push("/housekeeping/schedules")
        }
      } catch (error) {
        toast.error("Failed to load schedule")
        router.push("/housekeeping/schedules")
      } finally {
        setIsLoading(false)
      }
    }

    if (scheduleId) {
      loadSchedule()
    }
  }, [scheduleId, fetchScheduleById, router])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const { data, error } = await updateSchedule(scheduleId, {
        status,
        notes,
      })
      if (error) {
        toast.error("Failed to update schedule")
      } else {
        toast.success("Schedule updated successfully")
        setSchedule({ ...schedule, status, notes })
      }
    } catch (error) {
      toast.error("Failed to update schedule")
    } finally {
      setIsSaving(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        )
      case "in_progress":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <AlertCircle className="mr-1 h-3 w-3" />
            In Progress
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="mr-1 h-3 w-3" />
            Completed
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "low":
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            Low
          </Badge>
        )
      case "medium":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Medium
          </Badge>
        )
      case "high":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            High
          </Badge>
        )
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!schedule) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Schedule not found</h2>
          <p className="text-muted-foreground">The schedule you're looking for doesn't exist.</p>
          <Button className="mt-4" onClick={() => router.push("/housekeeping/schedules")}>
            Back to Schedules
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Room {schedule.room.number} - {schedule.room.building}
          </h1>
          <p className="text-muted-foreground">
            Scheduled for {format(new Date(schedule.schedule_date), "MMMM dd, yyyy")}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Schedule Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Room</label>
                <p className="font-medium">
                  {schedule.room.number} - Floor {schedule.room.floor}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Building</label>
                <p className="font-medium">{schedule.room.building}</p>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Priority</label>
                <div className="mt-1">{getPriorityBadge(schedule.priority)}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Assigned To</label>
                <p className="font-medium">{schedule.assigned_to?.name || "Unassigned"}</p>
              </div>
            </div>
            <Separator />
            <div>
              <label className="text-sm font-medium text-muted-foreground">Created</label>
              <p className="font-medium">{format(new Date(schedule.createdAt), "MMM dd, yyyy 'at' h:mm a")}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Update Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <div className="mt-2">{getStatusBadge(status)}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Notes</label>
              <Textarea
                placeholder="Add notes about the cleaning task..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1"
                rows={4}
              />
            </div>
            <Button onClick={handleSave} disabled={isSaving} className="w-full">
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
