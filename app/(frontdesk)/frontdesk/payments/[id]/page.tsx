"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { usePayments } from "@/hooks/use-payments"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { ArrowLeft, Printer, Send, RefreshCcw, ReceiptIcon, AlertTriangle } from "lucide-react"
import { format } from "date-fns"

export default function PaymentDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { payment, isLoading, getPaymentById, processRefund, issueReceipt, sendReceiptByEmail } = usePayments()

  const [refundData, setRefundData] = useState({
    amount: 0,
    reason: "",
    refundReference: "",
  })
  const [showRefundDialog, setShowRefundDialog] = useState(false)

  const [emailData, setEmailData] = useState({
    email: "",
    message: "",
  })
  const [showEmailDialog, setShowEmailDialog] = useState(false)

  const paymentId = params.id as string

  useEffect(() => {
    if (paymentId) {
      getPaymentById(paymentId)
    }
  }, [paymentId])

  useEffect(() => {
    // Initialize refund amount when payment data is loaded
    if (payment) {
      setRefundData({
        ...refundData,
        amount: payment.amountPaid,
      })
    }
  }, [payment])

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Loading payment details...</p>
      </div>
    )
  }

  if (!payment) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
        <AlertTriangle className="h-12 w-12 text-yellow-500" />
        <h2 className="text-2xl font-bold">Payment Not Found</h2>
        <p className="text-muted-foreground">The requested payment could not be found.</p>
        <Button onClick={() => router.push("/dashboard/payments")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Payments
        </Button>
      </div>
    )
  }

  // Format date to display in a more readable format
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return format(date, "MMMM d, yyyy h:mm a")
  }

  // Format currency
  const formatCurrency = (amount: number, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount)
  }

  // Function to get badge variant based on status
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
      case "Failed":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Failed
          </Badge>
        )
      case "Refunded":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            Refunded
          </Badge>
        )
      case "Partially Refunded":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Partially Refunded
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Function to get formatted payment method
  const getFormattedMethod = (method: string) => {
    switch (method) {
      case "credit_card":
        return "Credit Card"
      case "cash":
        return "Cash"
      case "bank_transfer":
        return "Bank Transfer"
      case "paypal":
        return "PayPal"
      case "stripe":
        return "Stripe"
      case "mobile_money":
        return "Mobile Money"
      default:
        return method
    }
  }

  const handleProcessRefund = async () => {
    try {
      if (refundData.amount <= 0) {
        toast.error("Refund amount must be greater than zero")
        return
      }

      if (refundData.amount > payment.amountPaid) {
        toast.error("Refund amount cannot exceed payment amount")
        return
      }

      const response = await processRefund(paymentId, refundData)
      if (response.success) {
        toast.success("Refund processed successfully")
        setShowRefundDialog(false)
      }
    } catch (error) {
      console.error("Error processing refund:", error)
      toast.error("Failed to process refund")
    }
  }

  const handleIssueReceipt = async () => {
    try {
      const response = await issueReceipt(paymentId)
      if (response.success) {
        toast.success("Receipt issued successfully")
      }
    } catch (error) {
      console.error("Error issuing receipt:", error)
      toast.error("Failed to issue receipt")
    }
  }

  const handleSendEmail = async () => {
    try {
      const response = await sendReceiptByEmail(paymentId, {
        email: emailData.email || undefined,
        message: emailData.message || undefined,
      })

      if (response.success) {
        toast.success("Receipt sent by email successfully")
        setShowEmailDialog(false)
        // Reset email form
        setEmailData({
          email: "",
          message: "",
        })
      }
    } catch (error) {
      console.error("Error sending receipt by email:", error)
      toast.error("Failed to send receipt by email")
    }
  }

  const handlePrintReceipt = () => {
    window.print()
  }

  // Render payment method specific details
  const renderPaymentMethodDetails = () => {
    switch (payment.method) {
      case "credit_card":
        return payment.cardDetails ? (
          <div className="space-y-2">
            <p>
              <span className="font-medium">Card Type:</span> {payment.cardDetails.cardType}
            </p>
            <p>
              <span className="font-medium">Last 4 Digits:</span> {payment.cardDetails.last4}
            </p>
            <p>
              <span className="font-medium">Expiry:</span> {payment.cardDetails.expiryMonth}/
              {payment.cardDetails.expiryYear}
            </p>
            <p>
              <span className="font-medium">Cardholder:</span> {payment.cardDetails.cardholderName}
            </p>
          </div>
        ) : (
          <p className="text-muted-foreground">No card details available</p>
        )
      case "bank_transfer":
        return payment.bankDetails ? (
          <div className="space-y-2">
            <p>
              <span className="font-medium">Bank Name:</span> {payment.bankDetails.bankName}
            </p>
            <p>
              <span className="font-medium">Account Number:</span> {payment.bankDetails.accountNumber}
            </p>
            <p>
              <span className="font-medium">Routing Number:</span> {payment.bankDetails.routingNumber}
            </p>
            <p>
              <span className="font-medium">Account Name:</span> {payment.bankDetails.accountName}
            </p>
          </div>
        ) : (
          <p className="text-muted-foreground">No bank details available</p>
        )
      case "mobile_money":
        return payment.mobileMoneyDetails ? (
          <div className="space-y-2">
            <p>
              <span className="font-medium">Provider:</span> {payment.mobileMoneyDetails.provider}
            </p>
            <p>
              <span className="font-medium">Phone Number:</span> {payment.mobileMoneyDetails.phoneNumber}
            </p>
            <p>
              <span className="font-medium">Transaction ID:</span> {payment.mobileMoneyDetails.transactionId}
            </p>
          </div>
        ) : (
          <p className="text-muted-foreground">No mobile money details available</p>
        )
      case "paypal":
      case "stripe":
        return payment.onlinePaymentDetails ? (
          <div className="space-y-2">
            <p>
              <span className="font-medium">Provider:</span> {payment.onlinePaymentDetails.provider}
            </p>
            <p>
              <span className="font-medium">Payment ID:</span> {payment.onlinePaymentDetails.paymentId}
            </p>
            <p>
              <span className="font-medium">Payer Email:</span> {payment.onlinePaymentDetails.payerEmail}
            </p>
          </div>
        ) : (
          <p className="text-muted-foreground">No online payment details available</p>
        )
      case "cash":
      default:
        return <p className="text-muted-foreground">No additional details for this payment method</p>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Payment {payment.receiptNumber ? `#${payment.receiptNumber}` : ""}
          </h1>
          <p className="text-muted-foreground">
            {getStatusBadge(payment.status)} • {formatDate(payment.paidAt)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => router.push("/dashboard/payments")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          {payment.receiptIssued && (
            <Button variant="outline" onClick={handlePrintReceipt}>
              <Printer className="mr-2 h-4 w-4" />
              Print Receipt
            </Button>
          )}

          {payment.status === "Completed" && !payment.receiptIssued && (
            <Button onClick={handleIssueReceipt}>
              <ReceiptIcon className="mr-2 h-4 w-4" />
              Issue Receipt
            </Button>
          )}

          {payment.receiptIssued && (
            <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Send className="mr-2 h-4 w-4" />
                  Send Receipt
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Send Receipt by Email</DialogTitle>
                  <DialogDescription>
                    Send Receipt #{payment.receiptNumber} to the guest or another email address
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={emailData.email}
                      onChange={(e) => setEmailData({ ...emailData, email: e.target.value })}
                      placeholder={payment.guest.email || "recipient@example.com"}
                    />
                    <p className="text-xs text-muted-foreground">
                      Leave blank to use guest's email: {payment.guest.email || "N/A"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message (Optional)</Label>
                    <Textarea
                      id="message"
                      value={emailData.message}
                      onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
                      placeholder="Add a custom message to the email"
                      rows={4}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowEmailDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSendEmail}>Send Email</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {payment.status === "Completed" && !payment.isRefund && (
            <Dialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700">
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Process Refund
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Process Refund</DialogTitle>
                  <DialogDescription>
                    Enter the refund details for Payment {payment.receiptNumber ? `#${payment.receiptNumber}` : ""}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Refund Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      max={payment.amountPaid}
                      value={refundData.amount || ""}
                      onChange={(e) => setRefundData({ ...refundData, amount: Number.parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                    />
                    <p className="text-xs text-muted-foreground">
                      Maximum refund amount: {formatCurrency(payment.amountPaid, payment.currency)}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="refundReference">Refund Reference (Optional)</Label>
                    <Input
                      id="refundReference"
                      value={refundData.refundReference}
                      onChange={(e) => setRefundData({ ...refundData, refundReference: e.target.value })}
                      placeholder="REF123456"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason for Refund</Label>
                    <Textarea
                      id="reason"
                      value={refundData.reason}
                      onChange={(e) => setRefundData({ ...refundData, reason: e.target.value })}
                      placeholder="Please provide a reason for the refund"
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowRefundDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleProcessRefund}>Process Refund</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Guest Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="font-medium">{payment.guest.full_name}</p>
              <p>{payment.guest.email}</p>
              <p>{payment.guest.phone}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Amount:</span>
                <span className="font-bold">{formatCurrency(payment.amountPaid, payment.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Method:</span>
                <span>{getFormattedMethod(payment.method)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Status:</span>
                <span>{getStatusBadge(payment.status)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Date:</span>
                <span>{formatDate(payment.paidAt)}</span>
              </div>
              {payment.transactionReference && (
                <div className="flex justify-between">
                  <span className="font-medium">Reference:</span>
                  <span>{payment.transactionReference}</span>
                </div>
              )}
              {payment.isDeposit && (
                <div className="flex justify-between">
                  <span className="font-medium">Type:</span>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    Deposit
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Related Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {payment.invoice && (
                <div>
                  <h3 className="font-medium mb-2">Invoice</h3>
                  <p>
                    <span className="font-medium">Number:</span>{" "}
                    <Button variant="link" className="h-auto p-0" asChild>
                      <a href={`/dashboard/invoices/${payment.invoice._id}`}>{payment.invoice.invoiceNumber}</a>
                    </Button>
                  </p>
                  <p>
                    <span className="font-medium">Total:</span>{" "}
                    {formatCurrency(payment.invoice.total, payment.currency)}
                  </p>
                  <p>
                    <span className="font-medium">Status:</span> {payment.invoice.status}
                  </p>
                </div>
              )}

              {payment.booking && (
                <div>
                  <h3 className="font-medium mb-2">Booking</h3>
                  <p>
                    <span className="font-medium">Number:</span>{" "}
                    <Button variant="link" className="h-auto p-0" asChild>
                      <a href={`/dashboard/bookings/${payment.booking._id}`}>{payment.booking.confirmation_number}</a>
                    </Button>
                  </p>
                  <p>
                    <span className="font-medium">Check-in:</span> {formatDate(payment.booking.check_in)}
                  </p>
                  <p>
                    <span className="font-medium">Check-out:</span> {formatDate(payment.booking.check_out)}
                  </p>
                </div>
              )}

              {payment.order && (
                <div>
                  <h3 className="font-medium mb-2">Order</h3>
                  <p>
                    <span className="font-medium">Number:</span>{" "}
                    <Button variant="link" className="h-auto p-0" asChild>
                      <a href={`/dashboard/orders/${payment.order._id}`}>{payment.order.orderNumber}</a>
                    </Button>
                  </p>
                  <p>
                    <span className="font-medium">Total:</span>{" "}
                    {formatCurrency(payment.order.totalAmount, payment.currency)}
                  </p>
                </div>
              )}

              {!payment.invoice && !payment.booking && !payment.order && (
                <p className="text-muted-foreground">No related information available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Method Details</CardTitle>
        </CardHeader>
        <CardContent>{renderPaymentMethodDetails()}</CardContent>
      </Card>

      {payment.isRefund && payment.refundDetails && (
        <Card>
          <CardHeader>
            <CardTitle>Refund Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Refund Amount:</span>{" "}
                {formatCurrency(payment.refundDetails.amount, payment.currency)}
              </p>
              <p>
                <span className="font-medium">Refunded On:</span> {formatDate(payment.refundDetails.refundedAt)}
              </p>
              {payment.refundDetails.refundReference && (
                <p>
                  <span className="font-medium">Reference:</span> {payment.refundDetails.refundReference}
                </p>
              )}
              {payment.refundDetails.reason && (
                <div>
                  <p className="font-medium">Reason:</p>
                  <p className="whitespace-pre-line mt-1">{payment.refundDetails.reason}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {payment.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line">{payment.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
