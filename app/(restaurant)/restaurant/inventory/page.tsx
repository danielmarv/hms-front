"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Package, AlertTriangle, TrendingDown } from "lucide-react"
import Link from "next/link"

// Import consistent components
import { PageHeader } from "@/components/ui/page-header"
import { StatsGrid, StatCard } from "@/components/ui/stats-grid"
import { FilterBar } from "@/components/ui/filter-bar"
import { StatusBadge } from "@/components/ui/status-badge"
import { EmptyState } from "@/components/ui/empty-state"
import { LoadingSkeleton } from "@/components/ui/loading-skeleton"
import { Card, CardContent } from "@/components/ui/card"

// Mock data for demonstration
const mockInventoryItems = [
  {
    _id: "1",
    name: "Tomatoes",
    category: "Vegetables",
    currentStock: 25,
    minStock: 10,
    maxStock: 100,
    unit: "kg",
    cost: 3.5,
    supplier: "Fresh Farms",
    lastUpdated: new Date().toISOString(),
    status: "in_stock",
  },
  {
    _id: "2",
    name: "Chicken Breast",
    category: "Meat",
    currentStock: 5,
    minStock: 15,
    maxStock: 50,
    unit: "kg",
    cost: 12.0,
    supplier: "Premium Meats",
    lastUpdated: new Date().toISOString(),
    status: "low_stock",
  },
  {
    _id: "3",
    name: "Olive Oil",
    category: "Oils",
    currentStock: 0,
    minStock: 5,
    maxStock: 20,
    unit: "liters",
    cost: 8.5,
    supplier: "Mediterranean Imports",
    lastUpdated: new Date().toISOString(),
    status: "out_of_stock",
  },
]

export default function RestaurantInventoryPage() {
  const [inventoryItems, setInventoryItems] = useState(mockInventoryItems)
  const [filteredItems, setFilteredItems] = useState(mockInventoryItems)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    filterItems()
  }, [inventoryItems, searchTerm, statusFilter, categoryFilter])

  const filterItems = () => {
    let filtered = inventoryItems

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.supplier.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((item) => item.status === statusFilter)
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((item) => item.category === categoryFilter)
    }

    setFilteredItems(filtered)
  }

  const calculateStats = () => {
    return {
      total: inventoryItems.length,
      inStock: inventoryItems.filter((item) => item.status === "in_stock").length,
      lowStock: inventoryItems.filter((item) => item.status === "low_stock").length,
      outOfStock: inventoryItems.filter((item) => item.status === "out_of_stock").length,
    }
  }

  const getStatusColor = (item: any) => {
    if (item.currentStock === 0) return "out_of_stock"
    if (item.currentStock <= item.minStock) return "low_stock"
    return "in_stock"
  }

  const stats = calculateStats()
  const categories = [...new Set(inventoryItems.map((item) => item.category))]

  if (loading) {
    return <LoadingSkeleton variant="page" />
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <PageHeader
        title="Inventory Management"
        description="Track and manage restaurant inventory items"
        action={
          <Button asChild>
            <Link href="/restaurant/inventory/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Link>
          </Button>
        }
      />

      {/* Stats */}
      <StatsGrid>
        <StatCard title="Total Items" value={stats.total} icon={Package} />
        <StatCard title="In Stock" value={stats.inStock} icon={Package} />
        <StatCard title="Low Stock" value={stats.lowStock} icon={AlertTriangle} />
        <StatCard title="Out of Stock" value={stats.outOfStock} icon={TrendingDown} />
      </StatsGrid>

      {/* Filters */}
      <FilterBar
        searchPlaceholder="Search inventory items..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        filters={[
          {
            placeholder: "Filter by status",
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: "all", label: "All Statuses" },
              { value: "in_stock", label: "In Stock" },
              { value: "low_stock", label: "Low Stock" },
              { value: "out_of_stock", label: "Out of Stock" },
            ],
          },
          {
            placeholder: "Filter by category",
            value: categoryFilter,
            onChange: setCategoryFilter,
            options: [
              { value: "all", label: "All Categories" },
              ...categories.map((cat) => ({ value: cat, label: cat })),
            ],
          },
        ]}
      />

      {/* Inventory Items */}
      {filteredItems.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <Card key={item._id}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{item.name}</h3>
                    <StatusBadge status={getStatusColor(item)} />
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Category:</span>
                      <span className="font-medium">{item.category}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Current Stock:</span>
                      <span className="font-medium">
                        {item.currentStock} {item.unit}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Min Stock:</span>
                      <span className="font-medium">
                        {item.minStock} {item.unit}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Cost per {item.unit}:</span>
                      <span className="font-medium">${item.cost.toFixed(2)}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Supplier:</span>
                      <span className="font-medium">{item.supplier}</span>
                    </div>
                  </div>

                  {/* Stock Level Indicator */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Stock Level</span>
                      <span>{Math.round((item.currentStock / item.maxStock) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          item.currentStock === 0
                            ? "bg-red-500"
                            : item.currentStock <= item.minStock
                              ? "bg-yellow-500"
                              : "bg-green-500"
                        }`}
                        style={{
                          width: `${Math.min((item.currentStock / item.maxStock) * 100, 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent" asChild>
                      <Link href={`/restaurant/inventory/${item._id}`}>View Details</Link>
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent" asChild>
                      <Link href={`/restaurant/inventory/${item._id}/stock`}>Update Stock</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Package}
          title="No inventory items found"
          description={
            searchTerm || statusFilter !== "all" || categoryFilter !== "all"
              ? "No items match your current filters."
              : "Start by adding your first inventory item."
          }
          action={{
            label: "Add Inventory Item",
            href: "/restaurant/inventory/new",
          }}
        />
      )}
    </div>
  )
}
