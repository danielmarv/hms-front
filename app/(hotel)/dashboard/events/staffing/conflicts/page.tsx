"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, ArrowLeft, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useEventStaffing, type StaffingConflict } from "@/hooks/use-event-staffing"
import { useCurrentHotel } from "@/hooks/use-current-hotel"
import { format } from "date-fns"
import { toast } from "sonner"

export default function StaffingConflictsPage() {
  const { currentHotel } = useCurrentHotel()
  const { getStaffingConflicts, resolveConflict } = useEventStaffing(currentHotel?._id)
  const [conflicts, setConflicts] = useState<StaffingConflict[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [resolvingConflict, setResolvingConflict] = useState<string | null>(null)

  // Load conflicts
  useEffect(() => {
    const loadConflicts = async () => {
      try {
        setIsLoading(true)
        const conflictData = await getStaffingConflicts()
        setConflicts(conflictData)
      } catch (error) {
        console.error("Failed to load conflicts:", error)
        toast.error("Failed to load staffing conflicts")
      } finally {
        setIsLoading(false)
      }
    }

    if (currentHotel?._id) {
      loadConflicts()
    }
  }, [currentHotel?._id, getStaffingConflicts])

  // Handle conflict resolution
  const handleResolveConflict = async (conflictId: string, keepAssignmentId: string) => {
    try {
      setResolvingConflict(conflictId)
      await resolveConflict(conflictId, {
        resolution: "keep_assignment",
        keepAssignmentId,
      })

      // Remove resolved conflict from list
      setConflicts((prev) => prev.filter((c) => `${c._id.staff}-${c._id.date.toISOString()}` !== conflictId))

      toast.success("Conflict resolved successfully")
    } catch (error) {
      console.error("Failed to resolve conflict:", error)
      toast.error("Failed to resolve conflict")
    } finally {
      setResolvingConflict(null)
    }
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
          <h1 className="text-3xl font-bold tracking-tight">Staffing Conflicts</h1>
          <p className="text-muted-foreground">
            Resolve scheduling conflicts where staff are assigned to multiple events
          </p>
        </div>
      </div>

      {/* Conflicts List */}
      {conflicts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Conflicts Found</h3>
            <p className="text-muted-foreground text-center">
              All staff assignments are properly scheduled without conflicts.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {conflicts.map((conflict) => {
            const conflictId = `${conflict._id.staff}-${conflict._id.date.toISOString()}`
            const staffMember = conflict.staffInfo[0]

            return (
              <Card key={conflictId} className="border-red-200 bg-red-50/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      <div>
                        <CardTitle className="text-lg">
                          Scheduling Conflict - {staffMember?.firstName} {staffMember?.lastName}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {format(conflict._id.date, "EEEE, MMMM dd, yyyy")} - {conflict.count} overlapping assignments
                        </p>
                      </div>
                    </div>
                    <Badge variant="destructive">{conflict.count} Conflicts</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid gap-3">
                      {conflict.assignments.map((assignment, index) => (
                        <div
                          key={assignment._id}
                          className="flex items-center justify-between p-3 bg-white rounded-lg border"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-full text-red-600 font-semibold text-sm">
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-medium">
                                {typeof assignment.event === "object" ? assignment.event.title : "Unknown Event"}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {assignment.role} • {assignment.startTime} - {assignment.endTime}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{assignment.status}</Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleResolveConflict(conflictId, assignment._id)}
                              disabled={resolvingConflict === conflictId}
                            >
                              {resolvingConflict === conflictId ? "Resolving..." : "Keep This"}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      <p className="text-sm text-muted-foreground">
                        Choose which assignment to keep. Other conflicting assignments will be cancelled.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
