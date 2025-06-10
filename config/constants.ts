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

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: "Pending",
  PAID: "Paid",
  REFUNDED: "Refunded",
  FAILED: "Failed",
}

// Kitchen Order Status
export const KITCHEN_ORDER_STATUS = {
  PENDING: "Pending",
  COOKING: "In Progress",
  READY: "Ready",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
}

// Priority Levels
export const PRIORITY_LEVELS = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
}

// Order Types
export const ORDER_TYPES = ["Dine In", "Takeaway", "Delivery", "Room Service"]

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

// Table Status
export const TABLE_STATUS = {
  AVAILABLE: "Available",
  OCCUPIED: "Occupied",
  RESERVED: "Reserved",
  CLEANING: "Cleaning",
  MAINTENANCE: "Maintenance",
}

// Table Sections
export const TABLE_SECTIONS = ["Main", "Outdoor", "Bar", "Private", "Lounge"]
