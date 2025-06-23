export interface CheckIn {
  id: string
  guest: {
    id: string
    full_name: string
    email: string
    phone: string
  }
  room: {
    id: string
    roomNumber: string
    floor: number
  }
  booking?: {
    id: string
    confirmation_number: string
  }
  check_in_date: string
  expected_check_out: string
  actual_check_out?: string
  number_of_guests: number
  number_of_nights: number
  room_rate: number
  total_room_charges: number
  additional_charges: Array<{
    description: string
    amount: number
    date: string
    category: string
  }>
  discounts: Array<{
    description: string
    amount: number
    type: "fixed" | "percentage"
    date: string
  }>
  tax_rate: number
  tax_amount: number
  total_amount: number
  payment_status: "pending" | "partial" | "paid" | "refunded"
  payment_method?: string
  deposit_amount: number
  balance_due: number
  status: "checked_in" | "checked_out" | "no_show" | "cancelled"
  check_in_type: "booking" | "walk_in"
  special_requests?: string
  notes?: string
  key_cards_issued: number
  parking_space?: string
  vehicle_details?: {
    license_plate: string
    make: string
    model: string
    color: string
  }
  emergency_contact?: {
    name: string
    phone: string
    relationship: string
  }
  checked_in_by: {
    id: string
    full_name: string
  }
  checked_out_by?: {
    id: string
    full_name: string
  }
  folio_number: string
  registration_document?: {
    guest_signature: string
    agreements: {
      terms_and_conditions: boolean
      privacy_policy: boolean
      damage_policy: boolean
      no_smoking_policy: boolean
    }
    additional_requests?: string
    created_at: string
  }
  createdAt: string
  updatedAt: string
}

export interface GuestFolio {
  folio_number: string
  guest: {
    full_name: string
    email: string
    phone: string
  }
  room: {
    roomNumber: string
    floor: number
  }
  check_in_date: string
  check_out_date: string
  number_of_nights: number
  room_charges: {
    rate_per_night: number
    number_of_nights: number
    total: number
  }
  additional_charges: Array<{
    description: string
    amount: number
    date: string
    category: string
  }>
  discounts: Array<{
    description: string
    amount: number
    type: "fixed" | "percentage"
    date: string
  }>
  tax: {
    rate: number
    amount: number
  }
  totals: {
    subtotal: number
    discount_total: number
    tax_amount: number
    grand_total: number
    paid_amount: number
    balance_due: number
  }
  payment_status: string
  status: string
}

export interface OccupancyData {
  occupied_rooms: CheckIn[]
  total_rooms: number
  occupancy_count: number
  occupancy_rate: number
  available_rooms: number
}
