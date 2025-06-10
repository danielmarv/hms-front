"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useKitchenOrders } from "@/hooks/use-kitchen-orders"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ArrowLeft, AlertTriangle, XCircle, ChefHat, Timer } from "lucide-react"
import Link from "next/link"
import type { KitchenOrder } from "@/types"

const ORDER_STATUS_COLORS: Record<string, string> = {
  New: "bg-blue-100 text-blue-800",
  Preparing: "bg-yellow-100 text-yellow-800",
  Ready: "bg-green-100 text-green-800",
  Completed: "bg-green-100 text-green-800",
  Cancelled: "bg-red-100 text-red-800",
}

const PRIORITY_COLORS: Record<string, string> = {
  Low: "bg-blue-100 text-blue-800",
  Medium: "bg-yellow-100 text-yellow-800",
  High: "bg-red-100 text-red-800",
}

export default function KitchenOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { getOrder, updateOrderStatus, updateItemStatus, loading: apiLoading } = useKitchenOrders()
  const [order, setOrder] = useState<KitchenOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState("")
  const [timeElapsed, setTimeElapsed] = useState(0)
  const orderId = params.id as string

  useEffect(() => {
    fetchOrder()
  }, [orderId])

  useEffect(() => {
    if (order && (order.status === "New" || order.status === "Preparing")) {
      const startTime = new Date(order.startedAt || order.createdAt).getTime()
      const interval = setInterval(() => {
        const now = new Date().getTime()
        const elapsed = Math.floor((now - startTime) / 1000) // elapsed time in seconds
        setTimeElapsed(elapsed)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [order])

  const fetchOrder = async () => {
    setLoading(true)
    try {
      const result = await getOrder(orderId)
      if (result) {
        setOrder(result)
      }
    } catch (error) {
      console.error("Error fetching order:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (status: string) => {
    const result = await updateOrderStatus(orderId, status, notes)
    if (result) {
      setOrder(result)
      setNotes("")
    }
  }

  const handleUpdateItemStatus = async (itemId: string, status: string) => {
    const result = await updateItemStatus(orderId, itemId, status)
    if (result) {
      setOrder(result)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  const isLoading = loading || apiLoading

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array(4)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <div className="space-y-1">
                          <Skeleton className="h-5 w-40" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                        <Skeleton className="h-10 w-24" />
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container mx-auto p-6">
        <Link href="/kitchen">
          <Button variant="outline" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Kitchen
          </Button>
        </Link>
        <Card className="p-8 text-center">
          <div className="mb-4 flex justify-center">
            <XCircle className="h-12 w-12 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold">Order Not Found</h3>
          <p className="text-muted-foreground mt-2">The order you're looking for doesn't exist or has been removed.</p>
          <Button className="mt-4" onClick={() => router.push("/kitchen")}>
            Return to Kitchen
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <Link href="/kitchen">
        <Button variant="outline" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Kitchen
        </Button>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">Order #{order.orderNumber}</CardTitle>
                  <CardDescription>
                    {new Date(order.createdAt).toLocaleString()} • {order.orderType}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge className={ORDER_STATUS_COLORS[order.status] || "bg-gray-100"}>{order.status}</Badge>
                  <Badge className={PRIORITY_COLORS[order.priority] || "bg-gray-100"}>{order.priority} Priority</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {(order.status === "New" || order.status === "Preparing") && (
                <div className="mb-4 p-3 bg-yellow-50 rounded-md flex items-center justify-between">
                  <div className="flex items-center">
                    <Timer className="h-5 w-5 text-yellow-600 mr-2" />
                    <span className="font-medium">Time Elapsed: {formatTime(timeElapsed)}</span>
                  </div>
                  {order.status === "New" && (
                    <Button size="sm" onClick={() => handleUpdateStatus("Preparing")}>
                      Start Preparing
                    </Button>
                  )}
                </div>
              )}

              <h3 className="font-medium text-lg mb-3">Order Items</h3>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item._id} className="flex justify-between items-center border-b pb-3">
                    <div>
                      <p className="font-medium">
                        {item.quantity}x {item.name}
                      </p>
                      {item.notes && <p className="text-sm text-muted-foreground">Note: {item.notes}</p>}
                    </div>
                    <div className="flex gap-2">
                      <Badge
                        className={
                          item.status === "New"
                            ? "bg-blue-100 text-blue-800"
                            : item.status === "Preparing"
                              ? "bg-yellow-100 text-yellow-800"
                              : item.status === "Ready"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100"
                        }
                      >
                        {item.status}
                      </Badge>
                      {item.status !== "Ready" && (
                        <Button size="sm" variant="outline" onClick={() => handleUpdateItemStatus(item._id, "Ready")}>
                          Mark Ready
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                <h3 className="font-medium text-lg">Order Actions</h3>
                <Textarea
                  placeholder="Add notes about this order (optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mb-4"
                />
                <div className="flex flex-wrap gap-2">
                  {order.status === "New" && (
                    <Button onClick={() => handleUpdateStatus("Preparing")}>Start Preparing</Button>
                  )}
                  {(order.status === "New" || order.status === "Preparing") && (
                    <Button onClick={() => handleUpdateStatus("Ready")}>Mark as Ready</Button>
                  )}
                  {order.status === "Ready" && (
                    <Button onClick={() => handleUpdateStatus("Completed")}>Mark as Completed</Button>
                  )}
                  {(order.status === "New" || order.status === "Preparing") && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="destructive">Cancel Order</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Cancel Order</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to cancel this order? This action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <Textarea
                          placeholder="Reason for cancellation"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className="my-4"
                        />
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setNotes("")}>
                            Cancel
                          </Button>
                          <Button variant="destructive" onClick={() => handleUpdateStatus("Cancelled")}>
                            Yes, Cancel Order
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">Table/Room</p>
                <p className="text-sm text-muted-foreground">
                  {order.table ? `Table ${order.table}` : order.room ? `Room ${order.room}` : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Order Type</p>
                <p className="text-sm text-muted-foreground">{order.orderType}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Priority</p>
                <p className="text-sm text-muted-foreground flex items-center">
                  {order.priority === "High" && <AlertTriangle className="mr-1 h-4 w-4 text-red-500" />}
                  {order.priority}
                </p>
              </div>
              {order.waiter && (
                <div>
                  <p className="text-sm font-medium">Waiter</p>
                  <p className="text-sm text-muted-foreground">{order.waiter}</p>
                </div>
              )}
              {order.chef && (
                <div>
                  <p className="text-sm font-medium">Assigned Chef</p>
                  <p className="text-sm text-muted-foreground flex items-center">
                    <ChefHat className="mr-1 h-4 w-4" />
                    {order.chef}
                  </p>
                </div>
              )}
              {order.notes && (
                <div>
                  <p className="text-sm font-medium">Order Notes</p>
                  <p className="text-sm text-muted-foreground">{order.notes}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium">Timeline</p>
                <div className="mt-2 space-y-2">
                  <div className="flex items-start">
                    <div className="mr-2 mt-0.5">
                      <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    </div>
                    <div>
                      <p className="text-xs font-medium">Order Created</p>
                      <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  {order.startedAt && (
                    <div className="flex items-start">
                      <div className="mr-2 mt-0.5">
                        <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                      </div>
                      <div>
                        <p className="text-xs font-medium">Preparation Started</p>
                        <p className="text-xs text-muted-foreground">{new Date(order.startedAt).toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                  {order.completedAt && (
                    <div className="flex items-start">
                      <div className="mr-2 mt-0.5">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      </div>
                      <div>
                        <p className="text-xs font-medium">Order Completed</p>
                        <p className="text-xs text-muted-foreground">{new Date(order.completedAt).toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                  {order.cancelledAt && (
                    <div className="flex items-start">
                      <div className="mr-2 mt-0.5">
                        <div className="h-2 w-2 rounded-full bg-red-500"></div>
                      </div>
                      <div>
                        <p className="text-xs font-medium">Order Cancelled</p>
                        <p className="text-xs text-muted-foreground">{new Date(order.cancelledAt).toLocaleString()}</p>
                        {order.cancellationReason && (
                          <p className="text-xs text-red-500">Reason: {order.cancellationReason}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={fetchOrder}>
                Refresh Order
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
