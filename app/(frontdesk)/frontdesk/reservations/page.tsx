"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { EmptyState } from "@/components/ui/empty-state"
import { LoadingSkeleton } from "@/components/ui/loading-skeleton"
import {
  Calendar,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Clock,
  DollarSign,
  Users,
  Bed,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  RefreshCw,
  CreditCard,
} from "lucide-react"
import { format, parseISO } from "date-fns"
import { useBookings, type Booking, type BookingFilters } from "@/hooks/use-bookings"
import { useGuests, type Guest } from "@/hooks/use-guests"
import { useRooms } from "@/hooks/use-rooms"
import { useRoomTypes } from "@/hooks/use-room-types"
import { useCheckInApi } from "@/hooks/use-checkin-api"
import { useCheckoutApi } from "@/hooks/use-checkout-api"
import { toast } from "sonner"

export default function ReservationsPage() {
  const {
    bookings,
    availableRooms,
    isLoading,
    getBookings,
    getBookingById,
    createBooking,
    updateBooking,
    cancelBooking,
    getAvailableRooms,
    getBookingStats,
  } = useBookings()

  const { getGuests } = useGuests()
  const { fetchRooms, rooms } = useRooms()
  const { fetchRoomTypes, roomTypes } = useRoomTypes()
  const { checkInGuest } = useCheckInApi()
  const { checkOutGuest } = useCheckoutApi()

  // State for fetched data
  const [guests, setGuests] = useState<Guest[]>([])
  const [guestsLoading, setGuestsLoading] = useState(false)

  const [filters, setFilters] = useState<BookingFilters>({
    page: 1,
    limit: 20,
    sort: "-createdAt",
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showCheckInDialog, setShowCheckInDialog] = useState(false)
  const [showCheckOutDialog, setShowCheckOutDialog] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [bookingStats, setBookingStats] = useState<any>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  // Form states
  const [createForm, setCreateForm] = useState({
    guest: "",
    room: "",
    check_in: "",
    check_out: "",
    number_of_guests: 1,
    booking_source: "direct",
    payment_status: "pending",
    payment_method: "",
    total_amount: 0,
    special_requests: "",
    rate_plan: "",
    discount: 0,
    discount_reason: "",
    tax_rate: 10,
    is_group_booking: false,
    group_id: "",
    is_corporate: false,
    corporate_id: "",
    assigned_staff: "",
  })

  const [editForm, setEditForm] = useState<any>({})
  const [cancellationReason, setCancellationReason] = useState("")

  // Check-in form state
  const [checkInForm, setCheckInForm] = useState({
    deposit_amount: 0,
    deposit_payment_method: "cash",
    key_cards_issued: 1,
    parking_space: "",
    vehicle_details: {
      license_plate: "",
      make: "",
      model: "",
      color: "",
    },
    emergency_contact: {
      name: "",
      phone: "",
      relationship: "",
    },
    special_requests: "",
    notes: "",
  })

  // Check-out form state
  const [checkOutForm, setCheckOutForm] = useState({
    additional_charges: [] as Array<{
      description: string
      amount: number
      category: string
    }>,
    discounts: [] as Array<{
      description: string
      amount: number
      type: "fixed" | "percentage"
    }>,
    payment_method: "cash",
    payment_amount: 0,
    notes: "",
  })

  useEffect(() => {
    loadData()
  }, [filters])

  useEffect(() => {
    // Load supporting data
    loadGuests()
    fetchRooms()
    fetchRoomTypes()
    loadBookingStats()
  }, [])

  const loadData = async () => {
    try {
      const response = await getBookings(filters)
      if (response.data) {
        setTotalCount(response.data.total || 0)
        setTotalPages(response.data.pagination?.totalPages || 0)
      }
    } catch (error) {
      console.error("Error loading bookings:", error)
      toast.error("Failed to load reservations")
    }
  }

  const loadGuests = async () => {
    try {
      setGuestsLoading(true)
      const response = await getGuests({ limit: 100 })
      if (response.data) {
        // Handle different response formats
        const guestsData = Array.isArray(response.data) ? response.data : response.data.data || []
        setGuests(guestsData)
      }
    } catch (error) {
      console.error("Error loading guests:", error)
      toast.error("Failed to load guests")
    } finally {
      setGuestsLoading(false)
    }
  }

  const loadBookingStats = async () => {
    try {
      const response = await getBookingStats()
      if (response.data) {
        setBookingStats(response.data.data)
      }
    } catch (error) {
      console.error("Error loading booking stats:", error)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filtering
    }))
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    const statusFilter = tab === "all" ? "" : tab
    handleFilterChange("status", statusFilter)
  }

  const handleCreateBooking = async () => {
    try {
      if (!createForm.guest || !createForm.room || !createForm.check_in || !createForm.check_out) {
        toast.error("Please fill in all required fields")
        return
      }

      await createBooking(createForm)
      toast.success("Reservation created successfully")
      setShowCreateDialog(false)
      resetCreateForm()
      loadData()
    } catch (error: any) {
      console.error("Error creating booking:", error)
      toast.error(error.response?.data?.message || "Failed to create reservation")
    }
  }

  const handleUpdateBooking = async () => {
    try {
      if (!selectedBooking) return

      await updateBooking(selectedBooking._id, editForm)
      toast.success("Reservation updated successfully")
      setShowEditDialog(false)
      setSelectedBooking(null)
      loadData()
    } catch (error: any) {
      console.error("Error updating booking:", error)
      toast.error(error.response?.data?.message || "Failed to update reservation")
    }
  }

  const handleCancelBooking = async () => {
    try {
      if (!selectedBooking || !cancellationReason.trim()) {
        toast.error("Please provide a cancellation reason")
        return
      }

      await cancelBooking(selectedBooking._id, cancellationReason)
      toast.success("Reservation cancelled successfully")
      setShowCancelDialog(false)
      setSelectedBooking(null)
      setCancellationReason("")
      loadData()
    } catch (error: any) {
      console.error("Error cancelling booking:", error)
      toast.error(error.response?.data?.message || "Failed to cancel reservation")
    }
  }

  const handleCheckIn = async () => {
    try {
      if (!selectedBooking) return

      const checkInData = {
        guest_id: selectedBooking.guest._id,
        room_id: selectedBooking.room._id,
        expected_check_out: selectedBooking.check_out,
        number_of_guests: selectedBooking.number_of_guests,
        booking_id: selectedBooking._id,
        special_requests: checkInForm.special_requests || selectedBooking.special_requests,
        notes: checkInForm.notes,
        deposit_amount: checkInForm.deposit_amount,
        deposit_payment_method: checkInForm.deposit_payment_method,
        key_cards_issued: checkInForm.key_cards_issued,
        parking_space: checkInForm.parking_space,
        vehicle_details: checkInForm.vehicle_details.license_plate ? checkInForm.vehicle_details : undefined,
        emergency_contact: checkInForm.emergency_contact.name ? checkInForm.emergency_contact : undefined,
      }

      await checkInGuest(checkInData)
      toast.success("Guest checked in successfully")
      setShowCheckInDialog(false)
      setSelectedBooking(null)
      resetCheckInForm()
      loadData()
    } catch (error: any) {
      console.error("Error checking in:", error)
      toast.error(error.message || "Failed to check in guest")
    }
  }

  const handleCheckOut = async () => {
    try {
      if (!selectedBooking) return

      const checkOutData = {
        additional_charges: checkOutForm.additional_charges.length > 0 ? checkOutForm.additional_charges : undefined,
        discounts: checkOutForm.discounts.length > 0 ? checkOutForm.discounts : undefined,
        payment_method: checkOutForm.payment_method,
        payment_amount: checkOutForm.payment_amount,
        notes: checkOutForm.notes,
      }

      await checkOutGuest(selectedBooking._id, checkOutData)
      toast.success("Guest checked out successfully")
      setShowCheckOutDialog(false)
      setSelectedBooking(null)
      resetCheckOutForm()
      loadData()
    } catch (error: any) {
      console.error("Error checking out:", error)
      toast.error(error.message || "Failed to check out guest")
    }
  }

  const handleRoomSearch = async () => {
    if (!createForm.check_in || !createForm.check_out) {
      toast.error("Please select check-in and check-out dates first")
      return
    }

    try {
      await getAvailableRooms({
        check_in: createForm.check_in,
        check_out: createForm.check_out,
        capacity: createForm.number_of_guests,
      })
    } catch (error) {
      console.error("Error searching rooms:", error)
      toast.error("Failed to search available rooms")
    }
  }

  const resetCreateForm = () => {
    setCreateForm({
      guest: "",
      room: "",
      check_in: "",
      check_out: "",
      number_of_guests: 1,
      booking_source: "direct",
      payment_status: "pending",
      payment_method: "",
      total_amount: 0,
      special_requests: "",
      rate_plan: "",
      discount: 0,
      discount_reason: "",
      tax_rate: 10,
      is_group_booking: false,
      group_id: "",
      is_corporate: false,
      corporate_id: "",
      assigned_staff: "",
    })
  }

  const resetCheckInForm = () => {
    setCheckInForm({
      deposit_amount: 0,
      deposit_payment_method: "cash",
      key_cards_issued: 1,
      parking_space: "",
      vehicle_details: {
        license_plate: "",
        make: "",
        model: "",
        color: "",
      },
      emergency_contact: {
        name: "",
        phone: "",
        relationship: "",
      },
      special_requests: "",
      notes: "",
    })
  }

  const resetCheckOutForm = () => {
    setCheckOutForm({
      additional_charges: [],
      discounts: [],
      payment_method: "cash",
      payment_amount: 0,
      notes: "",
    })
  }

  const addAdditionalCharge = () => {
    setCheckOutForm((prev) => ({
      ...prev,
      additional_charges: [...prev.additional_charges, { description: "", amount: 0, category: "other" }],
    }))
  }

  const removeAdditionalCharge = (index: number) => {
    setCheckOutForm((prev) => ({
      ...prev,
      additional_charges: prev.additional_charges.filter((_, i) => i !== index),
    }))
  }

  const addDiscount = () => {
    setCheckOutForm((prev) => ({
      ...prev,
      discounts: [...prev.discounts, { description: "", amount: 0, type: "fixed" }],
    }))
  }

  const removeDiscount = (index: number) => {
    setCheckOutForm((prev) => ({
      ...prev,
      discounts: prev.discounts.filter((_, i) => i !== index),
    }))
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      confirmed: { label: "Confirmed", className: "bg-green-100 text-green-800", icon: CheckCircle },
      checked_in: { label: "Checked In", className: "bg-blue-100 text-blue-800", icon: UserCheck },
      checked_out: { label: "Checked Out", className: "bg-gray-100 text-gray-800", icon: UserX },
      cancelled: { label: "Cancelled", className: "bg-red-100 text-red-800", icon: XCircle },
      no_show: { label: "No Show", className: "bg-orange-100 text-orange-800", icon: AlertTriangle },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      className: "bg-gray-100 text-gray-800",
      icon: Clock,
    }

    const Icon = config.icon
    return (
      <Badge className={config.className}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      paid: { label: "Paid", className: "bg-green-100 text-green-800" },
      partial: { label: "Partial", className: "bg-yellow-100 text-yellow-800" },
      pending: { label: "Pending", className: "bg-orange-100 text-orange-800" },
      refunded: { label: "Refunded", className: "bg-purple-100 text-purple-800" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      className: "bg-gray-100 text-gray-800",
    }

    return <Badge className={config.className}>{config.label}</Badge>
  }

  const filteredBookings = bookings.filter((booking) => {
    if (!searchQuery) return true

    const query = searchQuery.toLowerCase()
    return (
      booking.guest.full_name.toLowerCase().includes(query) ||
      booking.confirmation_number.toLowerCase().includes(query) ||
      booking.guest.email?.toLowerCase().includes(query) ||
      booking.guest.phone?.toLowerCase().includes(query) ||
      booking.room.number.toLowerCase().includes(query)
    )
  })

  if (isLoading && bookings.length === 0) {
    return <LoadingSkeleton />
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reservations</h1>
          <p className="text-muted-foreground">Manage hotel bookings and reservations</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadData} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Reservation
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Reservation</DialogTitle>
                <DialogDescription>Fill in the details to create a new reservation</DialogDescription>
              </DialogHeader>

              <div className="grid gap-6 py-4">
                {/* Guest Selection */}
                <div className="grid gap-2">
                  <Label htmlFor="guest">Guest *</Label>
                  <Select
                    value={createForm.guest}
                    onValueChange={(value) => setCreateForm((prev) => ({ ...prev, guest: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={guestsLoading ? "Loading guests..." : "Select a guest"} />
                    </SelectTrigger>
                    <SelectContent>
                      {guests.map((guest) => (
                        <SelectItem key={guest._id} value={guest._id}>
                          {guest.full_name} - {guest.email || guest.phone}
                          {guest.vip && <Badge className="ml-2 bg-purple-100 text-purple-800 text-xs">VIP</Badge>}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="check_in">Check-in Date *</Label>
                    <Input
                      type="date"
                      value={createForm.check_in}
                      onChange={(e) => setCreateForm((prev) => ({ ...prev, check_in: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="check_out">Check-out Date *</Label>
                    <Input
                      type="date"
                      value={createForm.check_out}
                      onChange={(e) => setCreateForm((prev) => ({ ...prev, check_out: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Room Search and Selection */}
                <div className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="room">Room *</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRoomSearch}
                      disabled={!createForm.check_in || !createForm.check_out}
                    >
                      <Search className="mr-2 h-4 w-4" />
                      Search Available
                    </Button>
                  </div>
                  <Select
                    value={createForm.room}
                    onValueChange={(value) => setCreateForm((prev) => ({ ...prev, room: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a room" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRooms.map((room) => (
                        <SelectItem key={room._id} value={room._id}>
                          Room {room.number} - {room.room_type?.name} (${room.room_type?.base_price}/night)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Booking Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="number_of_guests">Number of Guests</Label>
                    <Input
                      type="number"
                      min="1"
                      value={createForm.number_of_guests}
                      onChange={(e) =>
                        setCreateForm((prev) => ({ ...prev, number_of_guests: Number.parseInt(e.target.value) || 1 }))
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="booking_source">Booking Source</Label>
                    <Select
                      value={createForm.booking_source}
                      onValueChange={(value) => setCreateForm((prev) => ({ ...prev, booking_source: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="direct">Direct</SelectItem>
                        <SelectItem value="website">Website</SelectItem>
                        <SelectItem value="phone">Phone</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="walk_in">Walk-in</SelectItem>
                        <SelectItem value="agent">Agent</SelectItem>
                        <SelectItem value="ota">OTA</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Payment Details */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="total_amount">Total Amount</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={createForm.total_amount}
                      onChange={(e) =>
                        setCreateForm((prev) => ({ ...prev, total_amount: Number.parseFloat(e.target.value) || 0 }))
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="payment_status">Payment Status</Label>
                    <Select
                      value={createForm.payment_status}
                      onValueChange={(value) => setCreateForm((prev) => ({ ...prev, payment_status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="partial">Partial</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="tax_rate">Tax Rate (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={createForm.tax_rate}
                      onChange={(e) =>
                        setCreateForm((prev) => ({ ...prev, tax_rate: Number.parseFloat(e.target.value) || 0 }))
                      }
                    />
                  </div>
                </div>

                {/* Special Requests */}
                <div className="grid gap-2">
                  <Label htmlFor="special_requests">Special Requests</Label>
                  <Textarea
                    value={createForm.special_requests}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, special_requests: e.target.value }))}
                    placeholder="Any special requests or notes..."
                  />
                </div>

                {/* Group/Corporate Booking */}
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_group_booking"
                      checked={createForm.is_group_booking}
                      onCheckedChange={(checked) => setCreateForm((prev) => ({ ...prev, is_group_booking: !!checked }))}
                    />
                    <Label htmlFor="is_group_booking">Group Booking</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_corporate"
                      checked={createForm.is_corporate}
                      onCheckedChange={(checked) => setCreateForm((prev) => ({ ...prev, is_corporate: !!checked }))}
                    />
                    <Label htmlFor="is_corporate">Corporate Booking</Label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateBooking}>Create Reservation</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      {bookingStats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reservations</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bookingStats.totals?.totalBookings || 0}</div>
              <p className="text-xs text-muted-foreground">Active bookings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${bookingStats.totals?.totalRevenue?.toFixed(2) || "0.00"}</div>
              <p className="text-xs text-muted-foreground">From all bookings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Booking</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${bookingStats.totals?.avgBookingValue?.toFixed(2) || "0.00"}</div>
              <p className="text-xs text-muted-foreground">Per reservation</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmed Today</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {bookingStats.byStatus?.find((s: any) => s._id === "confirmed")?.count || 0}
              </div>
              <p className="text-xs text-muted-foreground">New confirmations</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by guest name, confirmation number, email, phone, or room..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-8"
              />
            </div>

            {/* Filter Controls */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <Select value={filters.status || "all"} onValueChange={(value) => handleFilterChange("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="checked_in">Checked In</SelectItem>
                  <SelectItem value="checked_out">Checked Out</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="no_show">No Show</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.payment_status || "all"}
                onValueChange={(value) => handleFilterChange("payment_status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Payment Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.booking_source || "all"}
                onValueChange={(value) => handleFilterChange("booking_source", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Booking Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="direct">Direct</SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="walk_in">Walk-in</SelectItem>
                  <SelectItem value="ota">OTA</SelectItem>
                </SelectContent>
              </Select>

              <Input
                type="date"
                placeholder="Start Date"
                value={filters.start_date || ""}
                onChange={(e) => handleFilterChange("start_date", e.target.value)}
              />

              <Input
                type="date"
                placeholder="End Date"
                value={filters.end_date || ""}
                onChange={(e) => handleFilterChange("end_date", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All ({totalCount})</TabsTrigger>
          <TabsTrigger value="confirmed">
            Confirmed ({bookingStats?.byStatus?.find((s: any) => s._id === "confirmed")?.count || 0})
          </TabsTrigger>
          <TabsTrigger value="checked_in">
            Checked In ({bookingStats?.byStatus?.find((s: any) => s._id === "checked_in")?.count || 0})
          </TabsTrigger>
          <TabsTrigger value="checked_out">
            Checked Out ({bookingStats?.byStatus?.find((s: any) => s._id === "checked_out")?.count || 0})
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Cancelled ({bookingStats?.byStatus?.find((s: any) => s._id === "cancelled")?.count || 0})
          </TabsTrigger>
          <TabsTrigger value="no_show">
            No Show ({bookingStats?.byStatus?.find((s: any) => s._id === "no_show")?.count || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {/* Reservations Table */}
          <Card>
            <CardHeader>
              <CardTitle>Reservations</CardTitle>
              <CardDescription>
                {filteredBookings.length} of {totalCount} reservations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredBookings.length === 0 ? (
                <EmptyState
                  icon={Calendar}
                  title="No reservations found"
                  description="No reservations match your current filters"
                />
              ) : (
                <div className="space-y-4">
                  <ScrollArea className="h-[600px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Confirmation</TableHead>
                          <TableHead>Guest</TableHead>
                          <TableHead>Room</TableHead>
                          <TableHead>Dates</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Payment</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Source</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredBookings.map((booking) => (
                          <TableRow key={booking._id}>
                            <TableCell>
                              <div className="font-mono text-sm">{booking.confirmation_number}</div>
                              <div className="text-xs text-muted-foreground">
                                {format(parseISO(booking.createdAt), "MMM dd, yyyy")}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div>
                                  <div className="font-medium">{booking.guest.full_name}</div>
                                  <div className="text-sm text-muted-foreground">{booking.guest.email}</div>
                                  {booking.guest.vip && (
                                    <Badge className="bg-purple-100 text-purple-800 text-xs">VIP</Badge>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">Room {booking.room.number}</div>
                              <div className="text-sm text-muted-foreground">{booking.room.room_type?.name}</div>
                              <div className="text-xs text-muted-foreground">Floor {booking.room.floor}</div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div>In: {format(parseISO(booking.check_in), "MMM dd")}</div>
                                <div>Out: {format(parseISO(booking.check_out), "MMM dd")}</div>
                                <div className="text-xs text-muted-foreground">
                                  {booking.duration} nights • {booking.number_of_guests} guests
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(booking.status)}</TableCell>
                            <TableCell>{getPaymentStatusBadge(booking.payment_status)}</TableCell>
                            <TableCell>
                              <div className="font-medium">${booking.total_amount.toFixed(2)}</div>
                              {booking.grand_total !== booking.total_amount && (
                                <div className="text-sm text-muted-foreground">
                                  Total: ${booking.grand_total.toFixed(2)}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {booking.booking_source}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedBooking(booking)
                                    setShowDetailsDialog(true)
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>

                                {booking.status === "confirmed" && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedBooking(booking)
                                      setShowCheckInDialog(true)
                                    }}
                                  >
                                    <UserCheck className="h-4 w-4" />
                                  </Button>
                                )}

                                {booking.status === "checked_in" && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedBooking(booking)
                                      setShowCheckOutDialog(true)
                                    }}
                                  >
                                    <UserX className="h-4 w-4" />
                                  </Button>
                                )}

                                {(booking.status === "confirmed" || booking.status === "checked_in") && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedBooking(booking)
                                      setEditForm(booking)
                                      setShowEditDialog(true)
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                )}

                                {booking.status !== "cancelled" && booking.status !== "checked_out" && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedBooking(booking)
                                      setShowCancelDialog(true)
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Page {filters.page || 1} of {totalPages}
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleFilterChange("page", (filters.page || 1) - 1)}
                          disabled={(filters.page || 1) <= 1}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleFilterChange("page", (filters.page || 1) + 1)}
                          disabled={(filters.page || 1) >= totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Check-In Dialog */}
      <Dialog open={showCheckInDialog} onOpenChange={setShowCheckInDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Check-In Guest</DialogTitle>
            <DialogDescription>Complete check-in process for {selectedBooking?.guest.full_name}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Deposit Information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="deposit_amount">Deposit Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={checkInForm.deposit_amount}
                  onChange={(e) =>
                    setCheckInForm((prev) => ({ ...prev, deposit_amount: Number.parseFloat(e.target.value) || 0 }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="deposit_payment_method">Payment Method</Label>
                <Select
                  value={checkInForm.deposit_payment_method}
                  onValueChange={(value) => setCheckInForm((prev) => ({ ...prev, deposit_payment_method: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Credit Card</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="mobile_payment">Mobile Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Key Cards and Parking */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="key_cards_issued">Key Cards Issued</Label>
                <Input
                  type="number"
                  min="1"
                  value={checkInForm.key_cards_issued}
                  onChange={(e) =>
                    setCheckInForm((prev) => ({ ...prev, key_cards_issued: Number.parseInt(e.target.value) || 1 }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="parking_space">Parking Space</Label>
                <Input
                  value={checkInForm.parking_space}
                  onChange={(e) => setCheckInForm((prev) => ({ ...prev, parking_space: e.target.value }))}
                  placeholder="e.g., P1-A15"
                />
              </div>
            </div>

            {/* Vehicle Details */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Vehicle Details (Optional)</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="license_plate">License Plate</Label>
                  <Input
                    value={checkInForm.vehicle_details.license_plate}
                    onChange={(e) =>
                      setCheckInForm((prev) => ({
                        ...prev,
                        vehicle_details: { ...prev.vehicle_details, license_plate: e.target.value },
                      }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="make">Make</Label>
                  <Input
                    value={checkInForm.vehicle_details.make}
                    onChange={(e) =>
                      setCheckInForm((prev) => ({
                        ...prev,
                        vehicle_details: { ...prev.vehicle_details, make: e.target.value },
                      }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="model">Model</Label>
                  <Input
                    value={checkInForm.vehicle_details.model}
                    onChange={(e) =>
                      setCheckInForm((prev) => ({
                        ...prev,
                        vehicle_details: { ...prev.vehicle_details, model: e.target.value },
                      }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="color">Color</Label>
                  <Input
                    value={checkInForm.vehicle_details.color}
                    onChange={(e) =>
                      setCheckInForm((prev) => ({
                        ...prev,
                        vehicle_details: { ...prev.vehicle_details, color: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Emergency Contact (Optional)</Label>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="emergency_name">Name</Label>
                  <Input
                    value={checkInForm.emergency_contact.name}
                    onChange={(e) =>
                      setCheckInForm((prev) => ({
                        ...prev,
                        emergency_contact: { ...prev.emergency_contact, name: e.target.value },
                      }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="emergency_phone">Phone</Label>
                  <Input
                    value={checkInForm.emergency_contact.phone}
                    onChange={(e) =>
                      setCheckInForm((prev) => ({
                        ...prev,
                        emergency_contact: { ...prev.emergency_contact, phone: e.target.value },
                      }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="emergency_relationship">Relationship</Label>
                  <Input
                    value={checkInForm.emergency_contact.relationship}
                    onChange={(e) =>
                      setCheckInForm((prev) => ({
                        ...prev,
                        emergency_contact: { ...prev.emergency_contact, relationship: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* Special Requests and Notes */}
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="special_requests">Special Requests</Label>
                <Textarea
                  value={checkInForm.special_requests}
                  onChange={(e) => setCheckInForm((prev) => ({ ...prev, special_requests: e.target.value }))}
                  placeholder="Any special requests..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Check-in Notes</Label>
                <Textarea
                  value={checkInForm.notes}
                  onChange={(e) => setCheckInForm((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes for check-in..."
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowCheckInDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCheckIn}>Complete Check-In</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Check-Out Dialog */}
      <Dialog open={showCheckOutDialog} onOpenChange={setShowCheckOutDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Check-Out Guest</DialogTitle>
            <DialogDescription>Complete check-out process for {selectedBooking?.guest.full_name}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Additional Charges */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Additional Charges</Label>
                <Button type="button" variant="outline" size="sm" onClick={addAdditionalCharge}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Charge
                </Button>
              </div>
              {checkOutForm.additional_charges.map((charge, index) => (
                <div key={index} className="grid grid-cols-4 gap-4 items-end">
                  <div className="grid gap-2">
                    <Label>Description</Label>
                    <Input
                      value={charge.description}
                      onChange={(e) => {
                        const newCharges = [...checkOutForm.additional_charges]
                        newCharges[index].description = e.target.value
                        setCheckOutForm((prev) => ({ ...prev, additional_charges: newCharges }))
                      }}
                      placeholder="e.g., Mini bar"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Amount</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={charge.amount}
                      onChange={(e) => {
                        const newCharges = [...checkOutForm.additional_charges]
                        newCharges[index].amount = Number.parseFloat(e.target.value) || 0
                        setCheckOutForm((prev) => ({ ...prev, additional_charges: newCharges }))
                      }}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Category</Label>
                    <Select
                      value={charge.category}
                      onValueChange={(value) => {
                        const newCharges = [...checkOutForm.additional_charges]
                        newCharges[index].category = value
                        setCheckOutForm((prev) => ({ ...prev, additional_charges: newCharges }))
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="food_beverage">Food & Beverage</SelectItem>
                        <SelectItem value="laundry">Laundry</SelectItem>
                        <SelectItem value="spa">Spa</SelectItem>
                        <SelectItem value="parking">Parking</SelectItem>
                        <SelectItem value="phone">Phone</SelectItem>
                        <SelectItem value="internet">Internet</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => removeAdditionalCharge(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Discounts */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Discounts</Label>
                <Button type="button" variant="outline" size="sm" onClick={addDiscount}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Discount
                </Button>
              </div>
              {checkOutForm.discounts.map((discount, index) => (
                <div key={index} className="grid grid-cols-4 gap-4 items-end">
                  <div className="grid gap-2">
                    <Label>Description</Label>
                    <Input
                      value={discount.description}
                      onChange={(e) => {
                        const newDiscounts = [...checkOutForm.discounts]
                        newDiscounts[index].description = e.target.value
                        setCheckOutForm((prev) => ({ ...prev, discounts: newDiscounts }))
                      }}
                      placeholder="e.g., Senior discount"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Amount</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={discount.amount}
                      onChange={(e) => {
                        const newDiscounts = [...checkOutForm.discounts]
                        newDiscounts[index].amount = Number.parseFloat(e.target.value) || 0
                        setCheckOutForm((prev) => ({ ...prev, discounts: newDiscounts }))
                      }}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Type</Label>
                    <Select
                      value={discount.type}
                      onValueChange={(value: "fixed" | "percentage") => {
                        const newDiscounts = [...checkOutForm.discounts]
                        newDiscounts[index].type = value
                        setCheckOutForm((prev) => ({ ...prev, discounts: newDiscounts }))
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                        <SelectItem value="percentage">Percentage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => removeDiscount(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Payment Information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="payment_method">Payment Method</Label>
                <Select
                  value={checkOutForm.payment_method}
                  onValueChange={(value) => setCheckOutForm((prev) => ({ ...prev, payment_method: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Credit Card</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="mobile_payment">Mobile Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="payment_amount">Payment Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={checkOutForm.payment_amount}
                  onChange={(e) =>
                    setCheckOutForm((prev) => ({ ...prev, payment_amount: Number.parseFloat(e.target.value) || 0 }))
                  }
                />
              </div>
            </div>

            {/* Notes */}
            <div className="grid gap-2">
              <Label htmlFor="checkout_notes">Check-out Notes</Label>
              <Textarea
                value={checkOutForm.notes}
                onChange={(e) => setCheckOutForm((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes for check-out..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowCheckOutDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCheckOut}>Complete Check-Out</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Booking Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Reservation Details</DialogTitle>
            <DialogDescription>
              Complete information for reservation {selectedBooking?.confirmation_number}
            </DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="grid gap-6 py-4">
              {/* Guest Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Guest Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-sm font-medium">Name</Label>
                    <p className="text-sm">{selectedBooking.guest.full_name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Email</Label>
                    <p className="text-sm">{selectedBooking.guest.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Phone</Label>
                    <p className="text-sm">{selectedBooking.guest.phone}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Nationality</Label>
                    <p className="text-sm">{selectedBooking.guest.nationality || "N/A"}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Booking Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Booking Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-sm font-medium">Confirmation Number</Label>
                    <p className="text-sm font-mono">{selectedBooking.confirmation_number}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <div className="mt-1">{getStatusBadge(selectedBooking.status)}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Check-in</Label>
                    <p className="text-sm">{format(parseISO(selectedBooking.check_in), "MMMM dd, yyyy")}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Check-out</Label>
                    <p className="text-sm">{format(parseISO(selectedBooking.check_out), "MMMM dd, yyyy")}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Duration</Label>
                    <p className="text-sm">{selectedBooking.duration} nights</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Guests</Label>
                    <p className="text-sm">{selectedBooking.number_of_guests}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Booking Source</Label>
                    <p className="text-sm capitalize">{selectedBooking.booking_source}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Created</Label>
                    <p className="text-sm">{format(parseISO(selectedBooking.createdAt), "MMM dd, yyyy HH:mm")}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Room Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bed className="h-5 w-5" />
                    Room Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-sm font-medium">Room Number</Label>
                    <p className="text-sm">{selectedBooking.room.number}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Room Type</Label>
                    <p className="text-sm">{selectedBooking.room.room_type?.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Floor</Label>
                    <p className="text-sm">{selectedBooking.room.floor}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Building</Label>
                    <p className="text-sm">{selectedBooking.room.building || "N/A"}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Financial Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Financial Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-sm font-medium">Room Amount</Label>
                    <p className="text-sm">${selectedBooking.total_amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Tax ({selectedBooking.tax_rate}%)</Label>
                    <p className="text-sm">${selectedBooking.tax_amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Discount</Label>
                    <p className="text-sm">${selectedBooking.discount?.toFixed(2) || "0.00"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Grand Total</Label>
                    <p className="text-sm font-bold">${selectedBooking.grand_total.toFixed(2)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Payment Status</Label>
                    <div className="mt-1">{getPaymentStatusBadge(selectedBooking.payment_status)}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Payment Method</Label>
                    <p className="text-sm">{selectedBooking.payment_method || "N/A"}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Special Requests */}
              {selectedBooking.special_requests && (
                <Card>
                  <CardHeader>
                    <CardTitle>Special Requests</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{selectedBooking.special_requests}</p>
                  </CardContent>
                </Card>
              )}

              {/* Additional Charges */}
              {selectedBooking.additional_charges && selectedBooking.additional_charges.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Additional Charges</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedBooking.additional_charges.map((charge, index) => (
                        <div key={index} className="flex justify-between items-center p-2 border rounded">
                          <div>
                            <p className="text-sm font-medium">{charge.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(parseISO(charge.date), "MMM dd, yyyy")}
                            </p>
                          </div>
                          <p className="text-sm font-bold">${charge.amount.toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Booking Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Reservation</DialogTitle>
            <DialogDescription>Update reservation details for {selectedBooking?.confirmation_number}</DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="grid gap-6 py-4">
              {/* Similar form fields as create, but pre-populated with editForm values */}
              <div className="grid gap-2">
                <Label htmlFor="modification_notes">Modification Notes</Label>
                <Textarea
                  value={editForm.modification_notes || ""}
                  onChange={(e) => setEditForm((prev: any) => ({ ...prev, modification_notes: e.target.value }))}
                  placeholder="Reason for modification..."
                />
              </div>

              {/* Add other editable fields here */}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateBooking}>Update Reservation</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Booking Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Reservation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel reservation {selectedBooking?.confirmation_number}? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="grid gap-2 py-4">
            <Label htmlFor="cancellation_reason">Cancellation Reason *</Label>
            <Textarea
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              placeholder="Please provide a reason for cancellation..."
              required
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Keep Reservation</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelBooking} className="bg-red-600 hover:bg-red-700">
              Cancel Reservation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
