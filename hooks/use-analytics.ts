"use client"

import { useState, useCallback } from "react"
import { useApi } from "./use-api"

export type AnalyticsPeriod = "7" | "30" | "90" | "365"

export type DashboardAnalytics = {
  period: {
    startDate: string
    endDate: string
    days: number
  }
  summary: {
    totalRevenue: number
    totalBookings: number
    occupancyRate: number
    guestSatisfaction: number
    systemUptime: number
  }
  modules: {
    bookings: BookingAnalytics
    revenue: RevenueAnalytics
    guests: GuestAnalytics
    rooms: RoomAnalytics
    maintenance: MaintenanceAnalytics
    restaurant: RestaurantAnalytics
    inventory: InventoryAnalytics
    staff: StaffAnalytics
    events: EventAnalytics
    system: SystemAnalytics
  }
}

export type BookingAnalytics = {
  totalBookings: number
  confirmedBookings: number
  cancelledBookings: number
  checkedInBookings: number
  checkedOutBookings: number
  totalRevenue: number
  averageStayDuration: number
  cancellationRate: number
  bookingTrends: Array<{ _id: string; count: number; revenue: number }>
  channelDistribution: Array<{ _id: string; count: number; revenue: number }>
}

export type RevenueAnalytics = {
  totalRevenue: number
  totalInvoices: number
  averageInvoiceValue: number
  roomRevenue: number
  restaurantRevenue: number
  eventRevenue: number
  serviceRevenue: number
  dailyRevenue: Array<{ _id: string; revenue: number; count: number }>
  paymentMethods: Array<{ _id: string; count: number; amount: number }>
}

export type GuestAnalytics = {
  totalGuests: number
  uniqueCountries: number
  averageAge: number
  countryDistribution: Array<{ _id: string; count: number }>
  repeatGuestData: { repeat: number; new: number }
  satisfactionRate: number
  loyaltyRate: string
}

export type RoomAnalytics = {
  totalRooms: number
  occupiedRooms: number
  availableRooms: number
  occupancyRate: number
  roomStatusDistribution: Record<string, number>
  roomTypePerformance: Array<{
    _id: string
    bookings: number
    revenue: number
    averageRate: number
  }>
}

export type MaintenanceAnalytics = {
  totalIssues: number
  pendingIssues: number
  inProgressIssues: number
  completedIssues: number
  averageResolutionTime: number
  resolutionRate: number
  issuesByType: Array<{ _id: string; count: number; avgResolutionTime: number }>
  maintenanceTrends: Array<{ _id: string; newIssues: number; completedIssues: number }>
}

export type RestaurantAnalytics = {
  totalOrders: number
  totalRevenue: number
  averageOrderValue: number
  pendingOrders: number
  completedOrders: number
  cancelledOrders: number
  popularItems: Array<{ _id: string; quantity: number; revenue: number }>
  kitchenPerformance: {
    averagePreparationTime: number
    totalKitchenOrders: number
  }
}

export type InventoryAnalytics = {
  totalItems: number
  totalValue: number
  lowStockItems: number
  outOfStockItems: number
  categoryDistribution: Array<{ _id: string; itemCount: number; totalValue: number }>
  supplierPerformance: Array<{ _id: string; itemCount: number; totalValue: number }>
}

export type StaffAnalytics = {
  totalStaff: number
  activeStaff: number
  inactiveStaff: number
  roleDistribution: Array<{ _id: string; count: number }>
  housekeeping: {
    totalTasks: number
    completedTasks: number
    pendingTasks: number
  }
  activityLogs: Array<{ _id: string; activityCount: number }>
}

export type EventAnalytics = {
  totalEvents: number
  upcomingEvents: number
  completedEvents: number
  bookings: {
    totalBookings: number
    totalRevenue: number
    averageBookingValue: number
  }
  eventTypeDistribution: Array<{ _id: string; count: number }>
}

export type SystemAnalytics = {
  uptime: number
  memoryUsage: {
    rss: number
    heapTotal: number
    heapUsed: number
    external: number
  }
  systemLogs: Array<{ _id: string; count: number }>
  errorLogs: Array<{ _id: string; errorCount: number }>
  apiUsage: Array<{ _id: string; requestCount: number }>
  performance: {
    cpuUsage: { user: number; system: number }
    nodeVersion: string
    platform: string
  }
}

export type RealTimeAnalytics = {
  timestamp: string
  realTime: {
    todayBookings: number
    activeGuests: number
    pendingOrders: number
    maintenanceIssues: number
    systemHealth: {
      uptime: number
      memoryUsage: {
        rss: number
        heapTotal: number
        heapUsed: number
        external: number
      }
      errorCount: number
    }
  }
}

export const useAnalytics = () => {
  const { request, isLoading } = useApi()
  const [dashboardData, setDashboardData] = useState<DashboardAnalytics | null>(null)
  const [realTimeData, setRealTimeData] = useState<RealTimeAnalytics | null>(null)
  const [error, setError] = useState<string | null>(null)

  const getDashboardAnalytics = useCallback(
    async (period: AnalyticsPeriod = "30") => {
      try {
        const response = await request<{ data: DashboardAnalytics }>(`/analytics/dashboard?period=${period}`)
        if (response.success && response.data) {
          setDashboardData(response.data.data)
          setError(null)
        }
        return response
      } catch (err: any) {
        setError(err.message)
        throw err
      }
    },
    [request],
  )

  const getRealTimeAnalytics = useCallback(async () => {
    try {
      const response = await request<{ data: RealTimeAnalytics }>("/analytics/realtime")
      if (response.success && response.data) {
        setRealTimeData(response.data.data)
        setError(null)
      }
      return response
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }, [request])

  const getBookingAnalytics = useCallback(
    async (startDate?: string, endDate?: string) => {
      try {
        let url = "/analytics/bookings"
        const params = new URLSearchParams()
        if (startDate) params.append("startDate", startDate)
        if (endDate) params.append("endDate", endDate)
        if (params.toString()) url += `?${params.toString()}`

        const response = await request<{ data: { analytics: BookingAnalytics } }>(url)
        return response
      } catch (err: any) {
        setError(err.message)
        throw err
      }
    },
    [request],
  )

  const getRevenueAnalytics = useCallback(
    async (startDate?: string, endDate?: string) => {
      try {
        let url = "/analytics/revenue"
        const params = new URLSearchParams()
        if (startDate) params.append("startDate", startDate)
        if (endDate) params.append("endDate", endDate)
        if (params.toString()) url += `?${params.toString()}`

        const response = await request<{ data: { analytics: RevenueAnalytics } }>(url)
        return response
      } catch (err: any) {
        setError(err.message)
        throw err
      }
    },
    [request],
  )

  const getInventoryAnalytics = useCallback(async () => {
    try {
      const response = await request<{ data: { analytics: InventoryAnalytics } }>("/analytics/inventory")
      return response
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }, [request])

  const getSystemPerformance = useCallback(
    async (startDate?: string, endDate?: string) => {
      try {
        let url = "/analytics/system"
        const params = new URLSearchParams()
        if (startDate) params.append("startDate", startDate)
        if (endDate) params.append("endDate", endDate)
        if (params.toString()) url += `?${params.toString()}`

        const response = await request<{ data: { analytics: SystemAnalytics } }>(url)
        return response
      } catch (err: any) {
        setError(err.message)
        throw err
      }
    },
    [request],
  )

  return {
    dashboardData,
    realTimeData,
    error,
    isLoading,
    getDashboardAnalytics,
    getRealTimeAnalytics,
    getBookingAnalytics,
    getRevenueAnalytics,
    getInventoryAnalytics,
    getSystemPerformance,
  }
}
