"use client"

import type React from "react"

import { useState, useEffect } from "react"

import { useRouter } from "next/navigation"

import { usePayments } from "@/hooks/use-payments"

import { useGuests, type Guest } from "@/hooks/use-guests"

import { useInvoices } from "@/hooks/use-invoices"

import { useBookings } from "@/hooks/use-bookings"

import { Button } from "@/components/ui/button"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

import { Input } from "@/components/ui/input"

import { Label } from "@/components/ui/label"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { Textarea } from "@/components/ui/textarea"

import { DatePicker } from "@/components/ui/date-picker"

import { Checkbox } from "@/components/ui/checkbox"

import { Badge } from "@/components/ui/badge"

import { Separator } from "@/components/ui/separator"

import { Skeleton } from "@/components/ui/skeleton"

import { CurrencyInput } from "@/components/ui/currency-input"

import { useCurrency } from "@/hooks/use-currency"

import { toast } from "sonner"

import { ArrowLeft, Save, RefreshCw, User, CreditCard, FileText, AlertCircle, Crown } from "lucide-react"

export default function NewPaymentPage() {
  const router = useRouter()

  const { createPayment, getPayments, isLoading } = usePayments()

  const { getGuests } = useGuests()

  const { getInvoices } = useInvoices()

  const { getBookings } = useBookings()

  const { formatCurrency } = useCurrency()

  // State for fetched data

  const [guests, setGuests] = useState<Guest[]>([])

  const [guestsLoading, setGuestsLoading] = useState(false)

  const [selectedGuestData, setSelectedGuestData] = useState<any>(null)

  const [pendingCharges, setPendingCharges] = useState<any[]>([])

  const [paymentHistory, setPaymentHistory] = useState<any[]>([])

  const [loadingGuestData, setLoadingGuestData] = useState(false)

  const [paymentData, setPaymentData] = useState({
    guest: "",

    invoice: "",

    booking: "",

    order: "",

    amountPaid: 0,

    method: "cash",

    currency: "USD",

    transactionReference: "",

    notes: "",

    paidAt: new Date(),

    isDeposit: false,

    receiptIssued: true,
  })

  const [guestSearch, setGuestSearch] = useState("")

  // Filter guests based on search
  const filteredGuests = guests.filter(
    (guest) =>
      guest.full_name.toLowerCase().includes(guestSearch.toLowerCase()) ||
      guest.email?.toLowerCase().includes(guestSearch.toLowerCase()) ||
      guest.phone?.includes(guestSearch),
  )

  useEffect(() => {
    loadGuests()
  }, [])

  const loadGuests = async () => {
    try {
      setGuestsLoading(true)
      const response = await getGuests({}) // Remove limit to get all guests
      if (response.data) {
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

  const loadGuestData = async (guestId: string) => {
    if (!guestId) return

    try {
      setLoadingGuestData(true)
      const guest = guests.find((g) => g._id === guestId)
      setSelectedGuestData(guest)

      // Load pending charges and payment history
      const [invoicesResponse, bookingsResponse, paymentsResponse] = await Promise.all([
        getInvoices({ guest_id: guestId, status: "unpaid" }).catch(() => ({ data: [] })),
        getBookings({ guest_id: guestId, payment_status: "pending" }).catch(() => ({ data: [] })),
        getPayments({ guest: guestId, limit: 5, sort: "-paidAt" }).catch(() => ({ data: [] })),
      ])

      const charges = [
        ...(Array.isArray(invoicesResponse.data) ? invoicesResponse.data : []).map((invoice: any) => ({
          id: invoice._id,
          type: "invoice",
          title: `Invoice #${invoice.invoice_number}`,
          amount: invoice.total_amount,
          currency: invoice.currency,
          due_date: invoice.due_date,
          status: invoice.status,
          overdue: new Date(invoice.due_date) < new Date(),
        })),
        ...(Array.isArray(bookingsResponse.data) ? bookingsResponse.data : []).map((booking: any) => ({
          id: booking._id,
          type: "booking",
          title: `Booking #${booking.booking_number}`,
          amount: booking.total_amount - (booking.paid_amount || 0),
          currency: booking.currency,
          due_date: booking.check_in_date,
          status: booking.payment_status,
          overdue: new Date(booking.check_in_date) < new Date(),
        })),
      ]

      setPendingCharges(charges)

      // Set real payment history
      const payments = Array.isArray(paymentsResponse.data) ? paymentsResponse.data : []
      setPaymentHistory(
        payments.map((payment: any) => ({
          id: payment._id,
          amount: payment.amountPaid,
          method: payment.method,
          date: new Date(payment.paidAt),
          reference: payment.receiptNumber || payment.transactionReference,
          status: payment.status.toLowerCase(),
        })),
      )
    } catch (error) {
      console.error("Error loading guest data:", error)
      toast.error("Failed to load guest information")
    } finally {
      setLoadingGuestData(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    setPaymentData({ ...paymentData, [name]: value })
  }

  const handleSelectChange = (name: string, value: string) => {
    setPaymentData({ ...paymentData, [name]: value })

    if (name === "guest") {
      loadGuestData(value)
    }
  }

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setPaymentData({ ...paymentData, paidAt: date })
    }
  }

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setPaymentData({ ...paymentData, [name]: checked })
  }

  const handlePayNow = (charge: any) => {
    setPaymentData({
      ...paymentData,

      amountPaid: charge.amount,

      [charge.type]: charge.id,

      notes: `Payment for ${charge.title}`,
    })

    toast.success(`Pre-filled payment form for ${charge.title}`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!paymentData.guest) {
      toast.error("Please select a guest")

      return
    }

    if (paymentData.amountPaid <= 0) {
      toast.error("Payment amount must be greater than zero")

      return
    }

    try {
      const response = await createPayment({
        ...paymentData,

        paidAt: paymentData.paidAt.toISOString(),
      })

      if (response) {
        toast.success("Payment created successfully")

        router.push("/dashboard/payments")
      }
    } catch (error) {
      console.error("Error creating payment:", error)

      toast.error("Failed to create payment")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">New Payment</h2>

          <p className="text-muted-foreground">Record a new payment from a guest</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadGuests} disabled={guestsLoading}>
            <RefreshCw className="mr-2 h-4 w-4" />

            {guestsLoading ? "Loading..." : "Refresh Guests"}
          </Button>

          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Payment Form */}

        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>

                <CardDescription>Enter the basic payment details</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="guest">Guest *</Label>
                  <Input
                    placeholder="Search guests by name, email, or phone..."
                    value={guestSearch}
                    onChange={(e) => setGuestSearch(e.target.value)}
                    className="mb-2"
                  />
                  <Select value={paymentData.guest} onValueChange={(value) => handleSelectChange("guest", value)}>
                    <SelectTrigger id="guest">
                      <SelectValue placeholder={guestsLoading ? "Loading guests..." : "Select guest"} />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredGuests.length === 0 && !guestsLoading ? (
                        <SelectItem value="" disabled>
                          {guestSearch ? "No guests match your search" : "No guests found"}
                        </SelectItem>
                      ) : (
                        filteredGuests.map((guest) => (
                          <SelectItem key={guest._id} value={guest._id}>
                            <div className="flex items-center gap-2">
                              <span>{guest.full_name}</span>
                              {guest.vip && <Crown className="h-3 w-3 text-purple-600" />}
                              <span className="text-muted-foreground text-xs">- {guest.email}</span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <CurrencyInput
                  label="Amount *"
                  value={paymentData.amountPaid}
                  onChange={(usdValue) => setPaymentData({ ...paymentData, amountPaid: usdValue })}
                  required
                />

                <div className="space-y-2">
                  <Label htmlFor="method">Payment Method *</Label>

                  <Select value={paymentData.method} onValueChange={(value) => handleSelectChange("method", value)}>
                    <SelectTrigger id="method">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>

                      <SelectItem value="credit_card">Credit Card</SelectItem>

                      <SelectItem value="debit_card">Debit Card</SelectItem>

                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>

                      <SelectItem value="mobile_money">Mobile Money</SelectItem>

                      <SelectItem value="check">Check</SelectItem>

                      <SelectItem value="paypal">PayPal</SelectItem>

                      <SelectItem value="stripe">Stripe</SelectItem>

                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paidAt">Payment Date</Label>

                  <DatePicker date={paymentData.paidAt} setDate={handleDateChange} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transactionReference">Transaction Reference</Label>

                  <Input
                    id="transactionReference"
                    name="transactionReference"
                    value={paymentData.transactionReference}
                    onChange={handleInputChange}
                    placeholder="REF123456 (optional)"
                  />
                </div>

                <Separator />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="invoice">Related Invoice ID</Label>

                    <Input
                      id="invoice"
                      name="invoice"
                      value={paymentData.invoice}
                      onChange={handleInputChange}
                      placeholder="Invoice ID (optional)"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="booking">Related Booking ID</Label>

                    <Input
                      id="booking"
                      name="booking"
                      value={paymentData.booking}
                      onChange={handleInputChange}
                      placeholder="Booking ID (optional)"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="order">Related Order ID</Label>

                    <Input
                      id="order"
                      name="order"
                      value={paymentData.order}
                      onChange={handleInputChange}
                      placeholder="Order ID (optional)"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isDeposit"
                      checked={paymentData.isDeposit}
                      onCheckedChange={(checked) => handleCheckboxChange("isDeposit", checked as boolean)}
                    />

                    <Label htmlFor="isDeposit" className="cursor-pointer">
                      This is a deposit payment
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="receiptIssued"
                      checked={paymentData.receiptIssued}
                      onCheckedChange={(checked) => handleCheckboxChange("receiptIssued", checked as boolean)}
                    />

                    <Label htmlFor="receiptIssued" className="cursor-pointer">
                      Issue receipt automatically
                    </Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>

                  <Textarea
                    id="notes"
                    name="notes"
                    value={paymentData.notes}
                    onChange={handleInputChange}
                    placeholder="Add any additional notes about this payment"
                    rows={3}
                  />
                </div>
              </CardContent>

              <CardFooter className="flex justify-between">
                <Button variant="outline" type="button" onClick={() => router.back()}>
                  Cancel
                </Button>

                <Button type="submit" disabled={isLoading || guestsLoading}>
                  {isLoading ? "Saving..." : "Save Payment"}

                  {!isLoading && <Save className="ml-2 h-4 w-4" />}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>

        {/* Guest Information Sidebar */}

        <div className="space-y-6">
          {/* Guest Info */}

          {selectedGuestData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Guest Information
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{selectedGuestData.full_name}</span>

                  {selectedGuestData.vip && (
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                      <Crown className="h-3 w-3 mr-1" />
                      VIP
                    </Badge>
                  )}
                </div>

                <div className="text-sm text-muted-foreground">
                  <p>{selectedGuestData.email}</p>

                  {selectedGuestData.phone && <p>{selectedGuestData.phone}</p>}
                </div>

                {selectedGuestData.loyalty_program && (
                  <Badge variant="outline">
                    {typeof selectedGuestData.loyalty_program === "object" && selectedGuestData.loyalty_program !== null
                      ? selectedGuestData.loyalty_program.tier || selectedGuestData.loyalty_program.member || "Member"
                      : selectedGuestData.loyalty_program}{" "}
                    Member
                  </Badge>
                )}
              </CardContent>
            </Card>
          )}

          {/* Pending Charges */}

          {paymentData.guest && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Pending Charges
                </CardTitle>
              </CardHeader>

              <CardContent>
                {loadingGuestData ? (
                  <div className="space-y-2">
                    <Skeleton className="h-16 w-full" />

                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : pendingCharges.length > 0 ? (
                  <div className="space-y-3">
                    {pendingCharges.map((charge) => (
                      <div key={charge.id} className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{charge.title}</span>

                          {charge.overdue && (
                            <Badge variant="destructive" className="text-xs">
                              Overdue
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-green-600">{formatCurrency(charge.amount)}</span>

                          <Button size="sm" variant="outline" onClick={() => handlePayNow(charge)}>
                            Pay Now
                          </Button>
                        </div>

                        <div className="text-xs text-muted-foreground">
                          Due: {new Date(charge.due_date).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />

                    <p className="text-sm">No pending charges</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Recent Payments */}

          {paymentData.guest && paymentHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Recent Payments
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  {paymentHistory.slice(0, 3).map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium">{formatCurrency(payment.amount)}</p>

                        <p className="text-muted-foreground text-xs">
                          {payment.method.replace("_", " ")} • {payment.date.toLocaleDateString()}
                        </p>
                      </div>

                      <Badge variant="outline" className="text-xs">
                        {payment.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
