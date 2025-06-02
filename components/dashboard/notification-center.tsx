"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Bell,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  CreditCard,
  Wrench,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Notification {
  id: string
  type: "info" | "warning" | "error" | "success"
  category: "booking" | "maintenance" | "payment" | "guest" | "system"
  title: string
  message: string
  timestamp: Date
  read: boolean
  actionUrl?: string
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Simulate real-time notifications
    const mockNotifications: Notification[] = [
      {
        id: "1",
        type: "warning",
        category: "maintenance",
        title: "Maintenance Required",
        message: "Room 205 AC unit needs immediate attention",
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        read: false,
        actionUrl: "/dashboard/maintenance",
      },
      {
        id: "2",
        type: "success",
        category: "booking",
        title: "New Booking",
        message: "VIP guest checked in to Presidential Suite",
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        read: false,
        actionUrl: "/dashboard/bookings",
      },
      {
        id: "3",
        type: "info",
        category: "payment",
        title: "Payment Processed",
        message: "Room 412 payment of $450 completed",
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        read: true,
        actionUrl: "/dashboard/payments",
      },
      {
        id: "4",
        type: "error",
        category: "system",
        title: "System Alert",
        message: "Backup process failed - manual intervention required",
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        read: false,
        actionUrl: "/admin/backups",
      },
      {
        id: "5",
        type: "info",
        category: "guest",
        title: "Guest Request",
        message: "Room 301 requested extra towels",
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
        read: true,
        actionUrl: "/dashboard/housekeeping",
      },
    ]

    setNotifications(mockNotifications)
    setUnreadCount(mockNotifications.filter((n) => !n.read).length)

    // Simulate new notifications coming in
    const interval = setInterval(() => {
      const newNotification: Notification = {
        id: Date.now().toString(),
        type: Math.random() > 0.7 ? "warning" : "info",
        category: ["booking", "maintenance", "payment", "guest"][Math.floor(Math.random() * 4)] as any,
        title: "New Activity",
        message: "A new event has occurred in the system",
        timestamp: new Date(),
        read: false,
      }

      setNotifications((prev) => [newNotification, ...prev.slice(0, 9)])
      setUnreadCount((prev) => prev + 1)
    }, 60000) // New notification every minute

    return () => clearInterval(interval)
  }, [])

  const getNotificationIcon = (category: string) => {
    switch (category) {
      case "booking":
        return <Calendar className="h-4 w-4" />
      case "maintenance":
        return <Wrench className="h-4 w-4" />
      case "payment":
        return <CreditCard className="h-4 w-4" />
      case "guest":
        return <User className="h-4 w-4" />
      case "system":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "error":
        return "text-red-600"
      case "warning":
        return "text-yellow-600"
      case "success":
        return "text-green-600"
      case "info":
      default:
        return "text-blue-600"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "info":
      default:
        return <Info className="h-4 w-4 text-blue-600" />
    }
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
    setUnreadCount(0)
  }

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[400px]">
          <div className="p-2">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No notifications</p>
              </div>
            ) : (
              <div className="space-y-1">
                {notifications.map((notification, index) => (
                  <div key={notification.id}>
                    <div
                      className={cn(
                        "p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/50",
                        !notification.read && "bg-muted/30",
                      )}
                      onClick={() => {
                        if (!notification.read) {
                          markAsRead(notification.id)
                        }
                        if (notification.actionUrl) {
                          window.location.href = notification.actionUrl
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn("flex-shrink-0 mt-0.5", getNotificationColor(notification.type))}>
                          {getNotificationIcon(notification.category)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium truncate">{notification.title}</p>
                            {getTypeIcon(notification.type)}
                            {!notification.read && <div className="h-2 w-2 rounded-full bg-blue-600 flex-shrink-0" />}
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">{notification.message}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatTimestamp(notification.timestamp)}
                          </div>
                        </div>
                      </div>
                    </div>
                    {index < notifications.length - 1 && <Separator className="my-1" />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
