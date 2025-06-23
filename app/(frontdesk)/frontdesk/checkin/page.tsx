"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { Search, UserCheck, Plus, Bed, RefreshCw } from "lucide-react"
import { RegistrationDocumentDialog } from "@/components/frontdesk/registration-document-dialog"
import { CreateGuestDialog } from "@/components/frontdesk/create-guest-dialog"
import { BookingSearchPanel } from "@/components/frontdesk/booking-search-panel"
import { RoomSelectionPanel } from "@/components/frontdesk/room-selection-panel"
import { CheckInDetailsPanel } from "@/components/frontdesk/checkin-details-panel"
import { ReceiptDialog } from "@/components/frontdesk/receipt-dialog"
import { InvoiceDialog } from "@/components/frontdesk/invoice-dialog"
import { useCheckInApi } from "@/hooks/use-checkin-api"
import { useGuests } from "@/hooks/use-guests"
import { useRooms } from "@/hooks/use-rooms"
import { useRealtimeUpdates } from "@/hooks/use-realtime-updates"
import { useBookings } from "@/hooks/use-bookings"

export default function CheckInPage() {
  const [activeTab, setActiveTab] = useState("search")
  const [selectedBooking, setSelectedBooking] = useState<any>(null)
  const [selectedGuest, setSelectedGuest] = useState<any>(null)
  const [selectedRoom, setSelectedRoom] = useState<any>(null)
  const [checkInData, setCheckInData] = useState({
    keyCards: 2,
    specialRequests: "",
    arrivalNotes: "",
    depositAmount: 0,
    emergencyContact: {
      name: "",
      phone: "",
      relationship: "",
    },
  })

  // Dialog states
  const [showRegistrationDialog, setShowRegistrationDialog] = useState(false)
  const [showCreateGuestDialog, setShowCreateGuestDialog] = useState(false)
  const [showReceiptDialog, setShowReceiptDialog] = useState(false)
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false)
  const [registrationData, setRegistrationData] = useState<any>(null)
  const [receiptData, setReceiptData] = useState<any>(null)
  const [invoiceData, setInvoiceData] = useState<any>(null)

  // API hooks
  const { checkInGuest, getCurrentOccupancy, isLoading: checkInLoading } = useCheckInApi()
  const { getGuests, createGuest, isLoading: guestsLoading } = useGuests()
  const { rooms, fetchRooms, fetchAvailableRooms, isLoading: roomsLoading } = useRooms()
  const { bookings, getBookings, isLoading: bookingsLoading } = useBookings()

  // State for bookings and guests data
  const [guests, setGuests] = useState<any[]>([])

  // Real-time updates
  useRealtimeUpdates({
    onBookingUpdate: () => getBookings({ status: "confirmed" }),
    onRoomUpdate: () => fetchRooms(),
    onCheckInUpdate: () => getCurrentOccupancy(),
  })

  // Load initial data
  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      // Load bookings using the hook
      await getBookings({ status: "confirmed" })

      // Load guests
      const guestsResponse = await getGuests({ limit: 100 })
      if (guestsResponse.data) {
        setGuests(guestsResponse.data.data || [])
      }

      // Load rooms
      await fetchRooms()
      await getCurrentOccupancy()
    } catch (error) {
      toast.error("Failed to load initial data")
    }
  }

  const handleBookingSelect = (booking: any) => {
    setSelectedBooking(booking)
    setSelectedGuest(booking.guest)
    setActiveTab("rooms")

    // Search for available rooms based on booking requirements
    searchAvailableRooms({
      check_in: booking.check_in,
      check_out: booking.check_out,
      guests: booking.number_of_guests,
      room_type: booking.room_type_id,
    })
  }

  const handleGuestSelect = (guest: any) => {
    setSelectedGuest(guest)
    setSelectedBooking(null)
    setActiveTab("rooms")
  }

  const handleRoomSelect = (room: any) => {
    setSelectedRoom(room)
    setActiveTab("details")
  }

  const searchAvailableRooms = async (params: any) => {
    try {
      const rooms = await fetchAvailableRooms(params.check_in, params.check_out, {
        room_type: params.room_type,
      })
      return rooms
    } catch (error) {
      toast.error("Failed to search available rooms")
      return []
    }
  }

  const handleCreateGuest = async (guestData: any) => {
    try {
      const newGuest = await createGuest(guestData)
      setSelectedGuest(newGuest)
      setShowCreateGuestDialog(false)
      setActiveTab("rooms")
      toast.success("Guest created successfully")
    } catch (error) {
      toast.error("Failed to create guest")
    }
  }

  const handleCheckIn = async () => {
    if (!selectedGuest || !selectedRoom) {
      toast.error("Please select a guest and room")
      return
    }

    // Prepare registration data
    const regData = {
      booking: selectedBooking,
      guest: selectedGuest,
      room: selectedRoom,
      checkInData,
      hotel: {
        name: "Grand Hotel", // From configuration
        address: "123 Main Street, City, State 12345",
        phone: "+1-555-0100",
        email: "info@grandhotel.com",
      },
      checkInDate: new Date().toISOString(),
      staff: {
        name: "Front Desk Agent", // From current user
        id: "FD001",
      },
    }

    setRegistrationData(regData)
    setShowRegistrationDialog(true)
  }

  const handleCompleteCheckIn = async (completeCheckInData: any) => {
    try {
      const checkInResult = await checkInGuest(completeCheckInData)

      // Show receipt
      setReceiptData(checkInResult)
      setShowReceiptDialog(true)

      // Reset form
      resetForm()
      setShowRegistrationDialog(false)

      toast.success("Check-in completed successfully!")
    } catch (error) {
      toast.error("Failed to complete check-in")
    }
  }

  const resetForm = () => {
    setSelectedBooking(null)
    setSelectedGuest(null)
    setSelectedRoom(null)
    setCheckInData({
      keyCards: 2,
      specialRequests: "",
      arrivalNotes: "",
      depositAmount: 0,
      emergencyContact: {
        name: "",
        phone: "",
        relationship: "",
      },
    })
    setActiveTab("search")
  }

  const handlePrintReceipt = (checkInData: any) => {
    setReceiptData(checkInData)
    setShowReceiptDialog(true)
  }

  const handlePrintInvoice = (checkInData: any) => {
    setInvoiceData(checkInData)
    setShowInvoiceDialog(true)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Guest Check-in</h1>
          <p className="text-muted-foreground">Process guest arrivals and room assignments</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadInitialData} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateGuestDialog(true)} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Guest
          </Button>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg">
        <div
          className={`flex items-center space-x-2 ${activeTab === "search" ? "text-primary" : "text-muted-foreground"}`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${activeTab === "search" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
          >
            <Search className="h-4 w-4" />
          </div>
          <span className="text-sm font-medium">Find Guest</span>
        </div>
        <div className="flex-1 h-px bg-border" />
        <div
          className={`flex items-center space-x-2 ${activeTab === "rooms" ? "text-primary" : "text-muted-foreground"}`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${activeTab === "rooms" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
          >
            <Bed className="h-4 w-4" />
          </div>
          <span className="text-sm font-medium">Select Room</span>
        </div>
        <div className="flex-1 h-px bg-border" />
        <div
          className={`flex items-center space-x-2 ${activeTab === "details" ? "text-primary" : "text-muted-foreground"}`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${activeTab === "details" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
          >
            <UserCheck className="h-4 w-4" />
          </div>
          <span className="text-sm font-medium">Complete Check-in</span>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="search">Find Guest/Booking</TabsTrigger>
          <TabsTrigger value="rooms" disabled={!selectedGuest}>
            Select Room
          </TabsTrigger>
          <TabsTrigger value="details" disabled={!selectedRoom}>
            Check-in Details
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-6">
          <BookingSearchPanel
            bookings={bookings}
            guests={guests}
            onBookingSelect={handleBookingSelect}
            onGuestSelect={handleGuestSelect}
            isLoading={bookingsLoading || guestsLoading}
          />
        </TabsContent>

        <TabsContent value="rooms" className="space-y-6">
          <RoomSelectionPanel
            rooms={rooms}
            selectedGuest={selectedGuest}
            selectedBooking={selectedBooking}
            onRoomSelect={handleRoomSelect}
            onSearchRooms={searchAvailableRooms}
            isLoading={roomsLoading}
          />
        </TabsContent>

        <TabsContent value="details" className="space-y-6">
          <CheckInDetailsPanel
            selectedGuest={selectedGuest}
            selectedBooking={selectedBooking}
            selectedRoom={selectedRoom}
            checkInData={checkInData}
            onCheckInDataChange={setCheckInData}
            onCheckIn={handleCheckIn}
            onPrintReceipt={handlePrintReceipt}
            onPrintInvoice={handlePrintInvoice}
            isLoading={checkInLoading}
          />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <RegistrationDocumentDialog
        open={showRegistrationDialog}
        onOpenChange={setShowRegistrationDialog}
        registrationData={registrationData}
        onConfirm={handleCompleteCheckIn}
      />

      <CreateGuestDialog
        open={showCreateGuestDialog}
        onOpenChange={setShowCreateGuestDialog}
        onCreateGuest={handleCreateGuest}
      />

      <ReceiptDialog open={showReceiptDialog} onOpenChange={setShowReceiptDialog} receiptData={receiptData} />

      <InvoiceDialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog} invoiceData={invoiceData} />
    </div>
  )
}
