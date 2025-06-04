"use client"

import { useState } from "react"
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

  const fetchSchedules = async (filters: HousekeepingFilters = {}) => {
    const queryParams = new URLSearchParams()

    // Add filters to query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, String(value))
      }
    })

    const { data, error } = await request<{
      data: HousekeepingSchedule[]
      pagination: {
        page: number
        limit: number
        totalPages: number
      }
      total: number
    }>(`/housekeeping?${queryParams.toString()}`)

    if (data && !error) {
      setSchedules(data.data)
      setPagination({
        page: data.pagination.page,
        limit: data.pagination.limit,
        totalPages: data.pagination.totalPages,
        total: data.total,
      })
      return data.data
    }

    return []
  }

  const fetchScheduleById = async (id: string) => {
    const { data, error } = await request<{ data: HousekeepingSchedule }>(`/housekeeping/${id}`)
    return error ? null : data?.data
  }

  const createSchedule = async (scheduleData: {
    room: string
    assigned_to?: string
    priority: "low" | "medium" | "high"
    notes?: string
    schedule_date: string
    status: HousekeepingStatus
    updateRoomStatus?: boolean
  }) => {
    const { data, error } = await request<{ data: HousekeepingSchedule }>("/housekeeping", "POST", scheduleData)
    return { data: error ? null : data?.data, error }
  }

  const updateSchedule = async (id: string, scheduleData: Partial<HousekeepingSchedule>) => {
    const { data, error } = await request<{ data: HousekeepingSchedule }>(`/housekeeping/${id}`, "PUT", scheduleData)
    return { data: error ? null : data?.data, error }
  }

  const deleteSchedule = async (id: string) => {
    const { data, error } = await request<{ message: string }>(`/housekeeping/${id}`, "DELETE")
    return { success: !error, message: error || data?.message }
  }

  const assignSchedule = async (id: string, assignedTo: string) => {
    const { data, error } = await request<{ data: HousekeepingSchedule }>(`/housekeeping/${id}/assign`, "PATCH", {
      assignedTo,
    })
    return { data: error ? null : data?.data, error }
  }

  const bulkCreateSchedules = async (schedules: Array<Partial<HousekeepingSchedule>>) => {
    const { data, error } = await request<{ data: HousekeepingSchedule[] }>("/housekeeping/bulk", "POST", { schedules })
    return { data: error ? null : data?.data, error }
  }

  const fetchStats = async () => {
    const { data, error } = await request<{ data: HousekeepingStats }>("/housekeeping/stats")

    if (data && !error) {
      setStats(data.data)
      return data.data
    }

    return null
  }

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
