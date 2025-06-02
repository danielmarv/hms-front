"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { Search, UserCheck, Phone, Mail, Calendar, Users } from "lucide-react"
import { triggerCheckIn } from "@/lib/workflow-coordinator"

export default function CheckInPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedBooking, setSelectedBooking] = useState<any>(null)
  const [checkInData, setCheckInData] = useState({
    roomNumber: "",
    keyCards: 2,
    specialRequests: "",
    arrivalNotes: "",
    paymentMethod: "",
    depositAmount: 0,
  })

  const [bookings, setBookings] = useState([
    {
      id: "BK001",
      confirmationNumber: "HTL-2025-001",
      guest: {
        name: "John Smith",
        email: "john.smith@email.com",
        phone: "+1-555-0123",
        avatar: null,
      },
      checkIn: "2025-01-25",
      checkOut: "2025-01-28",
      roomType: "Deluxe King",
      guests: 2,
      status: "confirmed",
      totalAmount: 450.0,
      specialRequests: "Late check-in, high floor preferred",
      paymentStatus: "deposit_paid",
    },
    {
      id: "BK002",
      confirmationNumber: "HTL-2025-002",
      guest: {
        name: "Sarah Johnson",
        email: "sarah.j@email.com",
        phone: "+1-555-0124",
        avatar: null,
      },
      checkIn: "2025-01-25",
      checkOut: "2025-01-27",
      roomType: "Suite",
      guests: 1,
      status: "confirmed",
      totalAmount: 680.0,
      specialRequests: "VIP guest, welcome amenities",
      paymentStatus: "pending",
    },
  ])

  const [availableRooms, setAvailableRooms] = useState([
    { number: "301", type: "Deluxe King", floor: 3, status: "clean" },
    { number: "305", type: "Deluxe King", floor: 3, status: "clean" },
    { number: "501", type: "Suite", floor: 5, status: "clean" },
    { number: "502", type: "Suite", floor: 5, status: "clean" },
  ])

  const filteredBookings = bookings.filter(
    (booking) =>
      booking.guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.confirmationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.guest.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleBookingSelect = (booking: any) => {
    setSelectedBooking(booking)
    // Auto-suggest room based on room type
    const suitableRoom = availableRooms.find((room) => room.type === booking.roomType && room.status === "clean")
    if (suitableRoom) {
      setCheckInData((prev) => ({ ...prev, roomNumber: suitableRoom.number }))
    }
  }

  const handleCheckIn = async () => {
    if (!selectedBooking || !checkInData.roomNumber) {
      toast.error("Please select a booking and room")
      return
    }

    try {
      // Trigger check-in workflow
      await triggerCheckIn({
        bookingId: selectedBooking.id,
        guestId: selectedBooking.guest.id,
        roomId: checkInData.roomNumber,
        keyCards: checkInData.keyCards,
        specialRequests: checkInData.specialRequests,
        arrivalNotes: checkInData.arrivalNotes,
        paymentMethod: checkInData.paymentMethod,
        depositAmount: checkInData.depositAmount,
      })

      toast.success("Check-in completed successfully!")

      // Reset form
      setSelectedBooking(null)
      setCheckInData({
        roomNumber: "",
        keyCards: 2,
        specialRequests: "",
        arrivalNotes: "",
        paymentMethod: "",
        depositAmount: 0,
      })
      setSearchQuery("")
    } catch (error) {
      console.error("Check-in error:", error)
      toast.error("Failed to complete check-in")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "deposit_paid":
        return <Badge className="bg-blue-100 text-blue-800">Deposit Paid</Badge>
      case "paid":
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Guest Check-in</h1>
          <p className="text-muted-foreground">Process guest arrivals and room assignments</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Booking Search */}
        <Card>
          <CardHeader>
            <CardTitle>Find Reservation</CardTitle>
            <CardDescription>Search by guest name, confirmation number, or email</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reservations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {filteredBookings.map((booking) => (
                <div
                  key={booking.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedBooking?.id === booking.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                  }`}
                  onClick={() => handleBookingSelect(booking)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={booking.guest.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {booking.guest.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{booking.guest.name}</h3>
                        <p className="text-sm text-muted-foreground">{booking.confirmationNumber}</p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {booking.checkIn} - {booking.checkOut}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {booking.guests} guests
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {getStatusBadge(booking.status)}
                      {getPaymentStatusBadge(booking.paymentStatus)}
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{booking.roomType}</span>
                      <span className="text-sm font-bold">${booking.totalAmount}</span>
                    </div>
                    {booking.specialRequests && (
                      <p className="text-xs text-muted-foreground mt-1">{booking.specialRequests}</p>
                    )}
                  </div>
                </div>
              ))}

              {filteredBookings.length === 0 && searchQuery && (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-4" />
                  <p>No reservations found</p>
                  <p className="text-sm">Try a different search term</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Check-in Details */}
        <Card>
          <CardHeader>
            <CardTitle>Check-in Details</CardTitle>
            <CardDescription>
              {selectedBooking
                ? `Complete check-in for ${selectedBooking.guest.name}`
                : "Select a reservation to begin check-in"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedBooking ? (
              <Tabs defaultValue="room" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="room">Room</TabsTrigger>
                  <TabsTrigger value="payment">Payment</TabsTrigger>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                </TabsList>

                <TabsContent value="room" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="roomNumber">Assign Room</Label>
                    <Select
                      value={checkInData.roomNumber}
                      onValueChange={(value) => setCheckInData((prev) => ({ ...prev, roomNumber: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select room" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableRooms
                          .filter((room) => room.type === selectedBooking.roomType)
                          .map((room) => (
                            <SelectItem key={room.number} value={room.number}>
                              Room {room.number} - Floor {room.floor} ({room.status})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="keyCards">Number of Key Cards</Label>
                    <Select
                      value={checkInData.keyCards.toString()}
                      onValueChange={(value) =>
                        setCheckInData((prev) => ({ ...prev, keyCards: Number.parseInt(value) }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Key Card</SelectItem>
                        <SelectItem value="2">2 Key Cards</SelectItem>
                        <SelectItem value="3">3 Key Cards</SelectItem>
                        <SelectItem value="4">4 Key Cards</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedBooking.specialRequests && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <h4 className="text-sm font-medium text-blue-900 mb-1">Special Requests</h4>
                      <p className="text-sm text-blue-800">{selectedBooking.specialRequests}</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="payment" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Payment Method</Label>
                    <Select
                      value={checkInData.paymentMethod}
                      onValueChange={(value) => setCheckInData((prev) => ({ ...prev, paymentMethod: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="credit_card">Credit Card</SelectItem>
                        <SelectItem value="debit_card">Debit Card</SelectItem>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="depositAmount">Additional Deposit</Label>
                    <Input
                      id="depositAmount"
                      type="number"
                      placeholder="0.00"
                      value={checkInData.depositAmount || ""}
                      onChange={(e) =>
                        setCheckInData((prev) => ({
                          ...prev,
                          depositAmount: Number.parseFloat(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>

                  <div className="p-3 bg-background rounded-lg">
                    <h4 className="text-sm font-medium mb-2">Payment Summary</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Total Amount:</span>
                        <span>${selectedBooking.totalAmount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Payment Status:</span>
                        <span>{selectedBooking.paymentStatus.replace("_", " ")}</span>
                      </div>
                      {checkInData.depositAmount > 0 && (
                        <div className="flex justify-between">
                          <span>Additional Deposit:</span>
                          <span>${checkInData.depositAmount}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="notes" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="arrivalNotes">Arrival Notes</Label>
                    <Textarea
                      id="arrivalNotes"
                      placeholder="Any notes about the guest's arrival..."
                      value={checkInData.arrivalNotes}
                      onChange={(e) => setCheckInData((prev) => ({ ...prev, arrivalNotes: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specialRequests">Additional Special Requests</Label>
                    <Textarea
                      id="specialRequests"
                      placeholder="Any additional requests or preferences..."
                      value={checkInData.specialRequests}
                      onChange={(e) => setCheckInData((prev) => ({ ...prev, specialRequests: e.target.value }))}
                    />
                  </div>

                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <h4 className="text-sm font-medium text-yellow-900 mb-1">Guest Information</h4>
                    <div className="space-y-1 text-sm text-yellow-800">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        {selectedBooking.guest.email}
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        {selectedBooking.guest.phone}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <Separator />

                <div className="flex gap-2">
                  <Button onClick={handleCheckIn} className="flex-1" disabled={!checkInData.roomNumber}>
                    <UserCheck className="mr-2 h-4 w-4" />
                    Complete Check-in
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedBooking(null)}>
                    Cancel
                  </Button>
                </div>
              </Tabs>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <UserCheck className="h-12 w-12 mx-auto mb-4" />
                <p>Select a reservation to begin check-in</p>
                <p className="text-sm">Search for the guest's booking above</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
