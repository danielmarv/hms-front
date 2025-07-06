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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Minus, ShoppingCart, Trash2, Search, User, Utensils, Home, MapPin, Clock } from "lucide-react"
import { useRouter } from "next/navigation"
import { useRestaurantOrders } from "@/hooks/use-restaurant-orders"
import { useMenuItems } from "@/hooks/use-menu-items"
import { useTables } from "@/hooks/use-tables"
import { useGuests } from "@/hooks/use-guests"
import { useRooms } from "@/hooks/use-rooms"
import { useUsers } from "@/hooks/use-users"
import { toast } from "sonner"

interface OrderItem {
  menuItem: any
  quantity: number
  unitPrice: number
  totalPrice: number
  notes?: string
  modifiers: Array<{
    name: string
    price: number
  }>
}

interface ModifierOption {
  name: string
  price: number
}

const commonModifiers: ModifierOption[] = [
  { name: "Extra Cheese", price: 2.0 },
  { name: "No Onions", price: 0.0 },
  { name: "Extra Spicy", price: 0.0 },
  { name: "Less Salt", price: 0.0 },
  { name: "Extra Sauce", price: 1.5 },
  { name: "No Sauce", price: 0.0 },
  { name: "Extra Meat", price: 3.0 },
  { name: "Vegetarian Option", price: 0.0 },
]

export default function NewRestaurantOrderPage() {
  const router = useRouter()
  const { createOrder, loading: orderLoading } = useRestaurantOrders()
  const { getMenuItems, loading: menuLoading } = useMenuItems()
  const { getTables, loading: tablesLoading } = useTables()
  const { getGuests, isLoading: guestsLoading } = useGuests()
  const { fetchRooms, isLoading: roomsLoading } = useRooms()
  const { fetchUsers, isLoading: usersLoading } = useUsers()

  // Data states
  const [menuItems, setMenuItems] = useState<any[]>([])
  const [tables, setTables] = useState<any[]>([])
  const [guests, setGuests] = useState<any[]>([])
  const [rooms, setRooms] = useState<any[]>([])
  const [waiters, setWaiters] = useState<any[]>([])
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [guestSearch, setGuestSearch] = useState("")
  const [roomSearch, setRoomSearch] = useState("")

  // Order configuration states
  const [orderType, setOrderType] = useState<"Dine In" | "Room Service" | "Takeaway" | "Delivery">("Dine In")
  const [selectedTable, setSelectedTable] = useState("")
  const [selectedGuest, setSelectedGuest] = useState("")
  const [selectedRoom, setSelectedRoom] = useState("")
  const [selectedWaiter, setSelectedWaiter] = useState("")
  const [selectedBooking, setSelectedBooking] = useState("")

  // Customer details
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [deliveryAddress, setDeliveryAddress] = useState("")
  const [deliveryNotes, setDeliveryNotes] = useState("")

  // Order details
  const [priority, setPriority] = useState<"Normal" | "High" | "Rush">("Normal")
  const [notes, setNotes] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("Cash")

  // Pricing
  const [taxRate, setTaxRate] = useState(0)
  const [discountPercentage, setDiscountPercentage] = useState(0)
  const [discountReason, setDiscountReason] = useState("")
  const [serviceChargePercentage, setServiceChargePercentage] = useState(0)

  // Flags
  const [isCorporate, setIsCorporate] = useState(false)
  const [isGroupBooking, setIsGroupBooking] = useState(false)

  // Dialog states
  const [showModifiersDialog, setShowModifiersDialog] = useState(false)
  const [currentItemForModifiers, setCurrentItemForModifiers] = useState<any>(null)
  const [selectedModifiers, setSelectedModifiers] = useState<ModifierOption[]>([])

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      await Promise.all([loadMenuItems(), loadTables(), loadGuests(), loadRooms(), loadWaiters()])
    } catch (error) {
      console.error("Error loading initial data:", error)
      toast.error("Failed to load initial data")
    }
  }

  const loadMenuItems = async () => {
    try {
      const response = await getMenuItems({ availability: true, limit: 100 })
      if (response?.data) {
        setMenuItems(response.data)
      }
    } catch (error) {
      console.error("Error loading menu items:", error)
    }
  }

  const loadTables = async () => {
    try {
      const response = await getTables({ occupied: false })
      console.log("Tables response:", response)
      if (response?.data) {
        setTables(response.data)
      }
    } catch (error) {
      console.error("Error loading tables:", error)
    }
  }

  const loadGuests = async () => {
    try {
      const response = await getGuests({ limit: 100 })
      if (response?.data) {
        setGuests(response.data)
      }
    } catch (error) {
      console.error("Error loading guests:", error)
    }
  }

  const loadRooms = async () => {
    try {
      const roomsData = await fetchRooms({ status: "occupied" })
      if (roomsData) {
        setRooms(roomsData)
      }
    } catch (error) {
      console.error("Error loading rooms:", error)
    }
  }

  const loadWaiters = async () => {
    try {
      const waitersData = await fetchUsers({ role: "waiter" })
      if (waitersData) {
        setWaiters(waitersData)
      }
    } catch (error) {
      console.error("Error loading waiters:", error)
    }
  }

  const addToOrder = (menuItem: any) => {
    setCurrentItemForModifiers(menuItem)
    setSelectedModifiers([])
    setShowModifiersDialog(true)
  }

  const confirmAddToOrder = () => {
    if (!currentItemForModifiers) return

    const modifiersTotal = selectedModifiers.reduce((sum, mod) => sum + mod.price, 0)
    const unitPrice = currentItemForModifiers.price + modifiersTotal

    const existingItemIndex = orderItems.findIndex(
      (item) =>
        item.menuItem._id === currentItemForModifiers._id &&
        JSON.stringify(item.modifiers) === JSON.stringify(selectedModifiers),
    )

    if (existingItemIndex >= 0) {
      const updatedItems = [...orderItems]
      updatedItems[existingItemIndex].quantity += 1
      updatedItems[existingItemIndex].totalPrice = updatedItems[existingItemIndex].quantity * unitPrice
      setOrderItems(updatedItems)
    } else {
      const newItem: OrderItem = {
        menuItem: currentItemForModifiers,
        quantity: 1,
        unitPrice,
        totalPrice: unitPrice,
        modifiers: selectedModifiers,
      }
      setOrderItems([...orderItems, newItem])
    }

    setShowModifiersDialog(false)
    setCurrentItemForModifiers(null)
    setSelectedModifiers([])
  }

  const updateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromOrder(index)
    } else {
      const updatedItems = [...orderItems]
      updatedItems[index].quantity = newQuantity
      updatedItems[index].totalPrice = updatedItems[index].unitPrice * newQuantity
      setOrderItems(updatedItems)
    }
  }

  const removeFromOrder = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index))
  }

  const updateItemNotes = (index: number, notes: string) => {
    const updatedItems = [...orderItems]
    updatedItems[index].notes = notes
    setOrderItems(updatedItems)
  }

  const calculateSubtotal = () => {
    return orderItems.reduce((total, item) => total + item.totalPrice, 0)
  }

  const calculateTaxAmount = () => {
    return (calculateSubtotal() * taxRate) / 100
  }

  const calculateDiscountAmount = () => {
    return (calculateSubtotal() * discountPercentage) / 100
  }

  const calculateServiceChargeAmount = () => {
    return (calculateSubtotal() * serviceChargePercentage) / 100
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const tax = calculateTaxAmount()
    const discount = calculateDiscountAmount()
    const serviceCharge = calculateServiceChargeAmount()
    return subtotal + tax + serviceCharge - discount
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (orderItems.length === 0) {
      toast.error("Please add at least one item to the order")
      return
    }

    // Validation based on order type
    if (orderType === "Dine In" && !selectedTable) {
      toast.error("Please select a table for dine-in orders")
      return
    }

    if (orderType === "Room Service" && !selectedRoom) {
      toast.error("Please select a room for room service orders")
      return
    }

    if ((orderType === "Takeaway" || orderType === "Delivery") && !customerName) {
      toast.error("Please enter customer name for takeaway/delivery orders")
      return
    }

    if (orderType === "Delivery" && !deliveryAddress) {
      toast.error("Please enter delivery address")
      return
    }

    if (discountPercentage > 0 && !discountReason) {
      toast.error("Please provide a reason for the discount")
      return
    }

    try {
      const subtotal = calculateSubtotal()
      const taxAmount = calculateTaxAmount()
      const discountAmount = calculateDiscountAmount()
      const serviceChargeAmount = calculateServiceChargeAmount()
      const totalAmount = calculateTotal()

      const orderData = {
        table: orderType === "Dine In" ? selectedTable : undefined,
        room: orderType === "Room Service" ? selectedRoom : undefined,
        guest: selectedGuest || undefined,
        booking: selectedBooking || undefined,
        waiter: selectedWaiter || undefined,
        items: orderItems.map((item) => ({
          menuItem: item.menuItem._id,
          name: item.menuItem.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          notes: item.notes,
          modifiers: item.modifiers,
          status: "pending",
        })),
        subtotal,
        taxRate,
        taxAmount,
        discountPercentage,
        discountAmount,
        discountReason: discountReason || undefined,
        serviceChargePercentage,
        serviceChargeAmount,
        totalAmount,
        orderType,
        priority,
        notes,
        customerName: customerName || undefined,
        customerPhone: customerPhone || undefined,
        deliveryAddress: deliveryAddress || undefined,
        deliveryNotes: deliveryNotes || undefined,
        paymentMethod,
        isCorporate,
        isGroupBooking,
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

  const filteredGuests = guests.filter(
    (guest) =>
      guest.full_name.toLowerCase().includes(guestSearch.toLowerCase()) ||
      guest.email?.toLowerCase().includes(guestSearch.toLowerCase()) ||
      guest.phone?.includes(guestSearch),
  )

  const filteredRooms = rooms.filter((room) => room.roomNumber.toLowerCase().includes(roomSearch.toLowerCase()))

  const categories = [...new Set(menuItems.map((item) => item.category))].filter(Boolean)
  const loading = orderLoading || menuLoading || tablesLoading || guestsLoading || roomsLoading || usersLoading

  const getOrderTypeIcon = (type: string) => {
    switch (type) {
      case "Dine In":
        return <Utensils className="h-4 w-4" />
      case "Room Service":
        return <Home className="h-4 w-4" />
      case "Takeaway":
        return <User className="h-4 w-4" />
      case "Delivery":
        return <MapPin className="h-4 w-4" />
      default:
        return <Utensils className="h-4 w-4" />
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Restaurant Order</h1>
        <p className="text-muted-foreground">Create orders for dine-in, room service, takeaway, or delivery</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Menu Items - Left Column */}
        <Card className="lg:col-span-1">
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
            <ScrollArea className="h-[500px]">
              <div className="space-y-2">
                {filteredMenuItems.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{item.name}</h4>
                        {item.featured && <Badge variant="secondary">Featured</Badge>}
                        {item.isVegetarian && (
                          <Badge variant="outline" className="text-green-600">
                            Veg
                          </Badge>
                        )}
                        {item.isVegan && (
                          <Badge variant="outline" className="text-green-700">
                            Vegan
                          </Badge>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm font-medium">${item.price.toFixed(2)}</p>
                        {item.preparationTime && (
                          <Badge variant="outline" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {item.preparationTime}min
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button size="sm" onClick={() => addToOrder(item)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Order Configuration - Middle Column */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Order Configuration</CardTitle>
            <CardDescription>Configure order type and details</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={orderType} onValueChange={(value) => setOrderType(value as any)} className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="Dine In" className="flex items-center gap-2">
                  <Utensils className="h-4 w-4" />
                  Dine In
                </TabsTrigger>
                <TabsTrigger value="Room Service" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Room Service
                </TabsTrigger>
              </TabsList>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="Takeaway" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Takeaway
                </TabsTrigger>
                <TabsTrigger value="Delivery" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Delivery
                </TabsTrigger>
              </TabsList>

              <TabsContent value="Dine In" className="space-y-4">
                <div className="space-y-2">
                  <Label>Table Selection</Label>
                  <Select value={selectedTable} onValueChange={setSelectedTable}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a table" />
                    </SelectTrigger>
                    <SelectContent>
                      {tables
                        .filter((t) => !t.occupied)
                        .map((table) => (
                          <SelectItem key={table._id} value={table._id}>
                            Table {table.number} - {table.section} (Capacity: {table.capacity})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="Room Service" className="space-y-4">
                <div className="space-y-2">
                  <Label>Room Selection</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search rooms..."
                      value={roomSearch}
                      onChange={(e) => setRoomSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a room" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredRooms.map((room) => (
                        <SelectItem key={room._id} value={room._id}>
                          Room {room.roomNumber} - Floor {room.floor} ({room.roomType})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="Takeaway" className="space-y-4">
                <div className="space-y-2">
                  <Label>Customer Name</Label>
                  <Input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Customer Phone</Label>
                  <Input
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Enter customer phone"
                  />
                </div>
              </TabsContent>

              <TabsContent value="Delivery" className="space-y-4">
                <div className="space-y-2">
                  <Label>Customer Name</Label>
                  <Input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Customer Phone</Label>
                  <Input
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Enter customer phone"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Delivery Address</Label>
                  <Textarea
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Enter delivery address"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Delivery Notes</Label>
                  <Input
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    placeholder="Special delivery instructions"
                  />
                </div>
              </TabsContent>
            </Tabs>

            {/* Guest Selection */}
            <div className="space-y-2">
              <Label>Guest (Optional)</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search guests..."
                  value={guestSearch}
                  onChange={(e) => setGuestSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedGuest} onValueChange={setSelectedGuest}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a guest" />
                </SelectTrigger>
                <SelectContent>
                  {filteredGuests.map((guest) => (
                    <SelectItem key={guest._id} value={guest._id}>
                      <div className="flex items-center gap-2">
                        {guest.vip && (
                          <Badge variant="secondary" className="text-xs">
                            VIP
                          </Badge>
                        )}
                        <span>{guest.full_name}</span>
                        {guest.phone && <span className="text-muted-foreground">({guest.phone})</span>}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Waiter Assignment */}
            <div className="space-y-2">
              <Label>Waiter</Label>
              <Select value={selectedWaiter} onValueChange={setSelectedWaiter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a waiter" />
                </SelectTrigger>
                <SelectContent>
                  {waiters.map((waiter) => (
                    <SelectItem key={waiter._id} value={waiter._id}>
                      {waiter.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Priority and Payment */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={(value) => setPriority(value as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Normal">Normal</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Rush">Rush</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Card">Card</SelectItem>
                    <SelectItem value="Room Charge">Room Charge</SelectItem>
                    <SelectItem value="Complimentary">Complimentary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Special Flags */}
            <div className="flex items-center gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isCorporate}
                  onChange={(e) => setIsCorporate(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Corporate</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isGroupBooking}
                  onChange={(e) => setIsGroupBooking(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Group Booking</span>
              </label>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Special Instructions</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special instructions for the order..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Order Summary - Right Column */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Order Summary ({orderItems.length})
            </CardTitle>
            <CardDescription>Review and finalize your order</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Order Items */}
            <ScrollArea className="h-[300px]">
              {orderItems.length > 0 ? (
                <div className="space-y-3">
                  {orderItems.map((item, index) => (
                    <div key={index} className="space-y-2 p-3 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{item.menuItem.name}</h4>
                          <p className="text-sm text-muted-foreground">${item.unitPrice.toFixed(2)} each</p>
                          {item.modifiers.length > 0 && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Modifiers: {item.modifiers.map((m) => m.name).join(", ")}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="outline" onClick={() => updateQuantity(index, item.quantity - 1)}>
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <Button size="sm" variant="outline" onClick={() => updateQuantity(index, item.quantity + 1)}>
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => removeFromOrder(index)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <Input
                        placeholder="Item notes..."
                        value={item.notes || ""}
                        onChange={(e) => updateItemNotes(index, e.target.value)}
                        className="text-sm"
                      />
                      <div className="text-right text-sm font-medium">${item.totalPrice.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4" />
                  <p>No items added yet</p>
                </div>
              )}
            </ScrollArea>

            {/* Pricing Configuration */}
            {orderItems.length > 0 && (
              <div className="space-y-4">
                <Separator />

                {/* Tax, Discount, Service Charge */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">Tax Rate (%)</Label>
                    <Input
                      type="number"
                      value={taxRate}
                      onChange={(e) => setTaxRate(Number(e.target.value))}
                      className="w-20 h-8"
                      min="0"
                      max="100"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Label className="text-sm">Discount (%)</Label>
                    <Input
                      type="number"
                      value={discountPercentage}
                      onChange={(e) => setDiscountPercentage(Number(e.target.value))}
                      className="w-20 h-8"
                      min="0"
                      max="100"
                    />
                  </div>

                  {discountPercentage > 0 && (
                    <Input
                      placeholder="Discount reason"
                      value={discountReason}
                      onChange={(e) => setDiscountReason(e.target.value)}
                      className="text-sm"
                    />
                  )}

                  <div className="flex items-center gap-2">
                    <Label className="text-sm">Service Charge (%)</Label>
                    <Input
                      type="number"
                      value={serviceChargePercentage}
                      onChange={(e) => setServiceChargePercentage(Number(e.target.value))}
                      className="w-20 h-8"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>

                <Separator />

                {/* Price Breakdown */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${calculateSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax ({taxRate}%):</span>
                    <span>${calculateTaxAmount().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service Charge ({serviceChargePercentage}%):</span>
                    <span>${calculateServiceChargeAmount().toFixed(2)}</span>
                  </div>
                  {discountPercentage > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Discount ({discountPercentage}%):</span>
                      <span>-${calculateDiscountAmount().toFixed(2)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} disabled={loading || orderItems.length === 0} className="flex-1">
                    {loading ? "Creating..." : "Create Order"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modifiers Dialog */}
      <Dialog open={showModifiersDialog} onOpenChange={setShowModifiersDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Modifiers</DialogTitle>
            <DialogDescription>Customize {currentItemForModifiers?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              {commonModifiers.map((modifier, index) => (
                <label
                  key={index}
                  className="flex items-center justify-between p-2 border rounded cursor-pointer hover:bg-muted/50"
                >
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedModifiers.some((m) => m.name === modifier.name)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedModifiers([...selectedModifiers, modifier])
                        } else {
                          setSelectedModifiers(selectedModifiers.filter((m) => m.name !== modifier.name))
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">{modifier.name}</span>
                  </div>
                  <span className="text-sm font-medium">
                    {modifier.price > 0 ? `+$${modifier.price.toFixed(2)}` : "Free"}
                  </span>
                </label>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowModifiersDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={confirmAddToOrder} className="flex-1">
                Add to Order
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
