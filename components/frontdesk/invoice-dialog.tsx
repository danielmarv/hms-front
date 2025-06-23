"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Printer, Download, Mail } from "lucide-react"
import { format } from "date-fns"

interface InvoiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoiceData: any
}

export function InvoiceDialog({ open, onOpenChange, invoiceData }: InvoiceDialogProps) {
  if (!invoiceData) return null

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    // In a real app, this would generate and download a PDF
    console.log("Download invoice as PDF")
  }

  const handleEmail = () => {
    // In a real app, this would send the invoice via email
    console.log("Email invoice to guest")
  }

  // Calculate totals
  const subtotal = (invoiceData.room?.roomType?.basePrice || 0) * (invoiceData.number_of_nights || 1)
  const taxRate = 0.1 // 10% tax
  const taxAmount = subtotal * taxRate
  const total = subtotal + taxAmount

  const invoiceItems = [
    {
      description: `Room ${invoiceData.room?.roomNumber} - ${invoiceData.room?.roomType?.name}`,
      quantity: invoiceData.number_of_nights || 1,
      rate: invoiceData.room?.roomType?.basePrice || 0,
      amount: subtotal,
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Guest Invoice</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 print:text-black">
          {/* Hotel Header */}
          <div className="text-center border-b pb-4">
            <h1 className="text-3xl font-bold">Grand Hotel</h1>
            <p className="text-muted-foreground">123 Main Street, City, State 12345</p>
            <p className="text-muted-foreground">Phone: +1-555-0100 | Email: info@grandhotel.com</p>
            <p className="text-muted-foreground">Tax ID: 123-456-789</p>
          </div>

          {/* Invoice Header */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-bold mb-4">INVOICE</h2>
              <div className="space-y-1">
                <p>
                  <strong>Invoice #:</strong> INV-{Date.now()}
                </p>
                <p>
                  <strong>Date:</strong> {format(new Date(), "MMM dd, yyyy")}
                </p>
                <p>
                  <strong>Due Date:</strong> {format(new Date(), "MMM dd, yyyy")}
                </p>
                <p>
                  <strong>Folio #:</strong> {invoiceData.folio_number || "F-" + Date.now()}
                </p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Bill To:</h3>
              <div className="space-y-1">
                <p className="font-medium">{invoiceData.guest?.full_name}</p>
                <p>{invoiceData.guest?.email}</p>
                <p>{invoiceData.guest?.phone}</p>
                {invoiceData.guest?.address && (
                  <>
                    <p>{invoiceData.guest.address.street}</p>
                    <p>
                      {invoiceData.guest.address.city}, {invoiceData.guest.address.state}{" "}
                      {invoiceData.guest.address.zip}
                    </p>
                    <p>{invoiceData.guest.address.country}</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Stay Details */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Stay Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Room</p>
                <p className="font-medium">{invoiceData.room?.roomNumber}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Check-in</p>
                <p className="font-medium">{format(new Date(), "MMM dd, yyyy")}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Check-out</p>
                <p className="font-medium">
                  {invoiceData.expected_check_out
                    ? format(new Date(invoiceData.expected_check_out), "MMM dd, yyyy")
                    : "TBD"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Guests</p>
                <p className="font-medium">{invoiceData.number_of_guests || 1}</p>
              </div>
            </div>
          </div>

          {/* Invoice Items */}
          <div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-center">Quantity</TableHead>
                  <TableHead className="text-right">Rate</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoiceItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell className="text-right">${item.rate.toFixed(2)}</TableCell>
                    <TableCell className="text-right">${item.amount.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
                {invoiceData.additional_charges?.map((charge: any, index: number) => (
                  <TableRow key={`charge-${index}`}>
                    <TableCell>{charge.description}</TableCell>
                    <TableCell className="text-center">1</TableCell>
                    <TableCell className="text-right">${charge.amount.toFixed(2)}</TableCell>
                    <TableCell className="text-right">${charge.amount.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-80 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {invoiceData.discounts?.map((discount: any, index: number) => (
                <div key={index} className="flex justify-between text-green-600">
                  <span>Discount ({discount.description}):</span>
                  <span>-${discount.amount.toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between">
                <span>Tax ({(taxRate * 100).toFixed(0)}%):</span>
                <span>${taxAmount.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
              {invoiceData.deposit_amount > 0 && (
                <>
                  <div className="flex justify-between text-green-600">
                    <span>Paid (Deposit):</span>
                    <span>-${invoiceData.deposit_amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-red-600">
                    <span>Balance Due:</span>
                    <span>${(total - invoiceData.deposit_amount).toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Payment Terms */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Payment Terms</h3>
            <p className="text-sm text-muted-foreground">
              Payment is due upon check-out. We accept cash, credit cards, and bank transfers. Late checkout fees may
              apply for departures after 12:00 PM.
            </p>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground border-t pt-4">
            <p>Thank you for choosing Grand Hotel!</p>
            <p>For questions about this invoice, please contact our front desk.</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2 print:hidden">
          <Button variant="outline" onClick={handleEmail}>
            <Mail className="mr-2 h-4 w-4" />
            Email
          </Button>
          <Button variant="outline" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
