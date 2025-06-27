"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Calendar,
  Users,
  Bed,
  DollarSign,
  Search,
  Plus,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Building,
  MapPin,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { format, differenceInDays } from "date-fns"
import { useBookings, type CreateBookingData } from "@/hooks/use-bookings"
import { useGuests } from "@/hooks/use-guests"
import { useRoomTypes } from "@/hooks/use-room-types"
import { toast } from "sonner"

export default function NewReservationPage() {
  const router = useRouter()
  const { createBooking, getAvailableRooms, availableRooms, isLoading } = useBookings()
  const { getGuests, guests } = useGuests()
  const { getRoomTypes, roomTypes } = useRoomTypes()

  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<CreateBookingData>({
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

  const [selectedRoom, setSelectedRoom] = useState<any>(null)
  const [selectedGuest, setSelectedGuest] = useState<any>(null)
  const [roomSearchFilters, setRoomSearchFilters] = useState({
    room_type: "",
    capacity: "",
    floor: "",
    building: "",
    view: "",
  })

  useEffect(() => {
    // Load supporting data
    getGuests({ limit: 100 })
    getRoomTypes()
  }, [])

  useEffect(() => {
    // Calculate total amount when room or dates change
    if (selectedRoom && formData.check_in && formData.check_out) {
      const nights = differenceInDays(new Date(formData.check_out), new Date(formData.check_in))
      const roomAmount = selectedRoom.room_type?.base_price * nights
      const taxAmount = (roomAmount * formData.tax_rate) / 100
      const totalAmount = roomAmount + taxAmount - (formData.discount || 0)

      setFormData((prev) => ({
        ...prev,
        total_amount: Math.max(0, totalAmount),
      }))
    }
  }, [selectedRoom, formData.check_in, formData.check_out, formData.tax_rate, formData.discount])

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSearchRooms = async () => {
    if (!formData.check_in || !formData.check_out) {
      toast.error("Please select check-in and check-out dates")
      return
    }

    if (new Date(formData.check_in) >= new Date(formData.check_out)) {
      toast.error("Check-out date must be after check-in date")
      return
    }

    try {
      await getAvailableRooms({
        check_in: formData.check_in,
        check_out: formData.check_out,
        capacity: formData.number_of_guests,
        ...roomSearchFilters,
      })
      setStep(2)
    } catch (error) {
      console.error("Error searching rooms:", error)
      toast.error("Failed to search available rooms")
    }
  }

  const handleRoomSelect = (room: any) => {
    setSelectedRoom(room)
    setFormData((prev) => ({
      ...prev,
      room: room._id,
    }))
    setStep(3)
  }

  const handleGuestSelect = (guestId: string) => {
    const guest = guests.find((g) => g._id === guestId)
    setSelectedGuest(guest)
    setFormData((prev) => ({
      ...prev,
      guest: guestId,
    }))
  }

  const handleCreateReservation = async () => {
    try {
      if (!formData.guest || !formData.room || !formData.check_in || !formData.check_out) {
        toast.error("Please fill in all required fields")
        return
      }

      await createBooking(formData)
      toast.success("Reservation created successfully")
      router.push("/frontdesk/reservations")
    } catch (error: any) {
      console.error("Error creating reservation:", error)
      toast.error(error.response?.data?.message || "Failed to create reservation")
    }
  }

  const calculateNights = () => {
    if (!formData.check_in || !formData.check_out) return 0
    return differenceInDays(new Date(formData.check_out), new Date(formData.check_in))
  }

  const calculateSubtotal = () => {
    if (!selectedRoom) return 0
    return selectedRoom.room_type?.base_price * calculateNights()
  }

  const calculateTax = () => {
    return (calculateSubtotal() * formData.tax_rate) / 100
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() - (formData.discount || 0)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/frontdesk/reservations">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Reservations
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Reservation</h1>
          <p className="text-muted-foreground">Create a new hotel reservation</p>
        </div>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-2 ${step >= 1 ? "text-primary" : "text-muted-foreground"}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted"}`}
              >
                1
              </div>
              <span className="font-medium">Dates & Guests</span>
            </div>
            <Separator className="flex-1 mx-4" />
            <div className={`flex items-center gap-2 ${step >= 2 ? "text-primary" : "text-muted-foreground"}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted"}`}
              >
                2
              </div>
              <span className="font-medium">Select Room</span>
            </div>
            <Separator className="flex-1 mx-4" />
            <div className={`flex items-center gap-2 ${step >= 3 ? "text-primary" : "text-muted-foreground"}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? "bg-primary text-primary-foreground" : "bg-muted"}`}
              >
                3
              </div>
              <span className="font-medium">Guest & Details</span>
            </div>
            <Separator className="flex-1 mx-4" />
            <div className={`flex items-center gap-2 ${step >= 4 ? "text-primary" : "text-muted-foreground"}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 4 ? "bg-primary text-primary-foreground" : "bg-muted"}`}
              >
                4
              </div>
              <span className="font-medium">Confirmation</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Dates & Guests */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Select Dates & Number of Guests
            </CardTitle>
            <CardDescription>Choose your check-in and check-out dates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="check_in">Check-in Date *</Label>
                <Input
                  type="date"
                  id="check_in"
                  value={formData.check_in}
                  onChange={(e) => handleInputChange("check_in", e.target.value)}
                  min={format(new Date(), "yyyy-MM-dd")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="check_out">Check-out Date *</Label>
                <Input
                  type="date"
                  id="check_out"
                  value={formData.check_out}
                  onChange={(e) => handleInputChange("check_out", e.target.value)}
                  min={formData.check_in || format(new Date(), "yyyy-MM-dd")}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="number_of_guests">Number of Guests *</Label>
                <Input
                  type="number"
                  id="number_of_guests"
                  min="1"
                  max="10"
                  value={formData.number_of_guests}
                  onChange={(e) => handleInputChange("number_of_guests", Number.parseInt(e.target.value) || 1)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="booking_source">Booking Source</Label>
                <Select
                  value={formData.booking_source}
                  onValueChange={(value) => handleInputChange("booking_source", value)}
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

            {/* Room Search Filters */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Room Preferences (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Room Type</Label>
                  <Select
                    value={roomSearchFilters.room_type}
                    onValueChange={(value) => setRoomSearchFilters((prev) => ({ ...prev, room_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any room type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any room type</SelectItem>
                      {roomTypes.map((type) => (
                        <SelectItem key={type._id} value={type._id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Floor</Label>
                  <Input
                    placeholder="Any floor"
                    value={roomSearchFilters.floor}
                    onChange={(e) => setRoomSearchFilters((prev) => ({ ...prev, floor: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Building</Label>
                  <Input
                    placeholder="Any building"
                    value={roomSearchFilters.building}
                    onChange={(e) => setRoomSearchFilters((prev) => ({ ...prev, building: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {formData.check_in && formData.check_out && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Stay Duration</p>
                    <p className="text-sm text-muted-foreground">
                      {calculateNights()} nights • {formData.number_of_guests} guests
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(formData.check_in), "MMM dd")} - {format(new Date(formData.check_out), "MMM dd")}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button onClick={handleSearchRooms} disabled={!formData.check_in || !formData.check_out}>
                <Search className="mr-2 h-4 w-4" />
                Search Available Rooms
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Room Selection */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bed className="h-5 w-5" />
              Select Room
            </CardTitle>
            <CardDescription>
              {availableRooms.length} rooms available for {format(new Date(formData.check_in), "MMM dd")} -{" "}
              {format(new Date(formData.check_out), "MMM dd")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {availableRooms.length === 0 ? (
              <div className="text-center py-8">
                <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No rooms available</h3>
                <p className="text-muted-foreground">
                  No rooms match your criteria for the selected dates. Please try different dates or preferences.
                </p>
                <Button variant="outline" className="mt-4 bg-transparent" onClick={() => setStep(1)}>
                  Change Dates
                </Button>
              </div>
            ) : (
              <ScrollArea className="h-[600px]">
                <div className="grid gap-4">
                  {availableRooms.map((room) => (
                    <Card
                      key={room._id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleRoomSelect(room)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-medium">Room {room.number}</h3>
                              <Badge variant="outline">{room.room_type?.category}</Badge>
                            </div>
                            <p className="text-muted-foreground">{room.room_type?.name}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Building className="h-4 w-4" />
                                Floor {room.floor}
                              </span>
                              {room.building && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {room.building}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                Max {room.max_occupancy} guests
                              </span>
                            </div>
                            {room.amenities && room.amenities.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {room.amenities.slice(0, 3).map((amenity: string, index: number) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {amenity}
                                  </Badge>
                                ))}
                                {room.amenities.length > 3 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{room.amenities.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold">${room.room_type?.base_price}</p>
                            <p className="text-sm text-muted-foreground">per night</p>
                            <p className="text-lg font-medium mt-2">
                              ${(room.room_type?.base_price * calculateNights()).toFixed(2)} total
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}

            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back to Dates
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Guest & Details */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Guest Information & Booking Details
            </CardTitle>
            <CardDescription>Select guest and add booking details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Selected Room Summary */}
            {selectedRoom && (
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2">Selected Room</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      Room {selectedRoom.number} - {selectedRoom.room_type?.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Floor {selectedRoom.floor} • {calculateNights()} nights
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${(selectedRoom.room_type?.base_price * calculateNights()).toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">${selectedRoom.room_type?.base_price}/night</p>
                  </div>
                </div>
              </div>
            )}

            {/* Guest Selection */}
            <div className="space-y-2">
              <Label htmlFor="guest">Select Guest *</Label>
              <Select value={formData.guest} onValueChange={handleGuestSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a guest" />
                </SelectTrigger>
                <SelectContent>
                  {guests.map((guest) => (
                    <SelectItem key={guest._id} value={guest._id}>
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="font-medium">{guest.full_name}</p>
                          <p className="text-sm text-muted-foreground">{guest.email}</p>
                        </div>
                        {guest.vip && <Badge className="bg-purple-100 text-purple-800">VIP</Badge>}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex justify-end">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/frontdesk/guests/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Guest
                  </Link>
                </Button>
              </div>
            </div>

            {/* Payment Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="payment_status">Payment Status</Label>
                <Select
                  value={formData.payment_status}
                  onValueChange={(value) => handleInputChange("payment_status", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="partial">Partial Payment</SelectItem>
                    <SelectItem value="paid">Paid in Full</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment_method">Payment Method</Label>
                <Select
                  value={formData.payment_method}
                  onValueChange={(value) => handleInputChange("payment_method", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="debit_card">Debit Card</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="mobile_money">Mobile Money</SelectItem>
                    <SelectItem value="online">Online Payment</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Pricing Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="tax_rate">Tax Rate (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.tax_rate}
                  onChange={(e) => handleInputChange("tax_rate", Number.parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount">Discount Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.discount}
                  onChange={(e) => handleInputChange("discount", Number.parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount_reason">Discount Reason</Label>
                <Input
                  value={formData.discount_reason}
                  onChange={(e) => handleInputChange("discount_reason", e.target.value)}
                  placeholder="Reason for discount"
                />
              </div>
            </div>

            {/* Special Requests */}
            <div className="space-y-2">
              <Label htmlFor="special_requests">Special Requests</Label>
              <Textarea
                value={formData.special_requests}
                onChange={(e) => handleInputChange("special_requests", e.target.value)}
                placeholder="Any special requests or notes..."
                rows={3}
              />
            </div>

            {/* Group/Corporate Booking */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_group_booking"
                  checked={formData.is_group_booking}
                  onCheckedChange={(checked) => handleInputChange("is_group_booking", !!checked)}
                />
                <Label htmlFor="is_group_booking">Group Booking</Label>
              </div>
              {formData.is_group_booking && (
                <div className="space-y-2">
                  <Label htmlFor="group_id">Group ID</Label>
                  <Input
                    value={formData.group_id}
                    onChange={(e) => handleInputChange("group_id", e.target.value)}
                    placeholder="Enter group identifier"
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_corporate"
                  checked={formData.is_corporate}
                  onCheckedChange={(checked) => handleInputChange("is_corporate", !!checked)}
                />
                <Label htmlFor="is_corporate">Corporate Booking</Label>
              </div>
            </div>

            {/* Pricing Summary */}
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <h3 className="font-medium">Pricing Summary</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Room ({calculateNights()} nights)</span>
                  <span>${calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax ({formData.tax_rate}%)</span>
                  <span>${calculateTax().toFixed(2)}</span>
                </div>
                {formData.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-${formData.discount.toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total Amount</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back to Rooms
              </Button>
              <Button onClick={() => setStep(4)} disabled={!formData.guest}>
                Review & Confirm
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Confirmation */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Review & Confirm Reservation
            </CardTitle>
            <CardDescription>Please review all details before confirming</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Booking Summary */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Guest Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Guest Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {selectedGuest && (
                    <>
                      <div>
                        <Label className="text-sm font-medium">Name</Label>
                        <p className="text-sm">{selectedGuest.full_name}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Email</Label>
                        <p className="text-sm">{selectedGuest.email}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Phone</Label>
                        <p className="text-sm">{selectedGuest.phone}</p>
                      </div>
                      {selectedGuest.vip && <Badge className="bg-purple-100 text-purple-800">VIP Guest</Badge>}
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Room Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Room Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {selectedRoom && (
                    <>
                      <div>
                        <Label className="text-sm font-medium">Room</Label>
                        <p className="text-sm">Room {selectedRoom.number}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Type</Label>
                        <p className="text-sm">{selectedRoom.room_type?.name}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Floor</Label>
                        <p className="text-sm">{selectedRoom.floor}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Rate</Label>
                        <p className="text-sm">${selectedRoom.room_type?.base_price}/night</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Booking Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Booking Details</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-sm font-medium">Check-in</Label>
                  <p className="text-sm">{format(new Date(formData.check_in), "MMMM dd, yyyy")}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Check-out</Label>
                  <p className="text-sm">{format(new Date(formData.check_out), "MMMM dd, yyyy")}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Duration</Label>
                  <p className="text-sm">{calculateNights()} nights</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Guests</Label>
                  <p className="text-sm">{formData.number_of_guests}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Booking Source</Label>
                  <p className="text-sm capitalize">{formData.booking_source}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Payment Status</Label>
                  <p className="text-sm capitalize">{formData.payment_status}</p>
                </div>
              </CardContent>
            </Card>

            {/* Special Requests */}
            {formData.special_requests && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Special Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{formData.special_requests}</p>
                </CardContent>
              </Card>
            )}

            {/* Final Pricing */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Pricing Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>
                      Room charges ({calculateNights()} nights × ${selectedRoom?.room_type?.base_price})
                    </span>
                    <span>${calculateSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax ({formData.tax_rate}%)</span>
                    <span>${calculateTax().toFixed(2)}</span>
                  </div>
                  {formData.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount {formData.discount_reason && `(${formData.discount_reason})`}</span>
                      <span>-${formData.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(3)}>
                Back to Details
              </Button>
              <Button onClick={handleCreateReservation} disabled={isLoading}>
                {isLoading ? "Creating..." : "Confirm Reservation"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
