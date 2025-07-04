"use client"

import { useState, useCallback } from "react"
import { useApi } from "./use-api"

export interface ActivityLog {
  _id: string
  type: "checkin" | "checkout" | "maintenance" | "payment" | "reservation" | "complaint" | "service"
  description: string
  guest?: {
    _id: string
    full_name: string
  }
  room?: {
    _id: string
    number: string
  }
  user: {
    _id: string
    full_name: string
  }
  metadata?: {
    amount?: number
    priority?: "low" | "medium" | "high" | "urgent"
    status?: string
    [key: string]: any
  }
  createdAt: string
  updatedAt: string
}

export function useActivityLog() {
  const { request, isLoading } = useApi()
  const [activities, setActivities] = useState<ActivityLog[]>([])

  const getRecentActivity = useCallback(
    async (limit = 10, filters: any = {}) => {
      const queryParams = new URLSearchParams()
      queryParams.append("limit", limit.toString())
      queryParams.append("sort", "-createdAt")

      Object.keys(filters).forEach((key) => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== "") {
          queryParams.append(key, filters[key])
        }
      })

      const response = await request(`/activity-log?${queryParams.toString()}`, "GET")
      if (response.data) {
        setActivities(response.data)
      }
      return response
    },
    [request],
  )

  const logActivity = useCallback(
    async (data: {
      type: ActivityLog["type"]
      description: string
      guestId?: string
      roomId?: string
      metadata?: any
    }) => {
      const response = await request("/activity-log", "POST", data)
      return response
    },
    [request],
  )

  const getActivityById = useCallback(
    async (id: string) => {
      const response = await request(`/activity-log/${id}`, "GET")
      return response
    },
    [request],
  )

  const getActivityByGuest = useCallback(
    async (guestId: string, limit = 20) => {
      const response = await request(`/activity-log?guest=${guestId}&limit=${limit}&sort=-createdAt`, "GET")
      return response
    },
    [request],
  )

  const getActivityByRoom = useCallback(
    async (roomId: string, limit = 20) => {
      const response = await request(`/activity-log?room=${roomId}&limit=${limit}&sort=-createdAt`, "GET")
      return response
    },
    [request],
  )

  return {
    activities,
    isLoading,
    getRecentActivity,
    logActivity,
    getActivityById,
    getActivityByGuest,
    getActivityByRoom,
  }
}
