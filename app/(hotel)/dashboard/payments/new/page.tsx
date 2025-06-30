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
import { toast } from "sonner"
import { ArrowLeft, Save, RefreshCw } from "lucide-react"

export default function NewPaymentPage() {
  const router = useRouter()
  const { createPayment, isLoading } = usePayments()
  const { getGuests } = useGuests()

  // State for fetched data
  const [guests, setGuests] = useState<Guest[]>([])
  const [guestsLoading, setGuestsLoading] = useState(false)

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

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
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
                  <Select value={paymentData.currency} onValueChange={(value) => handleSelectChange("currency", value)}>
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

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={paymentData.notes}
                  onChange={handleInputChange}
                  placeholder="Add any additional notes about this payment"
                  rows={4}
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
      </form>
    </div>
  )
}
