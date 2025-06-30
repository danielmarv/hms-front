"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { usePayments } from "@/hooks/use-payments"
import { useGuests, type Guest } from "@/hooks/use-guests"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"
import { ArrowLeft, Save, RefreshCw, CreditCard, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { format } from "date-fns"

type PendingCharge = {
  _id: string
  type: "invoice" | "booking" | "order"
  reference: string
  description: string
  amount: number
  currency: string
  dueDate?: string
  status: string
}

type GuestPaymentHistory = {
  _id: string
  amountPaid: number
  method: string
  status: string
  paidAt: string
  receiptNumber?: string
}

export default function NewPaymentPage() {
  const router = useRouter()
  const { createPayment, isLoading, getPayments } = usePayments()
  const { getGuests } = useGuests()

  // State for fetched data
  const [guests, setGuests] = useState<Guest[]>([])
  const [guestsLoading, setGuestsLoading] = useState(false)
  const [selectedGuestHistory, setSelectedGuestHistory] = useState<GuestPaymentHistory[]>([])
  const [selectedGuestPendingCharges, setSelectedGuestPendingCharges] = useState<PendingCharge[]>([])
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

  useEffect(() => {
    loadGuests()
  }, [])

  useEffect(() => {
    if (paymentData.guest) {
      loadGuestPaymentData(paymentData.guest)
    } else {
      setSelectedGuestHistory([])
      setSelectedGuestPendingCharges([])
    }
  }, [paymentData.guest])

  const loadGuests = async () => {
    try {
      setGuestsLoading(true)
      const response = await getGuests({ limit: 100 })
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

  const loadGuestPaymentData = async (guestId: string) => {
    try {
      setLoadingGuestData(true)

      // Load payment history
      const paymentsResponse = await getPayments({ guest: guestId, limit: 10 })
      if (paymentsResponse && "data" in paymentsResponse && paymentsResponse.data) {
        setSelectedGuestHistory(paymentsResponse.data)
      }

      // Mock pending charges - in real app, this would be an API call
      const mockPendingCharges: PendingCharge[] = [
        {
          _id: "1",
          type: "invoice",
          reference: "INV-2024-001",
          description: "Room Service - Dinner",
          amount: 85.5,
          currency: "USD",
          dueDate: "2024-01-15",
          status: "pending",
        },
        {
          _id: "2",
          type: "booking",
          reference: "BK-2024-456",
          description: "Room Booking Balance",
          amount: 250.0,
          currency: "USD",
          status: "overdue",
        },
      ]
      setSelectedGuestPendingCharges(mockPendingCharges)
    } catch (error) {
      console.error("Error loading guest payment data:", error)
      toast.error("Failed to load guest payment data")
    } finally {
      setLoadingGuestData(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setPaymentData({ ...paymentData, [name]: value })
  }

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPaymentData({ ...paymentData, [name]: Number.parseFloat(value) || 0 })
  }

  const handleSelectChange = (name: string, value: string) => {
    setPaymentData({ ...paymentData, [name]: value })
  }

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setPaymentData({ ...paymentData, paidAt: date })
    }
  }

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setPaymentData({ ...paymentData, [name]: checked })
  }

  const handlePayPendingCharge = (charge: PendingCharge) => {
    setPaymentData({
      ...paymentData,
      amountPaid: charge.amount,
      currency: charge.currency,
      [charge.type]: charge._id,
      notes: `Payment for ${charge.description} (${charge.reference})`,
    })
    toast.info(`Pre-filled payment for ${charge.reference}`)
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

  const formatCurrency = (amount: number, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Completed
          </Badge>
        )
      case "Pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Pending
          </Badge>
        )
      case "overdue":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Overdue
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const selectedGuest = guests.find((g) => g._id === paymentData.guest)

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

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Payment Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
                <CardDescription>Enter the basic payment details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="guest">Guest *</Label>
                  <Select value={paymentData.guest} onValueChange={(value) => handleSelectChange("guest", value)}>
                    <SelectTrigger id="guest">
                      <SelectValue placeholder={guestsLoading ? "Loading guests..." : "Select guest"} />
                    </SelectTrigger>
                    <SelectContent>
                      {guests.length === 0 && !guestsLoading ? (
                        <SelectItem value="" disabled>
                          No guests found
                        </SelectItem>
                      ) : (
                        guests.map((guest) => (
                          <SelectItem key={guest._id} value={guest._id}>
                            <div className="flex items-center gap-2">
                              <span>{guest.full_name}</span>
                              {guest.vip && (
                                <span className="bg-purple-100 text-purple-800 text-xs px-1 py-0.5 rounded">VIP</span>
                              )}
                              <span className="text-muted-foreground">- {guest.email}</span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="amountPaid">Amount *</Label>
                    <Input
                      id="amountPaid"
                      name="amountPaid"
                      type="number"
                      step="0.01"
                      min="0"
                      value={paymentData.amountPaid || ""}
                      onChange={handleNumberInputChange}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={paymentData.currency}
                      onValueChange={(value) => handleSelectChange("currency", value)}
                    >
                      <SelectTrigger id="currency">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="GBP">GBP - British Pound</SelectItem>
                        <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                        <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                        <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
                <CardDescription>Optional details and notes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
          </div>

          {/* Guest Information Sidebar */}
          <div className="space-y-6">
            {selectedGuest && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Guest Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{selectedGuest.full_name}</h4>
                      {selectedGuest.vip && (
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          VIP
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{selectedGuest.email}</p>
                    <p className="text-sm text-muted-foreground">{selectedGuest.phone}</p>
                  </div>

                  {selectedGuest.loyalty_program?.member && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-900">Loyalty Member</p>
                      <p className="text-sm text-blue-700">
                        {selectedGuest.loyalty_program.tier} • {selectedGuest.loyalty_program.points} points
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Pending Charges */}
            {paymentData.guest && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Pending Charges
                    {selectedGuestPendingCharges.length > 0 && (
                      <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                        {selectedGuestPendingCharges.length}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingGuestData ? (
                    <div className="text-center py-4">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Loading charges...</p>
                    </div>
                  ) : selectedGuestPendingCharges.length === 0 ? (
                    <div className="text-center py-4">
                      <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No pending charges</p>
                    </div>
                  ) : (
                    <ScrollArea className="h-64">
                      <div className="space-y-3">
                        {selectedGuestPendingCharges.map((charge) => (
                          <div key={charge._id} className="p-3 border rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-medium text-sm">{charge.reference}</p>
                                <p className="text-sm text-muted-foreground">{charge.description}</p>
                              </div>
                              {getStatusBadge(charge.status)}
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{formatCurrency(charge.amount, charge.currency)}</span>
                              <Button size="sm" variant="outline" onClick={() => handlePayPendingCharge(charge)}>
                                Pay Now
                              </Button>
                            </div>
                            {charge.dueDate && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Due: {format(new Date(charge.dueDate), "MMM d, yyyy")}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Payment History */}
            {paymentData.guest && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Recent Payments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingGuestData ? (
                    <div className="text-center py-4">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Loading history...</p>
                    </div>
                  ) : selectedGuestHistory.length === 0 ? (
                    <div className="text-center py-4">
                      <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No payment history</p>
                    </div>
                  ) : (
                    <ScrollArea className="h-48">
                      <div className="space-y-3">
                        {selectedGuestHistory.map((payment) => (
                          <div key={payment._id} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-sm">{formatCurrency(payment.amountPaid)}</span>
                              {getStatusBadge(payment.status)}
                            </div>
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                              <span>{payment.method}</span>
                              <span>{format(new Date(payment.paidAt), "MMM d, yyyy")}</span>
                            </div>
                            {payment.receiptNumber && (
                              <p className="text-xs text-muted-foreground mt-1">Receipt: {payment.receiptNumber}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
