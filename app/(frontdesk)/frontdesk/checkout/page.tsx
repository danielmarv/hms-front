"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { Search, UserX, RefreshCw } from "lucide-react"
import { CheckOutSearchPanel } from "@/components/frontdesk/checkout-search-panel"
import { CheckOutDetailsPanel } from "@/components/frontdesk/checkout-details-panel"
import { CheckOutReceiptDialog } from "@/components/frontdesk/checkout-receipt-dialog"
import { useCheckOutApi } from "@/hooks/use-checkout-api"
import { useCheckInApi } from "@/hooks/use-checkin-api"
import { usePayments } from "@/hooks/use-payments"
import { useCurrentHotel } from "@/hooks/use-current-hotel"
import { useAuth } from "@/hooks/use-auth"

export default function CheckOutPage() {
  const [activeTab, setActiveTab] = useState("search")
  const [selectedCheckIn, setSelectedCheckIn] = useState<any>(null)
  const [checkOutData, setCheckOutData] = useState({
    additionalCharges: [],
    discounts: [],
    paymentMethod: "",
    paymentAmount: 0,
    notes: "",
  })

  // Dialog states
  const [showReceiptDialog, setShowReceiptDialog] = useState(false)
  const [receiptData, setReceiptData] = useState<any>(null)

  // API hooks
  const { checkOutGuest, addCharges, addDiscount, getGuestFolio, isLoading: checkOutLoading } = useCheckOutApi()
  const { getCheckIns, isLoading: checkInsLoading } = useCheckInApi()
  const { createPayment } = usePayments()
  const { hotel, configuration, effectiveConfig } = useCurrentHotel()

  const [checkIns, setCheckIns] = useState<any[]>([])

  // Get user and hotel info
  const { user }: { user: any } = useAuth()
  const hotelId = user?.primaryHotel?.id

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

    loadInitialData()
  }, [user, hotelId])

  const loadInitialData = async () => {
    try {
      console.log("Loading check-ins for checkout...")
      const response = await getCheckIns({ status: "checked_in" })
      if (response.data && Array.isArray(response.data)) {
        setCheckIns(response.data)
        console.log("Loaded", response.data.length, "active check-ins")
      } else {
        setCheckIns([])
        console.log("No active check-ins found")
      }
    } catch (error) {
      console.error("Error loading check-ins:", error)
      toast.error("Failed to load check-ins")
    }
  }

  const handleCheckInSelect = (checkIn: any) => {
    setSelectedCheckIn(checkIn)
    setActiveTab("details")
  }

  const handleAddCharge = async (charge: any) => {
    if (!selectedCheckIn) return

    try {
      await addCharges(selectedCheckIn.id, [charge])
      // Refresh the selected check-in data
      const folio = await getGuestFolio(selectedCheckIn.id)
      setSelectedCheckIn({ ...selectedCheckIn, ...folio })
      toast.success("Charge added successfully")
    } catch (error) {
      toast.error("Failed to add charge")
    }
  }

  const handleAddDiscount = async (discount: any) => {
    if (!selectedCheckIn) return

    try {
      await addDiscount(selectedCheckIn.id, discount)
      // Refresh the selected check-in data
      const folio = await getGuestFolio(selectedCheckIn.id)
      setSelectedCheckIn({ ...selectedCheckIn, ...folio })
      toast.success("Discount added successfully")
    } catch (error) {
      toast.error("Failed to add discount")
    }
  }

  const handleCheckOut = async () => {
    if (!selectedCheckIn) {
      toast.error("Please select a check-in record")
      return
    }

    try {
      // Prepare checkout data
      const checkOutApiData = {
        additional_charges: checkOutData.additionalCharges,
        discounts: checkOutData.discounts,
        payment_method: checkOutData.paymentMethod,
        payment_amount: checkOutData.paymentAmount,
        notes: checkOutData.notes,
      }

      console.log("Processing checkout:", checkOutApiData)
      const checkOutResult = await checkOutGuest(selectedCheckIn.id, checkOutApiData)

      // If payment was made, create payment record
      if (checkOutData.paymentAmount > 0) {
        await createPayment({
          guest: selectedCheckIn.guest._id || selectedCheckIn.guest.id,
          amountPaid: checkOutData.paymentAmount,
          method: checkOutData.paymentMethod,
          currency: effectiveConfig?.financial?.currency?.code || "USD",
          notes: `Checkout payment for ${selectedCheckIn.guest.full_name}`,
          paidAt: new Date().toISOString(),
        })
      }

      // Prepare receipt data
      const completeReceiptData = {
        ...checkOutResult,
        guest: selectedCheckIn.guest,
        room: selectedCheckIn.room,
        booking: selectedCheckIn.booking,
        check_in_date: selectedCheckIn.check_in_date,
        check_out_date: new Date().toISOString(),
        number_of_nights: selectedCheckIn.number_of_nights,
        payment_made: checkOutData.paymentAmount,
        payment_method: checkOutData.paymentMethod,
        additional_charges: checkOutData.additionalCharges,
        discounts: checkOutData.discounts,
      }

      // Show receipt
      setReceiptData(completeReceiptData)
      setShowReceiptDialog(true)

      // Reset form
      resetForm()

      toast.success("Guest checked out successfully!")
    } catch (error) {
      console.error("Checkout failed:", error)
      toast.error("Failed to complete checkout")
    }
  }

  const resetForm = () => {
    setSelectedCheckIn(null)
    setCheckOutData({
      additionalCharges: [],
      discounts: [],
      paymentMethod: "",
      paymentAmount: 0,
      notes: "",
    })
    setActiveTab("search")
    loadInitialData() // Refresh the list
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Guest Check-out</h1>
          <p className="text-muted-foreground">
            Process guest departures and final billing
            {hotel && <span className="ml-2 text-sm text-blue-600">• {hotel.name}</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadInitialData} variant="outline" size="sm" disabled={checkInsLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${checkInsLoading ? "animate-spin" : ""}`} />
            Refresh
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
          className={`flex items-center space-x-2 ${activeTab === "details" ? "text-primary" : "text-muted-foreground"}`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${activeTab === "details" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
          >
            <UserX className="h-4 w-4" />
          </div>
          <span className="text-sm font-medium">Complete Check-out</span>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="search">Find Guest</TabsTrigger>
          <TabsTrigger value="details" disabled={!selectedCheckIn}>
            Check-out Details
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-6">
          <CheckOutSearchPanel checkIns={checkIns} onCheckInSelect={handleCheckInSelect} isLoading={checkInsLoading} />
        </TabsContent>

        <TabsContent value="details" className="space-y-6">
          <CheckOutDetailsPanel
            selectedCheckIn={selectedCheckIn}
            checkOutData={checkOutData}
            onCheckOutDataChange={setCheckOutData}
            onAddCharge={handleAddCharge}
            onAddDiscount={handleAddDiscount}
            onCheckOut={handleCheckOut}
            isLoading={checkOutLoading}
            configuration={effectiveConfig || configuration}
          />
        </TabsContent>
      </Tabs>

      {/* Receipt Dialog */}
      <CheckOutReceiptDialog
        open={showReceiptDialog}
        onOpenChange={setShowReceiptDialog}
        receiptData={receiptData}
        hotel={hotel}
        configuration={effectiveConfig || configuration}
      />
    </div>
  )
}
