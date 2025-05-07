"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import type { KitchenOrder } from "@/types"
import { useKitchenOrders } from "@/hooks/use-kitchen-orders"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Clock, ChefHat, User, Coffee, Utensils, ExternalLink } from "lucide-react"
import { KITCHEN_STATUS_COLORS, PRIORITY_COLORS, ORDER_TYPES } from "@/config/constants"

interface KitchenOrderCardProps {
  order: KitchenOrder
  onStatusChange?: () => void
}

export function KitchenOrderCard({ order, onStatusChange }: KitchenOrderCardProps) {
  const router = useRouter()
  const { updateKitchenOrderStatus, loading } = useKitchenOrders()
  const [isUpdating, setIsUpdating] = useState(false)

  const getOrderTypeIcon = (type: string) => {
    switch (type) {
      case ORDER_TYPES.DINE_IN:
        return <Utensils className="h-4 w-4" />
      case ORDER_TYPES.TAKEAWAY:
        return <Coffee className="h-4 w-4" />
      case ORDER_TYPES.DELIVERY:
        return <User className="h-4 w-4" />
      default:
        return <Utensils className="h-4 w-4" />
    }
  }

  const getNextStatusButton = () => {
    switch (order.status) {
      case "Pending":
        return (
          <Button onClick={() => handleUpdateStatus("Cooking")} disabled={isUpdating || loading} className="w-full">
            Start Preparing
          </Button>
        )
      case "Cooking":
        return (
          <Button onClick={() => handleUpdateStatus("Ready")} disabled={isUpdating || loading} className="w-full">
            Mark as Ready
          </Button>
        )
      case "Ready":
        return (
          <Button onClick={() => handleUpdateStatus("Completed")} disabled={isUpdating || loading} className="w-full">
            Complete Order
          </Button>
        )
      default:
        return null
    }
  }

  const handleUpdateStatus = async (status: string) => {
    setIsUpdating(true)
    try {
      await updateKitchenOrderStatus(order._id, status)
      if (onStatusChange) {
        onStatusChange()
      }
    } finally {
      setIsUpdating(false)
    }
  }

  const pendingItems = order.items.filter((item) => item.status === "Pending").length
  const cookingItems = order.items.filter((item) => item.status === "Cooking").length
  const readyItems = order.items.filter((item) => item.status === "Ready").length

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
            <Badge className={KITCHEN_STATUS_COLORS[order.status] || "bg-gray-100"}>{order.status}</Badge>
            <Badge className={PRIORITY_COLORS[order.priority] || "bg-blue-100"}>{order.priority}</Badge>
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
            {order.items?.slice(0, 3).map((item, index) => (
              <li key={index} className="text-sm flex justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={KITCHEN_STATUS_COLORS[item.status]}>
                    {item.status}
                  </Badge>
                  <span>
                    {item.quantity}x {item.name || (typeof item.menuItem === "object" && item.menuItem.name) || "Item"}
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

        <div className="mt-3 grid grid-cols-3 gap-1 text-center">
          <div className="text-xs">
            <div className="font-medium">Pending</div>
            <Badge variant="outline" className={pendingItems > 0 ? "bg-yellow-50" : ""}>
              {pendingItems}
            </Badge>
          </div>
          <div className="text-xs">
            <div className="font-medium">Cooking</div>
            <Badge variant="outline" className={cookingItems > 0 ? "bg-blue-50" : ""}>
              {cookingItems}
            </Badge>
          </div>
          <div className="text-xs">
            <div className="font-medium">Ready</div>
            <Badge variant="outline" className={readyItems > 0 ? "bg-green-50" : ""}>
              {readyItems}
            </Badge>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        {getNextStatusButton()}
        <Button variant="outline" size="icon" onClick={() => router.push(`/kitchen/orders/${order._id}`)}>
          <ExternalLink className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
