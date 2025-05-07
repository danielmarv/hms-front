"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import {
  ArrowLeft,
  Edit,
  RefreshCcw,
  Calendar,
  User,
  Building,
  Package,
  TrendingUp,
  TrendingDown,
  History,
  ArrowRightLeft,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { useInventory } from "@/hooks/use-inventory"
import { useSuppliers } from "@/hooks/use-suppliers"

export default function InventoryItemPage() {
  const params = useParams()
  const router = useRouter()
  const { getInventoryItemById, getItemTransactions } = useInventory()
  const { getSupplierById } = useSuppliers()

  const [item, setItem] = useState<any>(null)
  const [supplier, setSupplier] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [transactionsLoading, setTransactionsLoading] = useState(false)

  useEffect(() => {
    const loadItem = async () => {
      setIsLoading(true)
      try {
        const response = await getInventoryItemById(params.id as string)
        if (response.data) {
          setItem(response.data)

          // Load supplier details if available
          if (response.data.supplier) {
            let supplierId = response.data.supplier
            if (typeof supplierId === "object" && supplierId._id) {
              supplierId = supplierId._id
            }

            const supplierResponse = await getSupplierById(supplierId)
            if (supplierResponse.data) {
              setSupplier(supplierResponse.data)
            }
          }
        } else {
          toast.error("Failed to load inventory item")
        }
      } catch (error) {
        console.error("Error loading item:", error)
        toast.error("An error occurred while loading the inventory item")
      } finally {
        setIsLoading(false)
      }
    }

    loadItem()
  }, [params.id, getInventoryItemById, getSupplierById])

  const loadTransactions = async () => {
    setTransactionsLoading(true)
    try {
      const response = await getItemTransactions(params.id as string, { limit: 5 })
      if (response.data) {
        setTransactions(response.data.data)
      } else {
        toast.error("Failed to load transactions")
      }
    } catch (error) {
      console.error("Error loading transactions:", error)
      toast.error("An error occurred while loading transactions")
    } finally {
      setTransactionsLoading(false)
    }
  }

  useEffect(() => {
    if (item) {
      loadTransactions()
    }
  }, [item])

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array(6)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="h-6 w-full" />
                ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array(6)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="h-6 w-full" />
                ))}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="p-6">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Failed to load inventory item</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={() => router.back()}>
              Go Back
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  const getStockStatusBadge = () => {
    if (!item.stockStatus) {
      if (item.currentStock <= item.minStockLevel) {
        return <Badge variant="destructive">Low Stock</Badge>
      } else if (item.currentStock >= item.maxStockLevel) {
        return <Badge variant="warning">Overstocked</Badge>
      } else if (item.currentStock <= item.reorderPoint) {
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            Reorder Soon
          </Badge>
        )
      } else {
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
            In Stock
          </Badge>
        )
      }
    } else {
      switch (item.stockStatus) {
        case "Low":
          return <Badge variant="destructive">Low Stock</Badge>
        case "Overstocked":
          return <Badge variant="warning">Overstocked</Badge>
        case "Reorder":
          return (
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
              Reorder Soon
            </Badge>
          )
        case "Normal":
          return (
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
              In Stock
            </Badge>
          )
        default:
          return <Badge variant="outline">Unknown</Badge>
      }
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    return format(new Date(dateString), "PPP")
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "restock":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "use":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      case "transfer":
        return <ArrowRightLeft className="h-4 w-4 text-blue-500" />
      case "adjustment":
        return <History className="h-4 w-4 text-amber-500" />
      case "waste":
        return <TrendingDown className="h-4 w-4 text-red-700" />
      default:
        return <History className="h-4 w-4" />
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">{item.name}</h1>
        {getStockStatusBadge()}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Item Details</CardTitle>
            <CardDescription>Detailed information about this inventory item</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Category</h3>
                <p className="text-sm">{item.category}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">SKU</h3>
                <p className="text-sm">{item.sku || "N/A"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Barcode</h3>
                <p className="text-sm">{item.barcode || "N/A"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Location</h3>
                <p className="text-sm">{item.location || "N/A"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                <p className="text-sm">{item.isActive ? "Active" : "Inactive"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Perishable</h3>
                <p className="text-sm">{item.isPerishable ? "Yes" : "No"}</p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Current Stock</h3>
                <p className="text-lg font-semibold">
                  {item.currentStock} {item.unit}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Reorder Point</h3>
                <p className="text-lg font-semibold">
                  {item.reorderPoint} {item.unit}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Price per Unit</h3>
                <p className="text-lg font-semibold">${item.unitPrice?.toFixed(2)}</p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Min Stock Level</h3>
                <p className="text-lg font-semibold">
                  {item.minStockLevel} {item.unit}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Max Stock Level</h3>
                <p className="text-lg font-semibold">
                  {item.maxStockLevel} {item.unit}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Reorder Quantity</h3>
                <p className="text-lg font-semibold">
                  {item.reorderQuantity} {item.unit}
                </p>
              </div>
            </div>

            {item.description && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                  <p className="text-sm mt-1">{item.description}</p>
                </div>
              </>
            )}

            {item.expiryDate && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Expiry Date</h3>
                  <p className="text-sm mt-1">{formatDate(item.expiryDate)}</p>
                </div>
              </>
            )}

            {supplier && (
              <>
                <Separator />

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Supplier</h3>
                  <div className="bg-muted p-3 rounded-md">
                    <p className="font-medium">{supplier.name}</p>
                    {supplier.contact_person && (
                      <p className="text-sm flex items-center gap-1">
                        <User className="h-3 w-3" /> {supplier.contact_person}
                      </p>
                    )}
                    {supplier.phone && <p className="text-sm">{supplier.phone}</p>}
                    {supplier.email && <p className="text-sm">{supplier.email}</p>}
                  </div>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href={`/dashboard/inventory/${item._id}/edit`}>
                <Edit className="mr-2 h-4 w-4" /> Edit Item
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/dashboard/inventory/${item._id}/stock`}>
                <RefreshCcw className="mr-2 h-4 w-4" /> Update Stock
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Last 5 stock transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {transactionsLoading ? (
              <div className="space-y-2">
                {Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
              </div>
            ) : transactions.length > 0 ? (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div key={transaction._id} className="border rounded-md p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        {getTransactionIcon(transaction.type)}
                        <Badge
                          variant={
                            transaction.type === "restock"
                              ? "default"
                              : transaction.type === "use"
                                ? "destructive"
                                : transaction.type === "waste"
                                  ? "destructive"
                                  : transaction.type === "transfer"
                                    ? "outline"
                                    : "secondary"
                          }
                          className="ml-2"
                        >
                          {transaction.type}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium">
                        {transaction.type === "restock" ? "+" : "-"}
                        {transaction.quantity} {item.unit}
                      </p>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(transaction.transaction_date)}
                      </div>
                      {transaction.department && (
                        <div className="flex items-center gap-1 mt-1">
                          <Building className="h-3 w-3" />
                          {transaction.department}
                        </div>
                      )}
                      {transaction.reason && <div className="mt-1">{transaction.reason}</div>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">No transactions found</p>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href={`/dashboard/inventory/${item._id}/transactions`}>View All Transactions</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="flex gap-2 mt-4">
        <Button variant="outline" asChild>
          <Link href={`/dashboard/inventory/${item._id}/transfer`}>
            <ArrowRightLeft className="mr-2 h-4 w-4" /> Transfer Stock
          </Link>
        </Button>
        {item.currentStock <= item.reorderPoint && (
          <Button asChild>
            <Link href={`/dashboard/inventory/${item._id}/stock`}>
              <Package className="mr-2 h-4 w-4" /> Restock Now
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}
