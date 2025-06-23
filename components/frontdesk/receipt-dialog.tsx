"use client"

import { useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Printer } from "lucide-react"
import { format } from "date-fns"

interface ReceiptDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  receiptData: any
}

export function ReceiptDialog({ open, onOpenChange, receiptData }: ReceiptDialogProps) {
  const printRef = useRef<HTMLDivElement>(null)

  if (!receiptData) return null

  const handlePrint = () => {
    if (printRef.current) {
      const printContent = printRef.current.innerHTML
      const printWindow = window.open("", "_blank")
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Check-in Receipt</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; font-size: 12px; }
                .header { text-align: center; margin-bottom: 20px; }
                .section { margin-bottom: 15px; }
                .row { display: flex; justify-content: space-between; margin-bottom: 5px; }
                .total { font-weight: bold; border-top: 1px solid #000; padding-top: 5px; }
                @media print {
                  body { margin: 0; font-size: 10px; }
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Check-in Receipt</DialogTitle>
        </DialogHeader>

        <div ref={printRef} className="space-y-4">
          {/* Hotel Header */}
          <div className="text-center">
            <h2 className="text-lg font-bold">Grand Hotel</h2>
            <p className="text-sm text-muted-foreground">123 Main Street, City, State 12345</p>
            <p className="text-sm text-muted-foreground">Phone: +1-555-0100</p>
          </div>

          <Separator />

          {/* Receipt Details */}
          <div className="space-y-3">
            <div className="text-center">
              <h3 className="font-semibold">CHECK-IN RECEIPT</h3>
              <p className="text-sm text-muted-foreground">{format(new Date(), "MMMM dd, yyyy 'at' HH:mm")}</p>
            </div>

            {/* Guest Information */}
            <div>
              <h4 className="font-medium mb-2">Guest Information</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Name:</span>
                  <span>{receiptData.guest?.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Email:</span>
                  <span>{receiptData.guest?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phone:</span>
                  <span>{receiptData.guest?.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span>Folio Number:</span>
                  <span className="font-mono">{receiptData.folio_number}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Stay Information */}
            <div>
              <h4 className="font-medium mb-2">Stay Information</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Room:</span>
                  <span>{receiptData.room?.roomNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Check-in:</span>
                  <span>{format(new Date(receiptData.check_in_date), "MMM dd, yyyy")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Check-out:</span>
                  <span>{format(new Date(receiptData.expected_check_out), "MMM dd, yyyy")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Nights:</span>
                  <span>{receiptData.number_of_nights}</span>
                </div>
                <div className="flex justify-between">
                  <span>Guests:</span>
                  <span>{receiptData.number_of_guests}</span>
                </div>
                <div className="flex justify-between">
                  <span>Key Cards:</span>
                  <span>{receiptData.key_cards_issued}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Charges */}
            <div>
              <h4 className="font-medium mb-2">Charges</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Room Rate (per night):</span>
                  <span>${receiptData.room_rate}</span>
                </div>
                <div className="flex justify-between">
                  <span>Room Charges:</span>
                  <span>${receiptData.total_room_charges}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax ({receiptData.tax_rate}%):</span>
                  <span>${receiptData.tax_amount}</span>
                </div>
                {receiptData.deposit_amount > 0 && (
                  <div className="flex justify-between">
                    <span>Deposit Paid:</span>
                    <span>${receiptData.deposit_amount}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total Amount:</span>
                  <span>${receiptData.total_amount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Balance Due:</span>
                  <span>${receiptData.balance_due || 0}</span>
                </div>
              </div>
            </div>

            {/* Payment Status */}
            <div className="text-center">
              <Badge
                className={
                  receiptData.payment_status === "paid"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }
              >
                {receiptData.payment_status?.toUpperCase()}
              </Badge>
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-muted-foreground mt-4">
              <p>Thank you for choosing Grand Hotel!</p>
              <p>Check-out time: 11:00 AM</p>
              <p>For assistance, call +1-555-0100</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 no-print">
          <Button onClick={handlePrint} className="flex-1">
            <Printer className="mr-2 h-4 w-4" />
            Print Receipt
          </Button>
          <Button onClick={() => onOpenChange(false)} variant="outline">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
