"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useInventory } from "@/hooks/use-inventory"
import { useSuppliers } from "@/hooks/use-suppliers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { ArrowLeft, Edit, Package, Loader2, AlertTriangle, History, TrendingUp, TrendingDown } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

export default function InventoryItemPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const { getInventoryItemById, getItemTransactions } = useInventory()
  const { getSupplierById } = useSuppliers()

  const [item, setItem] = useState<any>(null)
  const [supplier, setSupplier] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [transactionsLoading, setTransactionsLoading] = useState<boolean>(false)

  useEffect(() => {
    const fetchItem = async () => {
      setIsLoading(true)
      try {
        const response = await getInventoryItemById(id)
        if (response.data) {
          setItem(response.data)

          // If the item has a supplier, fetch the supplier details
          if (response.data.supplier) {
            const supplierResponse = await getSupplierById(response.data.supplier)
            if (supplierResponse.data) {
              setSupplier(supplierResponse.data)
            }
          }
        } else {
          toast.error("Failed to load inventory item")
        }
      } catch (error) {
        toast.error("An error occurred while fetching the inventory item")
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchItem()
    }
  }, [id, getInventoryItemById, getSupplierById])

  const loadTransactions = async () => {
    setTransactionsLoading(true)
    try {
      const response = await getItemTransactions(id)
      if (response.data) {
        setTransactions(response.data.transactions)
      } else {
        toast.error("Failed to load transactions")
      }
    } catch (error) {
      toast.error("An error occurred while fetching transactions")
    } finally {
      setTransactionsLoading(false)
    }
  }

  const getStockStatusBadge = () => {
    if (!item) return null

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
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "IN":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "OUT":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      case "TRANSFER":
        return <ArrowLeft className="h-4 w-4 text-blue-500" />
      case "ADJUSTMENT":
        return <History className="h-4 w-4 text-amber-500" />
      default:
        return <History className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!item) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="pt-6">
            <p>Inventory item not found</p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/inventory">Back to Inventory</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="mb-4 flex justify-between items-center">
        <Button variant="outline" asChild>
          <Link href="/dashboard/inventory">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Inventory
          </Link>
        </Button>
        <Button asChild>
          <Link href={`/dashboard/inventory/${id}/edit`}>
            <Edit className="mr-2 h-4 w-4" /> Edit Item
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center">
                  <Package className="mr-2 h-5 w-5" /> {item.name}
                </CardTitle>
                <CardDescription>SKU: {item.sku}</CardDescription>
              </div>
              {getStockStatusBadge()}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-1">Description</h3>
                <p>{item.description || "No description provided"}</p>

                <h3 className="font-medium text-sm text-muted-foreground mt-4 mb-1">Category</h3>
                <p>{item.category}</p>

                <h3 className="font-medium text-sm text-muted-foreground mt-4 mb-1">Location</h3>
                <p>{item.location || "Not specified"}</p>

                <h3 className="font-medium text-sm text-muted-foreground mt-4 mb-1">Department</h3>
                <p>{item.department || "Not assigned"}</p>
              </div>

              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-1">Unit Price</h3>
                <p>${item.unitPrice.toFixed(2)}</p>

                <h3 className="font-medium text-sm text-muted-foreground mt-4 mb-1">Unit Cost</h3>
                <p>${item.unitCost.toFixed(2)}</p>

                <h3 className="font-medium text-sm text-muted-foreground mt-4 mb-1">Last Restock Date</h3>
                <p>{item.lastRestockDate ? format(new Date(item.lastRestockDate), "PPP") : "Not available"}</p>

                <h3 className="font-medium text-sm text-muted-foreground mt-4 mb-1">Expiry Date</h3>
                <p>{item.expiryDate ? format(new Date(item.expiryDate), "PPP") : "Not applicable"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stock Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-1">Current Stock</h3>
                <p className="text-2xl font-bold">{item.currentStock}</p>
              </div>

              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-1">Min Stock Level</h3>
                <p>{item.minStockLevel}</p>
              </div>

              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-1">Max Stock Level</h3>
                <p>{item.maxStockLevel}</p>
              </div>

              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-1">Reorder Point</h3>
                <p>{item.reorderPoint}</p>
              </div>

              <div className="pt-4 flex flex-col gap-2">
                <Button asChild>
                  <Link href={`/dashboard/inventory/${id}/stock`}>Update Stock</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href={`/dashboard/inventory/${id}/transfer`}>Transfer Stock</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions" className="w-full">
        <TabsList>
          <TabsTrigger value="transactions" onClick={loadTransactions}>
            Transaction History
          </TabsTrigger>
          <TabsTrigger value="supplier">Supplier Information</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : transactions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead>Created By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <div className="flex items-center">
                            {getTransactionIcon(transaction.type)}
                            <span className="ml-2">{transaction.type}</span>
                          </div>
                        </TableCell>
                        <TableCell>{transaction.quantity}</TableCell>
                        <TableCell>{format(new Date(transaction.createdAt), "PPP")}</TableCell>
                        <TableCell>{transaction.notes || "-"}</TableCell>
                        <TableCell>{transaction.createdBy}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">No transactions found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="supplier">
          <Card>
            <CardHeader>
              <CardTitle>Supplier Information</CardTitle>
            </CardHeader>
            <CardContent>
              {supplier ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-1">Name</h3>
                    <p>{supplier.name}</p>

                    <h3 className="font-medium text-sm text-muted-foreground mt-4 mb-1">Contact Person</h3>
                    <p>{supplier.contactPerson}</p>

                    <h3 className="font-medium text-sm text-muted-foreground mt-4 mb-1">Email</h3>
                    <p>{supplier.email}</p>

                    <h3 className="font-medium text-sm text-muted-foreground mt-4 mb-1">Phone</h3>
                    <p>{supplier.phone}</p>
                  </div>

                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-1">Address</h3>
                    <p>
                      {supplier.address}
                      <br />
                      {supplier.city}, {supplier.state} {supplier.postalCode}
                      <br />
                      {supplier.country}
                    </p>

                    <h3 className="font-medium text-sm text-muted-foreground mt-4 mb-1">Payment Terms</h3>
                    <p>{supplier.paymentTerms || "Not specified"}</p>

                    <Button variant="outline" className="mt-4" asChild>
                      <Link href={`/dashboard/suppliers/${supplier.id}`}>View Supplier Details</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                  <p>No supplier information available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
