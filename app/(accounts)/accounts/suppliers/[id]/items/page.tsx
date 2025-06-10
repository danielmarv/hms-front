"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Package, Plus, Search, Filter, Eye } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useSuppliers } from "@/hooks/use-suppliers"

export default function SupplierItemsPage() {
  const params = useParams()
  const router = useRouter()
  const supplierId = params.id as string

  const { supplier, supplierItems, loading, error, getSupplierById, getSupplierItems } = useSuppliers()

  useEffect(() => {
    if (supplierId) {
      getSupplierById(supplierId)
      getSupplierItems(supplierId)
    }
  }, [supplierId, getSupplierById, getSupplierItems])

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="outline" size="sm" asChild className="mr-4">
            <Link href={`/dashboard/suppliers/${supplierId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Supplier
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">
            {loading && !supplier ? <Skeleton className="h-8 w-64 inline-block" /> : <>Items from {supplier?.name}</>}
          </h1>
        </div>

        <Button asChild>
          <Link href={`/dashboard/inventory/new?supplier=${supplierId}`}>
            <Plus className="mr-2 h-4 w-4" /> Add Item
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
          <CardDescription>Items supplied by {supplier?.name || "this supplier"}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex w-full md:w-1/3">
              <Input placeholder="Search items..." className="mr-2" />
              <Button variant="secondary">
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 flex justify-end">
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" /> Filter
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <TableRow key={i}>
                        {Array(6)
                          .fill(0)
                          .map((_, j) => (
                            <TableCell key={j}>
                              <Skeleton className="h-6 w-full" />
                            </TableCell>
                          ))}
                      </TableRow>
                    ))
                ) : supplierItems && supplierItems.length > 0 ? (
                  supplierItems.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.category}</Badge>
                      </TableCell>
                      <TableCell>{item.sku}</TableCell>
                      <TableCell>{item.currentStock}</TableCell>
                      <TableCell>${item.unitPrice?.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/inventory/${item._id}`}>
                            <Eye className="h-4 w-4 mr-1" /> View
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      {error ? (
                        <div className="text-destructive">{error}</div>
                      ) : (
                        <div className="flex flex-col items-center justify-center">
                          <Package className="h-12 w-12 text-muted-foreground opacity-20 mb-2" />
                          <p>No inventory items found for this supplier.</p>
                          <Button variant="outline" size="sm" className="mt-4" asChild>
                            <Link href={`/dashboard/inventory/new?supplier=${supplierId}`}>
                              <Plus className="h-4 w-4 mr-2" /> Add Inventory Item
                            </Link>
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
