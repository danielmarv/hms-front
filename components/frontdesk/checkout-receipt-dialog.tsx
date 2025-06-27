"use client"

import { useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Printer, Download, Mail, MapPin, Phone, Globe, Receipt } from "lucide-react"
import { format } from "date-fns"

interface CheckOutReceiptDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  receiptData: any
  hotel?: any
  configuration?: any
}

export function CheckOutReceiptDialog({
  open,
  onOpenChange,
  receiptData,
  hotel,
  configuration,
}: CheckOutReceiptDialogProps) {
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
              <title>Check-out Receipt</title>
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
                .footer { 
                  text-align: center; 
                  margin-top: 30px; 
                  color: #6b7280; 
                  font-size: 10px; 
                  border-top: 1px solid #e5e7eb;
                  padding-top: 20px;
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[95vh] p-0">
        <DialogHeader className="px-6 py-4 border-b bg-slate-50">
          <DialogTitle className="text-xl font-semibold text-slate-800 flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Check-out Receipt
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(95vh-140px)]">
          <div ref={printRef} className="p-6 space-y-6">
            {/* Hotel Header */}
            <div className="header text-center">
              {(hotel?.branding?.logoUrl || configuration?.branding?.logoUrl) && (
                <img
                  src={hotel?.branding?.logoUrl || configuration?.branding?.logoUrl || "/placeholder.svg"}
                  alt="Hotel Logo"
                  className="logo mx-auto"
                  onError={(e) => {
                    e.target.style.display = "none"
                  }}
                />
              )}
              <h1 className="hotel-name" style={{ color: configuration?.branding?.primaryColor || "#1e40af" }}>
                {hotel?.name || configuration?.hotel_name || configuration?.name || "Hotel Name"}
              </h1>
              <div className="hotel-info space-y-1">
                <div className="flex items-center justify-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{hotel?.address || configuration?.address || "Hotel Address"}</span>
                </div>
                <div className="flex items-center justify-center gap-4">
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    <span>{hotel?.contact?.phone || configuration?.phone || "+1-555-0100"}</span>
                  </div>
                  {(hotel?.contact?.website || configuration?.website) && (
                    <div className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      <span>{hotel?.contact?.website || configuration?.website}</span>
                    </div>
                  )}
                </div>
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
              CHECK-OUT RECEIPT
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
                    <span className="info-value">{receiptData.folio_number}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stay Information */}
            <div className="section">
              <h3 className="section-title">Stay Summary</h3>
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
                    <span className="info-label">Check-in:</span>
                    <span className="info-value">{format(new Date(receiptData.check_in_date), "MMM dd, yyyy")}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="info-row">
                    <span className="info-label">Check-out:</span>
                    <span className="info-value">{format(new Date(), "MMM dd, yyyy")}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Nights:</span>
                    <span className="info-value">{receiptData.number_of_nights}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Final Bill */}
            <div className="section">
              <h3 className="section-title">Final Bill</h3>
              <div className="charges-section">
                <div className="charge-row">
                  <span className="font-medium">Room Charges</span>
                  <span className="font-semibold">{formatCurrency(receiptData.total_room_charges || 0)}</span>
                </div>

                {receiptData.additional_charges?.map((charge: any, index: number) => (
                  <div key={index} className="charge-row">
                    <span className="font-medium">{charge.description}</span>
                    <span className="font-semibold">{formatCurrency(charge.amount)}</span>
                  </div>
                ))}

                {receiptData.discounts?.map((discount: any, index: number) => (
                  <div key={index} className="charge-row">
                    <span className="font-medium text-green-600">{discount.description}</span>
                    <span className="font-semibold text-green-600">-{formatCurrency(discount.amount)}</span>
                  </div>
                ))}

                <div className="charge-row">
                  <span className="font-medium">Tax</span>
                  <span className="font-semibold">{formatCurrency(receiptData.tax_amount || 0)}</span>
                </div>

                <div className="total-row">
                  <div className="flex justify-between items-center">
                    <span>Total Amount</span>
                    <span>{formatCurrency(receiptData.total_amount || 0)}</span>
                  </div>
                </div>

                {receiptData.payment_made > 0 && (
                  <div className="payment-row">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">✓ Payment Received</span>
                        <div className="text-xs">Method: {receiptData.payment_method || "Not specified"}</div>
                      </div>
                      <span className="font-bold text-green-700">-{formatCurrency(receiptData.payment_made)}</span>
                    </div>
                  </div>
                )}

                <div className="total-row" style={{ backgroundColor: "#dcfce7", color: "#166534" }}>
                  <div className="flex justify-between items-center">
                    <span>✓ CHECKOUT COMPLETE</span>
                    <span>Balance: {formatCurrency(receiptData.balance_due || 0)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="footer">
              <p
                className="text-lg font-semibold mb-1"
                style={{ color: configuration?.branding?.primaryColor || "#1e40af" }}
              >
                Thank you for staying with {hotel?.name || configuration?.hotel_name || "us"}!
              </p>
              <p className="text-sm mb-2">We hope you enjoyed your stay and look forward to welcoming you back.</p>
              <p className="text-xs">
                For questions about this receipt, please contact us at{" "}
                {hotel?.contact?.phone || configuration?.phone || "+1-555-0100"}
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
