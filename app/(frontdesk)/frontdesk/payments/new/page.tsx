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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "sonner"
import { ArrowLeft, Save } from "lucide-react"

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
    method: "credit_card",
    currency: "USD",
    transactionReference: "",
    notes: "",
    paidAt: new Date(),
    isDeposit: false,
    receiptIssued: true,
  })

  const [paymentDetails, setPaymentDetails] = useState({
    cardType: "",
    last4: "",
    expiryMonth: "",
    expiryYear: "",
    cardholderName: "",
    bankName: "",
    accountNumber: "",
    routingNumber: "",
    accountName: "",
    provider: "",
    phoneNumber: "",
    transactionId: "",
    payerEmail: "",
  })

  useEffect(() => {
    getGuests()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setPaymentData({ ...paymentData, [name]: value })
  }

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPaymentData({ ...paymentData, [name]: Number.parseFloat(value) || 0 })
  }

  const handleDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPaymentDetails({ ...paymentDetails, [name]: value })
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
      // Prepare payment details based on method
      let paymentDetailsData = {}

      switch (paymentData.method) {
        case "credit_card":
          paymentDetailsData = {
            cardDetails: {
              cardType: paymentDetails.cardType,
              last4: paymentDetails.last4,
              expiryMonth: paymentDetails.expiryMonth,
              expiryYear: paymentDetails.expiryYear,
              cardholderName: paymentDetails.cardholderName,
            },
          }
          break
        case "bank_transfer":
          paymentDetailsData = {
            bankDetails: {
              bankName: paymentDetails.bankName,
              accountNumber: paymentDetails.accountNumber,
              routingNumber: paymentDetails.routingNumber,
              accountName: paymentDetails.accountName,
            },
          }
          break
        case "mobile_money":
          paymentDetailsData = {
            mobileMoneyDetails: {
              provider: paymentDetails.provider,
              phoneNumber: paymentDetails.phoneNumber,
              transactionId: paymentDetails.transactionId,
            },
          }
          break
        case "paypal":
        case "stripe":
          paymentDetailsData = {
            onlinePaymentDetails: {
              provider: paymentData.method,
              paymentId: paymentDetails.transactionId,
              payerEmail: paymentDetails.payerEmail,
            },
          }
          break
      }

      const response = await createPayment({
        ...paymentData,
        paidAt: paymentData.paidAt.toISOString(),
        ...paymentDetailsData,
      })

      if (response.success) {
        toast.success("Payment created successfully")
        router.push("/frontdesk/payments")
      }
    } catch (error) {
      console.error("Error creating payment:", error)
      toast.error("Failed to create payment")
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
  // Render payment method specific fields
  const renderPaymentMethodFields = () => {
    switch (paymentData.method) {
      case "credit_card":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cardType">Card Type</Label>
                <Select
                  value={paymentDetails.cardType}
                  onValueChange={(value) => setPaymentDetails({ ...paymentDetails, cardType: value })}
                >
                  <SelectTrigger id="cardType">
                    <SelectValue placeholder="Select card type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="visa">Visa</SelectItem>
                    <SelectItem value="mastercard">Mastercard</SelectItem>
                    <SelectItem value="amex">American Express</SelectItem>
                    <SelectItem value="discover">Discover</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="last4">Last 4 Digits</Label>
                <Input
                  id="last4"
                  name="last4"
                  value={paymentDetails.last4}
                  onChange={handleDetailsChange}
                  maxLength={4}
                  placeholder="1234"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="expiryMonth">Expiry Month</Label>
                <Select
                  value={paymentDetails.expiryMonth}
                  onValueChange={(value) => setPaymentDetails({ ...paymentDetails, expiryMonth: value })}
                >
                  <SelectTrigger id="expiryMonth">
                    <SelectValue placeholder="MM" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => {
                      const month = (i + 1).toString().padStart(2, "0")
                      return (
                        <SelectItem key={month} value={month}>
                          {month}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiryYear">Expiry Year</Label>
                <Select
                  value={paymentDetails.expiryYear}
                  onValueChange={(value) => setPaymentDetails({ ...paymentDetails, expiryYear: value })}
                >
                  <SelectTrigger id="expiryYear">
                    <SelectValue placeholder="YYYY" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => {
                      const year = (new Date().getFullYear() + i).toString()
                      return (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 sm:col-span-3">
                <Label htmlFor="cardholderName">Cardholder Name</Label>
                <Input
                  id="cardholderName"
                  name="cardholderName"
                  value={paymentDetails.cardholderName}
                  onChange={handleDetailsChange}
                  placeholder="John Smith"
                />
              </div>
            </div>
          </div>
        )
      case "bank_transfer":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bankName">Bank Name</Label>
              <Input
                id="bankName"
                name="bankName"
                value={paymentDetails.bankName}
                onChange={handleDetailsChange}
                placeholder="Bank of America"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  name="accountNumber"
                  value={paymentDetails.accountNumber}
                  onChange={handleDetailsChange}
                  placeholder="XXXX1234"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="routingNumber">Routing Number</Label>
                <Input
                  id="routingNumber"
                  name="routingNumber"
                  value={paymentDetails.routingNumber}
                  onChange={handleDetailsChange}
                  placeholder="123456789"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountName">Account Holder Name</Label>
              <Input
                id="accountName"
                name="accountName"
                value={paymentDetails.accountName}
                onChange={handleDetailsChange}
                placeholder="John Smith"
              />
            </div>
          </div>
        )
      case "mobile_money":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="provider">Provider</Label>
              <Select
                value={paymentDetails.provider}
                onValueChange={(value) => setPaymentDetails({ ...paymentDetails, provider: value })}
              >
                <SelectTrigger id="provider">
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mpesa">M-Pesa</SelectItem>
                  <SelectItem value="airtel">Airtel Money</SelectItem>
                  <SelectItem value="orange">Orange Money</SelectItem>
                  <SelectItem value="mtn">MTN Mobile Money</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  value={paymentDetails.phoneNumber}
                  onChange={handleDetailsChange}
                  placeholder="+1234567890"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="transactionId">Transaction ID</Label>
                <Input
                  id="transactionId"
                  name="transactionId"
                  value={paymentDetails.transactionId}
                  onChange={handleDetailsChange}
                  placeholder="ABC123XYZ"
                />
              </div>
            </div>
          </div>
        )
      case "paypal":
      case "stripe":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="transactionId">Transaction ID</Label>
                <Input
                  id="transactionId"
                  name="transactionId"
                  value={paymentDetails.transactionId}
                  onChange={handleDetailsChange}
                  placeholder="TXN_123456789"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payerEmail">Payer Email</Label>
                <Input
                  id="payerEmail"
                  name="payerEmail"
                  value={paymentDetails.payerEmail}
                  onChange={handleDetailsChange}
                  placeholder="customer@example.com"
                  type="email"
                />
              </div>
            </div>
          </div>
        )
      case "cash":
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">New Payment</h2>
          <p className="text-muted-foreground">Record a new payment from a guest</p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
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
                <Label htmlFor="guest">Guest</Label>
                <Select value={paymentData.guest} onValueChange={(value) => handleSelectChange("guest", value)}>
                  <SelectTrigger id="guest">
                    <SelectValue placeholder="Select guest" />
                  </SelectTrigger>
                  <SelectContent>
                    {guests.map((guest) => (
                      <SelectItem key={guest._id} value={guest._id}>
                        {guest.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="amountPaid">Amount</Label>
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
                <Label htmlFor="method">Payment Method</Label>
                <RadioGroup
                  value={paymentData.method}
                  onValueChange={(value) => handleSelectChange("method", value)}
                  className="grid grid-cols-2 gap-4 pt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="credit_card" id="credit_card" />
                    <Label htmlFor="credit_card" className="cursor-pointer">
                      Credit Card
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cash" id="cash" />
                    <Label htmlFor="cash" className="cursor-pointer">
                      Cash
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                    <Label htmlFor="bank_transfer" className="cursor-pointer">
                      Bank Transfer
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mobile_money" id="mobile_money" />
                    <Label htmlFor="mobile_money" className="cursor-pointer">
                      Mobile Money
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="paypal" id="paypal" />
                    <Label htmlFor="paypal" className="cursor-pointer">
                      PayPal
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="stripe" id="stripe" />
                    <Label htmlFor="stripe" className="cursor-pointer">
                      Stripe
                    </Label>
                  </div>
                </RadioGroup>
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
                  placeholder="REF123456"
                />
              </div>

              <div className="space-y-2">
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
              </div>

              <div className="space-y-2">
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

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
                <CardDescription>Enter the specific details for the selected payment method</CardDescription>
              </CardHeader>
              <CardContent>{renderPaymentMethodFields()}</CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent>
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
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Payment"}
                  {!isLoading && <Save className="ml-2 h-4 w-4" />}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
