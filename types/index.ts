// Common Types
export type ApiResponse<T> = {
    success: boolean
    data?: T
    error?: string
    message?: string
    count?: number
    total?: number
    pagination?: {
      page: number
      limit: number
      totalPages: number
    }
  }
  
  // Menu Item Types
  export type MenuItem = {
    _id: string
    name: string
    description: string
    price: number
    cost: number
    category: string
    subcategory?: string
    imageUrl?: string
    availability: boolean
    preparationTime: number
    isVegetarian: boolean
    isVegan: boolean
    isGlutenFree: boolean
    allergens?: string[]
    spicyLevel?: number
    calories?: number
    ingredients?: string[]
    tags?: string[]
    featured: boolean
    menuSections?: string[]
    availableDays?: string[]
    availableTimeStart?: string
    availableTimeEnd?: string
    discountPercentage?: number
    isDiscounted: boolean
    createdAt: string
    updatedAt: string
    createdBy?: any
    updatedBy?: any
  }
  
  export type MenuItemFilters = {
    search?: string
    category?: string
    subcategory?: string
    availability?: boolean
    isVegetarian?: boolean
    isVegan?: boolean
    isGlutenFree?: boolean
    featured?: boolean
    minPrice?: number
    maxPrice?: number
    menuSection?: string
    page?: number
    limit?: number
    sort?: string
  }
  
  // Order Types
  export type OrderItem = {
    _id: string
    menuItem: string | MenuItem
    name: string
    quantity: number
    unitPrice: number
    totalPrice: number
    notes?: string
    modifiers?: any[]
    status: string
    preparedBy?: string
    servedAt?: string
  }
  
  export type Order = {
    _id: string
    orderNumber: string
    table?: any
    room?: any
    guest?: any
    booking?: any
    waiter?: any
    items: OrderItem[]
    subtotal: number
    taxRate: number
    taxAmount: number
    discountPercentage: number
    discountAmount: number
    serviceChargePercentage: number
    serviceChargeAmount: number
    totalAmount: number
    orderType: string
    orderStatus: string
    paymentStatus: string
    priority: string
    notes?: string
    customerName?: string
    customerPhone?: string
    deliveryAddress?: string
    deliveryNotes?: string
    orderedAt: string
    completedAt?: string
    cancelledAt?: string
    cancellationReason?: string
    isModified: boolean
    modificationNotes?: string
    createdAt: string
    updatedAt: string
    createdBy?: any
    updatedBy?: any
  }
  
  export type OrderFilters = {
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
  
  // Kitchen Order Types
  export type KitchenOrderItem = {
    _id: string
    menuItem: string | MenuItem
    name: string
    quantity: number
    notes?: string
    modifiers?: any[]
    status: string
    assignedTo?: any
    startedAt?: string
    completedAt?: string
  }
  
  export type KitchenOrder = {
    _id: string
    orderNumber: string
    order: string | Order
    table?: any
    room?: any
    items: KitchenOrderItem[]
    priority: string
    status: string
    notes?: string
    orderType: string
    waiter?: any
    chef?: any
    estimatedCompletionTime?: string
    actualCompletionTime?: string
    startedAt?: string
    completedAt?: string
    cancelledAt?: string
    cancellationReason?: string
    isModified: boolean
    modificationNotes?: string
    createdAt: string
    updatedAt: string
    createdBy?: any
    updatedBy?: any
  }
  
  export type KitchenOrderFilters = {
    status?: string
    priority?: string
    orderType?: string
    startDate?: string
    endDate?: string
    page?: number
    limit?: number
    sort?: string
  }
  
  // Table Types
  export type Table = {
    _id: string
    number: string
    section: string
    capacity: number
    minCapacity?: number
    shape?: string
    width?: number
    length?: number
    positionX?: number
    positionY?: number
    rotation?: number
    status: string
    isActive: boolean
    currentOrder?: string | Order
    currentGuests?: number
    reservationName?: string
    reservationPhone?: string
    reservationTime?: string
    lastOccupiedAt?: string
    lastCleanedAt?: string
    notes?: string
    createdAt: string
    updatedAt: string
    createdBy?: any
    updatedBy?: any
  }
  
  export type TableFilters = {
    section?: string
    status?: string
    capacity?: number
    isActive?: boolean
  }
  
  // Analytics Types
  export type OrderStats = {
    byStatus: Array<{ _id: string; count: number; revenue: number }>
    byType: Array<{ _id: string; count: number; revenue: number }>
    daily: Array<{ _id: string; count: number; revenue: number }>
    hourly: Array<{ _id: number; count: number; revenue: number }>
    totals: {
      totalOrders: number
      totalRevenue: number
      avgOrderValue: number
    }
  }
  
  export type KitchenStats = {
    byStatus: Array<{ _id: string; count: number }>
    byPriority: Array<{ _id: string; count: number }>
    byType: Array<{ _id: string; count: number }>
    hourly: Array<{ _id: number; count: number }>
    preparationTime: {
      avgPreparationTime: number
      minPreparationTime: number
      maxPreparationTime: number
    }
    totals: {
      totalOrders: number
      completedOrders: number
      cancelledOrders: number
    }
  }
  