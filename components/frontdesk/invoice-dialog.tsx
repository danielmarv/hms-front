"use client"

import { useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Printer, Download, Mail, MapPin, Phone, Globe, FileText } from "lucide-react"
import { format } from "date-fns"

interface InvoiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoiceData: any
  configuration?: any
}

export function InvoiceDialog({ open, onOpenChange, invoiceData, configuration }: InvoiceDialogProps) {
  const printRef = useRef<HTMLDivElement>(null)

  if (!invoiceData) return null

  const handlePrint = () => {
    if (printRef.current) {
      const printContent = printRef.current.innerHTML
      const printWindow = window.open("", "_blank")
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Guest Invoice</title>
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
                  font-size: 28px; 
                  font-weight: bold; 
                  color: ${configuration?.branding?.primaryColor || "#1e40af"}; 
                  margin-bottom: 8px; 
                }
                .hotel-info { 
                  color: #6b7280; 
                  font-size: 11px; 
                  line-height: 1.3;
                }
                .invoice-header { 
                  display: grid; 
                  grid-template-columns: 1fr 1fr; 
                  gap: 30px; 
                  margin: 30px 0; 
                }
                .invoice-title { 
                  font-size: 24px; 
                  font-weight: bold; 
                  color: ${configuration?.branding?.primaryColor || "#1e40af"}; 
                  margin-bottom: 15px;
                }
                .invoice-details { 
                  background: #f8fafc; 
                  padding: 15px; 
                  border-radius: 8px; 
                }
                .section { 
                  margin-bottom: 25px; 
                  page-break-inside: avoid;
                }
                .section-title { 
                  font-weight: bold; 
                  margin-bottom: 10px; 
                  color: #374151; 
                  font-size: 14px; 
                  border-bottom: 1px solid ${configuration?.branding?.secondaryColor || "#e5e7eb"};
                  padding-bottom: 5px;
                }
                .bill-to { 
                  background: #f8fafc; 
                  padding: 15px; 
                  border-radius: 8px; 
                }
                .table { 
                  width: 100%; 
                  border-collapse: collapse; 
                  margin: 20px 0; 
                  border: 1px solid #e5e7eb;
                }
                .table th, .table td { 
                  padding: 12px; 
                  text-align: left; 
                  border-bottom: 1px solid #e5e7eb; 
                }
                .table th { 
                  background: ${configuration?.branding?.primaryColor || "#1e40af"}; 
                  color: white; 
                  font-weight: 600; 
                  font-size: 11px;
                  text-transform: uppercase;
                }
                .table .amount { 
                  text-align: right; 
                }
                .total-section { 
                  background: #f1f5f9; 
                  padding: 20px; 
                  border-radius: 8px; 
                  border: 1px solid #e2e8f0;
                }
                .total-row { 
                  font-weight: bold; 
                  font-size: 16px; 
                  color: ${configuration?.branding?.primaryColor || "#1e40af"}; 
                }
                .footer { 
                  text-align: center; 
                  margin-top: 40px; 
                  color: #6b7280; 
                  font-size: 10px; 
                  border-top: 1px solid #e5e7eb;
                  padding-top: 20px;
                }
                .stay-summary {
                  background: #f0f9ff;
                  border: 1px solid #0ea5e9;
                  padding: 20px;
                  border-radius: 8px;
                  display: grid;
                  grid-template-columns: repeat(4, 1fr);
                  gap: 20px;
                  text-align: center;
                }
                .summary-item h4 {
                  color: #0369a1;
                  font-size: 12px;
                  margin-bottom: 5px;
                }
                .summary-item .value {
                  font-size: 18px;
                  font-weight: bold;
                  color: #1e40af;
                }
                .summary-item .label {
                  font-size: 10px;
                  color: #0369a1;
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

  const calculateTotals = () => {
    const roomRate = invoiceData.room?.roomType?.basePrice || 0
    const nights = invoiceData.number_of_nights || 1
    const subtotal = roomRate * nights

    const additionalCharges =
      invoiceData.additional_charges?.reduce((sum: number, charge: any) => sum + charge.amount, 0) || 0
    const discounts = invoiceData.discounts?.reduce((sum: number, discount: any) => sum + discount.amount, 0) || 0

    const beforeTax = subtotal + additionalCharges - discounts
    const defaultTaxRate = configuration?.financial?.taxRates?.[0]?.rate || 10
    const taxRate = defaultTaxRate / 100
    const taxAmount = beforeTax * taxRate
    const totalCharges = beforeTax + taxAmount

    // Payment made by guest towards the bill
    const paymentReceived = invoiceData.deposit_amount || 0
    const balanceDue = totalCharges - paymentReceived

    return {
      subtotal,
      additionalCharges,
      discounts,
      beforeTax,
      taxRate: defaultTaxRate,
      taxAmount,
      totalCharges,
      paymentReceived,
      balanceDue: Math.max(0, balanceDue),
    }
  }

  const totals = calculateTotals()
  const invoiceNumber = `${configuration?.financial?.documentPrefixes?.invoice || "INV"}-${format(new Date(), "yyyyMMdd")}-${Date.now().toString().slice(-6)}`

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
          <div ref={printRef} className="p-8 space-y-8">
            {/* Hotel Header */}
            <div className="header">
              <div className="flex items-center justify-center mb-3">
                {configuration?.branding?.logoUrl && (
                  <img
                    src={configuration.branding.logoUrl || "/placeholder.svg"}
                    alt={configuration.hotel_name || "Hotel Logo"}
                    className="logo mr-4"
                  />
                )}
                <h1 className="hotel-name">{configuration?.hotel_name || "Hotel Name"}</h1>
              </div>
              <div className="hotel-info space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{configuration?.address || "Hotel Address"}</span>
                </div>
                <div className="flex items-center justify-center gap-6">
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    <span>{configuration?.phone || "+1-555-0100"}</span>
                  </div>
                  {configuration?.website && (
                    <div className="flex items-center gap-1">
                      <Globe className="h-4 w-4" />
                      <span>{configuration.website}</span>
                    </div>
                  )}
                  <span>Tax ID: {configuration?.tax_id || "123-456-789"}</span>
                </div>
              </div>
            </div>

            {/* Invoice Header */}
            <div className="invoice-header">
              <div>
                <h2 className="invoice-title">INVOICE</h2>
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
                      {invoiceData.folio_number ||
                        `${configuration?.financial?.documentPrefixes?.folio || "F"}-${Date.now().toString().slice(-6)}`}
                    </span>
                  </div>
                </div>
              </div>
              <div className="bill-to">
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
            <div className="section">
              <h3 className="section-title">Stay Summary</h3>
              <div className="stay-summary">
                <div className="summary-item">
                  <h4>Room</h4>
                  <div className="value">{invoiceData.room?.roomNumber}</div>
                  <div className="label">{invoiceData.room?.roomType?.name}</div>
                </div>
                <div className="summary-item">
                  <h4>Check-in</h4>
                  <div className="value">{format(new Date(), "MMM dd")}</div>
                  <div className="label">{format(new Date(), "yyyy")}</div>
                </div>
                <div className="summary-item">
                  <h4>Check-out</h4>
                  <div className="value">
                    {invoiceData.expected_check_out
                      ? format(new Date(invoiceData.expected_check_out), "MMM dd")
                      : "TBD"}
                  </div>
                  <div className="label">
                    {invoiceData.expected_check_out ? format(new Date(invoiceData.expected_check_out), "yyyy") : ""}
                  </div>
                </div>
                <div className="summary-item">
                  <h4>Guests</h4>
                  <div className="value">{invoiceData.number_of_guests || 1}</div>
                  <div className="label">person(s)</div>
                </div>
              </div>
            </div>

            {/* Invoice Items */}
            <div className="section">
              <h3 className="section-title">Invoice Items</h3>
              <table className="table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th style={{ textAlign: "center" }}>Period</th>
                    <th style={{ textAlign: "center" }}>Qty</th>
                    <th style={{ textAlign: "right" }}>Rate</th>
                    <th style={{ textAlign: "right" }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div>
                        <div className="font-medium">
                          {invoiceData.room?.roomType?.name} - Room {invoiceData.room?.roomNumber}
                        </div>
                        <div style={{ fontSize: "10px", color: "#6b7280" }}>
                          {format(new Date(), "MMM dd")} -{" "}
                          {invoiceData.expected_check_out
                            ? format(new Date(invoiceData.expected_check_out), "MMM dd, yyyy")
                            : "TBD"}
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign: "center", fontSize: "11px" }}>
                      {format(new Date(), "MMM dd")} -{" "}
                      {invoiceData.expected_check_out
                        ? format(new Date(invoiceData.expected_check_out), "MMM dd")
                        : "TBD"}
                    </td>
                    <td style={{ textAlign: "center", fontWeight: "500" }}>{invoiceData.number_of_nights || 1}</td>
                    <td style={{ textAlign: "right", fontWeight: "500" }}>
                      {formatCurrency(invoiceData.room?.roomType?.basePrice || 0)}
                    </td>
                    <td style={{ textAlign: "right", fontWeight: "600" }}>{formatCurrency(totals.subtotal)}</td>
                  </tr>

                  {invoiceData.additional_charges?.map((charge: any, index: number) => (
                    <tr key={`charge-${index}`}>
                      <td className="font-medium">{charge.description}</td>
                      <td style={{ textAlign: "center", fontSize: "11px" }}>-</td>
                      <td style={{ textAlign: "center" }}>1</td>
                      <td style={{ textAlign: "right", fontWeight: "500" }}>{formatCurrency(charge.amount)}</td>
                      <td style={{ textAlign: "right", fontWeight: "600" }}>{formatCurrency(charge.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Section */}
            <div className="section">
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <div className="total-section" style={{ width: "400px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                    <span>Subtotal:</span>
                    <span style={{ fontWeight: "500" }}>{formatCurrency(totals.subtotal)}</span>
                  </div>

                  {totals.additionalCharges > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                      <span>Additional Charges:</span>
                      <span style={{ fontWeight: "500" }}>{formatCurrency(totals.additionalCharges)}</span>
                    </div>
                  )}

                  {totals.discounts > 0 && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "10px",
                        color: "#059669",
                      }}
                    >
                      <span>Discounts:</span>
                      <span style={{ fontWeight: "500" }}>-{formatCurrency(totals.discounts)}</span>
                    </div>
                  )}

                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
                    <span>Tax ({totals.taxRate.toFixed(0)}%):</span>
                    <span style={{ fontWeight: "500" }}>{formatCurrency(totals.taxAmount)}</span>
                  </div>

                  <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "15px", marginBottom: "15px" }}></div>

                  <div
                    className="total-row"
                    style={{ display: "flex", justifyContent: "space-between", fontSize: "18px" }}
                  >
                    <span>Total Amount:</span>
                    <span>{formatCurrency(totals.totalCharges)}</span>
                  </div>

                  {totals.paymentReceived > 0 && (
                    <div
                      style={{
                        marginTop: "15px",
                        padding: "15px",
                        backgroundColor: "#dcfce7",
                        border: "1px solid #16a34a",
                        borderRadius: "8px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                        <span style={{ fontWeight: "600", color: "#166534" }}>Payment Received:</span>
                        <span style={{ fontWeight: "600", color: "#166534" }}>
                          -{formatCurrency(totals.paymentReceived)}
                        </span>
                      </div>
                      <p style={{ fontSize: "11px", color: "#166534", margin: 0 }}>
                        Payment method: {invoiceData.deposit_payment_method || "Not specified"}
                      </p>
                    </div>
                  )}

                  <div
                    style={{
                      marginTop: "15px",
                      padding: "15px",
                      backgroundColor: totals.balanceDue > 0 ? "#fef2f2" : "#dcfce7",
                      border: `1px solid ${totals.balanceDue > 0 ? "#f87171" : "#16a34a"}`,
                      borderRadius: "8px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "20px",
                        fontWeight: "bold",
                        color: totals.balanceDue > 0 ? "#dc2626" : "#166534",
                      }}
                    >
                      <span>{totals.balanceDue > 0 ? "Balance Due at Checkout:" : "✓ PAID IN FULL"}</span>
                      <span>{formatCurrency(totals.balanceDue)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Terms */}
            <div className="section">
              <div style={{ background: "#fef3c7", border: "1px solid #f59e0b", padding: "20px", borderRadius: "8px" }}>
                <h3 style={{ fontWeight: "600", color: "#92400e", marginBottom: "15px" }}>
                  Payment Terms & Conditions
                </h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "20px",
                    fontSize: "12px",
                    color: "#92400e",
                  }}
                >
                  <div>
                    <p style={{ fontWeight: "500", marginBottom: "8px" }}>Payment Information:</p>
                    <ul style={{ listStyle: "none", padding: 0 }}>
                      <li style={{ marginBottom: "4px" }}>• Payment due upon check-out</li>
                      <li style={{ marginBottom: "4px" }}>• We accept cash, credit cards, and bank transfers</li>
                      <li style={{ marginBottom: "4px" }}>• Late payment fees may apply</li>
                    </ul>
                  </div>
                  <div>
                    <p style={{ fontWeight: "500", marginBottom: "8px" }}>Hotel Policies:</p>
                    <ul style={{ listStyle: "none", padding: 0 }}>
                      <li style={{ marginBottom: "4px" }}>
                        • Check-out time: {configuration?.operational?.checkOutTime || "12:00 PM"}
                      </li>
                      <li style={{ marginBottom: "4px" }}>• Late check-out fees: $50/hour after 12:00 PM</li>
                      <li style={{ marginBottom: "4px" }}>• Damage charges will be added if applicable</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="footer">
              <p
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  marginBottom: "8px",
                  color: configuration?.branding?.primaryColor || "#1e40af",
                }}
              >
                Thank you for choosing {configuration?.hotel_name || "our hotel"}!
              </p>
              <p style={{ marginBottom: "4px" }}>We appreciate your business and hope you enjoy your stay.</p>
              <p>
                For questions about this invoice, please contact our accounting department at{" "}
                {configuration?.phone || "+1-555-0100"}
              </p>
            </div>
          </div>
        </ScrollArea>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 p-6 border-t bg-slate-50 no-print">
          <Button variant="outline" onClick={() => console.log("Email invoice")}>
            <Mail className="mr-2 h-4 w-4" />
            Email Invoice
          </Button>
          <Button variant="outline" onClick={() => console.log("Download PDF")}>
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
