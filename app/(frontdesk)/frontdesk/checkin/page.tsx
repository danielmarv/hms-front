"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { Search, UserCheck, Plus, Bed, RefreshCw } from "lucide-react"
import RegistrationDocumentDialog from "@/components/frontdesk/registration-document-dialog"
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
import { useCurrentHotel } from "@/hooks/use-current-hotel"
import { useAuth } from "@/hooks/use-auth"

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
    depositPaymentMethod: "",
    numberOfGuests: 1,
    numberOfNights: 1,
    parkingSpace: "",
    vehicleDetails: {
      license_plate: "",
      make: "",
      model: "",
      color: "",
    },
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
  const { hotel, configuration, effectiveConfig, isLoading: hotelLoading, error: hotelError } = useCurrentHotel()

  const [guests, setGuests] = useState<any[]>([])

  // Get user and hotel info
  const { user }: { user: any } = useAuth()
  const hotelId = user?.primaryHotel?.id

  // Real-time updates
  useRealtimeUpdates({
    onBookingUpdate: () => getBookings({ status: "confirmed" }),
    onRoomUpdate: () => fetchRooms(),
    onCheckInUpdate: () => getCurrentOccupancy(),
  })

  // Load initial data
  useEffect(() => {
    if (!user) {
      toast.error("User not found")
      return
    }

    if (!hotelId) {
      toast.error("Primary hotel not found for user")
      return
    }

    console.log("Loading data for hotel:", hotelId, "User:", user.full_name)
    loadInitialData()
  }, [user, hotelId])

  const loadInitialData = async () => {
    try {
      console.log("Starting to load initial data...")

      // Load bookings
      console.log("Loading bookings...")
      await getBookings({ status: "confirmed" })

      // Load guests
      console.log("Loading guests...")
      const guestsResponse = await getGuests()
      if (guestsResponse.data && Array.isArray(guestsResponse.data)) {
        setGuests(guestsResponse.data)
        console.log("Loaded", guestsResponse.data.length, "guests")
      } else {
        setGuests([])
        console.log("No guests found")
      }

      // Load rooms
      console.log("Loading rooms...")
      await fetchRooms()
      await getCurrentOccupancy()

      console.log("Initial data loading completed")
    } catch (error) {
      console.error("Error loading initial data:", error)
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
        guests: params.guests,
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

    // Prepare registration data with real hotel and user data
    const regData = {
      booking: selectedBooking,
      guest: selectedGuest,
      room: selectedRoom,
      checkInData,
      hotel: {
        name: hotel?.name || "Hotel",
        address: hotel?.address || configuration?.address || "Hotel Address",
        phone: hotel?.contact?.phone || configuration?.phone || "Hotel Phone",
        email: hotel?.contact?.email || configuration?.email || "hotel@example.com",
        logo: hotel?.branding?.logoUrl || configuration?.branding?.logoUrl,
        website: hotel?.contact?.website || configuration?.website,
        tax_id: hotel?.legalInfo?.taxId || configuration?.tax_id,
      },
      configuration: effectiveConfig || configuration,
      checkInDate: new Date().toISOString(),
      staff: {
        name: user?.full_name || user?.name || "Front Desk Agent",
        id: user?.id || user?._id,
        email: user?.email,
        role: user?.role?.name || user?.role,
        department: user?.department || "Front Desk",
      },
    }

    setRegistrationData(regData)
    setShowRegistrationDialog(true)
  }

  const handleCompleteCheckIn = async (registrationData: any) => {
    try {
      // Format check-in data for the API to match backend expectations
      const checkInApiData = {
        // Guest information
        guest_id: selectedGuest._id || selectedGuest.id,
        guest_info: selectedGuest._id
          ? undefined
          : {
              full_name: selectedGuest.full_name,
              email: selectedGuest.email,
              phone: selectedGuest.phone,
              address: selectedGuest.address,
              id_number: selectedGuest.id_number,
              nationality: selectedGuest.nationality,
            },

        // Room and stay information
        room_id: selectedRoom._id || selectedRoom.id,
        expected_check_out:
          selectedBooking?.check_out ||
          new Date(Date.now() + (checkInData.numberOfNights || 1) * 24 * 60 * 60 * 1000).toISOString(),
        number_of_guests: selectedBooking?.number_of_guests || checkInData.numberOfGuests || 1,
        number_of_nights: selectedBooking?.duration || checkInData.numberOfNights,

        // Booking information (if exists)
        booking_id: selectedBooking?._id || selectedBooking?.id,

        // Additional information
        special_requests: checkInData.specialRequests,
        notes: checkInData.arrivalNotes,
        deposit_amount: checkInData.depositAmount || 0,
        deposit_payment_method: checkInData.depositPaymentMethod,
        key_cards_issued: checkInData.keyCards || 2,
        parking_space: checkInData.parkingSpace,
        vehicle_details: checkInData.vehicleDetails,
        emergency_contact: checkInData.emergencyContact,

        // Registration document data
        registration_document: registrationData.registration_document,
      }

      console.log("Submitting check-in data:", checkInApiData)
      const checkInResult = await checkInGuest(checkInApiData)
      console.log("Check-in result:", checkInResult)

      // Prepare complete receipt data with all required information
      const completeReceiptData = {
        ...checkInResult,
        guest: selectedGuest,
        room: selectedRoom,
        booking: selectedBooking,
        number_of_nights: checkInData.numberOfNights || 1,
        number_of_guests: checkInData.numberOfGuests || 1,
        deposit_amount: checkInData.depositAmount || 0,
        deposit_payment_method: checkInData.depositPaymentMethod || "Not specified",
        key_cards_issued: checkInData.keyCards || 2,
        expected_check_out:
          selectedBooking?.check_out ||
          new Date(Date.now() + (checkInData.numberOfNights || 1) * 24 * 60 * 60 * 1000).toISOString(),
        additional_charges: [],
        payment_status: checkInData.depositAmount > 0 ? "partial" : "pending",

        // Ensure we have room rate information
        room_rate: selectedRoom.roomType?.basePrice || selectedRoom.roomType?.rate || 100,
        total_room_charges: (selectedRoom.roomType?.basePrice || 100) * (checkInData.numberOfNights || 1),
        tax_rate: effectiveConfig?.financial?.taxRates?.[0]?.rate || configuration?.financial?.taxRates?.[0]?.rate || 0,
        tax_amount:
          (selectedRoom.roomType?.basePrice || 100) *
          (checkInData.numberOfNights || 1) *
          ((effectiveConfig?.financial?.taxRates?.[0]?.rate || configuration?.financial?.taxRates?.[0]?.rate || 0) /
            100),
        total_amount:
          (selectedRoom.roomType?.basePrice || 100) *
          (checkInData.numberOfNights || 1) *
          (1 +
            (effectiveConfig?.financial?.taxRates?.[0]?.rate || configuration?.financial?.taxRates?.[0]?.rate || 0) /
              100),
      }

      // Show receipt with actual data and configuration
      setReceiptData(completeReceiptData)
      setShowReceiptDialog(true)

      // Reset form
      resetForm()
      setShowRegistrationDialog(false)

      toast.success("Check-in completed successfully!")
    } catch (error) {
      console.error("Check-in failed:", error)
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
      depositPaymentMethod: "",
      numberOfGuests: 1,
      numberOfNights: 1,
      parkingSpace: "",
      vehicleDetails: {
        license_plate: "",
        make: "",
        model: "",
        color: "",
      },
      emergencyContact: {
        name: "",
        phone: "",
        relationship: "",
      },
    })
    setActiveTab("search")
  }

  const handlePrintReceipt = (checkInData: any) => {
    setReceiptData({ ...checkInData })
    setShowReceiptDialog(true)
  }

  const handlePrintInvoice = (checkInData: any) => {
    setInvoiceData({ ...checkInData })
    setShowInvoiceDialog(true)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Guest Check-in</h1>
          <p className="text-muted-foreground">
            Process guest arrivals and room assignments
            {hotel && <span className="ml-2 text-sm text-blue-600">• {hotel.name}</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadInitialData} variant="outline" size="sm" disabled={hotelLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${hotelLoading ? "animate-spin" : ""}`} />
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

      <ReceiptDialog
        open={showReceiptDialog}
        onOpenChange={setShowReceiptDialog}
        receiptData={receiptData}
        hotel={hotel}
        configuration={effectiveConfig || configuration}
      />

      <InvoiceDialog
        open={showInvoiceDialog}
        onOpenChange={setShowInvoiceDialog}
        invoiceData={invoiceData}
        hotel={hotel}
        configuration={effectiveConfig || configuration}
      />
    </div>
  )
}
