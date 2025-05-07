"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRestaurantOrders, type Order, type OrderFilters } from "@/hooks/use-restaurant-orders"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Pagination } from "@/components/ui/pagination"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { PlusCircle, Search, ChevronLeft, ChevronRight, User, MapPin } from "lucide-react"
import Link from "next/link"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { format } from "date-fns"

const ORDER_STATUS_COLORS: Record<string, string> = {
  New: "bg-blue-100 text-blue-800",
  Preparing: "bg-yellow-100 text-yellow-800",
  Ready: "bg-green-100 text-green-800",
  Served: "bg-purple-100 text-purple-800",
  Completed: "bg-green-100 text-green-800",
  Cancelled: "bg-red-100 text-red-800",
}

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-800",
  Paid: "bg-green-100 text-green-800",
  Refunded: "bg-blue-100 text-blue-800",
  Failed: "bg-red-100 text-red-800",
}

export default function OrdersPage() {
  const { getOrders, updateOrderStatus, updatePaymentStatus, loading } = useRestaurantOrders()
  const [orders, setOrders] = useState<Order[]>([])
  const [totalOrders, setTotalOrders] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})
  const [filters, setFilters] = useState<OrderFilters>({
    page: 1,
    limit: 10,
    sort: "-orderedAt",
  })

  useEffect(() => {
    fetchOrders()
  }, [filters])

  const fetchOrders = async () => {
    const result = await getOrders(filters)
    if (result) {
      setOrders(result.data)
      setTotalOrders(result.total)
      setTotalPages(result.pagination.totalPages)
      setCurrentPage(result.pagination.page)
    }
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setFilters((prev) => ({
      ...prev,
      orderStatus: value === "all" ? undefined : value,
      page: 1,
    }))
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // For simplicity, we're just searching by order number
    setFilters((prev) => ({
      ...prev,
      search: searchQuery,
      page: 1,
    }))
  }

  const handleDateRangeChange = (range: { from?: Date; to?: Date }) => {
    setDateRange(range)
    setFilters((prev) => ({
      ...prev,
      startDate: range.from ? format(range.from, "yyyy-MM-dd") : undefined,
      endDate: range.to ? format(range.to, "yyyy-MM-dd") : undefined,
      page: 1,
    }))
  }

  const handleOrderTypeChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      orderType: value === "all" ? undefined : value,
      page: 1,
    }))
  }

  const handlePaymentStatusChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      paymentStatus: value === "all" ? undefined : value,
      page: 1,
    }))
  }

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({
      ...prev,
      page,
    }))
  }

  const handleUpdateOrderStatus = async (id: string, status: string) => {
    const result = await updateOrderStatus(id, status)
    if (result) {
      fetchOrders()
    }
  }

  const handleUpdatePaymentStatus = async (id: string, status: string) => {
    const result = await updatePaymentStatus(id, status)
    if (result) {
      fetchOrders()
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Order Management</h1>
          <p className="text-muted-foreground">Manage customer orders and track status</p>
        </div>
        <Link href="/dashboard/orders/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Order
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange} className="mb-6">
        <TabsList className="grid grid-cols-6 w-full max-w-3xl">
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="New">New</TabsTrigger>
          <TabsTrigger value="Preparing">Preparing</TabsTrigger>
          <TabsTrigger value="Ready">Ready</TabsTrigger>
          <TabsTrigger value="Served">Served</TabsTrigger>
          <TabsTrigger value="Completed">Completed</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2">
          <Input
            type="search"
            placeholder="Search order number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button type="submit">
            <Search className="h-4 w-4" />
          </Button>
        </form>

        <div className="flex flex-1 gap-2 flex-wrap">
          <DateRangePicker value={dateRange} onChange={handleDateRangeChange} />

          <Select defaultValue="all" onValueChange={handleOrderTypeChange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Order Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Dine In">Dine In</SelectItem>
              <SelectItem value="Takeaway">Takeaway</SelectItem>
              <SelectItem value="Delivery">Delivery</SelectItem>
              <SelectItem value="Room Service">Room Service</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="all" onValueChange={handlePaymentStatusChange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Payment Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payments</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Refunded">Refunded</SelectItem>
              <SelectItem value="Failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-6 w-1/4" />
                  <Skeleton className="h-4 w-1/3" />
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-10 w-28" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      ) : orders.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="mb-4 flex justify-center">
            <Search className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No orders found</h3>
          <p className="text-muted-foreground mt-2">
            Try adjusting your search or filters to find what you're looking for.
          </p>
          <Button
            className="mt-4"
            onClick={() =>
              setFilters({
                page: 1,
                limit: 10,
                sort: "-orderedAt",
              })
            }
          >
            Reset Filters
          </Button>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order._id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Order #{order.orderNumber}</CardTitle>
                      <CardDescription>{new Date(order.orderedAt).toLocaleString()}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={ORDER_STATUS_COLORS[order.orderStatus] || "bg-gray-100"}>
                        {order.orderStatus}
                      </Badge>
                      <Badge className={PAYMENT_STATUS_COLORS[order.paymentStatus] || "bg-gray-100"}>
                        {order.paymentStatus}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium">Order Type</p>
                      <p className="text-sm text-muted-foreground flex items-center mt-1">
                        {order.orderType === "Delivery" ? (
                          <MapPin className="mr-1 h-4 w-4" />
                        ) : order.orderType === "Room Service" ? (
                          <User className="mr-1 h-4 w-4" />
                        ) : (
                          <MapPin className="mr-1 h-4 w-4" />
                        )}
                        {order.orderType}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Items</p>
                      <p className="text-sm text-muted-foreground mt-1">{order.items.length} items</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Total</p>
                      <p className="text-sm font-bold text-green-600 mt-1">${order.totalAmount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Customer</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {order.customerName || order.guest?.full_name || "Walk-in Customer"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/dashboard/orders/${order._id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            Update Status
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Update Order Status</DialogTitle>
                            <DialogDescription>Change the status for order #{order.orderNumber}</DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-2">
                              <Button
                                variant={order.orderStatus === "New" ? "default" : "outline"}
                                onClick={() => handleUpdateOrderStatus(order._id, "New")}
                              >
                                New
                              </Button>
                              <Button
                                variant={order.orderStatus === "Preparing" ? "default" : "outline"}
                                onClick={() => handleUpdateOrderStatus(order._id, "Preparing")}
                              >
                                Preparing
                              </Button>
                              <Button
                                variant={order.orderStatus === "Ready" ? "default" : "outline"}
                                onClick={() => handleUpdateOrderStatus(order._id, "Ready")}
                              >
                                Ready
                              </Button>
                              <Button
                                variant={order.orderStatus === "Served" ? "default" : "outline"}
                                onClick={() => handleUpdateOrderStatus(order._id, "Served")}
                              >
                                Served
                              </Button>
                              <Button
                                variant={order.orderStatus === "Completed" ? "default" : "outline"}
                                onClick={() => handleUpdateOrderStatus(order._id, "Completed")}
                              >
                                Completed
                              </Button>
                              <Button
                                variant={order.orderStatus === "Cancelled" ? "destructive" : "outline"}
                                onClick={() => handleUpdateOrderStatus(order._id, "Cancelled")}
                              >
                                Cancelled
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            Payment
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Update Payment Status</DialogTitle>
                            <DialogDescription>
                              Change the payment status for order #{order.orderNumber}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-2">
                              <Button
                                variant={order.paymentStatus === "Pending" ? "default" : "outline"}
                                onClick={() => handleUpdatePaymentStatus(order._id, "Pending")}
                              >
                                Pending
                              </Button>
                              <Button
                                variant={order.paymentStatus === "Paid" ? "default" : "outline"}
                                onClick={() => handleUpdatePaymentStatus(order._id, "Paid")}
                              >
                                Paid
                              </Button>
                              <Button
                                variant={order.paymentStatus === "Refunded" ? "default" : "outline"}
                                onClick={() => handleUpdatePaymentStatus(order._id, "Refunded")}
                              >
                                Refunded
                              </Button>
                              <Button
                                variant={order.paymentStatus === "Failed" ? "destructive" : "outline"}
                                onClick={() => handleUpdatePaymentStatus(order._id, "Failed")}
                              >
                                Failed
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <Pagination>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center mx-4">
                  Page {currentPage} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  )
}
