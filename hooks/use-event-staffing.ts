"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { useApi } from "@/hooks/use-api"

// Types and Interfaces
export interface EventStaffing {
  _id: string
  event:
    | {
        _id: string
        title: string
        start_date: Date
        end_date: Date
        venue_id?: string
      }
    | string
  staff:
    | {
        _id: string
        firstName: string
        lastName: string
        email: string
        phone?: string
      }
    | string
  hotel:
    | {
        _id: string
        name: string
      }
    | string
  date: Date
  startTime: string
  endTime: string
  role: string
  status: "scheduled" | "confirmed" | "checked-in" | "completed" | "cancelled" | "no-show"
  checkInTime?: Date
  checkOutTime?: Date
  notes?: string
  hourlyRate?: number
  totalHours?: number
  totalCost?: number
  checkedInAt?: Date
  checkedOutAt?: Date
  breakTimes?: Array<{
    _id?: string
    startTime: Date
    endTime: Date
    duration: number
  }>
  tasks?: Array<{
    _id?: string
    description: string
    isCompleted: boolean
    completedAt?: Date
  }>
  feedback?: {
    rating?: number
    comments?: string
    submittedBy?: string
    submittedAt?: Date
  }
  performance?: {
    rating?: number
    feedback?: string
    categories?: Record<string, number>
    recordedBy?: string
    recordedAt?: Date
  }
  createdBy?: string
  updatedBy?: string
  createdAt?: Date
  updatedAt?: Date
  isDeleted?: boolean
}

export interface StaffingFilters {
  hotel?: string
  event?: string
  staff?: string
  status?: string
  date?: string
  start_date?: string
  end_date?: string
  role?: string
  page?: number
  limit?: number
  sort?: string
}

export interface PaginationInfo {
  total: number
  page: number
  pages: number
  limit: number
}

export interface StaffingResponse {
  staffing: EventStaffing[]
  pagination: PaginationInfo
}

export interface StaffAvailability {
  staff: {
    id: string
    name: string
    email: string
  }
  date_range: {
    start: Date
    end: Date
  }
  assignments: EventStaffing[]
}

export interface StaffTimesheet {
  assignment: EventStaffing
  scheduled_hours: number
  actual_hours: number
  overtime_hours: number
  break_time: Array<{
    startTime: Date
    endTime: Date
    duration: number
  }>
  total_break_minutes: number
}

export interface StaffingConflict {
  _id: {
    staff: string
    date: Date
  }
  assignments: EventStaffing[]
  count: number
  staffInfo: Array<{
    _id: string
    firstName: string
    lastName: string
    email: string
  }>
}

// Hook for managing event staffing
export function useEventStaffing(hotelId?: string) {
  const [staffing, setStaffing] = useState<EventStaffing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { request } = useApi()

  // Fetch all staffing assignments
  const fetchStaffing = useCallback(
    async (filters: StaffingFilters = {}) => {
      try {
        setLoading(true)
        setError(null)

        const queryParams = new URLSearchParams()
        if (hotelId) queryParams.append("hotel", hotelId)

        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            queryParams.append(key, value.toString())
          }
        })

        const endpoint = `/event-staffing?${queryParams.toString()}`
        const response = await request(endpoint, "GET")

        if (response.error) {
          throw new Error(response.error)
        }

        if (response.data) {
          const staffingWithDates = response.data.staffing.map((item: any) => ({
            ...item,
            date: new Date(item.date),
            checkedInAt: item.checkedInAt ? new Date(item.checkedInAt) : undefined,
            checkedOutAt: item.checkedOutAt ? new Date(item.checkedOutAt) : undefined,
            checkInTime: item.checkInTime ? new Date(item.checkInTime) : undefined,
            checkOutTime: item.checkOutTime ? new Date(item.checkOutTime) : undefined,
          }))

          setStaffing(staffingWithDates)
          return response.data
        }

        return { staffing: [], pagination: { total: 0, page: 1, pages: 0, limit: 20 } }
      } catch (err) {
        console.error("Failed to fetch staffing:", err)
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch staffing"
        setError(errorMessage)
        toast.error(errorMessage)
        return { staffing: [], pagination: { total: 0, page: 1, pages: 0, limit: 20 } }
      } finally {
        setLoading(false)
      }
    },
    [hotelId, request],
  )

  // Get staffing by ID
  const getStaffingById = async (id: string) => {
    try {
      setLoading(true)
      const response = await request(`/event-staffing/${id}`, "GET")

      if (response.error) {
        throw new Error(response.error)
      }

      if (response.data) {
        const staffingWithDates = {
          ...response.data,
          date: new Date(response.data.date),
          checkedInAt: response.data.checkedInAt ? new Date(response.data.checkedInAt) : undefined,
          checkedOutAt: response.data.checkedOutAt ? new Date(response.data.checkedOutAt) : undefined,
          checkInTime: response.data.checkInTime ? new Date(response.data.checkInTime) : undefined,
          checkOutTime: response.data.checkOutTime ? new Date(response.data.checkOutTime) : undefined,
        }

        return staffingWithDates
      }

      throw new Error("Staffing assignment not found")
    } catch (err) {
      console.error(`Failed to fetch staffing ${id}:`, err)
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch staffing"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Create staffing assignment
  const createStaffing = async (staffingData: Partial<EventStaffing>) => {
    try {
      setLoading(true)
      const response = await request("/event-staffing", "POST", staffingData)

      if (response.error) {
        throw new Error(response.error)
      }

      if (response.data) {
        const newStaffing = {
          ...response.data,
          date: new Date(response.data.date),
          checkedInAt: response.data.checkedInAt ? new Date(response.data.checkedInAt) : undefined,
          checkedOutAt: response.data.checkedOutAt ? new Date(response.data.checkedOutAt) : undefined,
        }

        setStaffing((prevStaffing) => [newStaffing, ...prevStaffing])
        toast.success("Staffing assignment created successfully")
        return newStaffing
      }

      throw new Error("Failed to create staffing assignment")
    } catch (err) {
      console.error("Failed to create staffing:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to create staffing assignment"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Update staffing assignment
  const updateStaffing = async (id: string, staffingData: Partial<EventStaffing>) => {
    try {
      setLoading(true)
      const response = await request(`/event-staffing/${id}`, "PUT", staffingData)

      if (response.error) {
        throw new Error(response.error)
      }

      if (response.data) {
        const updatedStaffing = {
          ...response.data,
          date: new Date(response.data.date),
          checkedInAt: response.data.checkedInAt ? new Date(response.data.checkedInAt) : undefined,
          checkedOutAt: response.data.checkedOutAt ? new Date(response.data.checkedOutAt) : undefined,
        }

        setStaffing((prevStaffing) => prevStaffing.map((item) => (item._id === id ? updatedStaffing : item)))

        toast.success("Staffing assignment updated successfully")
        return updatedStaffing
      }

      throw new Error("Failed to update staffing assignment")
    } catch (err) {
      console.error("Failed to update staffing:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to update staffing assignment"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Delete staffing assignment
  const deleteStaffing = async (id: string) => {
    try {
      setLoading(true)
      const response = await request(`/event-staffing/${id}`, "DELETE")

      if (response.error) {
        throw new Error(response.error)
      }

      setStaffing((prevStaffing) => prevStaffing.filter((item) => item._id !== id))
      toast.success("Staffing assignment deleted successfully")
    } catch (err) {
      console.error("Failed to delete staffing:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to delete staffing assignment"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Get event staffing
  const getEventStaffing = async (eventId: string) => {
    try {
      setLoading(true)
      const response = await request(`/event-staffing/event/${eventId}`, "GET")

      if (response.error) {
        throw new Error(response.error)
      }

      if (response.data) {
        const staffingWithDates = response.data.staffing.map((item: any) => ({
          ...item,
          date: new Date(item.date),
          checkedInAt: item.checkedInAt ? new Date(item.checkedInAt) : undefined,
          checkedOutAt: item.checkedOutAt ? new Date(item.checkedOutAt) : undefined,
        }))

        return { ...response.data, staffing: staffingWithDates }
      }

      throw new Error("Event staffing not found")
    } catch (err) {
      console.error("Failed to fetch event staffing:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch event staffing"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Assign staff to event
  const assignStaffToEvent = async (
    eventId: string,
    assignmentData: {
      staffId: string
      role: string
      hourlyRate?: number
      notes?: string
    },
  ) => {
    try {
      setLoading(true)
      const response = await request(`/event-staffing/event/${eventId}/assign`, "POST", assignmentData)

      if (response.error) {
        throw new Error(response.error)
      }

      if (response.data) {
        const newStaffing = {
          ...response.data,
          date: new Date(response.data.date),
          checkedInAt: response.data.checkedInAt ? new Date(response.data.checkedInAt) : undefined,
          checkedOutAt: response.data.checkedOutAt ? new Date(response.data.checkedOutAt) : undefined,
        }

        setStaffing((prevStaffing) => [newStaffing, ...prevStaffing])
        toast.success("Staff assigned to event successfully")
        return newStaffing
      }

      throw new Error("Failed to assign staff to event")
    } catch (err) {
      console.error("Failed to assign staff to event:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to assign staff to event"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Unassign staff from event
  const unassignStaffFromEvent = async (eventId: string, staffId: string) => {
    try {
      setLoading(true)
      const response = await request(`/event-staffing/event/${eventId}/unassign/${staffId}`, "DELETE")

      if (response.error) {
        throw new Error(response.error)
      }

      setStaffing((prevStaffing) => prevStaffing.filter((item) => !(item.event === eventId && item.staff === staffId)))
      toast.success("Staff unassigned from event successfully")
    } catch (err) {
      console.error("Failed to unassign staff from event:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to unassign staff from event"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Get staff availability
  const getStaffAvailability = async (staffId: string, startDate: string, endDate: string) => {
    try {
      const queryParams = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
      })

      const response = await request(`/event-staffing/staff/${staffId}/availability?${queryParams.toString()}`, "GET")

      if (response.error) {
        throw new Error(response.error)
      }

      if (response.data) {
        const availabilityWithDates = {
          ...response.data,
          date_range: {
            start: new Date(response.data.date_range.start),
            end: new Date(response.data.date_range.end),
          },
          assignments: response.data.assignments.map((item: any) => ({
            ...item,
            date: new Date(item.date),
          })),
        }

        return availabilityWithDates
      }

      throw new Error("Staff availability not found")
    } catch (err) {
      console.error("Failed to fetch staff availability:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch staff availability"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    }
  }

  // Get staff schedule
  const getStaffSchedule = async (
    staffId: string,
    filters: {
      start_date?: string
      end_date?: string
      status?: string
    } = {},
  ) => {
    try {
      const queryParams = new URLSearchParams()

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, value.toString())
        }
      })

      const response = await request(`/event-staffing/staff/${staffId}/schedule?${queryParams.toString()}`, "GET")

      if (response.error) {
        throw new Error(response.error)
      }

      if (response.data) {
        const scheduleWithDates = response.data.map((item: any) => ({
          ...item,
          date: new Date(item.date),
          checkedInAt: item.checkedInAt ? new Date(item.checkedInAt) : undefined,
          checkedOutAt: item.checkedOutAt ? new Date(item.checkedOutAt) : undefined,
        }))

        return scheduleWithDates
      }

      return []
    } catch (err) {
      console.error("Failed to fetch staff schedule:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch staff schedule"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    }
  }

  // Check in staff
  const checkInStaff = async (staffingId: string, notes?: string) => {
    try {
      setLoading(true)
      const response = await request(`/event-staffing/${staffingId}/checkin`, "POST", { notes })

      if (response.error) {
        throw new Error(response.error)
      }

      if (response.data) {
        const updatedStaffing = {
          ...response.data,
          date: new Date(response.data.date),
          checkedInAt: response.data.checkedInAt ? new Date(response.data.checkedInAt) : undefined,
          checkInTime: response.data.checkInTime ? new Date(response.data.checkInTime) : undefined,
        }

        setStaffing((prevStaffing) => prevStaffing.map((item) => (item._id === staffingId ? updatedStaffing : item)))

        toast.success("Staff checked in successfully")
        return updatedStaffing
      }

      throw new Error("Failed to check in staff")
    } catch (err) {
      console.error("Failed to check in staff:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to check in staff"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Check out staff
  const checkOutStaff = async (staffingId: string, notes?: string) => {
    try {
      setLoading(true)
      const response = await request(`/event-staffing/${staffingId}/checkout`, "POST", { notes })

      if (response.error) {
        throw new Error(response.error)
      }

      if (response.data) {
        const updatedStaffing = {
          ...response.data,
          date: new Date(response.data.date),
          checkedOutAt: response.data.checkedOutAt ? new Date(response.data.checkedOutAt) : undefined,
          checkOutTime: response.data.checkOutTime ? new Date(response.data.checkOutTime) : undefined,
        }

        setStaffing((prevStaffing) => prevStaffing.map((item) => (item._id === staffingId ? updatedStaffing : item)))

        toast.success("Staff checked out successfully")
        return updatedStaffing
      }

      throw new Error("Failed to check out staff")
    } catch (err) {
      console.error("Failed to check out staff:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to check out staff"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Get staff timesheet
  const getStaffTimesheet = async (staffingId: string) => {
    try {
      const response = await request(`/event-staffing/${staffingId}/timesheet`, "GET")

      if (response.error) {
        throw new Error(response.error)
      }

      if (response.data) {
        const timesheetWithDates = {
          ...response.data,
          assignment: {
            ...response.data.assignment,
            date: new Date(response.data.assignment.date),
            checkedInAt: response.data.assignment.checkedInAt
              ? new Date(response.data.assignment.checkedInAt)
              : undefined,
            checkedOutAt: response.data.assignment.checkedOutAt
              ? new Date(response.data.assignment.checkedOutAt)
              : undefined,
          },
          break_time: response.data.break_time.map((breakTime: any) => ({
            ...breakTime,
            startTime: new Date(breakTime.startTime),
            endTime: new Date(breakTime.endTime),
          })),
        }

        return timesheetWithDates
      }

      throw new Error("Staff timesheet not found")
    } catch (err) {
      console.error("Failed to fetch staff timesheet:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch staff timesheet"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    }
  }

  // Record staff performance
  const recordPerformance = async (
    staffingId: string,
    performanceData: {
      rating: number
      feedback?: string
      categories?: Record<string, number>
    },
  ) => {
    try {
      setLoading(true)
      const response = await request(`/event-staffing/${staffingId}/performance`, "POST", performanceData)

      if (response.error) {
        throw new Error(response.error)
      }

      if (response.data) {
        const updatedStaffing = {
          ...response.data,
          date: new Date(response.data.date),
          checkedInAt: response.data.checkedInAt ? new Date(response.data.checkedInAt) : undefined,
          checkedOutAt: response.data.checkedOutAt ? new Date(response.data.checkedOutAt) : undefined,
        }

        setStaffing((prevStaffing) => prevStaffing.map((item) => (item._id === staffingId ? updatedStaffing : item)))

        toast.success("Performance recorded successfully")
        return updatedStaffing
      }

      throw new Error("Failed to record performance")
    } catch (err) {
      console.error("Failed to record performance:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to record performance"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Get performance history
  const getPerformanceHistory = async (staffingId: string) => {
    try {
      const response = await request(`/event-staffing/${staffingId}/performance`, "GET")

      if (response.error) {
        throw new Error(response.error)
      }

      return response.data
    } catch (err) {
      console.error("Failed to fetch performance history:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch performance history"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    }
  }

  // Get staffing conflicts
  const getStaffingConflicts = async (
    filters: {
      hotel?: string
      start_date?: string
      end_date?: string
    } = {},
  ) => {
    try {
      const queryParams = new URLSearchParams()
      if (hotelId) queryParams.append("hotel", hotelId)

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, value.toString())
        }
      })

      const response = await request(`/event-staffing/conflicts?${queryParams.toString()}`, "GET")

      if (response.error) {
        throw new Error(response.error)
      }

      if (response.data) {
        const conflictsWithDates = response.data.map((conflict: any) => ({
          ...conflict,
          _id: {
            ...conflict._id,
            date: new Date(conflict._id.date),
          },
          assignments: conflict.assignments.map((assignment: any) => ({
            ...assignment,
            date: new Date(assignment.date),
          })),
        }))

        return conflictsWithDates
      }

      return []
    } catch (err) {
      console.error("Failed to fetch staffing conflicts:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch staffing conflicts"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    }
  }

  // Resolve staffing conflict
  const resolveConflict = async (
    conflictId: string,
    resolution: {
      resolution: string
      keepAssignmentId?: string
    },
  ) => {
    try {
      setLoading(true)
      const response = await request(`/event-staffing/conflicts/${conflictId}/resolve`, "POST", resolution)

      if (response.error) {
        throw new Error(response.error)
      }

      toast.success("Conflict resolved successfully")
      // Refresh staffing data
      await fetchStaffing()
    } catch (err) {
      console.error("Failed to resolve conflict:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to resolve conflict"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch on mount
  useEffect(() => {
    if (hotelId) {
      fetchStaffing({ hotel: hotelId })
    }
  }, [hotelId, fetchStaffing])

  return {
    staffing,
    loading,
    error,
    fetchStaffing,
    getStaffingById,
    createStaffing,
    updateStaffing,
    deleteStaffing,
    getEventStaffing,
    assignStaffToEvent,
    unassignStaffFromEvent,
    getStaffAvailability,
    getStaffSchedule,
    checkInStaff,
    checkOutStaff,
    getStaffTimesheet,
    recordPerformance,
    getPerformanceHistory,
    getStaffingConflicts,
    resolveConflict,
    refreshStaffing: fetchStaffing,
  }
}
