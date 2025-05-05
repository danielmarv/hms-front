"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ArrowRightLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { useInventory } from "@/hooks/use-inventory"

export default function TransferStockPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { getInventoryItemById, getInventoryItems, transferStock, transferStockToDepartment, loading, error } =
    useInventory()

  const [item, setItem] = useState<any>(null)
  const [transferType, setTransferType] = useState<"item" | "department">("department")
  const [quantity, setQuantity] = useState<string>("")
  const [department, setDepartment] = useState<string>("")
  const [reason, setReason] = useState<string>("")
  const [destinationItems, setDestinationItems] = useState<any[]>([])
  const [selectedDestinationItem, setSelectedDestinationItem] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const loadItem = async () => {
      const result = await getInventoryItemById(params.id as string)
      if (result) {
        setItem(result)
      }
    }

    loadItem()
  }, [params.id])

  useEffect(() => {
    const loadDestinationItems = async () => {
      if (transferType === "item") {
        // Assuming getInventoryItems expects a category id as number, pass item?.category as number or adjust accordingly
        const categoryId = typeof item?.category === "number" ? item.category : Number(item?.category)
        const result = await getInventoryItems(categoryId)
        if (result && result.data) {
          // Filter out the current item
          const filteredItems = result.data.filter((i: any) => i._id !== params.id)
          setDestinationItems(filteredItems)
        }
      }
    }

    if (item) {
      loadDestinationItems()
    }
  }, [transferType, item])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !quantity ||
      (transferType === "item" && !selectedDestinationItem) ||
      (transferType === "department" && !department)
    ) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    if (Number(quantity) <= 0) {
      toast({
        title: "Error",
        description: "Quantity must be greater than zero",
        variant: "destructive",
      })
      return
    }

    if (Number(quantity) > item.quantity_in_stock) {
      toast({
        title: "Error",
        description: `Cannot transfer more than available stock (${item.quantity_in_stock} ${item.unit})`,
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      if (transferType === "item") {
        await transferStock(
          params.id as string,
          selectedDestinationItem,
          Number(quantity),
          reason || `Transfer from ${item.name}`,
        )

        toast({
          title: "Success",
          description: "Stock transferred successfully between items",
        })
      } else {
        await transferStockToDepartment(
          params.id as string,
          Number(quantity),
          department,
          reason || `Transfer to ${department} department`,
        )

        toast({
          title: "Success",
          description: `Stock transferred successfully to ${department} department`,
        })
      }

      router.push(`/dashboard/inventory/${params.id}`)
    } catch (err: unknown) {
      let errorMessage = "Failed to transfer stock"
      if (err instanceof Error) {
        errorMessage = err.message
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading && !item) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Loading item details...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Error</CardTitle>
            </CardHeader>
            <CardContent>
            <p>{typeof error === "string" ? error : error?.message || "Failed to load inventory item"}</p>
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
                <Input id="current-stock" value={`${item.quantity_in_stock} ${item.unit}`} disabled />
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
              ) : (
                <div>
                  <Label htmlFor="destination-item-select">Destination Item</Label>
                  <Select value={selectedDestinationItem} onValueChange={setSelectedDestinationItem} required>
                    <SelectTrigger id="destination-item-select">
                      <SelectValue placeholder="Select destination item" />
                    </SelectTrigger>
                    <SelectContent>
                      {destinationItems.map((destItem: any) => (
                        <SelectItem key={destItem._id} value={destItem._id}>
                          {destItem.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="quantity">Quantity to Transfer</Label>
                <Input
                  type="number"
                  id="quantity"
                  placeholder="Enter quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
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
              <Link href={`/dashboard/inventory/${params.id}`}>
                <Button variant="outline">Cancel</Button>
              </Link>
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
