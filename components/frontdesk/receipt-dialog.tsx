"use client"

import { useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Printer, Download, Mail, MapPin, Phone, Globe } from "lucide-react"
import { format } from "date-fns"

interface ReceiptDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  receiptData: any
  configuration?: any
}

export function ReceiptDialog({ open, onOpenChange, receiptData, configuration }: ReceiptDialogProps) {
  const printRef = useRef<HTMLDivElement>(null)

  if (!receiptData) return null

  const handlePrint = () => {
    if (printRef.current) {
      const printContent = printRef.current.innerHTML
      const printWindow = window.open("", "_blank")
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Check-in Receipt</title>
              <style>
                * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
                }
                body { 
                  font-family: '${configuration?.branding?.fonts?.primary || "Arial"}', sans-serif; 
                  margin: 0; 
                  padding: 20px; 
                  font-size: 12px; 
                  line-height: 1.4;
                  color: #1a1a1a;
                  background: white;
                }
                .header { 
                  text-align: center; 
                  margin-bottom: 30px; 
                  border-bottom: 2px solid ${configuration?.branding?.primaryColor || "#1e40af"};
                  padding-bottom: 20px;
                }
                .hotel-name { 
                  font-size: 24px; 
                  font-weight: bold; 
                  color: ${configuration?.branding?.primaryColor || "#1e40af"}; 
                  margin-bottom: 8px; 
                }
                .hotel-info { 
                  color: #6b7280; 
                  font-size: 11px; 
                  line-height: 1.3;
                }
                .receipt-title { 
                  font-size: 18px; 
                  font-weight: bold; 
                  margin: 20px 0; 
                  text-align: center; 
                  color: ${configuration?.branding?.primaryColor || "#1e40af"};
                  background: ${configuration?.branding?.accentColor || "#f0f9ff"};
                  padding: 10px;
                  border-radius: 5px;
                }
                .section { 
                  margin-bottom: 20px; 
                  page-break-inside: avoid;
                }
                .section-title { 
                  font-weight: bold; 
                  margin-bottom: 8px; 
                  color: #374151; 
                  border-bottom: 1px solid ${configuration?.branding?.secondaryColor || "#e5e7eb"}; 
                  padding-bottom: 4px; 
                  font-size: 14px;
                }
                .info-grid {
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 15px;
                  margin-bottom: 15px;
                }
                .info-row { 
                  display: flex; 
                  justify-content: space-between; 
                  margin-bottom: 6px; 
                  align-items: center;
                }
                .info-label { 
                  color: #6b7280; 
                  font-weight: 500;
                }
                .info-value { 
                  font-weight: 600; 
                  color: #1f2937;
                }
                .charges-section {
                  background: #f9fafb;
                  padding: 15px;
                  border-radius: 8px;
                  border: 1px solid #e5e7eb;
                }
                .charge-row {
                  display: flex;
                  justify-content: space-between;
                  padding: 8px 0;
                  border-bottom: 1px solid #e5e7eb;
                }
                .charge-row:last-child {
                  border-bottom: none;
                }
                .total-row { 
                  font-weight: bold; 
                  background: ${configuration?.branding?.accentColor || "#f3f4f6"}; 
                  padding: 12px;
                  margin-top: 10px;
                  border-radius: 5px;
                  font-size: 16px;
                  color: ${configuration?.branding?.primaryColor || "#059669"};
                }
                .payment-row {
                  background: #dcfce7;
                  border: 1px solid #16a34a;
                  padding: 12px;
                  margin-top: 10px;
                  border-radius: 5px;
                  color: #166534;
                }
                .balance-row {
                  background: #fef2f2;
                  border: 1px solid #dc2626;
                  padding: 12px;
                  margin-top: 10px;
                  border-radius: 5px;
                  color: #dc2626;
                  font-weight: bold;
                  font-size: 16px;
                }
                .key-cards-section {
                  background: ${configuration?.branding?.primaryColor || "#3b82f6"}15;
                  border: 1px solid ${configuration?.branding?.primaryColor || "#3b82f6"};
                  padding: 15px;
                  border-radius: 8px;
                  text-align: center;
                }
                .policies-section {
                  background: #f8fafc;
                  padding: 15px;
                  border-radius: 8px;
                  border: 1px solid #e2e8f0;
                }
                .policies-list {
                  list-style: none;
                  padding: 0;
                }
                .policies-list li {
                  margin: 5px 0;
                  padding-left: 15px;
                  position: relative;
                }
                .policies-list li:before {
                  content: "•";
                  color: ${configuration?.branding?.primaryColor || "#3b82f6"};
                  font-weight: bold;
                  position: absolute;
                  left: 0;
                }
                .footer { 
                  text-align: center; 
                  margin-top: 30px; 
                  color: #6b7280; 
                  font-size: 10px; 
                  border-top: 1px solid #e5e7eb;
                  padding-top: 20px;
                }
                .currency { 
                  font-weight: bold; 
                  color: ${configuration?.branding?.primaryColor || "#059669"};
                }
                .badge {
                  display: inline-block;
                  padding: 4px 8px;
                  border-radius: 4px;
                  font-size: 10px;
                  font-weight: 600;
                  text-transform: uppercase;
                }
                .badge-success {
                  background: #dcfce7;
                  color: #166534;
                }
                .badge-warning {
                  background: #fef3c7;
                  color: #92400e;
                }
                .logo {
                  max-height: 60px;
                  width: auto;
                  margin-bottom: 15px;
                }
                @media print {
                  body { 
                    margin: 0; 
                    padding: 15px; 
                    font-size: 11px; 
                  }
                  .no-print { 
                    display: none !important; 
                  }
                  .page-break { 
                    page-break-before: always; 
                  }
                  .section {
                    page-break-inside: avoid;
                  }
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

  const formatCurrency = (amount: number) => {
    const currency = configuration?.financial?.currency
    if (!currency) return `$${amount.toFixed(2)}`

    const formatted = amount.toFixed(2)
    return currency.position === "before" ? `${currency.symbol}${formatted}` : `${formatted}${currency.symbol}`
  }

  const calculateTotal = () => {
    const roomRate = receiptData.room?.roomType?.basePrice || 0
    const nights = receiptData.number_of_nights || 1
    const subtotal = roomRate * nights

    const taxRate = configuration?.financial?.taxRates?.[0]?.rate || 0
    const taxAmount = subtotal * (taxRate / 100)
    const totalCharges = subtotal + taxAmount

    // Payment made by guest towards the bill
    const paymentReceived = receiptData.deposit_amount || 0
    const balanceDue = totalCharges - paymentReceived

    return {
      subtotal,
      taxAmount,
      taxRate,
      totalCharges,
      paymentReceived,
      balanceDue: Math.max(0, balanceDue),
    }
  }

  const totals = calculateTotal()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[95vh] p-0">
        <DialogHeader className="px-6 py-4 border-b bg-slate-50">
          <DialogTitle className="text-xl font-semibold text-slate-800">Check-in Receipt</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(95vh-140px)]">
          <div ref={printRef} className="p-6 space-y-6">
            {/* Hotel Header */}
            <div className="header text-center">
              {configuration?.branding?.logoUrl && (
                <img
                  src={configuration.branding.logoUrl || "/placeholder.svg"}
                  alt="Hotel Logo"
                  className="logo mx-auto"
                />
              )}
              <h1 className="hotel-name" style={{ color: configuration?.branding?.primaryColor || "#1e40af" }}>
                {configuration?.hotel_name || "Hotel Name"}
              </h1>
              <div className="hotel-info space-y-1">
                <div className="flex items-center justify-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{configuration?.address || "Hotel Address"}</span>
                </div>
                <div className="flex items-center justify-center gap-4">
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    <span>{configuration?.phone || "+1-555-0100"}</span>
                  </div>
                  {configuration?.website && (
                    <div className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      <span>{configuration.website}</span>
                    </div>
                  )}
                </div>
                {configuration?.tax_id && <p className="text-xs">Tax ID: {configuration.tax_id}</p>}
              </div>
            </div>

            {/* Receipt Header */}
            <div
              className="receipt-title"
              style={{
                backgroundColor: configuration?.branding?.accentColor || "#f0f9ff",
                color: configuration?.branding?.primaryColor || "#1e40af",
              }}
            >
              CHECK-IN RECEIPT
              <div className="text-sm mt-1">{format(new Date(), "EEEE, MMMM dd, yyyy 'at' HH:mm")}</div>
              <div className="text-xs mt-1">
                Receipt #: {configuration?.financial?.documentPrefixes?.receipt || "RCP"}-
                {Date.now().toString().slice(-8)}
              </div>
            </div>

            {/* Guest Information */}
            <div className="section">
              <h3 className="section-title">Guest Information</h3>
              <div className="info-grid">
                <div className="space-y-2">
                  <div className="info-row">
                    <span className="info-label">Name:</span>
                    <span className="info-value">{receiptData.guest?.full_name}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Email:</span>
                    <span className="info-value">{receiptData.guest?.email}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="info-row">
                    <span className="info-label">Phone:</span>
                    <span className="info-value">{receiptData.guest?.phone}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Folio #:</span>
                    <span className="info-value">
                      {receiptData.folio_number ||
                        `${configuration?.financial?.documentPrefixes?.folio || "F"}-${Date.now().toString().slice(-6)}`}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stay Information */}
            <div className="section">
              <h3 className="section-title">Stay Details</h3>
              <div className="info-grid">
                <div className="space-y-2">
                  <div className="info-row">
                    <span className="info-label">Room:</span>
                    <span
                      className="info-value text-xl font-bold"
                      style={{ color: configuration?.branding?.primaryColor || "#1e40af" }}
                    >
                      {receiptData.room?.roomNumber}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Room Type:</span>
                    <span className="info-value">{receiptData.room?.roomType?.name}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Floor:</span>
                    <span className="info-value">{receiptData.room?.floor}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="info-row">
                    <span className="info-label">Check-in:</span>
                    <span className="info-value">
                      {format(new Date(), configuration?.operational?.dateFormat || "MMM dd, yyyy")}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Check-out:</span>
                    <span className="info-value">
                      {receiptData.expected_check_out
                        ? format(
                            new Date(receiptData.expected_check_out),
                            configuration?.operational?.dateFormat || "MMM dd, yyyy",
                          )
                        : "TBD"}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Guests:</span>
                    <span className="info-value">{receiptData.number_of_guests || 1}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Charges */}
            <div className="section">
              <h3 className="section-title">Bill Summary</h3>
              <div className="charges-section">
                <div className="charge-row">
                  <div>
                    <span className="font-medium">Room Rate</span>
                    <div className="text-xs text-gray-500">
                      {receiptData.room?.roomType?.name} × {receiptData.number_of_nights || 1} night(s)
                    </div>
                  </div>
                  <span className="font-semibold">{formatCurrency(totals.subtotal)}</span>
                </div>

                {receiptData.additional_charges?.map((charge: any, index: number) => (
                  <div key={index} className="charge-row">
                    <span className="font-medium">{charge.description}</span>
                    <span className="font-semibold">{formatCurrency(charge.amount)}</span>
                  </div>
                ))}

                <div className="charge-row">
                  <span className="font-medium">Tax ({totals.taxRate}%)</span>
                  <span className="font-semibold">{formatCurrency(totals.taxAmount)}</span>
                </div>

                <div className="total-row">
                  <div className="flex justify-between items-center">
                    <span>Total Amount</span>
                    <span className="currency">{formatCurrency(totals.totalCharges)}</span>
                  </div>
                </div>

                {totals.paymentReceived > 0 && (
                  <div className="payment-row">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">Payment Received</span>
                        <div className="text-xs">
                          {receiptData.deposit_payment_method || "Payment method not specified"}
                        </div>
                      </div>
                      <span className="font-bold">-{formatCurrency(totals.paymentReceived)}</span>
                    </div>
                  </div>
                )}

                {totals.balanceDue > 0 && (
                  <div className="balance-row">
                    <div className="flex justify-between items-center">
                      <span>Balance Due at Checkout</span>
                      <span>{formatCurrency(totals.balanceDue)}</span>
                    </div>
                  </div>
                )}

                {totals.balanceDue === 0 && totals.paymentReceived > 0 && (
                  <div className="payment-row">
                    <div className="flex justify-between items-center">
                      <span className="font-bold">✓ PAID IN FULL</span>
                      <span className="font-bold">$0.00</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Key Cards */}
            <div className="key-cards-section">
              <h3 className="font-semibold mb-2" style={{ color: configuration?.branding?.primaryColor || "#1e40af" }}>
                Key Cards Issued
              </h3>
              <p style={{ color: configuration?.branding?.primaryColor || "#1e40af" }}>
                <span className="font-bold text-lg">{receiptData.key_cards_issued || 2}</span> key cards provided
              </p>
              <p className="text-xs mt-1">Please keep your key cards safe and return them at checkout</p>
            </div>

            {/* Hotel Policies */}
            <div className="section">
              <div className="policies-section">
                <h3 className="section-title">Important Information</h3>
                <ul className="policies-list text-xs">
                  <li>Check-out time: {configuration?.operational?.checkOutTime || "12:00 PM"}</li>
                  <li>Late check-out available upon request (additional charges may apply)</li>
                  {configuration?.operational?.cancellationPolicy && (
                    <li>Cancellation policy: {configuration.operational.cancellationPolicy}</li>
                  )}
                  <li>For assistance, dial "0" from your room phone</li>
                  {totals.balanceDue > 0 && (
                    <li>Remaining balance of {formatCurrency(totals.balanceDue)} due at checkout</li>
                  )}
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="footer">
              <p
                className="text-lg font-semibold mb-1"
                style={{ color: configuration?.branding?.primaryColor || "#1e40af" }}
              >
                Thank you for choosing {configuration?.hotel_name || "our hotel"}!
              </p>
              <p className="text-sm mb-2">We hope you enjoy your stay with us.</p>
              <p className="text-xs">
                For questions or assistance, please contact our front desk at {configuration?.phone || "+1-555-0100"}
              </p>
            </div>
          </div>
        </ScrollArea>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2 p-4 border-t bg-slate-50 no-print">
          <Button variant="outline" onClick={() => console.log("Email receipt")}>
            <Mail className="mr-2 h-4 w-4" />
            Email
          </Button>
          <Button variant="outline" onClick={() => console.log("Download PDF")}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button
            onClick={handlePrint}
            style={{ backgroundColor: configuration?.branding?.primaryColor || "#3b82f6" }}
            className="hover:opacity-90"
          >
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
