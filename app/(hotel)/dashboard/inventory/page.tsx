"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Search, Package, DollarSign, AlertTriangle, RotateCcw, Eye, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useInventory, type InventoryItem } from "@/hooks/use-inventory"
import { useToast } from "@/hooks/use-toast"

const CATEGORIES = [
  "Food & Beverage",
  "Housekeeping",
  "Maintenance",
  "Office Supplies",
  "Amenities",
  "Linens",
  "Cleaning Supplies",
  "Other",
]

const STOCK_STATUS_OPTIONS = [
  { value: "all", label: "All Items" },
  { value: "in-stock", label: "In Stock" },
  { value: "low-stock", label: "Low Stock" },
  { value: "out-of-stock", label: "Out of Stock" },
  { value: "reorder", label: "Needs Reorder" },
]

const SORT_OPTIONS = [
  { value: "name", label: "Name" },
  { value: "category", label: "Category" },
  { value: "currentStock", label: "Stock Level" },
  { value: "unitPrice", label: "Unit Price" },
  { value: "createdAt", label: "Date Added" },
]

export default function InventoryPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { fetchInventoryItems, fetchInventoryStats, deleteInventoryItem, loading: isLoading } = useInventory()

  const [items, setItems] = useState<InventoryItem[]>([])
  const [stats, setStats] = useState({
    totalItems: 0,
    totalValue: 0,
    lowStockItems: 0,
    reorderItems: 0,
  })
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 10,
  })

  const [filters, setFilters] = useState({
    search: "",
    category: "",
    stockStatus: "",
    sortBy: "name",
    sortOrder: "asc",
    page: 1,
    limit: 10,
  })

  // Fetch items function
  const fetchItems = async () => {
    try {
      const response = await fetchInventoryItems(
        filters.page,
        filters.limit,
        filters.search,
        filters.category,
        "", // supplier
        filters.stockStatus,
        "", // isActive
      )

      if (response && response.data) {
        // Handle different possible response structures
        const responseData = response.data

        if (Array.isArray(responseData)) {
          // If response.data is directly an array
          setItems(responseData)
          setPagination((prev) => ({ ...prev, total: responseData.length }))
        } else if (responseData.data && Array.isArray(responseData.data)) {
          // If response.data has a nested data property
          setItems(responseData.data)
          setPagination(responseData.pagination || pagination)
        } else {
          setItems([])
        }
      } else if (response && response.error) {
        toast({
          title: "Error",
          description: `Failed to fetch inventory items: ${response.error}`,
          variant: "destructive",
        })
        setItems([])
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching items",
        variant: "destructive",
      })
      setItems([])
    }
  }

  // Fetch stats function
  const fetchStats = async () => {
    try {
      const response = await fetchInventoryStats()

      if (response && response.data) {
        const statsData = response.data
        setStats({
          totalItems: statsData.totalItems || 0,
          totalValue: statsData.totalValue || 0,
          lowStockItems: statsData.stockStatus?.find((s: any) => s._id === "Low")?.count || 0,
          reorderItems: statsData.stockStatus?.find((s: any) => s._id === "Reorder")?.count || 0,
        })
      }
    } catch (error) {
      // Silent fail for stats
    }
  }

  // Fetch data on component mount and filter changes
  useEffect(() => {
    fetchItems()
    fetchStats()
  }, [filters])

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      try {
        const response = await deleteInventoryItem(id)
        if (response && response.error) {
          toast({
            title: "Error",
            description: "Failed to delete item",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Success",
            description: "Item deleted successfully",
          })
          // Refresh data after deletion
          fetchItems()
          fetchStats()
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "An unexpected error occurred while deleting the item",
          variant: "destructive",
        })
      }
    }
  }

  const getStockStatus = (item: InventoryItem) => {
    if (item.currentStock === 0) return { label: "Out of Stock", variant: "destructive" as const }
    if (item.currentStock <= item.reorderPoint) return { label: "Reorder", variant: "destructive" as const }
    if (item.currentStock <= item.minStockLevel) return { label: "Low Stock", variant: "secondary" as const }
    return { label: "In Stock", variant: "default" as const }
  }

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === "all" ? "" : value,
      page: key === "page" ? value : 1,
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 dark:border-slate-700/20">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Inventory Management
            </h1>
            <p className="text-slate-600 dark:text-slate-300 mt-2 text-lg">
              Manage your hotel inventory items and stock levels
            </p>
          </div>
          <Button
            onClick={() => router.push("/dashboard/inventory/new")}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 dark:from-emerald-600 dark:to-teal-700 dark:hover:from-emerald-700 dark:hover:to-teal-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            size="lg"
          >
            <Plus className="mr-2 h-5 w-5" />
            Add Item
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-100 dark:text-blue-50">Total Items</CardTitle>
              <Package className="h-6 w-6 text-blue-200 dark:text-blue-100" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalItems}</div>
              <p className="text-blue-100 dark:text-blue-50 text-sm mt-1">Active inventory items</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-100 dark:text-emerald-50">Total Value</CardTitle>
              <DollarSign className="h-6 w-6 text-emerald-200 dark:text-emerald-100" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">Shs{stats.totalValue.toLocaleString()}</div>
              <p className="text-emerald-100 dark:text-emerald-50 text-sm mt-1">Current inventory value</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-100 dark:text-orange-50">Low Stock Items</CardTitle>
              <AlertTriangle className="h-6 w-6 text-orange-200 dark:text-orange-100" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.lowStockItems}</div>
              <p className="text-orange-100 dark:text-orange-50 text-sm mt-1">Items needing attention</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-100 dark:text-red-50">Reorder Items</CardTitle>
              <RotateCcw className="h-6 w-6 text-red-200 dark:text-red-100" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.reorderItems}</div>
              <p className="text-red-100 dark:text-red-50 text-sm mt-1">Items to reorder</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-600 dark:from-purple-600 dark:to-indigo-700 text-white rounded-t-lg">
            <CardTitle className="text-xl">Filters & Search</CardTitle>
            <CardDescription className="text-purple-100 dark:text-purple-50">
              Filter and search inventory items
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
                <Input
                  placeholder="Search items..."
                  value={filters.search || ""}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="pl-10 border-2 border-slate-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>
              <Select
                value={filters.category || "all"}
                onValueChange={(value) => handleFilterChange("category", value)}
              >
                <SelectTrigger className="border-2 border-slate-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600">
                  <SelectItem value="all">All Categories</SelectItem>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category} className="text-slate-900 dark:text-slate-100">
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={filters.stockStatus || "all"}
                onValueChange={(value) => handleFilterChange("stockStatus", value)}
              >
                <SelectTrigger className="border-2 border-slate-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100">
                  <SelectValue placeholder="Stock Status" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600">
                  {STOCK_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-slate-900 dark:text-slate-100">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filters.sortBy || "name"} onValueChange={(value) => handleFilterChange("sortBy", value)}>
                <SelectTrigger className="border-2 border-slate-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600">
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-slate-900 dark:text-slate-100">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={filters.sortOrder || "asc"}
                onValueChange={(value) => handleFilterChange("sortOrder", value)}
              >
                <SelectTrigger className="border-2 border-slate-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100">
                  <SelectValue placeholder="Order" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600">
                  <SelectItem value="asc" className="text-slate-900 dark:text-slate-100">
                    Ascending
                  </SelectItem>
                  <SelectItem value="desc" className="text-slate-900 dark:text-slate-100">
                    Descending
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Items Table */}
        <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-slate-700 to-slate-800 dark:from-slate-800 dark:to-slate-900 text-white rounded-t-lg">
            <CardTitle className="text-xl">Inventory Items</CardTitle>
            <CardDescription className="text-slate-200 dark:text-slate-300">
              {pagination.total} total items • Page {pagination.page} of {pagination.totalPages}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 dark:border-blue-400 border-t-transparent"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600">
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-200">Name</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-200">SKU</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-200">Category</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-200">Current Stock</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-200">Unit Price</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-200">Status</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-200">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12">
                          <div className="flex flex-col items-center gap-4">
                            <div className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-full p-6">
                              <Package className="h-12 w-12 text-slate-400 dark:text-slate-500" />
                            </div>
                            <div>
                              <p className="text-slate-600 dark:text-slate-300 text-lg font-medium">
                                No inventory items found
                              </p>
                              <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
                                Get started by adding your first item
                              </p>
                            </div>
                            <Button
                              onClick={() => router.push("/dashboard/inventory/new")}
                              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 dark:from-blue-600 dark:to-indigo-700 dark:hover:from-blue-700 dark:hover:to-indigo-800"
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Add your first item
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      items.map((item, index) => {
                        const status = getStockStatus(item)
                        return (
                          <TableRow
                            key={item._id}
                            className={`hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${
                              index % 2 === 0 ? "bg-white dark:bg-slate-800" : "bg-slate-25 dark:bg-slate-750"
                            }`}
                          >
                            <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                              {item.name}
                            </TableCell>
                            <TableCell className="text-slate-600 dark:text-slate-400">{item.sku || "-"}</TableCell>
                            <TableCell>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                                {item.category}
                              </span>
                            </TableCell>
                            <TableCell className="font-medium">
                              <span
                                className={`${
                                  item.currentStock <= item.minStockLevel
                                    ? "text-red-600 dark:text-red-400"
                                    : item.currentStock <= item.reorderPoint
                                      ? "text-orange-600 dark:text-orange-400"
                                      : "text-green-600 dark:text-green-400"
                                }`}
                              >
                                {item.currentStock} {item.unit}
                              </span>
                            </TableCell>
                            <TableCell className="font-medium text-green-600 dark:text-green-400">
                              Shs{item.unitPrice.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={status.variant}
                                className={`${
                                  status.variant === "destructive"
                                    ? "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800"
                                    : status.variant === "secondary"
                                      ? "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 hover:bg-orange-200 dark:hover:bg-orange-800"
                                      : "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800"
                                }`}
                              >
                                {status.label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => router.push(`/dashboard/inventory/${item._id}`)}
                                  className="border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 hover:border-blue-300 dark:hover:border-blue-600"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => router.push(`/dashboard/inventory/${item._id}/edit`)}
                                  className="border-emerald-200 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900 hover:border-emerald-300 dark:hover:border-emerald-600"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDelete(item._id)}
                                  className="border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 hover:border-red-300 dark:hover:border-red-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-700 border-t border-slate-200 dark:border-slate-600">
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Showing page {pagination.page} of {pagination.totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page <= 1}
                    onClick={() => handleFilterChange("page", pagination.page - 1)}
                    className="border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => handleFilterChange("page", pagination.page + 1)}
                    className="border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
