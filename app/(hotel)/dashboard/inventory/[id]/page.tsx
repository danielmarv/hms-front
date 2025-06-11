"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
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
import {
  ArrowLeft,
  Edit,
  Trash2,
  Package,
  TrendingUp,
  TrendingDown,
  Calendar,
  MapPin,
  Tag,
  FileText,
} from "lucide-react"
import { useInventory, type InventoryItem, type StockTransaction } from "@/hooks/use-inventory"
import { toast } from "sonner"
import { StockUpdateDialog } from "@/components/inventory/stock-update-dialog"

interface InventoryItemPageProps {
  params: Promise<{
    id: string
  }>
}

export default function InventoryItemPage({ params }: InventoryItemPageProps) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { getInventoryItemById, getItemTransactions, deleteInventoryItem, isLoading } = useInventory()
  const [item, setItem] = useState<InventoryItem | null>(null)
  const [transactions, setTransactions] = useState<StockTransaction[]>([])
  const [showStockDialog, setShowStockDialog] = useState(false)

  const fetchItem = async () => {
    const { data } = await getInventoryItemById(resolvedParams.id)
    if (data) {
      setItem(data)
    }
  }

  const fetchTransactions = async () => {
    const { data } = await getItemTransactions(resolvedParams.id, { limit: 10, sort: "-transaction_date" })
    if (data) {
      setTransactions(data.data)
    }
  }

  useEffect(() => {
    fetchItem()
    fetchTransactions()
  }, [resolvedParams.id])

  const handleDelete = async () => {
    const { error } = await deleteInventoryItem(resolvedParams.id)
    if (error) {
      toast.error(error)
    } else {
      toast.success("Item deleted successfully")
      router.push("/dashboard/inventory")
    }
  }

  const getStockStatusBadge = (item: InventoryItem) => {
    if (item.currentStock <= item.minStockLevel) {
      return <Badge variant="destructive">Low Stock</Badge>
    }
    if (item.currentStock <= item.reorderPoint) {
      return <Badge variant="secondary">Reorder</Badge>
    }
    if (item.currentStock >= item.maxStockLevel) {
      return <Badge variant="outline">Overstocked</Badge>
    }
    return <Badge variant="default">Normal</Badge>
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "restock":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "usage":
      case "waste":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Package className="h-4 w-4 text-blue-600" />
    }
  }

  if (isLoading || !item) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-20" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/inventory")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Inventory
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{item.name}</h1>
            <p className="text-muted-foreground">{item.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowStockDialog(true)}>
            Update Stock
          </Button>
          <Button asChild>
            <Link href={`/dashboard/inventory/${resolvedParams.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the inventory item.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="details" className="w-full">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Category</label>
                      <p className="text-sm">{item.category}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Unit</label>
                      <p className="text-sm">{item.unit}</p>
                    </div>
                    {item.sku && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">SKU</label>
                        <p className="text-sm">{item.sku}</p>
                      </div>
                    )}
                    {item.barcode && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Barcode</label>
                        <p className="text-sm">{item.barcode}</p>
                      </div>
                    )}
                    {item.location && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Location</label>
                        <p className="text-sm flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {item.location}
                        </p>
                      </div>
                    )}
                    {item.expiryDate && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Expiry Date</label>
                        <p className="text-sm flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(item.expiryDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>

                  {item.tags && item.tags.length > 0 && (
                    <div className="mt-4">
                      <label className="text-sm font-medium text-muted-foreground">Tags</label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {item.notes && (
                    <div className="mt-4">
                      <label className="text-sm font-medium text-muted-foreground">Notes</label>
                      <p className="text-sm flex items-start gap-1 mt-1">
                        <FileText className="h-3 w-3 mt-0.5" />
                        {item.notes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Stock Levels */}
              <Card>
                <CardHeader>
                  <CardTitle>Stock Levels</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Minimum Stock</label>
                      <p className="text-sm">
                        {item.minStockLevel} {item.unit}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Maximum Stock</label>
                      <p className="text-sm">
                        {item.maxStockLevel} {item.unit}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Reorder Point</label>
                      <p className="text-sm">
                        {item.reorderPoint} {item.unit}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Reorder Quantity</label>
                      <p className="text-sm">
                        {item.reorderQuantity} {item.unit}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="transactions">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>Latest stock movements for this item</CardDescription>
                </CardHeader>
                <CardContent>
                  {!transactions || transactions.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No transactions found</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Performed By</TableHead>
                          <TableHead>Reason</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactions.map((transaction) => (
                          <TableRow key={transaction._id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getTransactionIcon(transaction.type)}
                                <span className="capitalize">{transaction.type}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className={transaction.type === "restock" ? "text-green-600" : "text-red-600"}>
                                {transaction.type === "restock" ? "+" : "-"}
                                {transaction.quantity}
                              </span>
                            </TableCell>
                            <TableCell>{new Date(transaction.transaction_date).toLocaleDateString()}</TableCell>
                            <TableCell>{transaction.performedBy?.full_name || "Unknown"}</TableCell>
                            <TableCell>{transaction.reason || "-"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Current Stock */}
          <Card>
            <CardHeader>
              <CardTitle>Current Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">
                  {item.currentStock} {item.unit}
                </div>
                {getStockStatusBadge(item)}
                <div className="text-sm text-muted-foreground mt-2">
                  Value: Shs{(item.currentStock * item.unitPrice).toFixed(2)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Unit Price</span>
                  <span className="text-sm font-medium">Shs{item.unitPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Value</span>
                  <span className="text-sm font-medium">Shs{(item.currentStock * item.unitPrice).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Active</span>
                  <Badge variant={item.isActive ? "default" : "secondary"}>{item.isActive ? "Yes" : "No"}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Perishable</span>
                  <Badge variant={item.isPerishable ? "destructive" : "secondary"}>
                    {item.isPerishable ? "Yes" : "No"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Supplier */}
          {item.supplier && (
            <Card>
              <CardHeader>
                <CardTitle>Supplier</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium">{item.supplier.name}</span>
                  </div>
                  {item.supplier.contact_person && (
                    <div>
                      <span className="text-sm text-muted-foreground">Contact: {item.supplier.contact_person}</span>
                    </div>
                  )}
                  {item.supplier.phone && (
                    <div>
                      <span className="text-sm text-muted-foreground">Phone: {item.supplier.phone}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <StockUpdateDialog
        open={showStockDialog}
        onOpenChange={setShowStockDialog}
        item={item}
        onSuccess={() => {
          fetchItem()
          fetchTransactions()
        }}
      />
    </div>
  )
}
