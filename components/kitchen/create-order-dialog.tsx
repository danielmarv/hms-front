"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useKitchenOrders } from "@/hooks/use-kitchen-orders"
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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Plus, Minus, X } from "lucide-react"
import { toast } from "sonner"

interface CreateOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onOrderCreated: () => void
}

interface OrderItem {
  menuItem: string
  name: string
  quantity: number
  notes?: string
}

export function CreateOrderDialog({ open, onOpenChange, onOrderCreated }: CreateOrderDialogProps) {
  const { createOrder, getMenuItems, getChefs, loading } = useKitchenOrders()
  const [menuItems, setMenuItems] = useState<any[]>([])
  const [chefs, setChefs] = useState<any[]>([])
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [formData, setFormData] = useState({
    orderNumber: "",
    orderType: "Dine In",
    priority: "Medium",
    table: "",
    room: "",
    notes: "",
    chef: "",
  })

  useEffect(() => {
    if (open) {
      fetchData()
      generateOrderNumber()
    }
  }, [open])

  const fetchData = async () => {
    try {
      const [menuData, chefData] = await Promise.all([getMenuItems(), getChefs()])
      setMenuItems(menuData || [])
      setChefs(chefData || [])
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }

  const generateOrderNumber = () => {
    const timestamp = Date.now().toString().slice(-6)
    setFormData((prev) => ({
      ...prev,
      orderNumber: `KO${timestamp}`,
    }))
  }

  const addOrderItem = (menuItem: any) => {
    const existingItem = orderItems.find((item) => item.menuItem === menuItem._id)

    if (existingItem) {
      setOrderItems((prev) =>
        prev.map((item) => (item.menuItem === menuItem._id ? { ...item, quantity: item.quantity + 1 } : item)),
      )
    } else {
      setOrderItems((prev) => [
        ...prev,
        {
          menuItem: menuItem._id,
          name: menuItem.name,
          quantity: 1,
          notes: "",
        },
      ])
    }
  }

  const updateItemQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      setOrderItems((prev) => prev.filter((item) => item.menuItem !== menuItemId))
    } else {
      setOrderItems((prev) => prev.map((item) => (item.menuItem === menuItemId ? { ...item, quantity } : item)))
    }
  }

  const updateItemNotes = (menuItemId: string, notes: string) => {
    setOrderItems((prev) => prev.map((item) => (item.menuItem === menuItemId ? { ...item, notes } : item)))
  }

  const removeOrderItem = (menuItemId: string) => {
    setOrderItems((prev) => prev.filter((item) => item.menuItem !== menuItemId))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (orderItems.length === 0) {
      toast.error("Please add at least one item to the order")
      return
    }

    const orderData = {
      orderNumber: formData.orderNumber,
      orderType: formData.orderType,
      priority: formData.priority,
      table: formData.table || undefined,
      room: formData.room || undefined,
      notes: formData.notes || undefined,
      chef: formData.chef || undefined,
      items: orderItems.map((item) => ({
        menuItem: item.menuItem,
        name: item.name,
        quantity: item.quantity,
        notes: item.notes || undefined,
        status: "New",
      })),
      status: "New",
    }

    const result = await createOrder(orderData)
    if (result) {
      onOrderCreated()
      onOpenChange(false)
      resetForm()
    }
  }

  const resetForm = () => {
    setOrderItems([])
    setFormData({
      orderNumber: "",
      orderType: "Dine In",
      priority: "Medium",
      table: "",
      room: "",
      notes: "",
      chef: "",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Kitchen Order</DialogTitle>
          <DialogDescription>Add items and configure the order details</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Order Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="orderNumber">Order Number</Label>
              <Input
                id="orderNumber"
                value={formData.orderNumber}
                onChange={(e) => setFormData((prev) => ({ ...prev, orderNumber: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="orderType">Order Type</Label>
              <Select
                value={formData.orderType}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, orderType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dine In">Dine In</SelectItem>
                  <SelectItem value="Takeaway">Takeaway</SelectItem>
                  <SelectItem value="Delivery">Delivery</SelectItem>
                  <SelectItem value="Room Service">Room Service</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="chef">Assign Chef (Optional)</Label>
              <Select
                value={formData.chef}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, chef: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select chef" />
                </SelectTrigger>
                <SelectContent>
                  {chefs.map((chef) => (
                    <SelectItem key={chef._id} value={chef._id}>
                      {chef.full_name || chef.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.orderType === "Dine In" && (
              <div className="space-y-2">
                <Label htmlFor="table">Table Number</Label>
                <Input
                  id="table"
                  value={formData.table}
                  onChange={(e) => setFormData((prev) => ({ ...prev, table: e.target.value }))}
                  placeholder="e.g., 12"
                />
              </div>
            )}

            {formData.orderType === "Room Service" && (
              <div className="space-y-2">
                <Label htmlFor="room">Room Number</Label>
                <Input
                  id="room"
                  value={formData.room}
                  onChange={(e) => setFormData((prev) => ({ ...prev, room: e.target.value }))}
                  placeholder="e.g., 205"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Order Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Special instructions or notes"
            />
          </div>

          <Separator />

          {/* Menu Items Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Add Menu Items</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
              {menuItems.map((item) => (
                <Card key={item._id} className="cursor-pointer hover:bg-muted/50" onClick={() => addOrderItem(item)}>
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.category}</p>
                        <p className="text-sm font-medium">${item.price}</p>
                      </div>
                      <Button size="sm" variant="outline">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Separator />

          {/* Order Items */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Order Items ({orderItems.length})</h3>
            {orderItems.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No items added yet</p>
            ) : (
              <div className="space-y-3">
                {orderItems.map((item) => (
                  <Card key={item.menuItem}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => updateItemQuantity(item.menuItem, item.quantity - 1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => updateItemQuantity(item.menuItem, item.quantity + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <Input
                            placeholder="Special instructions"
                            value={item.notes || ""}
                            onChange={(e) => updateItemNotes(item.menuItem, e.target.value)}
                            className="mt-2"
                          />
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={() => removeOrderItem(item.menuItem)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || orderItems.length === 0}>
              {loading ? "Creating..." : "Create Order"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
