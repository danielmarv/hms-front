"use client"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"
import { Printer, FileText, Phone, CheckCircle, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { useCurrentHotel } from "@/hooks/use-current-hotel"
import { useHotelConfiguration } from "@/hooks/use-hotel-configuration"

interface RegistrationDocumentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  registrationData: any
  onConfirm: (checkInData: any) => Promise<void>
}

export function RegistrationDocumentDialog({
  open,
  onOpenChange,
  registrationData,
  onConfirm,
}: RegistrationDocumentDialogProps) {
  const { hotel, hotelId } = useCurrentHotel()
  const { getHotelConfiguration, generateDocumentNumber } = useHotelConfiguration()
  const [hotelConfig, setHotelConfig] = useState<any>(null)
  const [documentNumber, setDocumentNumber] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  const [guestSignature, setGuestSignature] = useState("")
  const [emergencyContact, setEmergencyContact] = useState({
    name: "",
    phone: "",
    relationship: "",
  })
  const [agreements, setAgreements] = useState({
    termsAndConditions: false,
    privacyPolicy: false,
    damagePolicy: false,
    noSmokingPolicy: false,
  })
  const [additionalRequests, setAdditionalRequests] = useState("")
  const printRef = useRef<HTMLDivElement>(null)

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

      // Generate document number
      const docNumResponse = await generateDocumentNumber(hotelId, "registration")
      if (docNumResponse.data?.documentNumber) {
        setDocumentNumber(docNumResponse.data.documentNumber)
      }
    } catch (error) {
      console.error("Failed to load hotel configuration:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!registrationData) return null

  const { booking, checkInData, checkInDate, staff } = registrationData

  const handlePrint = () => {
    if (printRef.current) {
      const printContent = printRef.current.innerHTML
      const printWindow = window.open("", "_blank")
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Guest Registration Form</title>
              <style>
                body { 
                  font-family: '${hotelConfig?.branding?.fonts?.primary || "Arial"}', sans-serif; 
                  margin: 20px; 
                  color: #1a1a1a;
                  line-height: 1.4;
                }
                .header { 
                  text-align: center; 
                  margin-bottom: 30px; 
                  border-bottom: 2px solid ${hotelConfig?.branding?.primaryColor || "#1e40af"};
                  padding-bottom: 20px;
                }
                .hotel-name { 
                  font-size: 28px; 
                  font-weight: bold; 
                  color: ${hotelConfig?.branding?.primaryColor || "#1e40af"}; 
                  margin-bottom: 8px; 
                }
                .section { margin-bottom: 25px; page-break-inside: avoid; }
                .section-title { 
                  font-weight: bold; 
                  font-size: 16px; 
                  color: ${hotelConfig?.branding?.primaryColor || "#1e40af"}; 
                  border-bottom: 1px solid ${hotelConfig?.branding?.secondaryColor || "#e5e7eb"};
                  padding-bottom: 5px;
                  margin-bottom: 15px;
                }
                .field { margin-bottom: 12px; }
                .field-label { font-weight: 600; color: #374151; }
                .field-value { margin-left: 10px; }
                .signature-section { 
                  margin-top: 40px; 
                  border: 2px solid ${hotelConfig?.branding?.primaryColor || "#1e40af"};
                  padding: 20px;
                  border-radius: 8px;
                }
                .signature-line { 
                  border-bottom: 2px solid #000; 
                  min-height: 50px; 
                  margin: 20px 0;
                  position: relative;
                }
                .signature-label {
                  position: absolute;
                  bottom: -20px;
                  left: 0;
                  font-size: 12px;
                  color: #6b7280;
                }
                .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                .full-width { grid-column: 1 / -1; }
                .checkbox-item { margin: 8px 0; }
                .footer { 
                  margin-top: 40px; 
                  text-align: center; 
                  font-size: 12px; 
                  color: #6b7280;
                  border-top: 1px solid #e5e7eb;
                  padding-top: 20px;
                }
                @media print {
                  body { margin: 0; font-size: 12px; }
                  .no-print { display: none; }
                  .page-break { page-break-before: always; }
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

  const handleConfirm = async () => {
    // Validate required fields
    if (!guestSignature.trim()) {
      toast.error("Guest signature is required")
      return
    }

    if (!agreements.termsAndConditions) {
      toast.error("Guest must agree to terms and conditions")
      return
    }

    try {
      // Prepare check-in data with registration document
      const checkInDataWithRegistration = {
        guest_id: booking?.guest?._id || registrationData.guest?._id,
        room_id: checkInData.roomNumber || registrationData.room?._id,
        expected_check_out: booking?.check_out || registrationData.expectedCheckOut,
        number_of_guests: booking?.number_of_guests || 1,
        booking_id: booking?._id,
        special_requests: checkInData.specialRequests,
        notes: checkInData.arrivalNotes,
        deposit_amount: checkInData.depositAmount,
        key_cards_issued: checkInData.keyCards,
        emergency_contact: emergencyContact.name ? emergencyContact : undefined,
        registration_document: {
          document_number: documentNumber,
          guest_signature: guestSignature,
          agreements,
          additional_requests: additionalRequests,
          emergency_contact: emergencyContact,
        },
      }

      // Call the onConfirm callback with the complete data
      await onConfirm(checkInDataWithRegistration)
    } catch (error) {
      console.error("Registration confirmation error:", error)
      toast.error("Failed to complete registration")
    }
  }

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading registration form...</span>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden p-0">
        <DialogHeader className="px-6 py-4 border-b bg-slate-50">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Guest Registration Form
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(95vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Print/Preview Section */}
            <div ref={printRef} className="bg-white p-8 border rounded-lg">
              {/* Hotel Header */}
              <div className="header text-center mb-8">
                {hotelConfig?.branding?.logoUrl && (
                  <img
                    src={hotelConfig.branding.logoUrl || "/placeholder.svg"}
                    alt="Hotel Logo"
                    className="h-20 mx-auto mb-4"
                  />
                )}
                <h1
                  className="hotel-name text-3xl font-bold"
                  style={{ color: hotelConfig?.branding?.primaryColor || "#1e40af" }}
                >
                  {hotelConfig?.name || hotel?.name || "Grand Hotel"}
                </h1>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>
                    {hotelConfig?.address
                      ? `${hotelConfig.address.street}, ${hotelConfig.address.city}, ${hotelConfig.address.state} ${hotelConfig.address.postalCode}`
                      : "123 Main Street, City, State 12345"}
                  </p>
                  <p>
                    Phone: {hotelConfig?.contact?.phone || "+1-555-0100"} | Email:{" "}
                    {hotelConfig?.contact?.email || "info@grandhotel.com"}
                  </p>
                  {hotelConfig?.taxId && <p>Tax ID: {hotelConfig.taxId}</p>}
                </div>
                <div className="mt-6">
                  <h2
                    className="text-2xl font-semibold"
                    style={{ color: hotelConfig?.branding?.primaryColor || "#1e40af" }}
                  >
                    GUEST REGISTRATION FORM
                  </h2>
                  <p className="text-sm text-muted-foreground mt-2">
                    Document #: {documentNumber || "REG-" + Date.now().toString().slice(-8)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Registration Date: {format(new Date(checkInDate), "EEEE, MMMM dd, yyyy 'at' HH:mm")}
                  </p>
                </div>
              </div>

              {/* Guest Information */}
              <div className="section">
                <h3 className="section-title">GUEST INFORMATION</h3>
                <div className="grid">
                  <div className="space-y-3">
                    <div className="field">
                      <span className="field-label">Full Name:</span>
                      <span className="field-value text-lg font-semibold">
                        {booking?.guest?.full_name || registrationData.guest?.full_name}
                      </span>
                    </div>
                    <div className="field">
                      <span className="field-label">Email Address:</span>
                      <span className="field-value">{booking?.guest?.email || registrationData.guest?.email}</span>
                    </div>
                    <div className="field">
                      <span className="field-label">Phone Number:</span>
                      <span className="field-value">{booking?.guest?.phone || registrationData.guest?.phone}</span>
                    </div>
                    <div className="field">
                      <span className="field-label">Nationality:</span>
                      <span className="field-value">{registrationData.guest?.nationality || "Not specified"}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="field">
                      <span className="field-label">ID Type:</span>
                      <span className="field-value">{registrationData.guest?.id_type || "Not specified"}</span>
                    </div>
                    <div className="field">
                      <span className="field-label">ID Number:</span>
                      <span className="field-value">{registrationData.guest?.id_number || "Not specified"}</span>
                    </div>
                    <div className="field">
                      <span className="field-label">Date of Birth:</span>
                      <span className="field-value">
                        {registrationData.guest?.dob
                          ? format(new Date(registrationData.guest.dob), "MMM dd, yyyy")
                          : "Not specified"}
                      </span>
                    </div>
                    {booking?.confirmation_number && (
                      <div className="field">
                        <span className="field-label">Confirmation Number:</span>
                        <span className="field-value font-mono font-semibold">{booking.confirmation_number}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Reservation Details */}
              <div className="section">
                <h3 className="section-title">RESERVATION DETAILS</h3>
                <div className="grid">
                  <div className="space-y-3">
                    <div className="field">
                      <span className="field-label">Check-in Date:</span>
                      <span className="field-value font-semibold">
                        {format(new Date(checkInDate), hotelConfig?.operational?.dateFormat || "EEEE, MMMM dd, yyyy")}
                      </span>
                    </div>
                    <div className="field">
                      <span className="field-label">Check-out Date:</span>
                      <span className="field-value font-semibold">
                        {booking?.check_out
                          ? format(
                              new Date(booking.check_out),
                              hotelConfig?.operational?.dateFormat || "EEEE, MMMM dd, yyyy",
                            )
                          : "To be determined"}
                      </span>
                    </div>
                    <div className="field">
                      <span className="field-label">Number of Guests:</span>
                      <span className="field-value">{booking?.number_of_guests || 1}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="field">
                      <span className="field-label">Room Number:</span>
                      <span
                        className="field-value text-xl font-bold"
                        style={{ color: hotelConfig?.branding?.primaryColor || "#1e40af" }}
                      >
                        {registrationData.room?.roomNumber || checkInData.roomNumber}
                      </span>
                    </div>
                    <div className="field">
                      <span className="field-label">Room Type:</span>
                      <span className="field-value">{registrationData.room?.roomType?.name || "Standard Room"}</span>
                    </div>
                    <div className="field">
                      <span className="field-label">Key Cards Issued:</span>
                      <span className="field-value font-semibold">{checkInData.keyCards || 2}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="section">
                <h3 className="section-title">PAYMENT INFORMATION</h3>
                <div className="grid">
                  <div className="space-y-3">
                    <div className="field">
                      <span className="field-label">Total Amount:</span>
                      <span className="field-value text-lg font-bold">
                        {hotelConfig?.financial?.currency?.symbol || "$"}
                        {booking?.total_amount || "0.00"}
                      </span>
                    </div>
                    <div className="field">
                      <span className="field-label">Payment Status:</span>
                      <span className="field-value">
                        <Badge
                          className={
                            booking?.payment_status === "paid"
                              ? "bg-green-100 text-green-800"
                              : booking?.payment_status === "partial"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {booking?.payment_status?.toUpperCase() || "PENDING"}
                        </Badge>
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {checkInData.depositAmount > 0 && (
                      <div className="field">
                        <span className="field-label">Additional Deposit:</span>
                        <span className="field-value font-semibold">
                          {hotelConfig?.financial?.currency?.symbol || "$"}
                          {checkInData.depositAmount}
                        </span>
                      </div>
                    )}
                    <div className="field">
                      <span className="field-label">Check-in Time:</span>
                      <span className="field-value">{format(new Date(checkInDate), "HH:mm")}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Special Requests */}
              {(booking?.special_requests || checkInData.specialRequests || checkInData.arrivalNotes) && (
                <div className="section">
                  <h3 className="section-title">SPECIAL REQUESTS & NOTES</h3>
                  {booking?.special_requests && (
                    <div className="field">
                      <span className="field-label">Original Requests:</span>
                      <div className="field-value bg-gray-50 p-3 rounded mt-2">{booking.special_requests}</div>
                    </div>
                  )}
                  {checkInData.specialRequests && (
                    <div className="field">
                      <span className="field-label">Additional Requests:</span>
                      <div className="field-value bg-gray-50 p-3 rounded mt-2">{checkInData.specialRequests}</div>
                    </div>
                  )}
                  {checkInData.arrivalNotes && (
                    <div className="field">
                      <span className="field-label">Arrival Notes:</span>
                      <div className="field-value bg-gray-50 p-3 rounded mt-2">{checkInData.arrivalNotes}</div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Interactive Form Section */}
            <div className="space-y-6 no-print">
              <Separator />

              {/* Emergency Contact */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Emergency Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="emergencyName">Contact Name</Label>
                    <Input
                      id="emergencyName"
                      value={emergencyContact.name}
                      onChange={(e) => setEmergencyContact((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyPhone">Phone Number</Label>
                    <Input
                      id="emergencyPhone"
                      value={emergencyContact.phone}
                      onChange={(e) => setEmergencyContact((prev) => ({ ...prev, phone: e.target.value }))}
                      placeholder="+1-555-0123"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="emergencyRelationship">Relationship</Label>
                    <Input
                      id="emergencyRelationship"
                      value={emergencyContact.relationship}
                      onChange={(e) => setEmergencyContact((prev) => ({ ...prev, relationship: e.target.value }))}
                      placeholder="e.g., Spouse, Parent, Friend"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Additional Requests */}
              <Card>
                <CardHeader>
                  <CardTitle>Additional Requests or Comments</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={additionalRequests}
                    onChange={(e) => setAdditionalRequests(e.target.value)}
                    placeholder="Any additional requests, dietary restrictions, accessibility needs, etc."
                    rows={3}
                  />
                </CardContent>
              </Card>

              {/* Agreements and Policies */}
              <Card>
                <CardHeader>
                  <CardTitle>Hotel Policies and Agreements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      checked={agreements.termsAndConditions}
                      onCheckedChange={(checked) =>
                        setAgreements((prev) => ({ ...prev, termsAndConditions: checked as boolean }))
                      }
                    />
                    <Label htmlFor="terms" className="text-sm">
                      I agree to the hotel's terms and conditions, including check-out time (
                      {hotelConfig?.operational?.checkOutTime || "12:00 PM"}) and cancellation policy
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="privacy"
                      checked={agreements.privacyPolicy}
                      onCheckedChange={(checked) =>
                        setAgreements((prev) => ({ ...prev, privacyPolicy: checked as boolean }))
                      }
                    />
                    <Label htmlFor="privacy" className="text-sm">
                      I consent to the collection and use of my personal information as per the privacy policy
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="damage"
                      checked={agreements.damagePolicy}
                      onCheckedChange={(checked) =>
                        setAgreements((prev) => ({ ...prev, damagePolicy: checked as boolean }))
                      }
                    />
                    <Label htmlFor="damage" className="text-sm">
                      I accept responsibility for any damages to the room or hotel property during my stay
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="smoking"
                      checked={agreements.noSmokingPolicy}
                      onCheckedChange={(checked) =>
                        setAgreements((prev) => ({ ...prev, noSmokingPolicy: checked as boolean }))
                      }
                    />
                    <Label htmlFor="smoking" className="text-sm">
                      I acknowledge this is a non-smoking property and agree to the smoking policy
                    </Label>
                  </div>

                  {hotelConfig?.operational?.cancellationPolicy && (
                    <div className="mt-4 p-3 bg-amber-50 rounded-lg">
                      <h4 className="font-medium text-amber-800 mb-1">Cancellation Policy</h4>
                      <p className="text-sm text-amber-700">{hotelConfig.operational.cancellationPolicy}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Guest Signature */}
              <Card>
                <CardHeader>
                  <CardTitle>Guest Signature</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="signature">Digital Signature (Full Name) *</Label>
                    <Input
                      id="signature"
                      value={guestSignature}
                      onChange={(e) => setGuestSignature(e.target.value)}
                      placeholder="Type your full name as digital signature"
                      className="text-lg"
                    />
                    <p className="text-xs text-muted-foreground">
                      By typing your name above, you acknowledge that this serves as your digital signature and
                      agreement to all terms and conditions.
                    </p>
                  </div>

                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm">
                      <strong>Staff Member:</strong> {staff?.name || "Front Desk Agent"} (ID: {staff?.id || "FD001"})
                    </p>
                    <p className="text-sm">
                      <strong>Date & Time:</strong> {format(new Date(checkInDate), "MMMM dd, yyyy 'at' HH:mm")}
                    </p>
                    <p className="text-sm">
                      <strong>Hotel:</strong> {hotelConfig?.name || hotel?.name || "Grand Hotel"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </ScrollArea>

        {/* Action Buttons */}
        <div className="flex gap-3 p-4 border-t bg-slate-50 no-print">
          <Button onClick={handlePrint} variant="outline" className="flex-1">
            <Printer className="mr-2 h-4 w-4" />
            Print Document
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1"
            style={{ backgroundColor: hotelConfig?.branding?.primaryColor || "#3b82f6" }}
            disabled={!guestSignature.trim() || !agreements.termsAndConditions}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Complete Check-in
          </Button>
          <Button onClick={() => onOpenChange(false)} variant="outline">
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
