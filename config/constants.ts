// API Base URL
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

// Order Status
export const ORDER_STATUS = {
  NEW: "New",
  PREPARING: "Preparing",
  READY: "Ready",
  SERVED: "Served",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
}

export const ORDER_STATUS_COLORS: Record<string, string> = {
  New: "bg-blue-100 text-blue-800",
  Preparing: "bg-yellow-100 text-yellow-800",
  Ready: "bg-green-100 text-green-800",
  Served: "bg-purple-100 text-purple-800",
  Completed: "bg-green-100 text-green-800",
  Cancelled: "bg-red-100 text-red-800",
}

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: "Pending",
  PAID: "Paid",
  REFUNDED: "Refunded",
  FAILED: "Failed",
}

export const PAYMENT_STATUS_COLORS: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-800",
  Paid: "bg-green-100 text-green-800",
  Refunded: "bg-blue-100 text-blue-800",
  Failed: "bg-red-100 text-red-800",
}

// Order Types
export const ORDER_TYPES = {
  DINE_IN: "Dine In",
  TAKEAWAY: "Takeaway",
  DELIVERY: "Delivery",
  ROOM_SERVICE: "Room Service",
}

// Kitchen Order Status
export const KITCHEN_ORDER_STATUS = {
  PENDING: "Pending",
  COOKING: "Cooking",
  READY: "Ready",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
}

export const KITCHEN_STATUS_COLORS: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-800",
  Cooking: "bg-blue-100 text-blue-800",
  Ready: "bg-green-100 text-green-800",
  Completed: "bg-green-100 text-green-800",
  Cancelled: "bg-red-100 text-red-800",
}

// Priority Levels
export const PRIORITY_LEVELS = {
  HIGH: "High",
  NORMAL: "Normal",
  LOW: "Low",
}

export const PRIORITY_COLORS: Record<string, string> = {
  High: "bg-red-100 text-red-800",
  Normal: "bg-blue-100 text-blue-800",
  Low: "bg-gray-100 text-gray-800",
}

// Table Status
export const TABLE_STATUS = {
  AVAILABLE: "Available",
  OCCUPIED: "Occupied",
  RESERVED: "Reserved",
  CLEANING: "Cleaning",
  MAINTENANCE: "Maintenance",
}

export const TABLE_STATUS_COLORS: Record<string, string> = {
  Available: "bg-green-100 text-green-800",
  Occupied: "bg-red-100 text-red-800",
  Reserved: "bg-blue-100 text-blue-800",
  Cleaning: "bg-yellow-100 text-yellow-800",
  Maintenance: "bg-gray-100 text-gray-800",
}

// Menu Categories
export const MENU_CATEGORIES = [
  "All",
  "Appetizers",
  "Soups",
  "Salads",
  "Main Courses",
  "Sides",
  "Desserts",
  "Beverages",
  "Specials",
]

// Dietary Options
export const DIETARY_OPTIONS = {
  VEGETARIAN: "Vegetarian",
  VEGAN: "Vegan",
  GLUTEN_FREE: "Gluten Free",
}
