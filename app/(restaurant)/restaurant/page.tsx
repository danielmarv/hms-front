"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  ShoppingCart,
  Users,
  DollarSign,
  Clock,
  ChefHat,
  AlertTriangle,
  Star,
  Utensils,
  Calendar,
  Package,
} from "lucide-react"
import Link from "next/link"
import { workflowCoordinator, triggerRestaurantOrder } from "@/lib/workflow-coordinator"

export default function RestaurantDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 45,
    activeOrders: 12,
    completedOrders: 33,
    totalRevenue: 2850,
    averageOrderValue: 63.33,
    tablesOccupied: 18,
    totalTables: 25,
    kitchenQueue: 8,
    averageWaitTime: 25,
    customerSatisfaction: 4.6,
  })

  const [activeOrders, setActiveOrders] = useState([
    {
      id: "ORD-001",
      table: "Table 5",
      items: 3,
      total: 85.5,
      status: "preparing",
      time: "15 min",
      priority: "normal",
    },
    {
      id: "ORD-002",
      table: "Table 12",
      items: 2,
      total: 42.0,
      status: "ready",
      time: "22 min",
      priority: "high",
    },
    {
      id: "ORD-003",
      table: "Room 301",
      items: 4,
      total: 125.75,
      status: "new",
      time: "2 min",
      priority: "normal",
    },
  ])

  const [popularItems, setPopularItems] = useState([
    { name: "Grilled Salmon", orders: 12, revenue: 360 },
    { name: "Caesar Salad", orders: 8, revenue: 120 },
    { name: "Beef Tenderloin", orders: 6, revenue: 270 },
    { name: "Pasta Carbonara", orders: 10, revenue: 180 },
  ])

  const [tableStatus, setTableStatus] = useState([
    { number: 1, status: "occupied", guests: 4, server: "Alice", time: "45 min" },
    { number: 2, status: "available", guests: 0, server: null, time: null },
    { number: 3, status: "reserved", guests: 2, server: "Bob", time: "30 min" },
    { number: 4, status: "occupied", guests: 6, server: "Carol", time: "20 min" },
    { number: 5, status: "cleaning", guests: 0, server: null, time: "5 min" },
  ])

  useEffect(() => {
    // Listen for workflow events
    const handleWorkflowEvent = (event: any) => {
      console.log("Restaurant received workflow event:", event)
      // Update dashboard based on workflow events
      if (event.type === "order.created") {
        // Refresh active orders
        // In a real app, you would fetch from API
      }
    }

    workflowCoordinator.addEventListener("order.created", handleWorkflowEvent)

    return () => {
      workflowCoordinator.removeEventListener("order.created", handleWorkflowEvent)
    }
  }, [])

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <Badge className="bg-blue-100 text-blue-800">New</Badge>
      case "preparing":
        return <Badge className="bg-yellow-100 text-yellow-800">Preparing</Badge>
      case "ready":
        return <Badge className="bg-green-100 text-green-800">Ready</Badge>
      case "served":
        return <Badge className="bg-purple-100 text-purple-800">Served</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTableStatusBadge = (status: string) => {
    switch (status) {
      case "occupied":
        return <Badge className="bg-red-100 text-red-800">Occupied</Badge>
      case "available":
        return <Badge className="bg-green-100 text-green-800">Available</Badge>
      case "reserved":
        return <Badge className="bg-blue-100 text-blue-800">Reserved</Badge>
      case "cleaning":
        return <Badge className="bg-yellow-100 text-yellow-800">Cleaning</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleNewOrder = () => {
    // Trigger workflow for new order
    triggerRestaurantOrder({
      orderId: `ORD-${Date.now()}`,
      table: "Table 10",
      items: [{ name: "Sample Item", quantity: 1, price: 25.0 }],
      total: 25.0,
    })
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Restaurant Dashboard</h1>
          <p className="text-muted-foreground">Monitor restaurant operations and manage orders efficiently</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleNewOrder}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            New Order
          </Button>
          <Button variant="outline" asChild>
            <Link href="/restaurant/kitchen">
              <ChefHat className="mr-2 h-4 w-4" />
              Kitchen View
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeOrders}</div>
            <p className="text-xs text-muted-foreground">{stats.totalOrders} total today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Today</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue}</div>
            <p className="text-xs text-muted-foreground">${stats.averageOrderValue.toFixed(2)} avg order</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tables Occupied</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.tablesOccupied}/{stats.totalTables}
            </div>
            <p className="text-xs text-muted-foreground">
              {((stats.tablesOccupied / stats.totalTables) * 100).toFixed(0)}% occupancy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kitchen Queue</CardTitle>
            <ChefHat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.kitchenQueue}</div>
            <p className="text-xs text-muted-foreground">{stats.averageWaitTime} min avg wait</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.customerSatisfaction}/5</div>
            <p className="text-xs text-muted-foreground">Based on reviews</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Active Orders */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Active Orders</CardTitle>
            <CardDescription>Orders currently being processed</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-4">
                {activeOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{order.id}</p>
                          {order.priority === "high" && <AlertTriangle className="h-4 w-4 text-red-500" />}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {order.table} • {order.items} items • ${order.total}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          <Clock className="inline h-3 w-3 mr-1" />
                          {order.time}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getOrderStatusBadge(order.status)}
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/restaurant/orders/${order.id}`}>View</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Popular Items */}
        <Card>
          <CardHeader>
            <CardTitle>Popular Items Today</CardTitle>
            <CardDescription>Best selling menu items</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {popularItems.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-600 text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.orders} orders</p>
                    </div>
                  </div>
                  <p className="text-sm font-medium">${item.revenue}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Table Status */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Table Status</CardTitle>
            <CardDescription>Current status of all restaurant tables</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              {tableStatus.map((table) => (
                <div key={table.number} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Table {table.number}</h3>
                    {getTableStatusBadge(table.status)}
                  </div>
                  {table.guests > 0 && <p className="text-sm text-muted-foreground">{table.guests} guests</p>}
                  {table.server && <p className="text-sm text-muted-foreground">Server: {table.server}</p>}
                  {table.time && (
                    <p className="text-xs text-muted-foreground">
                      <Clock className="inline h-3 w-3 mr-1" />
                      {table.time}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Frequently used restaurant functions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-20 flex-col gap-2" asChild>
              <Link href="/restaurant/orders/new">
                <ShoppingCart className="h-6 w-6" />
                New Order
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" asChild>
              <Link href="/restaurant/menu">
                <Utensils className="h-6 w-6" />
                Manage Menu
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" asChild>
              <Link href="/restaurant/reservations">
                <Calendar className="h-6 w-6" />
                Reservations
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" asChild>
              <Link href="/restaurant/inventory">
                <Package className="h-6 w-6" />
                Check Inventory
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
