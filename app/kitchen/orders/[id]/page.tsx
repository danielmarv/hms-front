"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { format } from "date-fns"
import { useKitchenOrders } from "@/hooks/use-kitchen-orders"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft,
  Clock,
  ChefHat,
  User,
  Utensils,
  Coffee,
  CheckCircle,
  XCircle,
  Loader2,
  AlertTriangle,
} from "lucide-react"
import { KITCHEN_STATUS_COLORS, PRIORITY_COLORS, ORDER_TYPES } from "@/config/constants"

export default function KitchenOrderDetail() {
  const params = useParams()
  const router = useRouter()
  const {
    getKitchenOrder,
    updateKitchenOrder,
    updateKitchenOrderStatus,
    updateKitchenOrderItemStatus,
    assignChef,
    loading,
  } = useKitchenOrders()
  const [order, setOrder] = useState<any>(null)
  const [selectedChef, setSelectedChef] = useState("")
  const [notes, setNotes] = useState("")
  const [chefs, setChefs] = useState<any[]>([])

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await getKitchenOrder(params.id as string)
        if (data) {
          setOrder(data)
          setNotes(data.notes || "")
          if (data.chef) {
            setSelectedChef(typeof data.chef === "object" ? data.chef._id : data.chef)
          }
        }
      } catch (error) {
        console.error("Error fetching order:", error)
      }
    }

    const fetchChefs = async () => {
      try {
        // This would be a real API call to fetch chefs
        // For now, we'll use dummy data
        setChefs([
          { _id: "chef1", full_name: "Chef John Doe" },
          { _id: "chef2", full_name: "Chef Jane Smith" },
          { _id: "chef3", full_name: "Chef Mike Johnson" },
        ])
      } catch (error) {
        console.error("Error fetching chefs:", error)
      }
    }

    fetchOrder()
    fetchChefs()
  }, [params.id])

  const handleUpdateOrderStatus = async (status: string) => {
    try {
      const result = await updateKitchenOrderStatus(params.id as string, status)
      if (result) {
        setOrder(result)
      }
    } catch (error) {
      console.error("Error updating order status:", error)
    }
  }

  const handleUpdateItemStatus = async (itemId: string, status: string) => {
    try {
      const result = await updateKitchenOrderItemStatus(params.id as string, itemId, status, selectedChef || undefined)
      if (result) {
        setOrder(result)
      }
    } catch (error) {
      console.error("Error updating item status:", error)
    }
  }

  const handleAssignChef = async () => {
    if (!selectedChef) return

    try {
      const result = await assignChef(params.id as string, selectedChef)
      if (result) {
        setOrder(result)
      }
    } catch (error) {
      console.error("Error assigning chef:", error)
    }
  }

  const handleUpdateNotes = async () => {
    try {
      const result = await updateKitchenOrder(params.id as string, { notes })
      if (result) {
        setOrder(result)
      }
    } catch (error) {
      console.error("Error updating notes:", error)
    }
  }

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
    if (!order) return null

    switch (order.status) {
      case "Pending":
        return (
          <Button onClick={() => handleUpdateOrderStatus("Cooking")} disabled={loading} className="w-full">
            Start Preparing
          </Button>
        )
      case "Cooking":
        return (
          <Button onClick={() => handleUpdateOrderStatus("Ready")} disabled={loading} className="w-full">
            Mark as Ready
          </Button>
        )
      case "Ready":
        return (
          <Button onClick={() => handleUpdateOrderStatus("Completed")} disabled={loading} className="w-full">
            Complete Order
          </Button>
        )
      default:
        return null
    }
  }

  if (loading && !order) {
    return (
      <div className="container mx-auto py-6 flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container mx-auto py-6">
        <Button variant="outline" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Order Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The requested order could not be found.</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={() => router.push("/kitchen")}>
              Return to Kitchen Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <Button variant="outline" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Kitchen Dashboard
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">Order #{order.orderNumber}</CardTitle>
                  <div className="text-sm text-muted-foreground mt-1">
                    {order.createdAt && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(order.createdAt), "PPP p")}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  <Badge className={KITCHEN_STATUS_COLORS[order.status]}>{order.status}</Badge>
                  <Badge className={PRIORITY_COLORS[order.priority]}>{order.priority}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {getOrderTypeIcon(order.orderType)}
                  <span className="text-sm font-medium">{order.orderType}</span>
                </div>
                {order.table && <div className="text-sm font-medium">Table: {order.table.number}</div>}
                {order.waiter && (
                  <div className="text-sm font-medium flex items-center gap-1">
                    <User className="h-3 w-3" />
                    Waiter: {typeof order.waiter === "object" ? order.waiter.full_name : "Assigned"}
                  </div>
                )}
              </div>

              <Separator className="my-4" />

              <Tabs defaultValue="items">
                <TabsList className="w-full">
                  <TabsTrigger value="items">Order Items</TabsTrigger>
                  <TabsTrigger value="details">Order Details</TabsTrigger>
                </TabsList>

                <TabsContent value="items" className="mt-4">
                  <div className="space-y-4">
                    {order.items?.map((item: any, index: number) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">
                                {item.quantity}x{" "}
                                {item.name || (typeof item.menuItem === "object" && item.menuItem.name) || "Item"}
                              </div>
                              {typeof item.menuItem === "object" && item.menuItem.preparationTime && (
                                <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                  <Clock className="h-3 w-3" />
                                  Prep time: {item.menuItem.preparationTime} min
                                </div>
                              )}
                              {item.notes && (
                                <div className="text-xs text-muted-foreground mt-1">Notes: {item.notes}</div>
                              )}
                              {item.modifiers && item.modifiers.length > 0 && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  Modifiers: {item.modifiers.join(", ")}
                                </div>
                              )}
                              {item.assignedTo && (
                                <div className="text-xs flex items-center gap-1 mt-1">
                                  <ChefHat className="h-3 w-3" />
                                  Chef: {typeof item.assignedTo === "object" ? item.assignedTo.full_name : "Assigned"}
                                </div>
                              )}
                            </div>
                            <Badge className={KITCHEN_STATUS_COLORS[item.status]}>{item.status}</Badge>
                          </div>

                          {(order.status === "Pending" || order.status === "Cooking") && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {item.status === "Pending" && (
                                <Button
                                  size="sm"
                                  onClick={() => handleUpdateItemStatus(item._id, "Cooking")}
                                  disabled={loading}
                                >
                                  Start Cooking
                                </Button>
                              )}
                              {item.status === "Cooking" && (
                                <Button
                                  size="sm"
                                  onClick={() => handleUpdateItemStatus(item._id, "Ready")}
                                  disabled={loading}
                                >
                                  Mark Ready
                                </Button>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="details" className="mt-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium mb-2">Chef Assignment</h3>
                      <div className="flex gap-2">
                        <Select value={selectedChef} onValueChange={setSelectedChef}>
                          <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Select chef" />
                          </SelectTrigger>
                          <SelectContent>
                            {chefs.map((chef) => (
                              <SelectItem key={chef._id} value={chef._id}>
                                {chef.full_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button onClick={handleAssignChef} disabled={loading || !selectedChef}>
                          Assign Chef
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium mb-2">Order Notes</h3>
                      <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add notes about this order"
                        rows={4}
                      />
                      <Button onClick={handleUpdateNotes} disabled={loading} className="mt-2" variant="outline">
                        Update Notes
                      </Button>
                    </div>

                    {order.estimatedCompletionTime && (
                      <div>
                        <h3 className="text-sm font-medium mb-1">Estimated Completion</h3>
                        <p>{format(new Date(order.estimatedCompletionTime), "PPP p")}</p>
                      </div>
                    )}

                    {order.startedAt && (
                      <div>
                        <h3 className="text-sm font-medium mb-1">Started At</h3>
                        <p>{format(new Date(order.startedAt), "PPP p")}</p>
                      </div>
                    )}

                    {order.completedAt && (
                      <div>
                        <h3 className="text-sm font-medium mb-1">Completed At</h3>
                        <p>{format(new Date(order.completedAt), "PPP p")}</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="destructive"
                onClick={() => handleUpdateOrderStatus("Cancelled")}
                disabled={loading || order.status === "Completed" || order.status === "Cancelled"}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancel Order
              </Button>
              {getNextStatusButton()}
            </CardFooter>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-2">
                  <div className="mt-0.5">
                    <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                      <Clock className="h-3 w-3 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <p className="font-medium">Order Created</p>
                    <p className="text-sm text-muted-foreground">
                      {order.createdAt ? format(new Date(order.createdAt), "PPP p") : "Unknown"}
                    </p>
                  </div>
                </div>

                {order.startedAt && (
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5">
                      <div className="h-6 w-6 rounded-full bg-amber-100 flex items-center justify-center">
                        <ChefHat className="h-3 w-3 text-amber-600" />
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">Preparation Started</p>
                      <p className="text-sm text-muted-foreground">{format(new Date(order.startedAt), "PPP p")}</p>
                    </div>
                  </div>
                )}

                {order.completedAt && (
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5">
                      <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">Order Completed</p>
                      <p className="text-sm text-muted-foreground">{format(new Date(order.completedAt), "PPP p")}</p>
                    </div>
                  </div>
                )}

                {order.cancelledAt && (
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5">
                      <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center">
                        <XCircle className="h-3 w-3 text-red-600" />
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">Order Cancelled</p>
                      <p className="text-sm text-muted-foreground">{format(new Date(order.cancelledAt), "PPP p")}</p>
                      {order.cancellationReason && (
                        <p className="text-sm text-muted-foreground mt-1">Reason: {order.cancellationReason}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Item Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <span>Pending</span>
                  </div>
                  <Badge variant="outline">{order.items.filter((item: any) => item.status === "Pending").length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <ChefHat className="h-4 w-4 text-blue-500" />
                    <span>Cooking</span>
                  </div>
                  <Badge variant="outline">{order.items.filter((item: any) => item.status === "Cooking").length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Ready</span>
                  </div>
                  <Badge variant="outline">{order.items.filter((item: any) => item.status === "Ready").length}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
