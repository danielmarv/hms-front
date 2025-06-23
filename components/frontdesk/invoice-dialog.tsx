"use client"

import { useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Printer } from "lucide-react"
import { format } from "date-fns"

interface InvoiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoiceData: any
}

export function InvoiceDialog({ open, onOpenChange, invoiceData }: InvoiceDialogProps) {
  const printRef = useRef<HTMLDivElement>(null)

  if (!invoiceData) return null

  const handlePrint = () => {
    if (printRef.current) {
      const printContent = printRef.current.innerHTML
      const printWindow = window.open("", "_blank")
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Invoice</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .invoice-header { display: flex; justify-content: space-between; margin-bottom: 30px; }
                .section { margin-bottom: 20px; }
                .table { width: 100%; border-collapse: collapse; }
                .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                .table th { background-color: #f5f5f5; }
                .total-row { font-weight: bold; background-color: #f9f9f9; }
                @media print {
                  body { margin: 0; }
                  .no-print { display: none; }
                }
              </style>
            </head>
            <body>
              ${printContent}
            </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.print()
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Guest Invoice</DialogTitle>
        </DialogHeader>

        <div ref={printRef} className="space-y-6">
          {/* Hotel Header */}
          <div className="text-center">
            <h1 className="text-2xl font-bold">Grand Hotel</h1>
            <p className="text-muted-foreground">123 Main Street, City, State 12345</p>
            <p className="text-muted-foreground">Phone: +1-555-0100 | Email: info@grandhotel.com</p>
          </div>

          {/* Invoice Header */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold">INVOICE</h2>
              <p className="text-sm text-muted-foreground">Date: {format(new Date(), "MMMM dd, yyyy")}</p>
              <p className="text-sm text-muted-foreground">
                Invoice #: INV-{format(new Date(), "yyyyMMdd")}-{Math.random().toString(36).substr(2, 6).toUpperCase()}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold">Folio Number:</p>
              <p className="font-mono text-lg">{invoiceData.selectedBooking?.confirmation_number || "WALK-IN"}</p>
            </div>
          </div>

          <Separator />

          {/* Bill To */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-2">Bill To:</h3>
              <div className="space-y-1">
                <p className="font-medium">{invoiceData.selectedGuest?.full_name}</p>
                <p>{invoiceData.selectedGuest?.email}</p>
                <p>{invoiceData.selectedGuest?.phone}</p>
                {invoiceData.selectedGuest?.address && (
                  <>
                    <p>{invoiceData.selectedGuest.address.street}</p>
                    <p>
                      {invoiceData.selectedGuest.address.city}, {invoiceData.selectedGuest.address.state}{" "}
                      {invoiceData.selectedGuest.address.postal_code}
                    </p>
                    <p>{invoiceData.selectedGuest.address.country}</p>
                  </>
                )}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Stay Details:</h3>
              <div className="space-y-1">
                <p>Room: {invoiceData.selectedRoom?.roomNumber}</p>
                <p>Room Type: {invoiceData.selectedRoom?.roomType?.name}</p>
                <p>
                  Check-in:{" "}
                  {invoiceData.selectedBooking
                    ? format(new Date(invoiceData.selectedBooking.check_in), "MMM dd, yyyy")
                    : format(new Date(), "MMM dd, yyyy")}
                </p>
                <p>
                  Check-out:{" "}
                  {invoiceData.selectedBooking
                    ? format(new Date(invoiceData.selectedBooking.check_out), "MMM dd, yyyy")
                    : "TBD"}
                </p>
                <p>Nights: {invoiceData.selectedBooking?.duration || 1}</p>
                <p>Guests: {invoiceData.selectedBooking?.number_of_guests || 1}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Invoice Items */}
          <div>
            <h3 className="font-semibold mb-4">Charges</h3>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 p-3 text-left">Description</th>
                  <th className="border border-gray-300 p-3 text-center">Quantity</th>
                  <th className="border border-gray-300 p-3 text-right">Rate</th>
                  <th className="border border-gray-300 p-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-3">
                    Room Charges - {invoiceData.selectedRoom?.roomType?.name}
                  </td>
                  <td className="border border-gray-300 p-3 text-center">
                    {invoiceData.selectedBooking?.duration || 1} nights
                  </td>
                  <td className="border border-gray-300 p-3 text-right">
                    ${invoiceData.selectedRoom?.roomType?.basePrice}
                  </td>
                  <td className="border border-gray-300 p-3 text-right">
                    $
                    {(
                      invoiceData.selectedRoom?.roomType?.basePrice * (invoiceData.selectedBooking?.duration || 1)
                    ).toFixed(2)}
                  </td>
                </tr>

                {/* Additional charges would go here */}

                <tr>
                  <td className="border border-gray-300 p-3" colSpan={3}>
                    <strong>Subtotal</strong>
                  </td>
                  <td className="border border-gray-300 p-3 text-right">
                    <strong>
                      $
                      {(
                        invoiceData.selectedRoom?.roomType?.basePrice * (invoiceData.selectedBooking?.duration || 1)
                      ).toFixed(2)}
                    </strong>
                  </td>
                </tr>

                <tr>
                  <td className="border border-gray-300 p-3" colSpan={3}>
                    Tax (10%)
                  </td>
                  <td className="border border-gray-300 p-3 text-right">
                    $
                    {(
                      invoiceData.selectedRoom?.roomType?.basePrice *
                      (invoiceData.selectedBooking?.duration || 1) *
                      0.1
                    ).toFixed(2)}
                  </td>
                </tr>

                {invoiceData.checkInData?.depositAmount > 0 && (
                  <tr>
                    <td className="border border-gray-300 p-3" colSpan={3}>
                      Additional Deposit
                    </td>
                    <td className="border border-gray-300 p-3 text-right">
                      ${invoiceData.checkInData.depositAmount.toFixed(2)}
                    </td>
                  </tr>
                )}

                <tr className="bg-gray-100">
                  <td className="border border-gray-300 p-3" colSpan={3}>
                    <strong>TOTAL AMOUNT</strong>
                  </td>
                  <td className="border border-gray-300 p-3 text-right">
                    <strong className="text-lg">
                      $
                      {(
                        invoiceData.selectedRoom?.roomType?.basePrice *
                          (invoiceData.selectedBooking?.duration || 1) *
                          1.1 +
                        (invoiceData.checkInData?.depositAmount || 0)
                      ).toFixed(2)}
                    </strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Payment Information */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-2">Payment Information:</h3>
              <div className="space-y-1 text-sm">
                <p>
                  Payment Status: <Badge className="ml-2">Pending</Badge>
                </p>
                <p>Payment Due: Upon Check-out</p>
                <p>Accepted Methods: Cash, Credit Card, Debit Card</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Hotel Policies:</h3>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>• Check-out time: 11:00 AM</p>
                <p>• Late check-out charges may apply</p>
                <p>• Damage charges will be added if applicable</p>
                <p>• No smoking policy in effect</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground border-t pt-4">
            <p>Thank you for choosing Grand Hotel!</p>
            <p>For questions about this invoice, please contact us at +1-555-0100</p>
          </div>
        </div>

        <div className="flex gap-2 no-print">
          <Button onClick={handlePrint} className="flex-1">
            <Printer className="mr-2 h-4 w-4" />
            Print Invoice
          </Button>
          <Button onClick={() => onOpenChange(false)} variant="outline">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
