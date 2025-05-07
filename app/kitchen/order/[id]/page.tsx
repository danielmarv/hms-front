"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { format } from "date-fns"
import { toast } from "sonner"
import { useApi } from "@/hooks/use-api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Clock, ChefHat, User, Utensils, Coffee, CheckCircle, XCircle, Loader2 } from "lucide-react"

export default function KitchenOrderDetail() {
  const params = useParams()
  const router = useRouter()
  const { request } = useApi()
  const [order, setOrder] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [selectedChef, setSelectedChef] = useState("")
  const [notes, setNotes] = useState("")
  const [chefs, setChefs] = useState<any[]>([])

  useEffect(() => {
    const fetchOrder = async () => {
      setIsLoading(true)
      try {
        const response = await request(`/kitchen/orders/${params.id}`)
        if (response.data) {
          setOrder(response.data.data)
          setNotes(response.data.data.notes || "")
          if (response.data.data.chef) {
            setSelectedChef(
              typeof response.data.data.chef === "object" ? response.data.data.chef._id : response.data.data.chef,
            )
          }
        } else {
          toast.error(response.error || "Failed to load order")
        }
      } catch (error) {
        console.error("Error fetching order:", error)
        toast.error("An error occurred while loading the order")
      } finally {
        setIsLoading(false)
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
  }, [params.id, request])

  const updateOrderStatus = async (status: string) => {
    setIsUpdating(true)
    try {
      const response = await request(`/kitchen/orders/${params.id}/status`, "PATCH", { status })

      if (response.data) {
        toast.success(`Order status updated to ${status}`)
        // Refresh order data
        const updatedOrder = await request(`/kitchen/orders/${params.id}`)
        if (updatedOrder.data) {
          setOrder(updatedOrder.data.data)
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

  const updateItemStatus = async (itemId: string, status: string) => {
    setIsUpdating(true)
    try {
      const response = await request(`/kitchen/orders/${params.id}/item-status`, "PATCH", {
        itemId,
        status,
        assignedTo: selectedChef || undefined,
      })

      if (response.data) {
        toast.success(`Item status updated to ${status}`)
        // Refresh order data
        const updatedOrder = await request(`/kitchen/orders/${params.id}`)
        if (updatedOrder.data) {
          setOrder(updatedOrder.data.data)
        }
      } else {
        toast.error(response.error || "Failed to update item status")
      }
    } catch (error) {
      toast.error("An error occurred while updating item status")
      console.error(error)
    } finally {
      setIsUpdating(false)
    }
  }

  const assignChef = async () => {
    if (!selectedChef) {
      toast.error("Please select a chef")
      return
    }

    setIsUpdating(true)
    try {
      const response = await request(`/kitchen/orders/${params.id}/assign-chef`, "PATCH", {
        chef: selectedChef,
      })

      if (response.data) {
        toast.success("Chef assigned successfully")
        // Refresh order data
        const updatedOrder = await request(`/kitchen/orders/${params.id}`)
        if (updatedOrder.data) {
          setOrder(updatedOrder.data.data)
        }
      } else {
        toast.error(response.error || "Failed to assign chef")
      }
    } catch (error) {
      toast.error("An error occurred while assigning chef")
      console.error(error)
    } finally {
      setIsUpdating(false)
    }
  }

  const updateOrderNotes = async () => {
    setIsUpdating(true)
    try {
      const response = await request(`/kitchen/orders/${params.id}`, "PUT", {
        notes,
      })

      if (response.data) {
        toast.success("Order notes updated")
        // Refresh order data
        const updatedOrder = await request(`/kitchen/orders/${params.id}`)
        if (updatedOrder.data) {
          setOrder(updatedOrder.data.data)
        }
      } else {
        toast.error(response.error || "Failed to update notes")
      }
    } catch (error) {
      toast.error("An error occurred while updating notes")
      console.error(error)
    } finally {
      setIsUpdating(false)
    }
  }

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

  const getNextStatusButton = () => {
    if (!order) return null

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

  if (isLoading) {
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
                  <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                  <Badge className={getPriorityColor(order.priority)}>{order.priority}</Badge>
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
                                {item.quantity}x {item.name || (item.menuItem && item.menuItem.name) || "Item"}
                              </div>
                              {item.menuItem?.preparationTime && (
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
                            <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                          </div>

                          {(order.status === "Pending" || order.status === "In Progress") && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {item.status === "Pending" && (
                                <Button
                                  size="sm"
                                  onClick={() => updateItemStatus(item._id, "Cooking")}
                                  disabled={isUpdating}
                                >
                                  Start Cooking
                                </Button>
                              )}
                              {item.status === "Cooking" && (
                                <Button
                                  size="sm"
                                  onClick={() => updateItemStatus(item._id, "Ready")}
                                  disabled={isUpdating}
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
                        <Button onClick={assignChef} disabled={isUpdating || !selectedChef}>
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
                      <Button onClick={updateOrderNotes} disabled={isUpdating} className="mt-2" variant="outline">
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
                onClick={() => updateOrderStatus("Cancelled")}
                disabled={isUpdating || order.status === "Completed" || order.status === "Cancelled"}
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
        </div>
      </div>
    </div>
  )
}
