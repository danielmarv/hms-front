"use client"

import { useState, useCallback } from "react"
import { format, addDays } from "date-fns"
import { useBookings } from "./use-bookings"
import { usePayments } from "./use-payments"
import { useMaintenanceRequests } from "./use-maintenance"
import { useGuests } from "./use-guests"

export interface DashboardActivity {
  id: string
  type: "checkin" | "checkout" | "maintenance" | "payment" | "reservation" | "complaint" | "service"
  guest?: string
  guestId?: string
  room?: string
  time: string
  status: "completed" | "pending" | "in-progress" | "cancelled"
  description?: string
  amount?: number
  priority?: "low" | "medium" | "high" | "urgent"
}

export interface DashboardTask {
  id: string
  title: string
  description: string
  priority: "low" | "medium" | "high" | "urgent"
  time: string
  assignedTo?: string
  category: "maintenance" | "housekeeping" | "guest_service" | "admin"
  dueDate?: string
}

export interface DashboardArrival {
  id: string
  guest: string
  guestId: string
  room: string
  roomType: string
  time: string
  status: "confirmed" | "checked_in" | "no_show" | "cancelled"
  vip: boolean
  specialRequests?: string[]
  estimatedArrival?: string
  contactNumber?: string
}

export interface DashboardDeparture {
  id: string
  guest: string
  guestId: string
  room: string
  checkOutTime: string
  status: "scheduled" | "checked_out" | "late_checkout" | "extended"
  balanceDue: number
  vip: boolean
}

export interface DashboardReservation {
  id: string
  guest: string
  checkIn: string
  checkOut: string
  roomType: string
  status: "confirmed" | "pending" | "cancelled"
  totalAmount: number
  source: "direct" | "booking.com" | "expedia" | "phone" | "walk_in"
}

export interface DashboardServiceRequest {
  id: string
  guest: string
  room: string
  type: "housekeeping" | "maintenance" | "concierge" | "room_service" | "laundry"
  description: string
  priority: "low" | "medium" | "high" | "urgent"
  status: "pending" | "in_progress" | "completed"
  requestedAt: string
}

export function useDashboardData() {
  const { getBookings } = useBookings()
  const { getPayments } = usePayments()
  const { getMaintenanceRequests } = useMaintenanceRequests()
  const { getGuests } = useGuests()

  const [dashboardData, setDashboardData] = useState({
    recentActivity: [] as DashboardActivity[],
    pendingTasks: [] as DashboardTask[],
    todayArrivals: [] as DashboardArrival[],
    todayDepartures: [] as DashboardDeparture[],
    upcomingReservations: [] as DashboardReservation[],
    serviceRequests: [] as DashboardServiceRequest[],
  })
  const [isLoading, setIsLoading] = useState(false)

  const fetchRecentActivity = useCallback(async () => {
    try {
      const activities: DashboardActivity[] = []

      // Get recent bookings (check-ins and check-outs)
      const bookingsResponse = await getBookings({
        limit: 5,
        sort: "-updatedAt",
        status: "checked_in,checked_out",
      })

      if (bookingsResponse.data) {
        bookingsResponse.data.forEach((booking: any) => {
          if (booking.status === "checked_in" && booking.actual_check_in) {
            activities.push({
              id: `checkin_${booking._id}`,
              type: "checkin",
              guest: booking.guest?.full_name,
              guestId: booking.guest?._id,
              room: booking.room?.number,
              time: format(new Date(booking.actual_check_in), "HH:mm"),
              status: "completed",
              description: "Standard check-in completed",
            })
          }
          if (booking.status === "checked_out" && booking.actual_check_out) {
            activities.push({
              id: `checkout_${booking._id}`,
              type: "checkout",
              guest: booking.guest?.full_name,
              guestId: booking.guest?._id,
              room: booking.room?.number,
              time: format(new Date(booking.actual_check_out), "HH:mm"),
              status: "completed",
              description: "Express checkout completed",
            })
          }
        })
      }

      // Get recent payments
      const paymentsResponse = await getPayments({ limit: 5, sort: "-createdAt" })
      if (paymentsResponse.data) {
        paymentsResponse.data.forEach((payment: any) => {
          activities.push({
            id: `payment_${payment._id}`,
            type: "payment",
            guest: payment.guest?.full_name,
            guestId: payment.guest?._id,
            room: payment.booking?.room?.number,
            time: format(new Date(payment.createdAt), "HH:mm"),
            status: payment.status === "completed" ? "completed" : "pending",
            amount: payment.amount,
            description: `Payment received for ${payment.description || "room charges"}`,
          })
        })
      }

      // Get recent maintenance requests
      const maintenanceResponse = await getMaintenanceRequests({ limit: 3, sort: "-createdAt" })
      if ("data" in maintenanceResponse && Array.isArray(maintenanceResponse.data)) {
        maintenanceResponse.data.forEach((maintenance: any) => {
          activities.push({
            id: `maintenance_${maintenance._id}`,
            type: "maintenance",
            room: maintenance.room?.number,
            time: format(new Date(maintenance.createdAt), "HH:mm"),
            status: maintenance.status?.toLowerCase(),
            priority: maintenance.priority?.toLowerCase(),
            description: maintenance.description,
          })
        })
      }

      // Sort activities by time (most recent first)
      activities.sort((a, b) => {
        const timeA = new Date(`1970-01-01T${a.time}:00`)
        const timeB = new Date(`1970-01-01T${b.time}:00`)
        return timeB.getTime() - timeA.getTime()
      })

      setDashboardData((prev) => ({ ...prev, recentActivity: activities.slice(0, 10) }))
      return activities.slice(0, 10)
    } catch (error) {
      console.error("Error fetching recent activity:", error)
      return []
    }
  }, [getBookings, getPayments, getMaintenanceRequests])

  const fetchPendingTasks = useCallback(async () => {
    try {
      const tasks: DashboardTask[] = []

      // Get pending maintenance requests as tasks
      const maintenanceResponse = await getMaintenanceRequests({
        status: "pending,in_progress",
        limit: 10,
      })

      if ("data" in maintenanceResponse && Array.isArray(maintenanceResponse.data)) {
        maintenanceResponse.data.forEach((maintenance: any) => {
          tasks.push({
            id: `maintenance_task_${maintenance._id}`,
            title: `${maintenance.type} - Room ${maintenance.room?.number}`,
            description: maintenance.description,
            priority: maintenance.priority?.toLowerCase() || "medium",
            time: format(new Date(maintenance.createdAt), "HH:mm"),
            assignedTo: maintenance.assignedTo?.full_name || "Maintenance Team",
            category: "maintenance",
            dueDate: maintenance.dueDate ? format(new Date(maintenance.dueDate), "yyyy-MM-dd") : undefined,
          })
        })
      }

      // Add some housekeeping tasks based on checkout data
      const checkoutsToday = await getBookings({
        end_date: format(new Date(), "yyyy-MM-dd"),
        status: "checked_out",
        limit: 5,
      })

      if (checkoutsToday.data) {
        checkoutsToday.data.forEach((booking: any) => {
          tasks.push({
            id: `housekeeping_${booking._id}`,
            title: `Room Cleaning - Room ${booking.room?.number}`,
            description: `Clean and prepare room after checkout`,
            priority: "medium",
            time: format(new Date(booking.actual_check_out || booking.check_out), "HH:mm"),
            assignedTo: "Housekeeping",
            category: "housekeeping",
            dueDate: format(new Date(), "yyyy-MM-dd"),
          })
        })
      }

      setDashboardData((prev) => ({ ...prev, pendingTasks: tasks.slice(0, 10) }))
      return tasks.slice(0, 10)
    } catch (error) {
      console.error("Error fetching pending tasks:", error)
      return []
    }
  }, [getMaintenanceRequests, getBookings])

  const fetchTodayArrivals = useCallback(async () => {
    try {
      const today = format(new Date(), "yyyy-MM-dd")
      const bookingsResponse = await getBookings({
        start_date: today,
        end_date: today,
        status: "confirmed,checked_in",
      })

      const arrivals: DashboardArrival[] = []

      if (bookingsResponse.data) {
        bookingsResponse.data.forEach((booking: any) => {
          arrivals.push({
            id: booking._id,
            guest: booking.guest?.full_name || "Unknown Guest",
            guestId: booking.guest?._id,
            room: booking.room?.number || "TBD",
            roomType: booking.room?.room_type?.name || "Standard Room",
            time: format(new Date(booking.check_in), "HH:mm"),
            status: booking.status === "checked_in" ? "checked_in" : "confirmed",
            vip: booking.guest?.vip || false,
            specialRequests: booking.special_requests ? [booking.special_requests] : [],
            estimatedArrival: booking.estimated_arrival
              ? format(new Date(booking.estimated_arrival), "HH:mm")
              : undefined,
            contactNumber: booking.guest?.phone,
          })
        })
      }

      setDashboardData((prev) => ({ ...prev, todayArrivals: arrivals }))
      return arrivals
    } catch (error) {
      console.error("Error fetching today's arrivals:", error)
      return []
    }
  }, [getBookings])

  const fetchTodayDepartures = useCallback(async () => {
    try {
      const today = format(new Date(), "yyyy-MM-dd")
      const bookingsResponse = await getBookings({
        end_date: today,
        status: "checked_in,checked_out,extended",
      })

      const departures: DashboardDeparture[] = []

      if (bookingsResponse) {
        bookingsResponse.data.forEach((booking: any) => {
          const balanceDue = booking.total_amount - (booking.paid_amount || 0)
          departures.push({
            id: booking._id,
            guest: booking.guest?.full_name || "Unknown Guest",
            guestId: booking.guest?._id,
            room: booking.room?.number || "Unknown",
            checkOutTime: format(new Date(booking.check_out), "HH:mm"),
            status:
              booking.status === "checked_out"
                ? "checked_out"
                : booking.status === "extended"
                  ? "extended"
                  : "scheduled",
            balanceDue: Math.max(0, balanceDue),
            vip: booking.guest?.vip || false,
          })
        })
      }

      setDashboardData((prev) => ({ ...prev, todayDepartures: departures }))
      return departures
    } catch (error) {
      console.error("Error fetching today's departures:", error)
      return []
    }
  }, [getBookings])

  const fetchUpcomingReservations = useCallback(async () => {
    try {
      const tomorrow = format(addDays(new Date(), 1), "yyyy-MM-dd")
      const threeDaysLater = format(addDays(new Date(), 3), "yyyy-MM-dd")

      const bookingsResponse = await getBookings({
        start_date: tomorrow,
        end_date: threeDaysLater,
        status: "confirmed,pending",
      })

      const reservations: DashboardReservation[] = []

      if (bookingsResponse.data?.data) {
        bookingsResponse.data.data.forEach((booking: any) => {
          reservations.push({
            id: booking._id,
            guest: booking.guest?.full_name || "Unknown Guest",
            checkIn: format(new Date(booking.check_in), "yyyy-MM-dd"),
            checkOut: format(new Date(booking.check_out), "yyyy-MM-dd"),
            roomType: booking.room?.room_type?.name || "Standard Room",
            status: booking.status?.toLowerCase(),
            totalAmount: booking.total_amount || 0,
            source: booking.booking_source?.toLowerCase() || "direct",
          })
        })
      }

      setDashboardData((prev) => ({ ...prev, upcomingReservations: reservations }))
      return reservations
    } catch (error) {
      console.error("Error fetching upcoming reservations:", error)
      return []
    }
  }, [getBookings])

  const fetchServiceRequests = useCallback(async () => {
    try {
      // For now, we'll create mock service requests since there's no specific endpoint
      // In a real implementation, you would have a service requests endpoint
      const services: DashboardServiceRequest[] = [
        {
          id: "srv_1",
          guest: "Sarah Johnson",
          room: "301",
          type: "room_service",
          description: "Dinner order - Grilled salmon with vegetables",
          priority: "medium",
          status: "in_progress",
          requestedAt: format(new Date(Date.now() - 20 * 60 * 1000), "HH:mm"),
        },
        {
          id: "srv_2",
          guest: "Michael Chen",
          room: "205",
          type: "housekeeping",
          description: "Extra towels and toiletries",
          priority: "low",
          status: "pending",
          requestedAt: format(new Date(Date.now() - 35 * 60 * 1000), "HH:mm"),
        },
        {
          id: "srv_3",
          guest: "Robert Anderson",
          room: "425",
          type: "concierge",
          description: "Restaurant reservation for 2 at 8 PM",
          priority: "high",
          status: "completed",
          requestedAt: format(new Date(Date.now() - 90 * 60 * 1000), "HH:mm"),
        },
      ]

      setDashboardData((prev) => ({ ...prev, serviceRequests: services }))
      return services
    } catch (error) {
      console.error("Error fetching service requests:", error)
      return []
    }
  }, [])

  const fetchAllDashboardData = useCallback(async () => {
    setIsLoading(true)
    try {
      await Promise.all([
        fetchRecentActivity(),
        fetchPendingTasks(),
        fetchTodayArrivals(),
        fetchTodayDepartures(),
        fetchUpcomingReservations(),
        fetchServiceRequests(),
      ])
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }, [
    fetchRecentActivity,
    fetchPendingTasks,
    fetchTodayArrivals,
    fetchTodayDepartures,
    fetchUpcomingReservations,
    fetchServiceRequests,
  ])

  return {
    dashboardData,
    isLoading,
    fetchRecentActivity,
    fetchPendingTasks,
    fetchTodayArrivals,
    fetchTodayDepartures,
    fetchUpcomingReservations,
    fetchServiceRequests,
    fetchAllDashboardData,
  }
}
