"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useInventory, type InventoryItem } from "@/hooks/use-inventory"
import { toast } from "sonner"

interface StockUpdateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: InventoryItem
  onSuccess: () => void
}

export function StockUpdateDialog({ open, onOpenChange, item, onSuccess }: StockUpdateDialogProps) {
  const { updateStockLevel, isLoading } = useInventory()
  const [formData, setFormData] = useState({
    quantity: 0,
    type: "restock" as "restock" | "usage" | "adjustment" | "transfer" | "waste",
    reason: "",
    unit_price: item.unitPrice,
    department: "",
    reference_number: "",
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.quantity || formData.quantity === 0) {
      toast.error("Please enter a valid quantity")
      return
    }

    if (!formData.type) {
      toast.error("Please select a transaction type")
      return
    }

    const { data, error } = await updateStockLevel(item._id, formData)

    if (error) {
      toast.error(error)
    } else {
      toast.success("Stock updated successfully")
      onSuccess()
      onOpenChange(false)
      setFormData({
        quantity: 0,
        type: "restock",
        reason: "",
        unit_price: item.unitPrice,
        department: "",
        reference_number: "",
      })
    }
  }

  const transactionTypes = [
    { value: "restock", label: "Restock (Add Stock)" },
    { value: "usage", label: "Usage (Remove Stock)" },
    { value: "adjustment", label: "Adjustment" },
    { value: "transfer", label: "Transfer" },
    { value: "waste", label: "Waste/Loss" },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Stock Level</DialogTitle>
          <DialogDescription>
            Update the stock level for {item.name}. Current stock: {item.currentStock} {item.unit}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Transaction Type *</Label>
              <Select value={formData.type} onValueChange={(value: any) => handleInputChange("type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select transaction type" />
                </SelectTrigger>
                <SelectContent>
                  {transactionTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange("quantity", Number.parseInt(e.target.value) || 0)}
                  placeholder="Enter quantity"
                  required
                />
                <span className="text-sm text-muted-foreground">{item.unit}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit_price">Unit Price</Label>
              <Input
                id="unit_price"
                type="number"
                step="0.01"
                min="0"
                value={formData.unit_price}
                onChange={(e) => handleInputChange("unit_price", Number.parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => handleInputChange("department", e.target.value)}
                placeholder="Department (optional)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reference_number">Reference Number</Label>
              <Input
                id="reference_number"
                value={formData.reference_number}
                onChange={(e) => handleInputChange("reference_number", e.target.value)}
                placeholder="Reference number (optional)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                value={formData.reason}
                onChange={(e) => handleInputChange("reason", e.target.value)}
                placeholder="Reason for stock change (optional)"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Stock"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
