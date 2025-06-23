"use client"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { Printer, FileText, User, Calendar, Phone, CreditCard, CheckCircle } from "lucide-react"
import { format } from "date-fns"

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

  if (!registrationData) return null

  const { booking, checkInData, hotel, checkInDate, staff } = registrationData

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
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .section { margin-bottom: 20px; }
                .field { margin-bottom: 10px; }
                .signature-line { border-bottom: 1px solid #000; min-height: 40px; margin-top: 10px; }
                .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                .full-width { grid-column: 1 / -1; }
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
        guest_id: booking.guest.id,
        room_id: checkInData.roomNumber,
        expected_check_out: booking.checkOut,
        number_of_guests: booking.guests,
        booking_id: booking.id,
        special_requests: checkInData.specialRequests,
        notes: checkInData.arrivalNotes,
        deposit_amount: checkInData.depositAmount,
        key_cards_issued: checkInData.keyCards,
        emergency_contact: emergencyContact.name ? emergencyContact : undefined,
        registration_document: {
          guest_signature: guestSignature,
          agreements,
          additional_requests: additionalRequests,
        },
      }

      // Call the onConfirm callback with the complete data
      await onConfirm(checkInDataWithRegistration)
    } catch (error) {
      console.error("Registration confirmation error:", error)
      toast.error("Failed to complete registration")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Guest Registration Form
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Print/Preview Section */}
          <div ref={printRef} className="bg-white p-6 border rounded-lg">
            {/* Hotel Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold">{hotel.name}</h1>
              <p className="text-muted-foreground">{hotel.address}</p>
              <p className="text-muted-foreground">
                Phone: {hotel.phone} | Email: {hotel.email}
              </p>
              <div className="mt-4">
                <h2 className="text-xl font-semibold">GUEST REGISTRATION FORM</h2>
                <p className="text-sm text-muted-foreground">
                  Check-in Date: {format(new Date(checkInDate), "MMMM dd, yyyy 'at' HH:mm")}
                </p>
              </div>
            </div>

            {/* Guest Information */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Guest Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Full Name</Label>
                  <p className="text-lg">{booking.guest.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Confirmation Number</Label>
                  <p className="text-lg font-mono">{booking.confirmationNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email Address</Label>
                  <p>{booking.guest.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Phone Number</Label>
                  <p>{booking.guest.phone}</p>
                </div>
              </CardContent>
            </Card>

            {/* Reservation Details */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Reservation Details
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Check-in Date</Label>
                  <p>{booking.checkIn}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Check-out Date</Label>
                  <p>{booking.checkOut}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Room Type</Label>
                  <p>{booking.roomType}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Room Number</Label>
                  <p className="text-lg font-bold">Room {checkInData.roomNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Number of Guests</Label>
                  <p>{booking.guests}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Key Cards Issued</Label>
                  <p>{checkInData.keyCards}</p>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Total Amount</Label>
                  <p className="text-lg font-bold">${booking.totalAmount}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Payment Status</Label>
                  <Badge
                    className={
                      booking.paymentStatus === "paid"
                        ? "bg-green-100 text-green-800"
                        : booking.paymentStatus === "deposit_paid"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                    }
                  >
                    {booking.paymentStatus.replace("_", " ")}
                  </Badge>
                </div>
                {checkInData.paymentMethod && (
                  <div>
                    <Label className="text-sm font-medium">Payment Method</Label>
                    <p>{checkInData.paymentMethod.replace("_", " ")}</p>
                  </div>
                )}
                {checkInData.depositAmount > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Additional Deposit</Label>
                    <p>${checkInData.depositAmount}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Special Requests */}
            {(booking.specialRequests || checkInData.specialRequests) && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Special Requests & Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  {booking.specialRequests && (
                    <div className="mb-2">
                      <Label className="text-sm font-medium">Original Requests:</Label>
                      <p>{booking.specialRequests}</p>
                    </div>
                  )}
                  {checkInData.specialRequests && (
                    <div className="mb-2">
                      <Label className="text-sm font-medium">Additional Requests:</Label>
                      <p>{checkInData.specialRequests}</p>
                    </div>
                  )}
                  {checkInData.arrivalNotes && (
                    <div>
                      <Label className="text-sm font-medium">Arrival Notes:</Label>
                      <p>{checkInData.arrivalNotes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
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
                    I agree to the hotel's terms and conditions, including check-out time and cancellation policy
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
                    By typing your name above, you acknowledge that this serves as your digital signature and agreement
                    to all terms and conditions.
                  </p>
                </div>

                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm">
                    <strong>Staff Member:</strong> {staff.name} (ID: {staff.id})
                  </p>
                  <p className="text-sm">
                    <strong>Date & Time:</strong> {format(new Date(checkInDate), "MMMM dd, yyyy 'at' HH:mm")}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 no-print">
            <Button onClick={handlePrint} variant="outline" className="flex-1">
              <Printer className="mr-2 h-4 w-4" />
              Print Document
            </Button>
            <Button
              onClick={handleConfirm}
              className="flex-1"
              disabled={!guestSignature.trim() || !agreements.termsAndConditions}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Complete Check-in
            </Button>
            <Button onClick={() => onOpenChange(false)} variant="outline">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
