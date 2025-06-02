"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Minus, ShoppingCart, Trash2, Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { useRestaurantOrders } from "@/hooks/use-restaurant-orders"
import { useMenuItems } from "@/hooks/use-menu-items"
import { useTables } from "@/hooks/use-tables"
import { toast } from "sonner"

interface OrderItem {
  menuItem: any
  quantity: number
  specialInstructions?: string
}

export default function NewOrderPage() {
  const router = useRouter()
  const { createOrder, loading: orderLoading } = useRestaurantOrders()
  const { getMenuItems, loading: menuLoading } = useMenuItems()
  const { getTables, loading: tablesLoading } = useTables()

  const [menuItems, setMenuItems] = useState<any[]>([])
  const [tables, setTables] = useState<any[]>([])
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  // Order details
  const [orderType, setOrderType] = useState("dine-in")
  const [selectedTable, setSelectedTable] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [deliveryRoom, setDeliveryRoom] = useState("")
  const [specialInstructions, setSpecialInstructions] = useState("")
  const [priority, setPriority] = useState("medium")

  useEffect(() => {
    loadMenuItems()
    loadTables()
  }, [])

  const loadMenuItems = async () => {
    try {
      const response = await getMenuItems({ available: true })
      if (response?.data) {
        setMenuItems(response.data)
      }
    } catch (error) {
      console.error("Error loading menu items:", error)
    }
  }

  const loadTables = async () => {
    try {
      const response = await getTables({ status: "available" })
      if (response?.data) {
        setTables(response.data)
      }
    } catch (error) {
      console.error("Error loading tables:", error)
    }
  }

  const addToOrder = (menuItem: any) => {
    const existingItem = orderItems.find((item) => item.menuItem._id === menuItem._id)

    if (existingItem) {
      setOrderItems(
        orderItems.map((item) =>
          item.menuItem._id === menuItem._id ? { ...item, quantity: item.quantity + 1 } : item,
        ),
      )
    } else {
      setOrderItems([...orderItems, { menuItem, quantity: 1 }])
    }
  }

  const updateQuantity = (menuItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromOrder(menuItemId)
    } else {
      setOrderItems(
        orderItems.map((item) => (item.menuItem._id === menuItemId ? { ...item, quantity: newQuantity } : item)),
      )
    }
  }

  const removeFromOrder = (menuItemId: string) => {
    setOrderItems(orderItems.filter((item) => item.menuItem._id !== menuItemId))
  }

  const updateSpecialInstructions = (menuItemId: string, instructions: string) => {
    setOrderItems(
      orderItems.map((item) =>
        item.menuItem._id === menuItemId ? { ...item, specialInstructions: instructions } : item,
      ),
    )
  }

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => {
      return total + item.menuItem.price * item.quantity
    }, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (orderItems.length === 0) {
      toast.error("Please add at least one item to the order")
      return
    }

    if (orderType === "dine-in" && !selectedTable) {
      toast.error("Please select a table for dine-in orders")
      return
    }

    if (orderType === "delivery" && !deliveryRoom) {
      toast.error("Please enter a room number for delivery orders")
      return
    }

    try {
      const orderData = {
        type: orderType,
        items: orderItems.map((item) => ({
          menuItem: item.menuItem._id,
          quantity: item.quantity,
          price: item.menuItem.price,
          specialInstructions: item.specialInstructions,
        })),
        totalAmount: calculateTotal(),
        customerName: customerName || undefined,
        customerPhone: customerPhone || undefined,
        table: orderType === "dine-in" ? selectedTable : undefined,
        deliveryInfo: orderType === "delivery" ? { room: deliveryRoom } : undefined,
        specialInstructions,
        priority,
        status: "pending",
      }

      const result = await createOrder(orderData)
      if (result) {
        toast.success("Order created successfully!")
        router.push("/restaurant/orders")
      }
    } catch (error) {
      console.error("Error creating order:", error)
      toast.error("Failed to create order")
    }
  }

  const filteredMenuItems = menuItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = [...new Set(menuItems.map((item) => item.category))].filter(Boolean)

  const loading = orderLoading || menuLoading || tablesLoading

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Order</h1>
        <p className="text-muted-foreground">Add items and create a new restaurant order</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Menu Items */}
        <Card>
          <CardHeader>
            <CardTitle>Menu Items</CardTitle>
            <CardDescription>Select items to add to the order</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search and Filter */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search menu items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Menu Items List */}
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {filteredMenuItems.map((item) => (
                  <div key={item._id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{item.name}</h4>
                        {item.featured && <Badge variant="secondary">Featured</Badge>}
                      </div>
                      {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                      <p className="text-sm font-medium">${item.price.toFixed(2)}</p>
                    </div>
                    <Button size="sm" onClick={() => addToOrder(item)} disabled={!item.available}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Order Details */}
        <div className="space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items ({orderItems.length})</CardTitle>
              <CardDescription>Items in the current order</CardDescription>
            </CardHeader>
            <CardContent>
              {orderItems.length > 0 ? (
                <div className="space-y-4">
                  {orderItems.map((item) => (
                    <div key={item.menuItem._id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{item.menuItem.name}</h4>
                          <p className="text-sm text-muted-foreground">${item.menuItem.price.toFixed(2)} each</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.menuItem._id, item.quantity - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.menuItem._id, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => removeFromOrder(item.menuItem._id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <Input
                        placeholder="Special instructions for this item..."
                        value={item.specialInstructions || ""}
                        onChange={(e) => updateSpecialInstructions(item.menuItem._id, e.target.value)}
                      />
                      <div className="text-right text-sm font-medium">
                        Subtotal: ${(item.menuItem.price * item.quantity).toFixed(2)}
                      </div>
                      <Separator />
                    </div>
                  ))}
                  <div className="text-right">
                    <div className="text-lg font-bold">Total: ${calculateTotal().toFixed(2)}</div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4" />
                  <p>No items added yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="orderType">Order Type</Label>
                  <Select value={orderType} onValueChange={setOrderType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dine-in">Dine In</SelectItem>
                      <SelectItem value="takeout">Takeout</SelectItem>
                      <SelectItem value="delivery">Delivery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {orderType === "dine-in" && (
                  <div className="space-y-2">
                    <Label htmlFor="table">Table</Label>
                    <Select value={selectedTable} onValueChange={setSelectedTable}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a table" />
                      </SelectTrigger>
                      <SelectContent>
                        {tables.map((table) => (
                          <SelectItem key={table._id} value={table._id}>
                            Table {table.number} (Capacity: {table.capacity})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {orderType === "delivery" && (
                  <div className="space-y-2">
                    <Label htmlFor="deliveryRoom">Room Number</Label>
                    <Input
                      id="deliveryRoom"
                      value={deliveryRoom}
                      onChange={(e) => setDeliveryRoom(e.target.value)}
                      placeholder="Enter room number"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name (Optional)</Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Customer Phone (Optional)</Label>
                  <Input
                    id="customerPhone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Enter customer phone"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialInstructions">Special Instructions</Label>
                  <Textarea
                    id="specialInstructions"
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="Any special instructions for the order..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading || orderItems.length === 0} className="flex-1">
                    {loading ? "Creating..." : "Create Order"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
