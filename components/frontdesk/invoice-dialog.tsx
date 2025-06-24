"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Printer, Download, Mail, MapPin, Phone, Globe, FileText } from "lucide-react"
import { format } from "date-fns"
import { useCurrentHotel } from "@/hooks/use-current-hotel"
import { useHotelConfiguration } from "@/hooks/use-hotel-configuration"
import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"

interface InvoiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoiceData: any
}

export function InvoiceDialog({ open, onOpenChange, invoiceData }: InvoiceDialogProps) {
  const { hotel } = useCurrentHotel()
  const { getHotelConfiguration, generateDocumentNumber } = useHotelConfiguration()
  const [hotelConfig, setHotelConfig] = useState<any>(null)
  const [isLoadingConfig, setIsLoadingConfig] = useState(false)
  const { user }: { user: any } = useAuth()
    const hotelId = user?.primaryHotel?.id

  // Load hotel configuration when dialog opens
  useEffect(() => {
    if (open && hotelId && !hotelConfig) {
      loadHotelConfiguration()
    }
  }, [open, hotelId])

  const loadHotelConfiguration = async () => {
    if (!hotelId) return

    setIsLoadingConfig(true)
    try {
      const response = await getHotelConfiguration(hotelId)
      if (response && response.data) {
        setHotelConfig(response.data)
      }
    } catch (error) {
      console.error("Error loading hotel configuration:", error)
    } finally {
      setIsLoadingConfig(false)
    }
  }

  if (isLoadingConfig) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading hotel configuration...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!invoiceData) return null

  const handlePrint = () => {
    const printContent = document.getElementById("invoice-content")
    if (printContent) {
      const printWindow = window.open("", "_blank")
      if (printWindow) {
        const printStyles = `
          body { 
            font-family: '${hotelConfig?.branding?.fonts?.primary || "Segoe UI"}', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0; 
            padding: 20px; 
            font-size: 12px; 
            line-height: 1.4;
            color: #1a1a1a;
          }
          .hotel-name { font-size: 28px; font-weight: bold; color: ${hotelConfig?.branding?.primaryColor || "#1e40af"}; margin-bottom: 8px; }
          .invoice-title { font-size: 24px; font-weight: bold; color: ${hotelConfig?.branding?.primaryColor || "#1e40af"}; }
          .table th { 
            background-color: ${hotelConfig?.branding?.primaryColor || "#1e40af"}; 
            color: white; 
            font-weight: 600; 
            font-size: 11px;
            text-transform: uppercase;
          }
          .total-row { font-weight: bold; font-size: 16px; color: ${hotelConfig?.branding?.primaryColor || "#1e40af"}; }
        `
        printWindow.document.write(`
          <html>
            <head>
              <title>Guest Invoice</title>
              <style>
                ${printStyles}
                body { 
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                  margin: 0; 
                  padding: 20px; 
                  font-size: 12px; 
                  line-height: 1.4;
                  color: #1a1a1a;
                }
                .header { text-align: center; margin-bottom: 30px; }
                .hotel-name { font-size: 28px; font-weight: bold; color: #1e40af; margin-bottom: 8px; }
                .hotel-info { color: #6b7280; font-size: 11px; }
                .invoice-header { display: flex; justify-content: space-between; margin: 30px 0; }
                .invoice-title { font-size: 24px; font-weight: bold; color: #1e40af; }
                .invoice-details { text-align: right; }
                .section { margin-bottom: 25px; }
                .section-title { font-weight: bold; margin-bottom: 10px; color: #374151; font-size: 14px; }
                .bill-to { background-color: #f8fafc; padding: 15px; border-radius: 8px; }
                .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                .table th, .table td { 
                  padding: 12px; 
                  text-align: left; 
                  border-bottom: 1px solid #e5e7eb; 
                }
                .table th { 
                  background-color: #1e40af; 
                  color: white; 
                  font-weight: 600; 
                  font-size: 11px;
                  text-transform: uppercase;
                }
                .table .amount { text-align: right; }
                .total-section { background-color: #f1f5f9; padding: 20px; border-radius: 8px; }
                .total-row { font-weight: bold; font-size: 16px; color: #1e40af; }
                .footer { text-align: center; margin-top: 40px; color: #6b7280; font-size: 10px; }
                @media print {
                  body { margin: 0; padding: 15px; font-size: 11px; }
                  .no-print { display: none; }
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

  const handleDownload = () => {
    console.log("Download invoice as PDF")
  }

  const handleEmail = () => {
    console.log("Email invoice to guest")
  }

  // Calculate invoice totals
  const formatCurrency = (amount: number) => {
    const currency = hotelConfig?.financial?.currency?.code || "USD"
    const symbol = hotelConfig?.financial?.currency?.symbol || "$"
    const position = hotelConfig?.financial?.currency?.position || "before"

    const formatted = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)

    return position === "before" ? `${symbol}${formatted}` : `${formatted}${symbol}`
  }

  const calculateTotals = () => {
    const roomRate = invoiceData.room?.roomType?.basePrice || 0
    const nights = invoiceData.number_of_nights || 1
    const subtotal = roomRate * nights

    const additionalCharges =
      invoiceData.additional_charges?.reduce((sum: number, charge: any) => sum + charge.amount, 0) || 0
    const discounts = invoiceData.discounts?.reduce((sum: number, discount: any) => sum + discount.amount, 0) || 0

    const beforeTax = subtotal + additionalCharges - discounts

    // Use hotel's tax rate from configuration
    const defaultTaxRate = hotelConfig?.financial?.taxRates?.[0]?.rate || 10
    const taxRate = defaultTaxRate / 100
    const taxAmount = beforeTax * taxRate
    const total = beforeTax + taxAmount
    const deposit = invoiceData.deposit_amount || 0
    const balanceDue = total - deposit

    return {
      subtotal,
      additionalCharges,
      discounts,
      beforeTax,
      taxRate: defaultTaxRate,
      taxAmount,
      total,
      deposit,
      balanceDue,
    }
  }

  const totals = calculateTotals()
  const invoiceNumber = `INV-${format(new Date(), "yyyyMMdd")}-${Date.now().toString().slice(-6)}`

  const invoiceItems = [
    {
      description: `${invoiceData.room?.roomType?.name} - Room ${invoiceData.room?.roomNumber}`,
      period: `${format(new Date(), "MMM dd")} - ${invoiceData.expected_check_out ? format(new Date(invoiceData.expected_check_out), "MMM dd, yyyy") : "TBD"}`,
      quantity: invoiceData.number_of_nights || 1,
      rate: invoiceData.room?.roomType?.basePrice || 0,
      amount: totals.subtotal,
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[95vh] p-0">
        <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Guest Invoice
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(95vh-140px)]">
          <div id="invoice-content" className="p-8 space-y-8">
            {/* Hotel Header */}
            <div
              className="text-center border-b-2 pb-6"
              style={{ borderColor: hotelConfig?.branding?.primaryColor || "#1e40af" }}
            >
              <div className="flex items-center justify-center mb-3">
                {hotelConfig?.branding?.logoUrl && (
                  <img
                    src={hotelConfig.branding.logoUrl || "/placeholder.svg"}
                    alt={hotelConfig.name || "Hotel Logo"}
                    className="h-16 w-auto mr-4"
                  />
                )}
                <h1
                  className="text-4xl font-bold mb-3"
                  style={{
                    color: hotelConfig?.branding?.primaryColor || "#1e40af",
                    fontFamily: hotelConfig?.branding?.fonts?.primary || "inherit",
                  }}
                >
                  {hotelConfig?.name || hotel?.name || "Hotel Name"}
                </h1>
              </div>
              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex items-center justify-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {hotelConfig?.address
                      ? `${hotelConfig.address.street}, ${hotelConfig.address.city}, ${hotelConfig.address.state} ${hotelConfig.address.postalCode}, ${hotelConfig.address.country}`
                      : "Hotel Address"}
                  </span>
                </div>
                <div className="flex items-center justify-center gap-6">
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    <span>{hotelConfig?.contact?.phone || "+1-555-0100"}</span>
                  </div>
                  {hotelConfig?.contact?.website && (
                    <div className="flex items-center gap-1">
                      <Globe className="h-4 w-4" />
                      <span>{hotelConfig.contact.website}</span>
                    </div>
                  )}
                  <span>Tax ID: {hotelConfig?.taxId || "123-456-789"}</span>
                </div>
              </div>
            </div>

            {/* Invoice Header */}
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h2
                  className="text-3xl font-bold mb-4"
                  style={{
                    color: hotelConfig?.branding?.primaryColor || "#1e40af",
                    fontFamily: hotelConfig?.branding?.fonts?.primary || "inherit",
                  }}
                >
                  INVOICE
                </h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Invoice Number:</span>
                    <span className="font-mono font-semibold">{invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Issue Date:</span>
                    <span className="font-semibold">{format(new Date(), "MMM dd, yyyy")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Due Date:</span>
                    <span className="font-semibold">{format(new Date(), "MMM dd, yyyy")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Folio Number:</span>
                    <span className="font-mono font-semibold">
                      {invoiceData.folio_number || `F-${Date.now().toString().slice(-6)}`}
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 p-6 rounded-lg">
                <h3 className="font-semibold text-slate-800 mb-3">Bill To:</h3>
                <div className="space-y-1">
                  <p className="font-semibold text-lg">{invoiceData.guest?.full_name}</p>
                  <p className="text-slate-600">{invoiceData.guest?.email}</p>
                  <p className="text-slate-600">{invoiceData.guest?.phone}</p>
                  {invoiceData.guest?.address && (
                    <>
                      <p className="text-slate-600">{invoiceData.guest.address.street}</p>
                      <p className="text-slate-600">
                        {invoiceData.guest.address.city}, {invoiceData.guest.address.state}{" "}
                        {invoiceData.guest.address.zip}
                      </p>
                      <p className="text-slate-600">{invoiceData.guest.address.country}</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Stay Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-800 mb-4">Stay Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <p className="text-blue-600 text-sm font-medium">Room</p>
                  <p className="text-2xl font-bold text-blue-800">{invoiceData.room?.roomNumber}</p>
                  <p className="text-xs text-blue-600">{invoiceData.room?.roomType?.name}</p>
                </div>
                <div className="text-center">
                  <p className="text-blue-600 text-sm font-medium">Check-in</p>
                  <p className="text-lg font-semibold text-blue-800">{format(new Date(), "MMM dd")}</p>
                  <p className="text-xs text-blue-600">{format(new Date(), "yyyy")}</p>
                </div>
                <div className="text-center">
                  <p className="text-blue-600 text-sm font-medium">Check-out</p>
                  <p className="text-lg font-semibold text-blue-800">
                    {invoiceData.expected_check_out
                      ? format(new Date(invoiceData.expected_check_out), "MMM dd")
                      : "TBD"}
                  </p>
                  <p className="text-xs text-blue-600">
                    {invoiceData.expected_check_out ? format(new Date(invoiceData.expected_check_out), "yyyy") : ""}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-blue-600 text-sm font-medium">Guests</p>
                  <p className="text-2xl font-bold text-blue-800">{invoiceData.number_of_guests || 1}</p>
                  <p className="text-xs text-blue-600">person(s)</p>
                </div>
              </div>
            </div>

            {/* Invoice Items */}
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow
                    className="hover:bg-blue-600"
                    style={{ backgroundColor: hotelConfig?.branding?.primaryColor || "#1e40af" }}
                  >
                    <TableHead className="text-white font-semibold">Description</TableHead>
                    <TableHead className="text-white font-semibold text-center">Period</TableHead>
                    <TableHead className="text-white font-semibold text-center">Qty</TableHead>
                    <TableHead className="text-white font-semibold text-right">Rate</TableHead>
                    <TableHead className="text-white font-semibold text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoiceItems.map((item, index) => (
                    <TableRow key={index} className="hover:bg-slate-50">
                      <TableCell className="font-medium">
                        <div>
                          <p>{item.description}</p>
                          <p className="text-xs text-slate-500">{item.period}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center text-sm">{item.period}</TableCell>
                      <TableCell className="text-center font-medium">{item.quantity}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(item.rate)}</TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency(item.amount)}</TableCell>
                    </TableRow>
                  ))}

                  {invoiceData.additional_charges?.map((charge: any, index: number) => (
                    <TableRow key={`charge-${index}`} className="hover:bg-slate-50">
                      <TableCell className="font-medium">{charge.description}</TableCell>
                      <TableCell className="text-center text-sm">-</TableCell>
                      <TableCell className="text-center">1</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(charge.amount)}</TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency(charge.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Totals Section */}
            <div className="flex justify-end">
              <div className="w-96 bg-slate-50 border border-slate-200 rounded-lg p-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Subtotal:</span>
                    <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
                  </div>

                  {totals.additionalCharges > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Additional Charges:</span>
                      <span className="font-medium">{formatCurrency(totals.additionalCharges)}</span>
                    </div>
                  )}

                  {totals.discounts > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discounts:</span>
                      <span className="font-medium">-{formatCurrency(totals.discounts)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Tax ({totals.taxRate.toFixed(0)}%):</span>
                    <span className="font-medium">{formatCurrency(totals.taxAmount)}</span>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-bold text-blue-700">
                    <span>Total Amount:</span>
                    <span>{formatCurrency(totals.total)}</span>
                  </div>

                  {totals.deposit > 0 && (
                    <>
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Paid (Deposit):</span>
                        <span className="font-medium">-{formatCurrency(totals.deposit)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold text-red-600">
                        <span>Balance Due:</span>
                        <span>{formatCurrency(totals.balanceDue)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Terms */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
              <h3 className="font-semibold text-amber-800 mb-3">Payment Terms & Conditions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-amber-700">
                <div>
                  <p className="font-medium mb-2">Payment Information:</p>
                  <ul className="space-y-1">
                    <li>• Payment due upon check-out</li>
                    <li>• We accept cash, credit cards, and bank transfers</li>
                    <li>• Late payment fees may apply</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium mb-2">Hotel Policies:</p>
                  <ul className="space-y-1">
                    <li>• Check-out time: 12:00 PM</li>
                    <li>• Late check-out fees: $50/hour after 12:00 PM</li>
                    <li>• Damage charges will be added if applicable</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              className="text-center border-t-2 pt-6"
              style={{ borderColor: hotelConfig?.branding?.primaryColor || "#1e40af" }}
            >
              <p
                className="text-xl font-semibold mb-2"
                style={{ color: hotelConfig?.branding?.primaryColor || "#1e40af" }}
              >
                Thank you for choosing {hotelConfig?.name || hotel?.name || "our hotel"}!
              </p>
              <p className="text-slate-600 mb-1">We appreciate your business and hope you enjoy your stay.</p>
              <p className="text-sm text-slate-500">
                For questions about this invoice, please contact our accounting department at{" "}
                {hotelConfig?.contact?.phone || "+1-555-0100"}
              </p>
            </div>
          </div>
        </ScrollArea>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 p-6 border-t bg-slate-50">
          <Button variant="outline" onClick={handleEmail} className="text-slate-600 hover:text-slate-800">
            <Mail className="mr-2 h-4 w-4" />
            Email Invoice
          </Button>
          <Button variant="outline" onClick={handleDownload} className="text-slate-600 hover:text-slate-800">
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700">
            <Printer className="mr-2 h-4 w-4" />
            Print Invoice
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
