"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Printer, Download, Mail, MapPin, Phone, Globe, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { useCurrentHotel } from "@/hooks/use-current-hotel"
import { useHotelConfiguration } from "@/hooks/use-hotel-configuration"

interface ReceiptDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  receiptData: any
}

export function ReceiptDialog({ open, onOpenChange, receiptData }: ReceiptDialogProps) {
  const { hotel, hotelId } = useCurrentHotel()
  const { getHotelConfiguration, getDocumentData, generateDocumentNumber } = useHotelConfiguration()
  const [hotelConfig, setHotelConfig] = useState<any>(null)
  const [documentData, setDocumentData] = useState<any>(null)
  const [receiptNumber, setReceiptNumber] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (open && hotelId) {
      loadHotelConfiguration()
    }
  }, [open, hotelId])

  const loadHotelConfiguration = async () => {
    if (!hotelId) return

    setIsLoading(true)
    try {
      // Load hotel configuration
      const configResponse = await getHotelConfiguration(hotelId)
      if (configResponse.data) {
        setHotelConfig(configResponse.data)
      }

      // Load document data for branding
      const docDataResponse = await getDocumentData(hotelId)
      if (docDataResponse.data) {
        setDocumentData(docDataResponse.data)
      }

      // Generate receipt number
      const receiptNumResponse = await generateDocumentNumber(hotelId, "receipt")
      if (receiptNumResponse.data?.documentNumber) {
        setReceiptNumber(receiptNumResponse.data.documentNumber)
      }
    } catch (error) {
      console.error("Failed to load hotel configuration:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!receiptData) return null

  const handlePrint = () => {
    const printContent = document.getElementById("receipt-content")
    if (printContent) {
      const printWindow = window.open("", "_blank")
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Check-in Receipt</title>
              <style>
                body { 
                  font-family: '${hotelConfig?.branding?.fonts?.primary || "Segoe UI"}', sans-serif; 
                  margin: 0; 
                  padding: 20px; 
                  font-size: 12px; 
                  line-height: 1.4;
                  color: #1a1a1a;
                }
                .header { text-align: center; margin-bottom: 30px; }
                .hotel-name { 
                  font-size: 24px; 
                  font-weight: bold; 
                  color: ${hotelConfig?.branding?.primaryColor || "#1e40af"}; 
                  margin-bottom: 8px; 
                }
                .hotel-info { color: #6b7280; font-size: 11px; }
                .receipt-title { 
                  font-size: 18px; 
                  font-weight: bold; 
                  margin: 20px 0; 
                  text-align: center; 
                  color: ${hotelConfig?.branding?.primaryColor || "#1e40af"};
                }
                .section { margin-bottom: 20px; }
                .section-title { 
                  font-weight: bold; 
                  margin-bottom: 8px; 
                  color: #374151; 
                  border-bottom: 1px solid ${hotelConfig?.branding?.secondaryColor || "#e5e7eb"}; 
                  padding-bottom: 4px; 
                }
                .info-row { display: flex; justify-content: space-between; margin-bottom: 4px; }
                .info-label { color: #6b7280; }
                .info-value { font-weight: 500; }
                .charges-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                .charges-table th, .charges-table td { 
                  padding: 8px; 
                  text-align: left; 
                  border-bottom: 1px solid #e5e7eb; 
                }
                .charges-table th { background-color: #f9fafb; font-weight: 600; }
                .total-row { 
                  font-weight: bold; 
                  background-color: ${hotelConfig?.branding?.accentColor || "#f3f4f6"}; 
                }
                .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 10px; }
                .currency { font-weight: bold; }
                @media print {
                  body { margin: 0; padding: 10px; font-size: 10px; }
                }
              </style>
            </head>
            <body>
              ${printContent.innerHTML}
            </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.print()
      }
    }
  }

  const formatCurrency = (amount: number) => {
    const currency = hotelConfig?.financial?.currency
    if (!currency) return `$${amount.toFixed(2)}`

    const formatted = amount.toFixed(2)
    return currency.position === "before" ? `${currency.symbol}${formatted}` : `${formatted}${currency.symbol}`
  }

  const calculateTotal = () => {
    const roomRate = receiptData.room?.roomType?.basePrice || 0
    const nights = receiptData.number_of_nights || 1
    const subtotal = roomRate * nights

    // Get tax rate from hotel configuration
    const taxRate =
      hotelConfig?.financial?.taxRates?.find((tax: any) => tax.appliesTo.includes("accommodation"))?.rate || 10

    const taxAmount = subtotal * (taxRate / 100)
    const deposit = receiptData.deposit_amount || 0

    return {
      subtotal,
      taxAmount,
      taxRate,
      total: subtotal + taxAmount + deposit,
      deposit,
    }
  }

  const totals = calculateTotal()

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading hotel configuration...</span>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[95vh] p-0">
        <DialogHeader className="px-6 py-4 border-b bg-slate-50">
          <DialogTitle className="text-xl font-semibold text-slate-800">Check-in Receipt</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(95vh-140px)]">
          <div id="receipt-content" className="p-6 space-y-6">
            {/* Hotel Header */}
            <div className="text-center border-b border-slate-200 pb-6">
              {hotelConfig?.branding?.logoUrl && (
                <img
                  src={hotelConfig.branding.logoUrl || "/placeholder.svg"}
                  alt="Hotel Logo"
                  className="h-16 mx-auto mb-4"
                />
              )}
              <h1
                className="text-3xl font-bold mb-2"
                style={{ color: hotelConfig?.branding?.primaryColor || "#1e40af" }}
              >
                {hotelConfig?.name || hotel?.name || "Grand Hotel"}
              </h1>
              <div className="space-y-1 text-sm text-slate-600">
                <div className="flex items-center justify-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>
                    {hotelConfig?.address
                      ? `${hotelConfig.address.street}, ${hotelConfig.address.city}, ${hotelConfig.address.state} ${hotelConfig.address.postalCode}`
                      : "123 Main Street, City, State 12345"}
                  </span>
                </div>
                <div className="flex items-center justify-center gap-4">
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    <span>{hotelConfig?.contact?.phone || "+1-555-0100"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    <span>{hotelConfig?.contact?.website || "www.grandhotel.com"}</span>
                  </div>
                </div>
                {hotelConfig?.taxId && <p className="text-xs">Tax ID: {hotelConfig.taxId}</p>}
              </div>
            </div>

            {/* Receipt Header */}
            <div
              className="text-center rounded-lg p-4"
              style={{ backgroundColor: hotelConfig?.branding?.accentColor || "#f0f9ff" }}
            >
              <h2
                className="text-xl font-bold mb-1"
                style={{ color: hotelConfig?.branding?.primaryColor || "#1e40af" }}
              >
                CHECK-IN RECEIPT
              </h2>
              <p className="text-sm" style={{ color: hotelConfig?.branding?.secondaryColor || "#6b7280" }}>
                {format(new Date(), "EEEE, MMMM dd, yyyy 'at' HH:mm")}
              </p>
              <p className="text-xs mt-1" style={{ color: hotelConfig?.branding?.secondaryColor || "#6b7280" }}>
                Receipt #: {receiptNumber || hotelConfig?.financial?.documentPrefixes?.receipt || "RCP"}-
                {Date.now().toString().slice(-8)}
              </p>
            </div>

            {/* Guest Information */}
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                Guest Information
                {receiptData.guest?.vip && <Badge className="bg-purple-100 text-purple-800 text-xs">VIP</Badge>}
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Name:</span>
                    <span className="font-medium">{receiptData.guest?.full_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Email:</span>
                    <span className="font-medium text-blue-600">{receiptData.guest?.email}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Phone:</span>
                    <span className="font-medium">{receiptData.guest?.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Folio #:</span>
                    <span className="font-mono font-medium">
                      {receiptData.folio_number ||
                        `${hotelConfig?.financial?.documentPrefixes?.folio || "F"}-${Date.now().toString().slice(-6)}`}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stay Information */}
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-800 mb-3">Stay Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Room:</span>
                    <span
                      className="font-bold text-lg"
                      style={{ color: hotelConfig?.branding?.primaryColor || "#1e40af" }}
                    >
                      {receiptData.room?.roomNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Room Type:</span>
                    <span className="font-medium">{receiptData.room?.roomType?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Floor:</span>
                    <span className="font-medium">{receiptData.room?.floor}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Check-in:</span>
                    <span className="font-medium">
                      {format(new Date(), `${hotelConfig?.operational?.dateFormat || "MMM dd, yyyy"}`)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Check-out:</span>
                    <span className="font-medium">
                      {receiptData.expected_check_out
                        ? format(
                            new Date(receiptData.expected_check_out),
                            hotelConfig?.operational?.dateFormat || "MMM dd, yyyy",
                          )
                        : "TBD"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Guests:</span>
                    <span className="font-medium">{receiptData.number_of_guests || 1}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Charges */}
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-800 mb-3">Charges</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <div>
                    <span className="font-medium">Room Rate</span>
                    <span className="text-xs text-slate-500 block">
                      {receiptData.room?.roomType?.name} × {receiptData.number_of_nights || 1} night(s)
                    </span>
                  </div>
                  <span className="font-semibold">{formatCurrency(totals.subtotal)}</span>
                </div>

                {receiptData.additional_charges?.map((charge: any, index: number) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="font-medium">{charge.description}</span>
                    <span className="font-semibold">{formatCurrency(charge.amount)}</span>
                  </div>
                ))}

                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="font-medium">Tax ({totals.taxRate}%)</span>
                  <span className="font-semibold">{formatCurrency(totals.taxAmount)}</span>
                </div>

                {totals.deposit > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="font-medium">Security Deposit</span>
                    <span className="font-semibold">{formatCurrency(totals.deposit)}</span>
                  </div>
                )}

                <div
                  className="flex justify-between items-center py-3 rounded-lg px-3 mt-4"
                  style={{ backgroundColor: hotelConfig?.branding?.accentColor || "#f1f5f9" }}
                >
                  <span className="text-lg font-bold text-slate-800">Total Amount</span>
                  <span
                    className="text-xl font-bold"
                    style={{ color: hotelConfig?.branding?.primaryColor || "#059669" }}
                  >
                    {formatCurrency(totals.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Status */}
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-800 mb-3">Payment Information</h3>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Payment Status:</span>
                <Badge
                  className={
                    receiptData.payment_status === "paid"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }
                >
                  {receiptData.payment_status?.toUpperCase() || "PENDING"}
                </Badge>
              </div>
              {receiptData.payment_method && (
                <div className="flex items-center justify-between mt-2">
                  <span className="text-slate-600">Payment Method:</span>
                  <span className="font-medium">{receiptData.payment_method}</span>
                </div>
              )}
            </div>

            {/* Key Cards */}
            <div
              className="border rounded-lg p-4"
              style={{
                backgroundColor: `${hotelConfig?.branding?.primaryColor || "#3b82f6"}15`,
                borderColor: hotelConfig?.branding?.primaryColor || "#3b82f6",
              }}
            >
              <h3 className="font-semibold mb-2" style={{ color: hotelConfig?.branding?.primaryColor || "#1e40af" }}>
                Key Cards Issued
              </h3>
              <p style={{ color: hotelConfig?.branding?.primaryColor || "#1e40af" }}>
                <span className="font-bold text-lg">{receiptData.key_cards_issued || 2}</span> key cards provided
              </p>
              <p className="text-xs mt-1" style={{ color: hotelConfig?.branding?.secondaryColor || "#6b7280" }}>
                Please keep your key cards safe and return them at checkout
              </p>
            </div>

            {/* Hotel Policies */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-800 mb-2">Important Information</h3>
              <ul className="text-xs text-slate-600 space-y-1">
                <li>• Check-out time: {hotelConfig?.operational?.checkOutTime || "12:00 PM"}</li>
                <li>• Late check-out available upon request (additional charges may apply)</li>
                {hotelConfig?.operational?.cancellationPolicy && (
                  <li>• Cancellation policy: {hotelConfig.operational.cancellationPolicy}</li>
                )}
                <li>• For assistance, dial "0" from your room phone</li>
              </ul>
            </div>

            {/* Footer */}
            <div className="text-center border-t border-slate-200 pt-4">
              <p
                className="text-lg font-semibold mb-1"
                style={{ color: hotelConfig?.branding?.primaryColor || "#1e40af" }}
              >
                Thank you for choosing {hotelConfig?.name || hotel?.name || "Grand Hotel"}!
              </p>
              <p className="text-sm text-slate-600">We hope you enjoy your stay with us.</p>
              <p className="text-xs text-slate-500 mt-2">
                For questions or assistance, please contact our front desk at{" "}
                {hotelConfig?.contact?.phone || "+1-555-0100"}
              </p>
            </div>
          </div>
        </ScrollArea>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2 p-4 border-t bg-slate-50">
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
            style={{ backgroundColor: hotelConfig?.branding?.primaryColor || "#3b82f6" }}
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
