"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Package, Plus, Search, ArrowUpDown, RefreshCcw, Trash2, Edit, Eye } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useInventory } from "@/hooks/use-inventory"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function InventoryPage() {
  const router = useRouter()
  const { items, loading, error, pagination, totalItems, fetchInventoryItems, deleteInventoryItem } = useInventory()
  console.log(items)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("")
  const [stockStatus, setStockStatus] = useState("")
  const [isActive, setIsActive] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  // Filter states
  // const [search, setSearch] = useState(searchParams.get("search") || "")
  // const [category, setCategory] = useState(searchParams.get("category") || "")
  // const [stockStatus, setStockStatus] = useState(searchParams.get("stockStatus") || "")
  // const [sort, setSort] = useState(searchParams.get("sort") || "name")

  // const loadItems = async () => {
  //   const params: Record<string, any> = {
  //     page: pagination.page,
  //     limit: pagination.limit,
  //     sort
  //   }

  //   if (search) params.search = search
  //   if (category) params.category = category
  //   if (stockStatus) params.stockStatus = stockStatus

  //   const result = await getInventoryItems(params)

  //   if (result && result.data) {
  //     setItems(result.data)
  //     setTotalItems(result.total || 0)
  //     setPagination({
  //       page: result.pagination?.page || 1,
  //       limit: result.pagination?.limit || 10,
  //       totalPages: result.pagination?.totalPages || 1
  //     })
  //   }
  // }

  // const loadLowStockItems = async () => {
  //   const result = await getLowStockItems()
  //   if (result) {
  //     setLowStockItems(result)
  //   }
  // }

  useEffect(() => {
    fetchInventoryItems(currentPage, 10, search, category, "", stockStatus, isActive)
  }, [fetchInventoryItems, currentPage, search, category, stockStatus, isActive])

  // const handleSearch = () => {
  //   setPagination({ ...pagination, page: 1 })
  //   loadItems()
  // }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchInventoryItems(1, 10, search, category, "", stockStatus, isActive)
  }

  // const handleCategoryChange = (value: string) => {
  //   setCategory(value)
  //   setPagination({ ...pagination, page: 1 })
  //   setTimeout(loadItems, 0)
  // }

  const handleDelete = async (id: string) => {
    const success = await deleteInventoryItem(id)
    if (success) {
      fetchInventoryItems(currentPage, 10, search, category, "", stockStatus, isActive)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleCategoryChange = (value: string) => {
    setCategory(value)
    setCurrentPage(1)
    fetchInventoryItems(1, 10, search, value, "", stockStatus, isActive)
  }

  const handleStockStatusChange = (value: string) => {
    setStockStatus(value)
  }

  // const handleStockStatusChange = (value: string) => {
  //   setStockStatus(value)
  //   setPagination({ ...pagination, page: 1 })
  //   setTimeout(loadItems, 0)
  // }

  // const handleSortChange = (value: string) => {
  //   setSort(value)
  //   setPagination({ ...pagination, page: 1 })
  // }

  // const handlePageChange = (page: number) => {
  //   setPagination({ ...pagination, page })
  // }

  const getStockStatusBadge = (item: any) => {
    if (!item.quantity_in_stock || !item.reorder_level) return null

    if (item.quantity_in_stock <= item.reorder_level) {
      return (
        <Badge variant="destructive" className="ml-2">
          Low Stock
        </Badge>
      )
    }

    return null
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Inventory Management</h1>
        <Button asChild>
          <Link href="/dashboard/inventory/new">
            <Plus className="mr-2 h-4 w-4" /> Add Item
          </Link>
        </Button>
      </div>

      {/* {lowStockItems.length > 0 && (
        <Card className="border-amber-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" />
              Low Stock Alert
            </CardTitle>
            <CardDescription>
              {lowStockItems.length} items are below their reorder level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lowStockItems.slice(0, 6).map((item) => (
                <div key={item._id} className="p-3 border rounded-md flex justify-between items-center">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Stock: {item.quantity_in_stock} {item.unit} (Reorder: {item.reorder_level})
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/inventory/${item._id}`}>
                      <Eye className="h-4 w-4 mr-1" /> View
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
            {lowStockItems.length > 6 && (
              <div className="mt-3 text-center">
                <Button variant="link" asChild>
                  <Link href="/dashboard/inventory/low-stock">
                    View all {lowStockItems.length} low stock items
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )} */}

      <Card>
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
          <CardDescription>
            Manage your inventory items, track stock levels, and reorder when necessary.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col md:flex-row gap-4 mb-6" onSubmit={handleSearch}>
            <div className="flex w-full md:w-1/3">
              <Input
                placeholder="Search items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                // onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="mr-2"
              />
              <Button type="submit" variant="secondary">
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-1 gap-4">
              <Select value={category} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={category || "All Categories"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="food">Food</SelectItem>
                  <SelectItem value="beverage">Beverage</SelectItem>
                  <SelectItem value="cleaning">Cleaning</SelectItem>
                  <SelectItem value="linen">Linen</SelectItem>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="furniture">Furniture</SelectItem>
                  <SelectItem value="stationery">Stationery</SelectItem>
                  <SelectItem value="others">Others</SelectItem>
                </SelectContent>
              </Select>

              <Select value={stockStatus} onValueChange={handleStockStatusChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={stockStatus || "Stock Status"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Low">Low Stock</SelectItem>
                  <SelectItem value="Reorder">Reorder</SelectItem>
                  <SelectItem value="Normal">Normal</SelectItem>
                  <SelectItem value="Overstocked">Overstocked</SelectItem>
                </SelectContent>
              </Select>

              {/* <Select value={sort} onValueChange={handleSortChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={sort || "Sort By"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="-name">Name (Z-A)</SelectItem>
                  <SelectItem value="-quantity_in_stock">Stock (High-Low)</SelectItem>
                  <SelectItem value="quantity_in_stock">Stock (Low-High)</SelectItem>
                  <SelectItem value="-price_per_unit">Price (High-Low)</SelectItem>
                  <SelectItem value="price_per_unit">Price (Low-High)</SelectItem>
                </SelectContent>
              </Select> */}
            </div>
          </form>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <TableRow key={i}>
                        {Array(8)
                          .fill(0)
                          .map((_, j) => (
                            <TableCell key={j}>
                              <Skeleton className="h-6 w-full" />
                            </TableCell>
                          ))}
                      </TableRow>
                    ))
                ) : items && items.length > 0 ? (
                  items.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell className="font-medium">
                        {item.name}
                        {getStockStatusBadge(item)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.category}</Badge>
                      </TableCell>
                      <TableCell>{item.sku}</TableCell>
                      <TableCell>{item.quantity_in_stock}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell>${item.price_per_unit?.toFixed(2)}</TableCell>
                      <TableCell>${item.total_value?.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <span className="sr-only">Open menu</span>
                              <ArrowUpDown className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/inventory/${item._id}`}>
                                <Eye className="mr-2 h-4 w-4" /> View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/inventory/${item._id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" /> Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/inventory/${item._id}/stock`}>
                                <RefreshCcw className="mr-2 h-4 w-4" /> Update Stock
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/inventory/${item._id}/transfer`}>
                                <Package className="mr-2 h-4 w-4" /> Transfer
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <AlertDialog>
                                <AlertDialogTrigger>
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will permanently delete this item from our
                                      servers.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(item._id)}>Delete</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      {loading ? "Loading..." : "No inventory items found."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {pagination?.totalPages > 1 && (
            <div className="mt-4 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>

                  {Array.from({ length: pagination?.totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      // Show first page, last page, and pages around current page
                      return (
                        page === 1 ||
                        page === pagination?.totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      )
                    })
                    .map((page, i, array) => {
                      // Add ellipsis where needed
                      if (i > 0 && array[i - 1] !== page - 1) {
                        return (
                          <PaginationItem key={`ellipsis-${page}`}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        )
                      }

                      return (
                        <PaginationItem key={page}>
                          <PaginationLink isActive={page === currentPage} onClick={() => handlePageChange(page)}>
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    })}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(Math.min(pagination?.totalPages, currentPage + 1))}
                      className={currentPage >= pagination?.totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}

          <div className="mt-4 text-sm text-muted-foreground text-center">
            Showing {items?.length} of {totalItems} items
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
