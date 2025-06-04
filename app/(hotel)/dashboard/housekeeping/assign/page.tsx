"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, UserPlus, Users } from "lucide-react"
import { format } from "date-fns"
import { useHousekeeping } from "@/hooks/use-housekeeping"
import { useUsers } from "@/hooks/use-users"
import { toast } from "sonner"
import type { User } from "@/types"

export default function AssignHousekeepingPage() {
  const router = useRouter()
  const [selectedSchedules, setSelectedSchedules] = useState<string[]>([])
  const [selectedUser, setSelectedUser] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const { schedules, fetchSchedules, assignSchedule } = useHousekeeping()
  const { users, fetchUsers } = useUsers()

  useEffect(() => {
    fetchSchedules({ status: "pending" })
    fetchUsers({ role: "housekeeping" })
  }, [fetchSchedules, fetchUsers])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSchedules(unassignedSchedules.map((s) => s._id))
    } else {
      setSelectedSchedules([])
    }
  }

  const handleSelectSchedule = (scheduleId: string, checked: boolean) => {
    if (checked) {
      setSelectedSchedules([...selectedSchedules, scheduleId])
    } else {
      setSelectedSchedules(selectedSchedules.filter((id) => id !== scheduleId))
    }
  }

  const handleBulkAssign = async () => {
    if (!selectedUser) {
      toast.error("Please select a housekeeper")
      return
    }
    if (selectedSchedules.length === 0) {
      toast.error("Please select at least one schedule")
      return
    }

    setIsLoading(true)
    try {
      const promises = selectedSchedules.map((scheduleId) => assignSchedule(scheduleId, selectedUser))
      await Promise.all(promises)

      toast.success(`Assigned ${selectedSchedules.length} schedules successfully`)
      setSelectedSchedules([])
      fetchSchedules({ status: "pending" })
    } catch (error) {
      toast.error("Failed to assign schedules")
    } finally {
      setIsLoading(false)
    }
  }

  const unassignedSchedules = schedules.filter((schedule) => !schedule.assigned_to)

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assign Housekeeping Schedules</h1>
          <p className="text-muted-foreground">Assign pending schedules to housekeeping staff</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span className="text-sm font-medium">Assign to:</span>
        </div>
        <Select value={selectedUser} onValueChange={setSelectedUser}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select housekeeper" />
          </SelectTrigger>
          <SelectContent>
            {users.map((user: User) => (
              <SelectItem key={user._id} value={user._id}>
                {user.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleBulkAssign} disabled={isLoading || selectedSchedules.length === 0 || !selectedUser}>
          <UserPlus className="mr-2 h-4 w-4" />
          Assign Selected ({selectedSchedules.length})
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Unassigned Schedules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={
                        selectedSchedules.length === unassignedSchedules.length && unassignedSchedules.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unassignedSchedules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No unassigned schedules found.
                    </TableCell>
                  </TableRow>
                ) : (
                  unassignedSchedules.map((schedule) => (
                    <TableRow key={schedule._id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedSchedules.includes(schedule._id)}
                          onCheckedChange={(checked) => handleSelectSchedule(schedule._id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {schedule.room.number} ({schedule.room.floor}/{schedule.room.building})
                      </TableCell>
                      <TableCell>{format(new Date(schedule.schedule_date), "MMM dd, yyyy")}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            schedule.priority === "high"
                              ? "bg-red-50 text-red-700 border-red-200"
                              : schedule.priority === "medium"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-gray-50 text-gray-700 border-gray-200"
                          }
                        >
                          {schedule.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                          {schedule.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="truncate max-w-32 block">{schedule.notes || "No notes"}</span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
