"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Clock, ChefHat, MoreVertical, AlertTriangle, Timer, Eye } from "lucide-react"
import type { KitchenOrder } from "@/types"

interface KitchenOrderCardProps {
  order: KitchenOrder
  onUpdateStatus: (orderId: string, status: string, notes?: string) => Promise<void>
  onRefresh: () => void
}

export function KitchenOrderCard({ order, onUpdateStatus, onRefresh }: KitchenOrderCardProps) {
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)

  const handleUpdateStatus = async (status: string) => {
    setIsUpdating(true)
    try {
      await onUpdateStatus(order._id, status)
      onRefresh()
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "New":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "In Progress":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Ready":
        return "bg-green-100 text-green-800 border-green-200"
      case "Completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "Cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800 border-red-200"
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Low":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getTimeElapsed = () => {
    const startTime = new Date(order.startedAt || order.createdAt).getTime()
    const now = new Date().getTime()
    const elapsed = Math.floor((now - startTime) / 1000 / 60) // minutes
    return elapsed
  }

  const getNextAction = () => {
    switch (order.status) {
      case "Pending":
        return (
          <Button onClick={() => handleUpdateStatus("In Progress")} disabled={isUpdating} className="w-full" size="sm">
            Start Preparing
          </Button>
        )
      case "In Progress":
        return (
          <Button onClick={() => handleUpdateStatus("Ready")} disabled={isUpdating} className="w-full" size="sm">
            Mark as Ready
          </Button>
        )
      case "Ready":
        return (
          <Button
            onClick={() => handleUpdateStatus("Completed")}
            disabled={isUpdating}
            className="w-full"
            size="sm"
            variant="outline"
          >
            Complete Order
          </Button>
        )
      default:
        return null
    }
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Helper function to safely render table information
  const getTableDisplay = () => {
    if (!order.table) return null

    if (typeof order.table === "string" || typeof order.table === "number") {
      return `Table ${order.table}`
    }

    if (typeof order.table === "object" && order.table !== null) {
      // Handle table object with number and section
      const tableObj = order.table as any
      if (tableObj.number) {
        return `Table ${tableObj.number}${tableObj.section ? ` (${tableObj.section})` : ""}`
      }
      return "Table"
    }

    return null
  }

  // Helper function to safely render room information
  const getRoomDisplay = () => {
    if (!order.room) return null

    if (typeof order.room === "string" || typeof order.room === "number") {
      return `Room ${order.room}`
    }

    if (typeof order.room === "object" && order.room !== null) {
      const roomObj = order.room as any
      if (roomObj.number) {
        return `Room ${roomObj.number}`
      }
      return "Room"
    }

    return null
  }

  // Helper function to get location display
  const getLocationDisplay = () => {
    const tableDisplay = getTableDisplay()
    const roomDisplay = getRoomDisplay()

    if (tableDisplay) return tableDisplay
    if (roomDisplay) return roomDisplay
    return "Takeaway"
  }

  return (
    <Card
      className={`overflow-hidden transition-all hover:shadow-md ${
        order.priority === "High" ? "ring-2 ring-red-200" : ""
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              Order #{order.orderNumber}
              {order.priority === "High" && <AlertTriangle className="h-4 w-4 text-red-500" />}
            </CardTitle>
            <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
              <Clock className="h-3 w-3" />
              {formatTime(order.createdAt)}
              {(order.status === "New" || order.status === "Preparing") && (
                <span className="flex items-center gap-1 text-orange-600">
                  <Timer className="h-3 w-3" />
                  {getTimeElapsed()}m
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-1">
            <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
            <Badge className={getPriorityColor(order.priority)}>{order.priority}</Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="space-y-3">
          {/* Order Details */}
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium">{order.orderType}</span>
              <span className="text-muted-foreground">• {getLocationDisplay()}</span>
            </div>
            {order.chef && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <ChefHat className="h-3 w-3" />
                <span className="text-xs">{typeof order.chef === "object" ? order.chef.full_name : "Assigned"}</span>
              </div>
            )}
          </div>

          <Separator />

          {/* Order Items */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Items ({order.items?.length || 0})</p>
            <div className="space-y-1">
              {order.items?.slice(0, 3).map((item, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="flex-1">
                    {item.quantity}x {item.name}
                  </span>
                  <Badge variant="outline" className={`text-xs ${getStatusColor(item.status || "New")}`}>
                    {item.status || "New"}
                  </Badge>
                </div>
              )) || []}
              {(order.items?.length || 0) > 3 && (
                <p className="text-xs text-muted-foreground">+{(order.items?.length || 0) - 3} more items</p>
              )}
            </div>
          </div>

          {/* Order Notes */}
          {order.notes && (
            <div className="text-xs bg-muted p-2 rounded-md">
              <p className="font-medium">Notes:</p>
              <p className="text-muted-foreground">{order.notes}</p>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between pt-0 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/kitchen/order/${order._id}`)}
          className="flex-1"
        >
          <Eye className="h-4 w-4 mr-1" />
          Details
        </Button>

        {getNextAction() && <div className="flex-1">{getNextAction()}</div>}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {order.status === "New" && (
              <DropdownMenuItem onClick={() => handleUpdateStatus("Preparing")}>Start Preparing</DropdownMenuItem>
            )}
            {(order.status === "New" || order.status === "Preparing") && (
              <DropdownMenuItem onClick={() => handleUpdateStatus("Ready")}>Mark as Ready</DropdownMenuItem>
            )}
            {order.status === "Ready" && (
              <DropdownMenuItem onClick={() => handleUpdateStatus("Completed")}>Complete Order</DropdownMenuItem>
            )}
            {(order.status === "New" || order.status === "Preparing") && (
              <DropdownMenuItem onClick={() => handleUpdateStatus("Cancelled")} className="text-red-600">
                Cancel Order
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  )
}
