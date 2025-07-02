// Common types
export type ApiResponse<T> = {
  success: boolean
  data?: T
  message?: string
  count?: number
  total?: number
  pagination?: {
    page: number
    limit: number
    totalPages: number
  }
}

// User types
export interface User {
  _id: string
  full_name: string
  email: string
  role: string
  status: "active" | "inactive"
  createdAt: string
  updatedAt: string
  hotelAccess?: number
}

export interface UserRole {
  _id: string
  name: string
  description: string
  permissions: string[]
}

// Room types
export interface Room {
  _id: string
  number: string
  floor: string
  building: string
  status: string
  type?: string
  capacity?: number
  amenities?: string[]
  rate?: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Housekeeping types
export type HousekeepingStatus = "pending" | "in_progress" | "completed"

export type HousekeepingSchedule = {
  _id: string
  room: {
    _id: string
    number: string
    floor: string
    building: string
    status: string
  }
  schedule_date: string
  status: HousekeepingStatus
  assigned_to?: {
    _id: string
    name: string
  }
  notes?: string
  priority: "low" | "medium" | "high"
  createdAt: string
  updatedAt: string
}

export type HousekeepingFilters = {
  room?: string
  assigned_to?: string
  status?: HousekeepingStatus
  date?: string
  startDate?: string
  endDate?: string
  sort?: string
  limit?: number
  page?: number
}

export type HousekeepingStats = {
  total: number
  pending: number
  in_progress: number
  completed: number
  today: {
    total: number
    pending: number
    in_progress: number
    completed: number
  }
}

export interface MenuItem {
  _id: string
  name: string
  description?: string
  price: number
  cost?: number
  category: string
  subcategory?: string
  imageUrl?: string
  availability: boolean
  preparationTime?: number
  isVegetarian?: boolean
  isVegan?: boolean
  isGlutenFree?: boolean
  allergens?: string[]
  spicyLevel?: number
  calories?: number
  ingredients?: string[]
  tags?: string[]
  featured?: boolean
  menuSections?: string[]
  availableDays?: string[]
  availableTimeStart?: string
  availableTimeEnd?: string
  discountPercentage?: number
  isDiscounted?: boolean
  createdBy?: string
  updatedBy?: string
  createdAt?: string
  updatedAt?: string
}

export interface Table {
  _id: string
  number: string
  section: string
  capacity: number
  minCapacity?: number
  shape?: "round" | "square" | "rectangle"
  width?: number
  length?: number
  positionX?: number
  positionY?: number
  rotation?: number
  status: "Available" | "Occupied" | "Reserved" | "Cleaning" | "Maintenance"
  isActive: boolean
  currentGuests?: number
  currentOrder?: string
  reservationName?: string
  reservationPhone?: string
  reservationTime?: string
  lastOccupiedAt?: string
  lastCleanedAt?: string
  notes?: string
  createdBy?: string
  updatedBy?: string
  createdAt?: string
  updatedAt?: string
}

export interface OrderItem {
  menuItem: string
  name: string
  quantity: number
  unitPrice: number
  totalPrice: number
  notes?: string
  modifiers?: Array<{
    name: string
    price: number
  }>
  status: "Pending" | "Preparing" | "Ready" | "Served"
}

export interface Order {
  _id: string
  orderNumber: string
  table?: string
  room?: string
  guest?: string
  booking?: string
  waiter?: string
  items: OrderItem[]
  subtotal: number
  taxRate: number
  taxAmount: number
  discountPercentage: number
  discountAmount: number
  serviceChargePercentage: number
  serviceChargeAmount: number
  totalAmount: number
  orderType: "Dine In" | "Takeaway" | "Delivery" | "Room Service"
  orderStatus: "New" | "Confirmed" | "Preparing" | "Ready" | "Served" | "Completed" | "Cancelled"
  paymentStatus: "Pending" | "Partial" | "Paid" | "Refunded"
  priority: "Low" | "Normal" | "High" | "Urgent"
  notes?: string
  customerName?: string
  customerPhone?: string
  deliveryAddress?: string
  deliveryNotes?: string
  orderedAt: string
  completedAt?: string
  cancelledAt?: string
  cancellationReason?: string
  isModified?: boolean
  modificationNotes?: string
  createdBy?: string
  updatedBy?: string
  createdAt?: string
  updatedAt?: string
}

export interface KitchenOrderItem {
  menuItem: string
  name: string
  quantity: number
  notes?: string
  modifiers?: Array<{
    name: string
    price: number
  }>
  status: "Pending" | "In Progress" | "Ready" | "Served"
  startedAt?: string
  completedAt?: string
}

export interface KitchenOrder {
  _id: string
  orderNumber: string
  order: string
  table?: string
  room?: string
  items: KitchenOrderItem[]
  priority: "Low" | "Normal" | "High" | "Urgent"
  status: "Pending" | "In Progress" | "Ready" | "Completed" | "Cancelled"
  notes?: string
  orderType: "Dine In" | "Takeaway" | "Delivery" | "Room Service"
  waiter?: string
  estimatedTime?: number
  startedAt?: string
  completedAt?: string
  cancelledAt?: string
  createdBy?: string
  updatedBy?: string
  createdAt?: string
  updatedAt?: string
}

export interface OrderFilters {
  table?: string
  room?: string
  guest?: string
  orderStatus?: string
  paymentStatus?: string
  orderType?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
  sort?: string
}

export interface OrderStats {
  byStatus: Array<{
    _id: string
    count: number
    revenue: number
  }>
  byType: Array<{
    _id: string
    count: number
    revenue: number
  }>
  daily: Array<{
    _id: string
    count: number
    revenue: number
  }>
  hourly: Array<{
    _id: number
    count: number
    revenue: number
  }>
  totals: {
    totalOrders: number
    totalRevenue: number
    avgOrderValue: number
  }
}
