"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useInventory } from "@/hooks/use-inventory"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

export default function UpdateStockPage() {
  const params = useParams()
  const id = params.id as string
  const { getInventoryItemById, updateStockLevel, loading } = useInventory()

  const [item, setItem] = useState<any>(null)
  const [quantity, setQuantity] = useState<number>(0)
  const [type, setType] = useState<"IN" | "OUT" | "ADJUSTMENT">("IN")
  const [notes, setNotes] = useState<string>("")
  const [location, setLocation] = useState<string>("")
  const [department, setDepartment] = useState<string>("")
  const [supplier, setSupplier] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  useEffect(() => {
    const fetchItem = async () => {
      setIsLoading(true)
      try {
        const response = await getInventoryItemById(id)
        if (response.data) {
          setItem(response.data)
          if (response.data.supplier) {
            setSupplier(response.data.supplier)
          }
          if (response.data.location) {
            setLocation(response.data.location)
          }
          if (response.data.department) {
            setDepartment(response.data.department)
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
  }, [id, getInventoryItemById])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Fix: Add the type parameter to the updateStockLevel call
      const response = await updateStockLevel(id, quantity, type, notes, location, department, supplier)

      if (response.data) {
        toast.success(`Stock ${type === "IN" ? "added" : type === "OUT" ? "removed" : "adjusted"} successfully`)
        setItem(response.data)
        setQuantity(0)
        setNotes("")
      } else {
        toast.error("Failed to update stock")
      }
    } catch (error) {
      toast.error("An error occurred while updating stock")
    } finally {
      setIsSubmitting(false)
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
      <div className="mb-4">
        <Button variant="outline" asChild>
          <Link href={`/dashboard/inventory/${id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Item
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Update Stock: {item.name}</CardTitle>
          <CardDescription>
            Current Stock: {item.currentStock} | Min: {item.minStockLevel} | Max: {item.maxStockLevel} | Reorder Point:{" "}
            {item.reorderPoint}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Transaction Type</Label>
                <Select value={type} onValueChange={(value) => setType(value as "IN" | "OUT" | "ADJUSTMENT")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select transaction type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IN">Stock In</SelectItem>
                    <SelectItem value="OUT">Stock Out</SelectItem>
                    <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  min={0}
                  required
                />
              </div>

              {type === "IN" && (
                <div className="space-y-2">
                  <Label htmlFor="supplier">Supplier</Label>
                  <Input id="supplier" value={supplier} onChange={(e) => setSupplier(e.target.value)} />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input id="department" value={department} onChange={(e) => setDepartment(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional information about this stock transaction"
                rows={3}
              />
            </div>

            <Button type="submit" disabled={isSubmitting || loading}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {type === "IN" ? "Add Stock" : type === "OUT" ? "Remove Stock" : "Adjust Stock"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
