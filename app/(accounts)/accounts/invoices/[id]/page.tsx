"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useInvoices } from "@/hooks/use-invoices"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { ArrowLeft, Printer, Send, CreditCard, FileText, AlertTriangle } from "lucide-react"
import { format } from "date-fns"

export default function InvoiceDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { invoice, isLoading, getInvoiceById, issueInvoice, cancelInvoice, recordPayment, sendInvoiceByEmail } =
    useInvoices()

  const [cancelReason, setCancelReason] = useState("")
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  const [paymentData, setPaymentData] = useState({
    amountPaid: 0,
    paymentMethod: "credit_card",
    paymentDate: new Date().toISOString().split("T")[0],
    reference: "",
  })
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)

  const [emailData, setEmailData] = useState({
    email: "",
    message: "",
  })
  const [showEmailDialog, setShowEmailDialog] = useState(false)

  const invoiceId = params.id as string

  useEffect(() => {
    if (invoiceId) {
      getInvoiceById(invoiceId)
    }
  }, [invoiceId])

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Loading invoice details...</p>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
        <AlertTriangle className="h-12 w-12 text-yellow-500" />
        <h2 className="text-2xl font-bold">Invoice Not Found</h2>
        <p className="text-muted-foreground">The requested invoice could not be found.</p>
        <Button onClick={() => router.push("/dashboard/invoices")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Invoices
        </Button>
      </div>
    )
  }

  // Format date to display in a more readable format
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return format(date, "MMMM d, yyyy")
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
      case "Paid":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Paid
          </Badge>
        )
      case "Partially Paid":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Partially Paid
          </Badge>
        )
      case "Issued":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Issued
          </Badge>
        )
      case "Draft":
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            Draft
          </Badge>
        )
      case "Cancelled":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Cancelled
          </Badge>
        )
      case "Overdue":
        return (
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            Overdue
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleIssueInvoice = async () => {
    if (invoice.status !== "Draft") {
      toast.error("Only draft invoices can be issued")
      return
    }

    try {
      const response = await issueInvoice(invoiceId)
      if (response.success) {
        toast.success("Invoice issued successfully")
      }
    } catch (error) {
      console.error("Error issuing invoice:", error)
      toast.error("Failed to issue invoice")
    }
  }

  const handleCancelInvoice = async () => {
    try {
      const response = await cancelInvoice(invoiceId, cancelReason)
      if (response.success) {
        toast.success("Invoice cancelled successfully")
        setShowCancelDialog(false)
      }
    } catch (error) {
      console.error("Error cancelling invoice:", error)
      toast.error("Failed to cancel invoice")
    }
  }

  const handleRecordPayment = async () => {
    try {
      if (paymentData.amountPaid <= 0) {
        toast.error("Payment amount must be greater than zero")
        return
      }

      const response = await recordPayment(invoiceId, {
        amountPaid: paymentData.amountPaid,
        paymentMethod: paymentData.paymentMethod,
        paymentDate: paymentData.paymentDate,
        reference: paymentData.reference,
      })

      if (response.success) {
        toast.success("Payment recorded successfully")
        setShowPaymentDialog(false)
        // Reset payment form
        setPaymentData({
          amountPaid: 0,
          paymentMethod: "credit_card",
          paymentDate: new Date().toISOString().split("T")[0],
          reference: "",
        })
      }
    } catch (error) {
      console.error("Error recording payment:", error)
      toast.error("Failed to record payment")
    }
  }

  const handleSendEmail = async () => {
    try {
      const response = await sendInvoiceByEmail(invoiceId, {
        email: emailData.email || undefined,
        message: emailData.message || undefined,
      })

      if (response.success) {
        toast.success("Invoice sent by email successfully")
        setShowEmailDialog(false)
        // Reset email form
        setEmailData({
          email: "",
          message: "",
        })
      }
    } catch (error) {
      console.error("Error sending invoice by email:", error)
      toast.error("Failed to send invoice by email")
    }
  }

  const handlePrintInvoice = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoice #{invoice.invoiceNumber}</h1>
          <p className="text-muted-foreground">
            {getStatusBadge(invoice.status)} • Issued: {formatDate(invoice.issuedDate || invoice.createdAt)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => router.push("/dashboard/invoices")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button variant="outline" onClick={handlePrintInvoice}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>

          {invoice.status === "Draft" && (
            <Button onClick={handleIssueInvoice}>
              <FileText className="mr-2 h-4 w-4" />
              Issue Invoice
            </Button>
          )}

          {(invoice.status === "Issued" || invoice.status === "Partially Paid") && (
            <>
              <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Record Payment
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Record Payment</DialogTitle>
                    <DialogDescription>
                      Enter the payment details for Invoice #{invoice.invoiceNumber}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="amountPaid">Amount</Label>
                      <Input
                        id="amountPaid"
                        type="number"
                        step="0.01"
                        min="0"
                        max={invoice.balance}
                        value={paymentData.amountPaid || ""}
                        onChange={(e) =>
                          setPaymentData({ ...paymentData, amountPaid: Number.parseFloat(e.target.value) || 0 })
                        }
                        placeholder="0.00"
                      />
                      <p className="text-xs text-muted-foreground">
                        Outstanding balance: {formatCurrency(invoice.balance, invoice.currency)}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paymentMethod">Payment Method</Label>
                      <Select
                        value={paymentData.paymentMethod}
                        onValueChange={(value) => setPaymentData({ ...paymentData, paymentMethod: value })}
                      >
                        <SelectTrigger id="paymentMethod">
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="credit_card">Credit Card</SelectItem>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                          <SelectItem value="paypal">PayPal</SelectItem>
                          <SelectItem value="mobile_money">Mobile Money</SelectItem>
                          <SelectItem value="check">Check</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paymentDate">Payment Date</Label>
                      <Input
                        id="paymentDate"
                        type="date"
                        value={paymentData.paymentDate}
                        onChange={(e) => setPaymentData({ ...paymentData, paymentDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reference">Reference</Label>
                      <Input
                        id="reference"
                        value={paymentData.reference}
                        onChange={(e) => setPaymentData({ ...paymentData, reference: e.target.value })}
                        placeholder="Transaction reference"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleRecordPayment}>Record Payment</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Send className="mr-2 h-4 w-4" />
                    Send Email
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Send Invoice by Email</DialogTitle>
                    <DialogDescription>
                      Send Invoice #{invoice.invoiceNumber} to the guest or another email address
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
                        placeholder={invoice.guest.email || "recipient@example.com"}
                      />
                      <p className="text-xs text-muted-foreground">
                        Leave blank to use guest's email: {invoice.guest.email || "N/A"}
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
            </>
          )}

          {(invoice.status === "Draft" || invoice.status === "Issued" || invoice.status === "Partially Paid") && (
            <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Cancel Invoice
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cancel Invoice</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to cancel Invoice #{invoice.invoiceNumber}? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="cancelReason">Reason for Cancellation</Label>
                    <Textarea
                      id="cancelReason"
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      placeholder="Please provide a reason for cancellation"
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                    No, Keep Invoice
                  </Button>
                  <Button variant="destructive" onClick={handleCancelInvoice}>
                    Yes, Cancel Invoice
                  </Button>
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
              <p className="font-medium">{invoice.guest.full_name}</p>
              <p>{invoice.guest.email}</p>
              <p>{invoice.guest.phone}</p>
              {invoice.guest.address && <p>{invoice.guest.address}</p>}
            </div>
          </CardContent>
        </Card>

        {invoice.booking && (
          <Card>
            <CardHeader>
              <CardTitle>Booking Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Confirmation:</span> {invoice.booking.confirmation_number}
                </p>
                <p>
                  <span className="font-medium">Check-in:</span> {formatDate(invoice.booking.check_in)}
                </p>
                <p>
                  <span className="font-medium">Check-out:</span> {formatDate(invoice.booking.check_out)}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Invoice Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Subtotal:</span>
                <span>{formatCurrency(invoice.subtotal, invoice.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Tax:</span>
                <span>{formatCurrency(invoice.taxTotal, invoice.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Discount:</span>
                <span>-{formatCurrency(invoice.discountTotal, invoice.currency)}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="font-medium">Total:</span>
                <span className="font-bold">{formatCurrency(invoice.total, invoice.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Amount Paid:</span>
                <span>{formatCurrency(invoice.amountPaid, invoice.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Balance Due:</span>
                <span className="font-bold">{formatCurrency(invoice.balance, invoice.currency)}</span>
              </div>
              <div className="pt-2">
                <span className="font-medium">Due Date:</span> {formatDate(invoice.dueDate)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoice Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50%]">Description</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.description}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.unitPrice, invoice.currency)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.total, invoice.currency)}</TableCell>
                </TableRow>
              ))}
              {invoice.items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                    No items found in this invoice
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {invoice.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line">{invoice.notes}</p>
          </CardContent>
        </Card>
      )}

      {invoice.paymentTerms && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line">{invoice.paymentTerms}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
