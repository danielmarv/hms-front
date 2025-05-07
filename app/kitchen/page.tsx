"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useKitchenOrders, type KitchenOrderFilters } from "@/hooks/use-kitchen-orders"
import { KitchenOrderCard } from "@/components/kitchen/kitchen-order-card"
import { KitchenOrderFilter } from "@/components/kitchen/kitchen-order-filter"
import { KitchenStats } from "@/components/kitchen/kitchen-stats"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, RefreshCw, ChefHat } from "lucide-react"
import { KITCHEN_ORDER_STATUS } from "@/config/constants"

export default function KitchenDashboard() {
  const router = useRouter()
  const { getKitchenOrders, loading } = useKitchenOrders()
  const [orders, setOrders] = useState<any[]>([])
  const [filters, setFilters] = useState<Record<string, any>>({})
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState("pending")

  const fetchOrders = async () => {
    // Combine filters with active tab filter
    const queryParams: KitchenOrderFilters = { ...filters }

    // Add tab-specific status filter
    if (activeTab === "pending") {
      queryParams.status = KITCHEN_ORDER_STATUS.PENDING
    } else if (activeTab === "in-progress") {
      queryParams.status = KITCHEN_ORDER_STATUS.COOKING
    } else if (activeTab === "ready") {
      queryParams.status = KITCHEN_ORDER_STATUS.READY
    }

    try {
      const response = await getKitchenOrders(queryParams)
      if (response.data) {
        setOrders(response.data)
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [filters, activeTab])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchOrders()
    setIsRefreshing(false)
  }

  const handleFilterChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters)
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kitchen Dashboard</h1>
          <p className="text-muted-foreground">Manage kitchen orders and operations</p>
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing || loading}>
            {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Refresh
          </Button>
          <Button size="sm" onClick={() => router.push("/kitchen/chefs")}>
            <ChefHat className="h-4 w-4 mr-2" />
            Manage Chefs
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <KitchenOrderFilter onFilterChange={handleFilterChange} />

          <Tabs defaultValue="pending" className="mt-6" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="in-progress">In Progress</TabsTrigger>
              <TabsTrigger value="ready">Ready</TabsTrigger>
              <TabsTrigger value="all">All Orders</TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-4">
              <OrdersList
                orders={orders}
                isLoading={loading}
                onStatusChange={fetchOrders}
                emptyMessage="No pending orders"
              />
            </TabsContent>

            <TabsContent value="in-progress" className="mt-4">
              <OrdersList
                orders={orders}
                isLoading={loading}
                onStatusChange={fetchOrders}
                emptyMessage="No orders in progress"
              />
            </TabsContent>

            <TabsContent value="ready" className="mt-4">
              <OrdersList
                orders={orders}
                isLoading={loading}
                onStatusChange={fetchOrders}
                emptyMessage="No orders ready for pickup"
              />
            </TabsContent>

            <TabsContent value="all" className="mt-4">
              <OrdersList
                orders={orders}
                isLoading={loading}
                onStatusChange={fetchOrders}
                emptyMessage="No orders found"
              />
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <KitchenStats />
        </div>
      </div>
    </div>
  )
}

interface OrdersListProps {
  orders: any[]
  isLoading: boolean
  onStatusChange: () => void
  emptyMessage: string
}

function OrdersList({ orders, isLoading, onStatusChange, emptyMessage }: OrdersListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/20">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {orders.map((order) => (
        <KitchenOrderCard key={order._id} order={order} onStatusChange={onStatusChange} />
      ))}
    </div>
  )
}
