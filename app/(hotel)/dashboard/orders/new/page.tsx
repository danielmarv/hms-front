"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { PlusCircle, Trash2, Save, ArrowLeft, Utensils, Clock, Search, Plus, Minus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { useCurrency } from "@/hooks/use-currency"
import { useRestaurantOrders } from "@/hooks/use-restaurant-orders"
import { useMenuItems } from "@/hooks/use-menu-items"
import { useTables } from "@/hooks/use-tables"
import { useRooms } from "@/hooks/use-rooms"
import { useGuests } from "@/hooks/use-guests"
import { useUsers } from "@/hooks/use-users"
import { useBookings } from "@/hooks/use-bookings"
import type { MenuItem, Table, Room, Guest, Booking } from "@/types"

// Define the form schema
const orderFormSchema = z.object({
  orderType: z.string(),
  table: z.string().optional(),
  room: z.string().optional(),
  guest: z.string().optional(),
  booking: z.string().optional(),
  waiter: z.string().optional(),
  priority: z.string().default("Normal"),
  notes: z.string().optional(),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  deliveryAddress: z.string().optional(),
  deliveryNotes: z.string().optional(),
  taxRate: z.number().default(10),
  discountPercentage: z.number().default(0),
  discountReason: z.string().optional(),
  serviceChargePercentage: z.number().default(0),
  paymentMethod: z.string().optional(),
  isGroupBooking: z.boolean().default(false),
  isCorporate: z.boolean().default(false),
})

type OrderFormValues = z.infer<typeof orderFormSchema>

// Define the order item type with modifiers
type OrderItemInput = {
  menuItem: MenuItem
  quantity: number
  notes?: string
  unitPrice: number
  totalPrice: number
  modifiers: Array<{
    name: string
    price: number
  }>
}

export default function NewOrderPage() {
  const router = useRouter()
  const { createOrder, loading } = useRestaurantOrders()
  const { getMenuItems } = useMenuItems()
  const { getTables } = useTables()
  const { fetchRooms } = useRooms()
  const { getGuests } = useGuests()
  const { fetchUsers } = useUsers()
  const { getBookings } = useBookings()
  const { formatCurrency } = useCurrency()

  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [tables, setTables] = useState<Table[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [guests, setGuests] = useState<Guest[]>([])
  const [waiters, setWaiters] = useState<any[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [orderItems, setOrderItems] = useState<OrderItemInput[]>([])

  const [menuItemsLoading, setMenuItemsLoading] = useState(true)
  const [tablesLoading, setTablesLoading] = useState(true)
  const [roomsLoading, setRoomsLoading] = useState(true)
  const [guestsLoading, setGuestsLoading] = useState(true)
  const [waitersLoading, setWaitersLoading] = useState(true)
  const [bookingsLoading, setBookingsLoading] = useState(true)

  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [categories, setCategories] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [guestSearchQuery, setGuestSearchQuery] = useState("")
  const [selectedModifiers, setSelectedModifiers] = useState<{ [key: string]: Array<{ name: string; price: number }> }>(
    {},
  )

  // Initialize form
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      orderType: "Dine In",
      priority: "Normal",
      taxRate: 10,
      discountPercentage: 0,
      serviceChargePercentage: 0,
      isGroupBooking: false,
      isCorporate: false,
    },
  })

  // Watch the orderType to conditionally render fields
  const orderType = form.watch("orderType")
  const selectedGuest = form.watch("guest")

  // Calculate order totals
  const subtotal = orderItems.reduce((sum, item) => sum + item.totalPrice, 0)
  const taxRate = form.watch("taxRate") || 0
  const taxAmount = (subtotal * taxRate) / 100
  const discountPercentage = form.watch("discountPercentage") || 0
  const discountAmount = (subtotal * discountPercentage) / 100
  const serviceChargePercentage = form.watch("serviceChargePercentage") || 0
  const serviceChargeAmount = (subtotal * serviceChargePercentage) / 100
  const totalAmount = subtotal + taxAmount + serviceChargeAmount - discountAmount

  // Fetch all required data on component mount
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Fetch menu items
        setMenuItemsLoading(true)
        const menuResponse = await getMenuItems({ availability: true })
        if (menuResponse.success && menuResponse.data) {
          setMenuItems(menuResponse.data)
          const allCategories = menuResponse.data.map((item) => item.category)
          const uniqueCategories = ["All", ...new Set(allCategories)]
          setCategories(uniqueCategories)
        }
        setMenuItemsLoading(false)

        // Fetch tables
        setTablesLoading(true)
        const tablesResponse = await getTables({ status: "Available" })
        if (tablesResponse.success && tablesResponse.data) {
          setTables(tablesResponse.data)
        }
        setTablesLoading(false)

        // Fetch rooms
        setRoomsLoading(true)
        const roomsData = await fetchRooms({ status: "occupied" })
        if (roomsData) {
          setRooms(roomsData)
        }
        setRoomsLoading(false)

        // Fetch guests
        setGuestsLoading(true)
        const guestsResponse = await getGuests({ limit: 100 })
        if (guestsResponse.success && guestsResponse.data) {
          setGuests(guestsResponse.data)
        }
        setGuestsLoading(false)

        // Fetch waiters/staff
        setWaitersLoading(true)
        const waitersData = await fetchUsers({ role: "waiter" })
        if (waitersData) {
          setWaiters(waitersData)
        }
        setWaitersLoading(false)

        // Fetch active bookings
        setBookingsLoading(true)
        const bookingsResponse = await getBookings({ status: "confirmed" })
        if (bookingsResponse.data?.data) {
          setBookings(bookingsResponse.data.data)
        }
        setBookingsLoading(false)
      } catch (error) {
        toast.error("Failed to load required data")
        console.error("Error loading data:", error)
      }
    }

    fetchAllData()
  }, [])

  // Filter menu items based on category and search query
  const filteredMenuItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory
    const matchesSearch =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesCategory && matchesSearch
  })

  // Filter guests based on search query
  const filteredGuests = guests.filter((guest) => {
    if (!guestSearchQuery) return true
    return (
      guest.full_name.toLowerCase().includes(guestSearchQuery.toLowerCase()) ||
      guest.email?.toLowerCase().includes(guestSearchQuery.toLowerCase()) ||
      guest.phone.includes(guestSearchQuery)
    )
  })

  // Add item to order with modifiers
  const addItemToOrder = (menuItem: MenuItem, modifiers: Array<{ name: string; price: number }> = []) => {
    const existingItemIndex = orderItems.findIndex(
      (item) => item.menuItem._id === menuItem._id && JSON.stringify(item.modifiers) === JSON.stringify(modifiers),
    )

    const modifiersTotal = modifiers.reduce((sum, mod) => sum + mod.price, 0)
    const unitPrice = menuItem.price + modifiersTotal

    if (existingItemIndex >= 0) {
      // Update quantity if item with same modifiers already exists
      const updatedItems = [...orderItems]
      updatedItems[existingItemIndex].quantity += 1
      updatedItems[existingItemIndex].totalPrice = updatedItems[existingItemIndex].quantity * unitPrice
      setOrderItems(updatedItems)
    } else {
      // Add new item
      setOrderItems([
        ...orderItems,
        {
          menuItem,
          quantity: 1,
          unitPrice,
          totalPrice: unitPrice,
          modifiers,
        },
      ])
    }
  }

  // Update item quantity
  const updateItemQuantity = (index: number, quantity: number) => {
    if (quantity < 1) return

    const updatedItems = [...orderItems]
    updatedItems[index].quantity = quantity
    updatedItems[index].totalPrice = quantity * updatedItems[index].unitPrice
    setOrderItems(updatedItems)
  }

  // Remove item from order
  const removeItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index))
  }

  // Update item notes
  const updateItemNotes = (index: number, notes: string) => {
    const updatedItems = [...orderItems]
    updatedItems[index].notes = notes
    setOrderItems(updatedItems)
  }

  // Handle form submission
  const onSubmit = async (values: OrderFormValues) => {
    if (orderItems.length === 0) {
      toast.error("Please add at least one item to the order")
      return
    }

    if (orderType === "Dine In" && !values.table) {
      toast.error("Please select a table for dine-in orders")
      return
    }

    if (orderType === "Room Service" && !values.room) {
      toast.error("Please select a room for room service orders")
      return
    }

    try {
      // Prepare order data
      const orderData = {
        ...values,
        items: orderItems.map((item) => ({
          menuItem: item.menuItem._id,
          name: item.menuItem.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          notes: item.notes,
          modifiers: item.modifiers,
        })),
        subtotal,
        taxRate,
        taxAmount,
        discountPercentage,
        discountAmount,
        serviceChargePercentage,
        serviceChargeAmount,
        totalAmount,
      }

      const result = await createOrder(orderData)

      if (result) {
        toast.success("Order created successfully")
        router.push("/dashboard/orders")
      } else {
        toast.error("Failed to create order")
      }
    } catch (error) {
      toast.error("An error occurred while creating the order")
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">New Order</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Form */}
        <div className="lg:col-span-1 space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Order Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="orderType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Order Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select order type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Dine In">Dine In</SelectItem>
                            <SelectItem value="Takeaway">Takeaway</SelectItem>
                            <SelectItem value="Delivery">Delivery</SelectItem>
                            <SelectItem value="Room Service">Room Service</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {orderType === "Dine In" && (
                    <FormField
                      control={form.control}
                      name="table"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Table</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a table" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {tablesLoading ? (
                                <SelectItem value="loading" disabled>
                                  Loading tables...
                                </SelectItem>
                              ) : tables.length === 0 ? (
                                <SelectItem value="none" disabled>
                                  No available tables
                                </SelectItem>
                              ) : (
                                tables.map((table) => (
                                  <SelectItem key={table._id} value={table._id}>
                                    Table {table.number} ({table.section}) - {table.capacity} seats
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {orderType === "Room Service" && (
                    <FormField
                      control={form.control}
                      name="room"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Room</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a room" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {roomsLoading ? (
                                <SelectItem value="loading" disabled>
                                  Loading rooms...
                                </SelectItem>
                              ) : rooms.length === 0 ? (
                                <SelectItem value="none" disabled>
                                  No occupied rooms
                                </SelectItem>
                              ) : (
                                rooms.map((room) => (
                                  <SelectItem key={room._id} value={room._id}>
                                    Room {room.roomNumber} - Floor {room.floor}
                                    {room.building && ` (${room.building})`}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="guest"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Guest (Optional)</FormLabel>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="w-full justify-start bg-transparent">
                              {selectedGuest
                                ? guests.find((g) => g._id === selectedGuest)?.full_name || "Select guest"
                                : "Select guest"}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Select Guest</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                <Input
                                  placeholder="Search guests..."
                                  value={guestSearchQuery}
                                  onChange={(e) => setGuestSearchQuery(e.target.value)}
                                  className="pl-10"
                                />
                              </div>
                              <div className="max-h-60 overflow-y-auto space-y-2">
                                {guestsLoading ? (
                                  <div className="text-center py-4">Loading guests...</div>
                                ) : filteredGuests.length === 0 ? (
                                  <div className="text-center py-4">No guests found</div>
                                ) : (
                                  filteredGuests.map((guest) => (
                                    <Button
                                      key={guest._id}
                                      variant="ghost"
                                      className="w-full justify-start"
                                      onClick={() => {
                                        field.onChange(guest._id)
                                        setGuestSearchQuery("")
                                      }}
                                    >
                                      <div className="text-left">
                                        <div className="font-medium">{guest.full_name}</div>
                                        <div className="text-sm text-muted-foreground">
                                          {guest.email} • {guest.phone}
                                        </div>
                                      </div>
                                    </Button>
                                  ))
                                )}
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="booking"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Booking (Optional)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select booking" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {bookingsLoading ? (
                              <SelectItem value="loading" disabled>
                                Loading bookings...
                              </SelectItem>
                            ) : bookings.length === 0 ? (
                              <SelectItem value="none" disabled>
                                No active bookings
                              </SelectItem>
                            ) : (
                              bookings.map((booking) => (
                                <SelectItem key={booking._id} value={booking._id}>
                                  {booking.confirmation_number} - {booking.guest.full_name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="waiter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assigned Waiter</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select waiter" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {waitersLoading ? (
                              <SelectItem value="loading" disabled>
                                Loading staff...
                              </SelectItem>
                            ) : waiters.length === 0 ? (
                              <SelectItem value="none" disabled>
                                No waiters available
                              </SelectItem>
                            ) : (
                              waiters.map((waiter) => (
                                <SelectItem key={waiter._id} value={waiter._id}>
                                  {waiter.full_name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {(orderType === "Takeaway" || orderType === "Delivery") && (
                    <>
                      <FormField
                        control={form.control}
                        name="customerName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Customer Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Enter customer name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="customerPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Customer Phone</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Enter customer phone" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  {orderType === "Delivery" && (
                    <>
                      <FormField
                        control={form.control}
                        name="deliveryAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Delivery Address</FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder="Enter delivery address" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="deliveryNotes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Delivery Notes</FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder="Enter delivery notes" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Normal">Normal</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                            <SelectItem value="Rush">Rush</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Order Notes</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Enter order notes" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center space-x-4">
                    <FormField
                      control={form.control}
                      name="isGroupBooking"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Group Booking</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isCorporate"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Corporate</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pricing & Payment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="taxRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tax Rate (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="discountPercentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch("discountPercentage") > 0 && (
                    <FormField
                      control={form.control}
                      name="discountReason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Discount Reason</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter discount reason" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="serviceChargePercentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Charge (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Method</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select payment method" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Cash">Cash</SelectItem>
                            <SelectItem value="Card">Card</SelectItem>
                            <SelectItem value="Room Charge">Room Charge</SelectItem>
                            <SelectItem value="Complimentary">Complimentary</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex flex-col items-start space-y-4">
                  <div className="w-full space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax ({taxRate}%):</span>
                      <span>{formatCurrency(taxAmount)}</span>
                    </div>
                    {discountPercentage > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount ({discountPercentage}%):</span>
                        <span>-{formatCurrency(discountAmount)}</span>
                      </div>
                    )}
                    {serviceChargePercentage > 0 && (
                      <div className="flex justify-between">
                        <span>Service Charge ({serviceChargePercentage}%):</span>
                        <span>{formatCurrency(serviceChargeAmount)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-bold">
                      <span>Total:</span>
                      <span>{formatCurrency(totalAmount)}</span>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading || orderItems.length === 0}>
                    <Save className="mr-2 h-4 w-4" />
                    Create Order
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        </div>

        {/* Menu Items and Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="menu">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="menu">Menu Items</TabsTrigger>
              <TabsTrigger value="order">Order Items ({orderItems.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="menu" className="space-y-4">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Search menu items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Badge
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>

                {menuItemsLoading ? (
                  <div className="text-center py-8">Loading menu items...</div>
                ) : filteredMenuItems.length === 0 ? (
                  <div className="text-center py-8">No menu items found</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredMenuItems.map((item) => (
                      <MenuItemCard key={item._id} item={item} onAddToOrder={addItemToOrder} />
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="order">
              <Card>
                <CardHeader>
                  <CardTitle>Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  {orderItems.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No items added to the order yet</div>
                  ) : (
                    <div className="space-y-4">
                      {orderItems.map((item, index) => (
                        <Card key={index} className="p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <h4 className="font-medium">{item.menuItem.name}</h4>
                                <div className="font-medium">{formatCurrency(item.totalPrice)}</div>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Badge variant="outline">{item.menuItem.category}</Badge>
                                <span>•</span>
                                <span>{formatCurrency(item.unitPrice)} each</span>
                              </div>
                              {item.modifiers.length > 0 && (
                                <div className="mt-1">
                                  <span className="text-sm text-muted-foreground">Modifiers: </span>
                                  {item.modifiers.map((mod, modIndex) => (
                                    <Badge key={modIndex} variant="secondary" className="mr-1">
                                      {mod.name} (+{formatCurrency(mod.price)})
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => updateItemQuantity(index, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => updateItemQuantity(index, item.quantity + 1)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                              <Button variant="destructive" size="icon" onClick={() => removeItem(index)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="mt-2">
                            <Textarea
                              placeholder="Special instructions..."
                              value={item.notes || ""}
                              onChange={(e) => updateItemNotes(index, e.target.value)}
                              className="text-sm"
                            />
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

// Menu Item Card Component with Modifiers
function MenuItemCard({
  item,
  onAddToOrder,
}: {
  item: MenuItem
  onAddToOrder: (item: MenuItem, modifiers: Array<{ name: string; price: number }>) => void
}) {
  const [selectedModifiers, setSelectedModifiers] = useState<Array<{ name: string; price: number }>>([])
  const [showModifiers, setShowModifiers] = useState(false)
  const { formatCurrency } = useCurrency()

  // Sample modifiers - in real app, these would come from the menu item
  const availableModifiers = [
    { name: "Extra Cheese", price: 2.0 },
    { name: "Extra Sauce", price: 1.5 },
    { name: "No Onions", price: 0 },
    { name: "Spicy", price: 0 },
    { name: "Extra Large", price: 3.0 },
  ]

  const handleModifierToggle = (modifier: { name: string; price: number }) => {
    setSelectedModifiers((prev) => {
      const exists = prev.find((m) => m.name === modifier.name)
      if (exists) {
        return prev.filter((m) => m.name !== modifier.name)
      } else {
        return [...prev, modifier]
      }
    })
  }

  const handleAddToOrder = () => {
    onAddToOrder(item, selectedModifiers)
    setSelectedModifiers([])
    setShowModifiers(false)
  }

  return (
    <Card className="overflow-hidden">
      <div className="relative h-40 bg-muted">
        {item.imageUrl ? (
          <img src={item.imageUrl || "/placeholder.svg"} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <Utensils className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {item.isVegetarian && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Veg
            </Badge>
          )}
          {item.isVegan && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Vegan
            </Badge>
          )}
          {item.isGlutenFree && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              GF
            </Badge>
          )}
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium">{item.name}</h3>
          <Badge>{formatCurrency(item.price)}</Badge>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{item.description}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
          <Clock className="h-3 w-3" />
          <span>{item.preparationTime} min</span>
          <Badge variant="outline">{item.category}</Badge>
        </div>

        {!showModifiers ? (
          <div className="flex gap-2">
            <Button onClick={handleAddToOrder} className="flex-1" size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add to Order
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowModifiers(true)}>
              Customize
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-sm font-medium">Customize your order:</div>
            <div className="space-y-2">
              {availableModifiers.map((modifier) => (
                <div key={modifier.name} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${item._id}-${modifier.name}`}
                    checked={selectedModifiers.some((m) => m.name === modifier.name)}
                    onCheckedChange={() => handleModifierToggle(modifier)}
                  />
                  <label htmlFor={`${item._id}-${modifier.name}`} className="text-sm flex-1 cursor-pointer">
                    {modifier.name}
                    {modifier.price > 0 && (
                      <span className="text-muted-foreground"> (+{formatCurrency(modifier.price)})</span>
                    )}
                  </label>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddToOrder} className="flex-1" size="sm">
                Add to Order
                {selectedModifiers.length > 0 && (
                  <span className="ml-1">
                    (+{formatCurrency(selectedModifiers.reduce((sum, m) => sum + m.price, 0))})
                  </span>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowModifiers(false)
                  setSelectedModifiers([])
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
