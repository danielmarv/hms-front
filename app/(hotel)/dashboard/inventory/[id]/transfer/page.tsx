"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useInventory } from "@/hooks/use-inventory"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "sonner"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

export default function TransferStockPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const { getInventoryItemById, getInventoryItems, transferStock, transferStockToDepartment } = useInventory()

  const [item, setItem] = useState<any>(null)
  const [transferType, setTransferType] = useState<"item" | "department">("item")
  const [targetItems, setTargetItems] = useState<any[]>([])
  const [targetItemId, setTargetItemId] = useState<string>("")
  const [departments, setDepartments] = useState<string[]>([])
  const [targetDepartment, setTargetDepartment] = useState<string>("")
  const [quantity, setQuantity] = useState<number>(0)
  const [notes, setNotes] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch the source inventory item
        const itemResponse = await getInventoryItemById(id)
        if (itemResponse.data) {
          setItem(itemResponse.data)
        } else {
          toast.error("Failed to load inventory item")
          return
        }

        // Fetch all other inventory items for transfer
        const itemsResponse = await getInventoryItems(1, 100)
        if (itemsResponse.data) {
          // Filter out the current item
          const filteredItems = itemsResponse.data.items.filter((i) => i.id !== id)
          setTargetItems(filteredItems)
        }

        // Fetch departments
        const departmentsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/inventory/departments`)
        const departmentsData = await departmentsResponse.json()
        if (departmentsData.data) {
          setDepartments(departmentsData.data)
        }
      } catch (error) {
        toast.error("An error occurred while fetching data")
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchData()
    }
  }, [id, getInventoryItemById, getInventoryItems])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      let response

      if (transferType === "item" && targetItemId) {
        response = await transferStock(id, targetItemId, quantity, notes)
      } else if (transferType === "department" && targetDepartment) {
        response = await transferStockToDepartment(id, targetDepartment, quantity, notes)
      } else {
        toast.error("Please select a valid transfer target")
        setIsSubmitting(false)
        return
      }

      if (response.data) {
        toast.success("Stock transferred successfully")
        router.push(`/dashboard/inventory/${id}`)
      } else {
        toast.error("Failed to transfer stock")
      }
    } catch (error) {
      toast.error("An error occurred while transferring stock")
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
          <CardTitle>Transfer Stock: {item.name}</CardTitle>
          <CardDescription>
            Current Stock: {item.currentStock} | SKU: {item.sku}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Transfer To</Label>
              <RadioGroup
                value={transferType}
                onValueChange={(value) => setTransferType(value as "item" | "department")}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="item" id="item" />
                  <Label htmlFor="item">Another Inventory Item</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="department" id="department" />
                  <Label htmlFor="department">Department</Label>
                </div>
              </RadioGroup>
            </div>

            {transferType === "item" ? (
              <div className="space-y-2">
                <Label htmlFor="targetItem">Target Item</Label>
                <Select value={targetItemId} onValueChange={setTargetItemId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select target item" />
                  </SelectTrigger>
                  <SelectContent>
                    {targetItems.map((targetItem) => (
                      <SelectItem key={targetItem.id} value={targetItem.id}>
                        {targetItem.name} (SKU: {targetItem.sku})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="targetDepartment">Target Department</Label>
                <Select value={targetDepartment} onValueChange={setTargetDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                min={1}
                max={item.currentStock}
                required
              />
              {quantity > item.currentStock && (
                <p className="text-sm text-red-500">Cannot transfer more than current stock ({item.currentStock})</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional information about this transfer"
                rows={3}
              />
            </div>

            <Button
              type="submit"
              disabled={
                isSubmitting ||
                quantity <= 0 ||
                quantity > item.currentStock ||
                (transferType === "item" && !targetItemId) ||
                (transferType === "department" && !targetDepartment)
              }
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Transfer Stock
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
