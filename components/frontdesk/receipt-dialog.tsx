"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Printer, Download, Mail } from "lucide-react"
import { format } from "date-fns"

interface ReceiptDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  receiptData: any
}

export function ReceiptDialog({ open, onOpenChange, receiptData }: ReceiptDialogProps) {
  if (!receiptData) return null

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    // In a real app, this would generate and download a PDF
    console.log("Download receipt as PDF")
  }

  const handleEmail = () => {
    // In a real app, this would send the receipt via email
    console.log("Email receipt to guest")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Check-in Receipt</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 print:text-black">
          {/* Hotel Header */}
          <div className="text-center border-b pb-4">
            <h1 className="text-2xl font-bold">Grand Hotel</h1>
            <p className="text-muted-foreground">123 Main Street, City, State 12345</p>
            <p className="text-muted-foreground">Phone: +1-555-0100 | Email: info@grandhotel.com</p>
          </div>

          {/* Receipt Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Guest Information</h3>
              <p>
                <strong>Name:</strong> {receiptData.guest?.full_name}
              </p>
              <p>
                <strong>Email:</strong> {receiptData.guest?.email}
              </p>
              <p>
                <strong>Phone:</strong> {receiptData.guest?.phone}
              </p>
              {receiptData.guest?.vip && <Badge className="mt-1 bg-purple-100 text-purple-800">VIP Guest</Badge>}
            </div>
            <div>
              <h3 className="font-semibold mb-2">Receipt Details</h3>
              <p>
                <strong>Receipt #:</strong> {receiptData.folio_number || "RCP-" + Date.now()}
              </p>
              <p>
                <strong>Date:</strong> {format(new Date(), "MMM dd, yyyy")}
              </p>
              <p>
                <strong>Time:</strong> {format(new Date(), "HH:mm")}
              </p>
              <p>
                <strong>Staff:</strong> Front Desk Agent
              </p>
            </div>
          </div>

          <Separator />

          {/* Stay Information */}
          <div>
            <h3 className="font-semibold mb-2">Stay Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p>
                  <strong>Room:</strong> {receiptData.room?.roomNumber}
                </p>
                <p>
                  <strong>Room Type:</strong> {receiptData.room?.roomType?.name}
                </p>
                <p>
                  <strong>Floor:</strong> {receiptData.room?.floor}
                </p>
              </div>
              <div>
                <p>
                  <strong>Check-in:</strong>{" "}
                  {receiptData.check_in_date
                    ? format(new Date(receiptData.check_in_date), "MMM dd, yyyy")
                    : format(new Date(), "MMM dd, yyyy")}
                </p>
                <p>
                  <strong>Check-out:</strong>{" "}
                  {receiptData.expected_check_out
                    ? format(new Date(receiptData.expected_check_out), "MMM dd, yyyy")
                    : "TBD"}
                </p>
                <p>
                  <strong>Guests:</strong> {receiptData.number_of_guests || 1}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Charges */}
          <div>
            <h3 className="font-semibold mb-2">Charges</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Room Rate (per night)</span>
                <span>${receiptData.room_rate || receiptData.room?.roomType?.basePrice || 0}</span>
              </div>
              {receiptData.number_of_nights && (
                <div className="flex justify-between">
                  <span>Number of Nights</span>
                  <span>{receiptData.number_of_nights}</span>
                </div>
              )}
              {receiptData.additional_charges?.map((charge: any, index: number) => (
                <div key={index} className="flex justify-between">
                  <span>{charge.description}</span>
                  <span>${charge.amount}</span>
                </div>
              ))}
              {receiptData.deposit_amount > 0 && (
                <div className="flex justify-between">
                  <span>Security Deposit</span>
                  <span>${receiptData.deposit_amount}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total Amount</span>
                <span>${receiptData.total_amount || receiptData.grand_total || 0}</span>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          {receiptData.payment_method && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Payment Information</h3>
                <p>
                  <strong>Payment Method:</strong> {receiptData.payment_method}
                </p>
                <p>
                  <strong>Payment Status:</strong> {receiptData.payment_status || "Pending"}
                </p>
                {receiptData.balance_due && (
                  <p>
                    <strong>Balance Due:</strong> ${receiptData.balance_due}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Key Cards */}
          <Separator />
          <div>
            <h3 className="font-semibold mb-2">Key Cards Issued</h3>
            <p>{receiptData.key_cards_issued || 2} key cards provided</p>
          </div>

          {/* Special Requests */}
          {receiptData.special_requests && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Special Requests</h3>
                <p className="text-sm">{receiptData.special_requests}</p>
              </div>
            </>
          )}

          {/* Footer */}
          <Separator />
          <div className="text-center text-sm text-muted-foreground">
            <p>Thank you for choosing Grand Hotel!</p>
            <p>We hope you enjoy your stay with us.</p>
            <p className="mt-2">For assistance, please contact the front desk at extension 0</p>
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
            Download
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
