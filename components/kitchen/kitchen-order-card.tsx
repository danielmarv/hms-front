"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Clock, ChefHat } from "lucide-react"
import { KITCHEN_ORDER_STATUS, PRIORITY_LEVELS } from "@/config/constants"
import type { KitchenOrder } from "@/types"

interface KitchenOrderCardProps {
  order: KitchenOrder
  onUpdateStatus: (orderId: string, status: string) => Promise<void>
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
      case KITCHEN_ORDER_STATUS.PENDING:
        return "bg-blue-100 text-blue-800"
      case KITCHEN_ORDER_STATUS.COOKING:
        return "bg-yellow-100 text-yellow-800"
      case KITCHEN_ORDER_STATUS.READY:
        return "bg-green-100 text-green-800"
      case KITCHEN_ORDER_STATUS.COMPLETED:
        return "bg-green-100 text-green-800"
      case KITCHEN_ORDER_STATUS.CANCELLED:
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case PRIORITY_LEVELS.HIGH:
        return "bg-red-100 text-red-800"
      case PRIORITY_LEVELS.MEDIUM:
        return "bg-yellow-100 text-yellow-800"
      case PRIORITY_LEVELS.LOW:
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getNextAction = () => {
    switch (order.status) {
      case KITCHEN_ORDER_STATUS.PENDING:
        return (
          <Button
            onClick={() => handleUpdateStatus(KITCHEN_ORDER_STATUS.COOKING)}
            disabled={isUpdating}
            className="w-full"
          >
            Start Preparing
          </Button>
        )
      case KITCHEN_ORDER_STATUS.COOKING:
        return (
          <Button
            onClick={() => handleUpdateStatus(KITCHEN_ORDER_STATUS.READY)}
            disabled={isUpdating}
            className="w-full"
          >
            Mark as Ready
          </Button>
        )
      case KITCHEN_ORDER_STATUS.READY:
        return (
          <Button
            onClick={() => handleUpdateStatus(KITCHEN_ORDER_STATUS.COMPLETED)}
            disabled={isUpdating}
            className="w-full"
          >
            Complete Order
          </Button>
        )
      default:
        return null
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">Order #{order.orderNumber}</CardTitle>
          <div className="flex gap-1">
            <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
            <Badge className={getPriorityColor(order.priority)}>{order.priority}</Badge>
          </div>
        </div>
        <div className="text-sm text-muted-foreground flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          {new Date(order.createdAt).toLocaleString()}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              {order.orderType === "Dine In" && order.table && (
                <span className="text-sm">Table: {order.table.number || order.table}</span>
              )}
              {order.orderType === "Room Service" && order.room && (
                <span className="text-sm">Room: {order.room.number || order.room}</span>
              )}
              <span className="text-sm">{order.orderType}</span>
            </div>
            {order.chef && (
              <div className="flex items-center gap-1 text-sm">
                <ChefHat className="h-3 w-3" />
                <span>{typeof order.chef === "object" ? order.chef.full_name : "Assigned"}</span>
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-1">
            <p className="text-sm font-medium">Items ({order.items.length})</p>
            {order.items.slice(0, 3).map((item, index) => (
              <div key={index} className="text-sm flex justify-between">
                <span>
                  {item.quantity}x {item.name}
                </span>
                <Badge variant="outline" className={getStatusColor(item.status)}>
                  {item.status}
                </Badge>
              </div>
            ))}
            {order.items.length > 3 && (
              <p className="text-xs text-muted-foreground">+{order.items.length - 3} more items</p>
            )}
          </div>

          {order.notes && (
            <div className="text-xs bg-muted p-2 rounded-md">
              <p className="font-medium">Notes:</p>
              <p>{order.notes}</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-0">
        <Button variant="outline" size="sm" onClick={() => router.push(`/kitchen/order/${order._id}`)}>
          View Details
        </Button>
        {getNextAction()}
      </CardFooter>
    </Card>
  )
}
