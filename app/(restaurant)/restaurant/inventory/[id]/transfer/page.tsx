"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, ArrowRightLeft, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "sonner"
import { useInventory } from "@/hooks/use-inventory"

export default function TransferStockPage() {
  const params = useParams()
  const router = useRouter()
  const { getInventoryItemById, getInventoryItems, transferStock, transferStockToDepartment, getInventoryDepartments } =
    useInventory()

  const [item, setItem] = useState<any>(null)
  const [transferType, setTransferType] = useState<"item" | "department">("department")
  const [quantity, setQuantity] = useState<string>("")
  const [department, setDepartment] = useState<string>("")
  const [reason, setReason] = useState<string>("")
  const [destinationItems, setDestinationItems] = useState<any[]>([])
  const [departments, setDepartments] = useState<string[]>([])
  const [selectedDestinationItem, setSelectedDestinationItem] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        // Load the source item
        const itemResponse = await getInventoryItemById(params.id as string)
        if (itemResponse.data) {
          setItem(itemResponse.data)
        } else {
          toast.error("Failed to load inventory item")
          return
        }

        // Load departments
        const departmentsResponse = await getInventoryDepartments()
        if (departmentsResponse.data) {
          setDepartments(departmentsResponse.data)
        }

        // Load destination items if needed
        if (transferType === "item") {
          const itemsResponse = await getInventoryItems()
          if (itemsResponse.data) {
            // Filter out the current item
            const filteredItems = itemsResponse.data.data.filter((i: any) => i._id !== params.id)
            setDestinationItems(filteredItems)
          }
        }
      } catch (error) {
        console.error("Error loading data:", error)
        toast.error("Failed to load required data")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [params.id, getInventoryItemById, getInventoryDepartments])

  // Load destination items when transfer type changes
  useEffect(() => {
    const loadDestinationItems = async () => {
      if (transferType === "item") {
        const itemsResponse = await getInventoryItems()
        if (itemsResponse.data) {
          // Filter out the current item
          const filteredItems = itemsResponse.data.data.filter((i: any) => i._id !== params.id)
          setDestinationItems(filteredItems)
        }
      }
    }

    if (item) {
      loadDestinationItems()
    }
  }, [transferType, item, params.id, getInventoryItems])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!quantity) {
      toast.error("Quantity is required")
      return
    }

    if (transferType === "item" && !selectedDestinationItem) {
      toast.error("Please select a destination item")
      return
    }

    if (transferType === "department" && !department) {
      toast.error("Please select a department")
      return
    }

    if (Number(quantity) <= 0) {
      toast.error("Quantity must be greater than zero")
      return
    }

    if (Number(quantity) > item.currentStock) {
      toast.error(`Cannot transfer more than available stock (${item.currentStock} ${item.unit})`)
      return
    }

    try {
      setIsSubmitting(true)

      let response

      if (transferType === "item") {
        response = await transferStock(
          params.id as string,
          selectedDestinationItem,
          Number(quantity),
          reason || `Transfer from ${item.name}`,
        )
      } else {
        response = await transferStockToDepartment(
          params.id as string,
          department,
          Number(quantity),
          reason || `Transfer to ${department} department`,
        )
      }

      if (response.data) {
        toast.success("Stock transferred successfully")
        router.push(`/dashboard/inventory/${params.id}`)
      } else {
        toast.error(response.error || "Failed to transfer stock")
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to transfer stock")
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
          <h1 className="text-2xl font-bold">Transfer Stock: {item.name}</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Transfer Stock</CardTitle>
            <CardDescription>Transfer stock from this item to another item or department</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="current-stock">Current Stock</Label>
                <Input id="current-stock" value={`${item.currentStock} ${item.unit}`} disabled />
              </div>

              <div>
                <Label>Transfer Type</Label>
                <RadioGroup
                  value={transferType}
                  onValueChange={(value) => setTransferType(value as "item" | "department")}
                  className="flex flex-col space-y-1 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="department" id="department" />
                    <Label htmlFor="department" className="cursor-pointer">
                      Transfer to Department
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="item" id="item" />
                    <Label htmlFor="item" className="cursor-pointer">
                      Transfer to Another Item
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {transferType === "department" ? (
                <div>
                  <Label htmlFor="department-select">Department</Label>
                  <Select value={department} onValueChange={setDepartment} required>
                    <SelectTrigger id="department-select">
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
              ) : (
                <div>
                  <Label htmlFor="destination-item-select">Destination Item</Label>
                  <Select value={selectedDestinationItem} onValueChange={setSelectedDestinationItem} required>
                    <SelectTrigger id="destination-item-select">
                      <SelectValue placeholder="Select destination item" />
                    </SelectTrigger>
                    <SelectContent>
                      {destinationItems.map((destItem) => (
                        <SelectItem key={destItem._id} value={destItem._id}>
                          {destItem.name} ({destItem.sku || "No SKU"})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="quantity">Quantity to Transfer ({item.unit})</Label>
                <Input
                  type="number"
                  id="quantity"
                  placeholder="Enter quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="0.01"
                  step="0.01"
                  max={item.currentStock}
                  required
                />
              </div>

              <div>
                <Label htmlFor="reason">Reason for Transfer (Optional)</Label>
                <Textarea
                  id="reason"
                  placeholder="Enter reason for transfer"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="justify-between">
              <Button variant="outline" type="button" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Transferring..." : "Transfer Stock"}
                <ArrowRightLeft className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
