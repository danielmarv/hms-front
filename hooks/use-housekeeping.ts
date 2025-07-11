"use client"

import { useState, useCallback } from "react"
import { useApi } from "./use-api"

export type HousekeepingStatus = "pending" | "in_progress" | "completed"

export type HousekeepingSchedule = {
  _id: string
  room: {
    _id: string
    number: string
    floor: string
    building: string
    status: string
  }
  schedule_date: string
  status: HousekeepingStatus
  assigned_to?: {
    _id: string
    name: string
  }
  notes?: string
  priority: "low" | "medium" | "high"
  createdAt: string
  updatedAt: string
}

export type HousekeepingFilters = {
  room?: string
  assigned_to?: string
  status?: HousekeepingStatus
  date?: string
  startDate?: string
  endDate?: string
  sort?: string
  limit?: number
  page?: number
}

export type HousekeepingStats = {
  total: number
  pending: number
  in_progress: number
  completed: number
  today: {
    total: number
    pending: number
    in_progress: number
    completed: number
  }
}

export function useHousekeeping() {
  const { request, isLoading } = useApi()
  const [schedules, setSchedules] = useState<HousekeepingSchedule[]>([])
  const [stats, setStats] = useState<HousekeepingStats | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    total: 0,
  })

  const fetchSchedules = useCallback(
    async (filters: HousekeepingFilters = {}) => {
      const queryParams = new URLSearchParams()

      // Add filters to query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, String(value))
        }
      })

      const { data, error } = await request(`/housekeeping?${queryParams.toString()}`)

      if (data && !error) {
        setSchedules(data)
        setPagination({
          page: data.pagination?.page || 1,
          limit: data.pagination?.limit || 10,
          totalPages: data.pagination?.totalPages || 1,
          total: data.total || 0,
        })
        return data.data || []
      }

      // Set empty defaults on error
      setSchedules([])
      setPagination({
        page: 1,
        limit: 10,
        totalPages: 1,
        total: 0,
      })

      return []
    },
    [request],
  )

  const fetchScheduleById = useCallback(
    async (id: string) => {
      const { data, error } = await request(`/housekeeping/${id}`)
      return error ? null : data?.data
    },
    [request],
  )

  const createSchedule = useCallback(
    async (scheduleData: {
      room: string
      assigned_to?: string
      priority: "low" | "medium" | "high"
      notes?: string
      schedule_date: string
      status: HousekeepingStatus
      updateRoomStatus?: boolean
    }) => {
      const { data, error } = await request("/housekeeping", "POST", scheduleData)
      return { data: error ? null : data?.data, error }
    },
    [request],
  )

  const updateSchedule = useCallback(
    async (id: string, scheduleData: Partial<HousekeepingSchedule>) => {
      const { data, error } = await request(`/housekeeping/${id}`, "PUT", scheduleData)
      return { data: error ? null : data?.data, error }
    },
    [request],
  )

  const deleteSchedule = useCallback(
    async (id: string) => {
      const { data, error } = await request(`/housekeeping/${id}`, "DELETE")
      return { success: !error, message: error || data?.message }
    },
    [request],
  )

  const assignSchedule = useCallback(
    async (id: string, assignedTo: string) => {
      const { data, error } = await request(`/housekeeping/${id}/assign`, "PATCH", {
        assignedTo,
      })
      return { data: error ? null : data?.data, error }
    },
    [request],
  )

  const bulkCreateSchedules = useCallback(
    async (schedules: Array<Partial<HousekeepingSchedule>>) => {
      const { data, error } = await request("/housekeeping/bulk", "POST", {
        schedules,
      })
      return { data: error ? null : data?.data, error }
    },
    [request],
  )

  const fetchStats = useCallback(async () => {
    const { data, error } = await request("/housekeeping/stats")

    if (data && !error) {
      setStats(data.data)
      return data.data
    }

    return null
  }, [request])

  return {
    schedules,
    stats,
    pagination,
    isLoading,
    fetchSchedules,
    fetchScheduleById,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    assignSchedule,
    bulkCreateSchedules,
    fetchStats,
  }
}
