"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"
import { Clock, ChefHat, User, Coffee, Utensils } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useApi } from "@/hooks/use-api"

interface KitchenOrderCardProps {
  order: any
  onStatusChange?: () => void
}

export function KitchenOrderCard({ order, onStatusChange }: KitchenOrderCardProps) {
  const router = useRouter()
  const { request } = useApi()
  const [isUpdating, setIsUpdating] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "In Progress":
        return "bg-blue-100 text-blue-800 border-blue-200"
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
      case "Normal":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Low":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-blue-100 text-blue-800 border-blue-200"
    }
  }

  const getOrderTypeIcon = (type: string) => {
    switch (type) {
      case "Dine In":
        return <Utensils className="h-4 w-4" />
      case "Takeaway":
        return <Coffee className="h-4 w-4" />
      case "Delivery":
        return <User className="h-4 w-4" />
      default:
        return <Utensils className="h-4 w-4" />
    }
  }

  const updateOrderStatus = async (status: string) => {
    setIsUpdating(true)
    try {
      const response = await request(`/kitchen/orders/${order._id}/status`, "PATCH", { status })

      if (response.data) {
        toast.success(`Order status updated to ${status}`)
        if (onStatusChange) {
          onStatusChange()
        }
      } else {
        toast.error(response.error || "Failed to update order status")
      }
    } catch (error) {
      toast.error("An error occurred while updating order status")
      console.error(error)
    } finally {
      setIsUpdating(false)
    }
  }

  const getNextStatusButton = () => {
    switch (order.status) {
      case "Pending":
        return (
          <Button onClick={() => updateOrderStatus("In Progress")} disabled={isUpdating} className="w-full">
            Start Preparing
          </Button>
        )
      case "In Progress":
        return (
          <Button onClick={() => updateOrderStatus("Ready")} disabled={isUpdating} className="w-full">
            Mark as Ready
          </Button>
        )
      case "Ready":
        return (
          <Button onClick={() => updateOrderStatus("Completed")} disabled={isUpdating} className="w-full">
            Complete Order
          </Button>
        )
      default:
        return null
    }
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">Order #{order.orderNumber}</CardTitle>
            <div className="text-sm text-muted-foreground mt-1">
              {order.createdAt && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-1 items-end">
            <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
            <Badge className={getPriorityColor(order.priority)}>{order.priority}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            {getOrderTypeIcon(order.orderType)}
            <span className="text-sm font-medium">{order.orderType}</span>
          </div>
          {order.table && <div className="text-sm font-medium">Table: {order.table.number}</div>}
        </div>

        <Separator className="my-2" />

        <div className="space-y-2 mt-2">
          <div className="text-sm font-medium">Items:</div>
          <ul className="space-y-2">
            {order.items?.slice(0, 3).map((item: any, index: number) => (
              <li key={index} className="text-sm flex justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={getStatusColor(item.status)}>
                    {item.status}
                  </Badge>
                  <span>
                    {item.quantity}x {item.name || (item.menuItem && item.menuItem.name) || "Item"}
                  </span>
                </div>
              </li>
            ))}
            {order.items && order.items.length > 3 && (
              <li className="text-sm text-muted-foreground">+{order.items.length - 3} more items</li>
            )}
          </ul>
        </div>

        {order.chef && (
          <div className="mt-3 flex items-center gap-1 text-sm">
            <ChefHat className="h-3 w-3" />
            <span>Chef: {typeof order.chef === "object" ? order.chef.full_name : "Assigned"}</span>
          </div>
        )}

        {order.notes && (
          <div className="mt-3 text-sm">
            <div className="font-medium">Notes:</div>
            <div className="text-muted-foreground">{order.notes}</div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex gap-2">
        {getNextStatusButton()}
        <Button variant="outline" size="icon" onClick={() => router.push(`/kitchen/orders/${order._id}`)}>
          <Utensils className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
