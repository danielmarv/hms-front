"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, AlertTriangle, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { useInventory } from "@/hooks/use-inventory"

export default function UpdateStockPage() {
  const params = useParams()
  const router = useRouter()
  const { getInventoryItemById, updateStockLevel, loading } = useInventory()

  const [item, setItem] = useState<any>(null)
  const [quantity, setQuantity] = useState<string>("")
  const [type, setType] = useState<string>("restock")
  const [reason, setReason] = useState<string>("")
  const [unitPrice, setUnitPrice] = useState<string>("")
  const [department, setDepartment] = useState<string>("")
  const [referenceNumber, setReferenceNumber] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadItem = async () => {
      setIsLoading(true)
      const response = await getInventoryItemById(params.id as string)
      if (response.data) {
        setItem(response.data)
        setUnitPrice(response.data.unitPrice?.toString() || "")
      } else {
        toast.error("Failed to load inventory item")
      }
      setIsLoading(false)
    }

    loadItem()
  }, [params.id, getInventoryItemById])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!quantity || !type) {
      toast.error("Quantity and transaction type are required")
      return
    }

    try {
      setIsSubmitting(true)

      const data = {
        quantity: Number(quantity),
        type: type as "restock" | "use" | "transfer" | "adjustment" | "waste",
        reason: reason || undefined,
        unit_price: unitPrice ? Number(unitPrice) : undefined,
        department: department || undefined,
        reference_number: referenceNumber || undefined,
      }

      const response = await updateStockLevel(params.id as string, data)

      if (response.data) {
        toast.success("Stock updated successfully")
        router.push(`/dashboard/inventory/${params.id}`)
      } else {
        toast.error(response.error || "Failed to update stock")
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update stock")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!item) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
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
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Update Stock: {item.name}</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Update Stock Level</CardTitle>
            <CardDescription>Add or remove stock from this inventory item</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="current-stock">Current Stock</Label>
                  <Input id="current-stock" value={`${item.currentStock} ${item.unit}`} disabled />
                </div>
                <div>
                  <Label htmlFor="reorder-level">Reorder Level</Label>
                  <Input id="reorder-level" value={`${item.reorderPoint} ${item.unit}`} disabled />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Transaction Type</Label>
                  <Select value={type} onValueChange={setType} required>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select transaction type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="restock">Restock</SelectItem>
                      <SelectItem value="use">Use</SelectItem>
                      <SelectItem value="transfer">Transfer</SelectItem>
                      <SelectItem value="adjustment">Adjustment</SelectItem>
                      <SelectItem value="waste">Waste</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="quantity">Quantity ({item.unit})</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                  />
                </div>
              </div>

              {type === "transfer" && (
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Select value={department} onValueChange={setDepartment}>
                    <SelectTrigger id="department">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kitchen">Kitchen</SelectItem>
                      <SelectItem value="housekeeping">Housekeeping</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="restaurant">Restaurant</SelectItem>
                      <SelectItem value="bar">Bar</SelectItem>
                      <SelectItem value="spa">Spa</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="unit-price">Unit Price ($)</Label>
                <Input
                  id="unit-price"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                  placeholder="Leave empty to use current price"
                />
              </div>

              <div>
                <Label htmlFor="reference">Reference Number</Label>
                <Input
                  id="reference"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="Invoice number, PO number, etc."
                />
              </div>

              <div>
                <Label htmlFor="reason">Reason</Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Reason for this stock update"
                  rows={3}
                />
              </div>

              {type === "use" && item.currentStock < Number(quantity) && (
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-md flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">Warning</p>
                    <p className="text-sm text-amber-700">
                      The quantity you're trying to use ({quantity} {item.unit}) is greater than the current stock (
                      {item.currentStock} {item.unit}).
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || loading}>
                {isSubmitting ? "Updating..." : "Update Stock"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
