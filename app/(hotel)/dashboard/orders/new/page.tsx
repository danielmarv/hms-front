"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { PlusCircle, Trash2, Save, ArrowLeft, Utensils, Clock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRestaurantOrders } from "@/hooks/use-restaurant-orders"
import { useMenuItems } from "@/hooks/use-menu-items"
import { useTables } from "@/hooks/use-tables"
import type { MenuItem, Table } from "@/types"

// Define the form schema
const orderFormSchema = z.object({
  orderType: z.string(),
  table: z.string().optional(),
  room: z.string().optional(),
  waiter: z.string().optional(),
  priority: z.string().default("Normal"),
  notes: z.string().optional(),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  deliveryAddress: z.string().optional(),
  deliveryNotes: z.string().optional(),
  taxRate: z.number().default(10),
  discountPercentage: z.number().default(0),
  serviceChargePercentage: z.number().default(0),
})

type OrderFormValues = z.infer<typeof orderFormSchema>

// Define the order item type
type OrderItemInput = {
  menuItem: MenuItem
  quantity: number
  notes?: string
  unitPrice: number
  totalPrice: number
}

export default function NewOrderPage() {
  const router = useRouter()
  const { createOrder, loading } = useRestaurantOrders()
  const { getMenuItems } = useMenuItems()
  const { getTables } = useTables()

  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [tables, setTables] = useState<Table[]>([])
  const [orderItems, setOrderItems] = useState<OrderItemInput[]>([])
  const [menuItemsLoading, setMenuItemsLoading] = useState(true)
  const [tablesLoading, setTablesLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [categories, setCategories] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  // Initialize form
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      orderType: "Dine In",
      priority: "Normal",
      taxRate: 10,
      discountPercentage: 0,
      serviceChargePercentage: 0,
    },
  })

  // Watch the orderType to conditionally render fields
  const orderType = form.watch("orderType")

  // Calculate order totals
  const subtotal = orderItems.reduce((sum, item) => sum + item.totalPrice, 0)
  const taxRate = form.watch("taxRate") || 0
  const taxAmount = (subtotal * taxRate) / 100
  const discountPercentage = form.watch("discountPercentage") || 0
  const discountAmount = (subtotal * discountPercentage) / 100
  const serviceChargePercentage = form.watch("serviceChargePercentage") || 0
  const serviceChargeAmount = (subtotal * serviceChargePercentage) / 100
  const totalAmount = subtotal + taxAmount + serviceChargeAmount - discountAmount

  // Fetch menu items and tables on component mount
  useEffect(() => {
    const fetchMenuItems = async () => {
      setMenuItemsLoading(true)
      try {
        const response = await getMenuItems({ availability: true })
        if (response.success && response.data) {
          setMenuItems(response.data)

          // Extract unique categories
          const allCategories = response.data.map((item) => item.category)
          const uniqueCategories = ["All", ...new Set(allCategories)]
          setCategories(uniqueCategories)
        }
      } catch (error) {
        toast.error("Failed to load menu items")
      } finally {
        setMenuItemsLoading(false)
      }
    }

    const fetchTables = async () => {
      setTablesLoading(true)
      try {
        const response = await getTables({ status: "Available" })
        if (response.success && response.data) {
          setTables(response.data)
        }
      } catch (error) {
        toast.error("Failed to load tables")
      } finally {
        setTablesLoading(false)
      }
    }

    fetchMenuItems()
    fetchTables()
  }, [getMenuItems, getTables])

  // Filter menu items based on category and search query
  const filteredMenuItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory
    const matchesSearch =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesCategory && matchesSearch
  })

  // Add item to order
  const addItemToOrder = (menuItem: MenuItem) => {
    const existingItemIndex = orderItems.findIndex((item) => item.menuItem._id === menuItem._id)

    if (existingItemIndex >= 0) {
      // Update quantity if item already exists
      const updatedItems = [...orderItems]
      updatedItems[existingItemIndex].quantity += 1
      updatedItems[existingItemIndex].totalPrice =
        updatedItems[existingItemIndex].quantity * updatedItems[existingItemIndex].unitPrice
      setOrderItems(updatedItems)
    } else {
      // Add new item
      setOrderItems([
        ...orderItems,
        {
          menuItem,
          quantity: 1,
          unitPrice: menuItem.price,
          totalPrice: menuItem.price,
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

    try {
      // Prepare order data
      const orderData = {
        ...values,
        items: orderItems.map((item) => ({
          menuItem: item.menuItem._id,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          notes: item.notes,
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Order Form */}
        <div className="md:col-span-1 space-y-6">
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
                            <SelectItem value="Takeout">Takeout</SelectItem>
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
                          <FormLabel>Room Number</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter room number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {(orderType === "Takeout" || orderType === "Delivery") && (
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
                            <SelectItem value="Low">Low</SelectItem>
                            <SelectItem value="Normal">Normal</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                            <SelectItem value="Urgent">Urgent</SelectItem>
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
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pricing</CardTitle>
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
                </CardContent>
                <CardFooter className="flex flex-col items-start space-y-4">
                  <div className="w-full space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax ({taxRate}%):</span>
                      <span>${taxAmount.toFixed(2)}</span>
                    </div>
                    {discountPercentage > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount ({discountPercentage}%):</span>
                        <span>-${discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    {serviceChargePercentage > 0 && (
                      <div className="flex justify-between">
                        <span>Service Charge ({serviceChargePercentage}%):</span>
                        <span>${serviceChargeAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-bold">
                      <span>Total:</span>
                      <span>${totalAmount.toFixed(2)}</span>
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
        <div className="md:col-span-2 space-y-6">
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
                      <Card key={item._id} className="overflow-hidden">
                        <div className="relative h-40 bg-muted">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl || "/placeholder.svg"}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
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
                            <Badge>${item.price.toFixed(2)}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{item.description}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                            <Clock className="h-3 w-3" />
                            <span>{item.preparationTime} min</span>
                            <Badge variant="outline">{item.category}</Badge>
                          </div>
                          <Button onClick={() => addItemToOrder(item)} className="w-full" size="sm">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add to Order
                          </Button>
                        </CardContent>
                      </Card>
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
                                <div className="font-medium">${item.totalPrice.toFixed(2)}</div>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Badge variant="outline">{item.menuItem.category}</Badge>
                                <span>•</span>
                                <span>${item.unitPrice.toFixed(2)} each</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => updateItemQuantity(index, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                              >
                                -
                              </Button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => updateItemQuantity(index, item.quantity + 1)}
                              >
                                +
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
