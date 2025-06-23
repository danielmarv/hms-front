"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UserCheck, Receipt, FileText, User, Bed, Calendar, CreditCard, Phone, Mail } from "lucide-react"
import { format } from "date-fns"

interface CheckInDetailsPanelProps {
  selectedGuest: any
  selectedBooking: any
  selectedRoom: any
  checkInData: any
  onCheckInDataChange: (data: any) => void
  onCheckIn: () => void
  onPrintReceipt: (data: any) => void
  onPrintInvoice: (data: any) => void
  isLoading: boolean
}

export function CheckInDetailsPanel({
  selectedGuest,
  selectedBooking,
  selectedRoom,
  checkInData,
  onCheckInDataChange,
  onCheckIn,
  onPrintReceipt,
  onPrintInvoice,
  isLoading,
}: CheckInDetailsPanelProps) {
  const updateCheckInData = (field: string, value: any) => {
    onCheckInDataChange({
      ...checkInData,
      [field]: value,
    })
  }

  const updateEmergencyContact = (field: string, value: string) => {
    onCheckInDataChange({
      ...checkInData,
      emergencyContact: {
        ...checkInData.emergencyContact,
        [field]: value,
      },
    })
  }

  const calculateTotal = () => {
    if (!selectedRoom || !selectedBooking) return 0
    const nights = selectedBooking.duration || 1
    const roomRate = selectedRoom.roomType?.basePrice || 0
    const subtotal = roomRate * nights
    const tax = subtotal * 0.1 // 10% tax
    return subtotal + tax + (checkInData.depositAmount || 0)
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Guest & Booking Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Check-in Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Guest Information */}
          <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
            <Avatar className="h-12 w-12">
              <AvatarImage src={selectedGuest?.avatar || "/placeholder.svg"} />
              <AvatarFallback>
                {selectedGuest?.full_name
                  ?.split(" ")
                  .map((n: string) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold">{selectedGuest?.full_name}</h3>
              <div className="space-y-1 text-sm text-muted-foreground">
                {selectedGuest?.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {selectedGuest.email}
                  </div>
                )}
                {selectedGuest?.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {selectedGuest.phone}
                  </div>
                )}
              </div>
            </div>
            {selectedGuest?.vip && <Badge className="bg-purple-100 text-purple-800">VIP</Badge>}
          </div>

          {/* Room Information */}
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Bed className="h-4 w-4" />
              <span className="font-medium">Room {selectedRoom?.roomNumber}</span>
              <Badge variant="outline">Floor {selectedRoom?.floor}</Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>{selectedRoom?.roomType?.name}</p>
              <p>Max {selectedRoom?.roomType?.maxOccupancy} guests</p>
              <p>${selectedRoom?.roomType?.basePrice}/night</p>
            </div>
          </div>

          {/* Booking Information */}
          {selectedBooking && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">Booking Details</span>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Confirmation: {selectedBooking.confirmation_number}</p>
                <p>
                  {format(new Date(selectedBooking.check_in), "MMM dd, yyyy")} -{" "}
                  {format(new Date(selectedBooking.check_out), "MMM dd, yyyy")}
                </p>
                <p>{selectedBooking.duration} nights</p>
                <p>{selectedBooking.number_of_guests} guests</p>
              </div>
            </div>
          )}

          {/* Payment Summary */}
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="h-4 w-4" />
              <span className="font-medium">Payment Summary</span>
            </div>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span>Room charges:</span>
                <span>${selectedRoom?.roomType?.basePrice * (selectedBooking?.duration || 1)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (10%):</span>
                <span>${(selectedRoom?.roomType?.basePrice * (selectedBooking?.duration || 1) * 0.1).toFixed(2)}</span>
              </div>
              {checkInData.depositAmount > 0 && (
                <div className="flex justify-between">
                  <span>Additional deposit:</span>
                  <span>${checkInData.depositAmount}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total:</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Check-in Details Form */}
      <Card>
        <CardHeader>
          <CardTitle>Check-in Details</CardTitle>
          <CardDescription>Complete the check-in information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Key Cards */}
          <div className="space-y-2">
            <Label htmlFor="keyCards">Number of Key Cards</Label>
            <Select
              value={checkInData.keyCards.toString()}
              onValueChange={(value) => updateCheckInData("keyCards", Number.parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Key Card</SelectItem>
                <SelectItem value="2">2 Key Cards</SelectItem>
                <SelectItem value="3">3 Key Cards</SelectItem>
                <SelectItem value="4">4 Key Cards</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Additional Deposit */}
          <div className="space-y-2">
            <Label htmlFor="depositAmount">Additional Deposit</Label>
            <Input
              id="depositAmount"
              type="number"
              placeholder="0.00"
              value={checkInData.depositAmount || ""}
              onChange={(e) => updateCheckInData("depositAmount", Number.parseFloat(e.target.value) || 0)}
            />
          </div>

          {/* Emergency Contact */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Emergency Contact</Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="emergencyName">Name</Label>
                <Input
                  id="emergencyName"
                  value={checkInData.emergencyContact.name}
                  onChange={(e) => updateEmergencyContact("name", e.target.value)}
                  placeholder="Full name"
                />
              </div>
              <div>
                <Label htmlFor="emergencyPhone">Phone</Label>
                <Input
                  id="emergencyPhone"
                  value={checkInData.emergencyContact.phone}
                  onChange={(e) => updateEmergencyContact("phone", e.target.value)}
                  placeholder="+1-555-0123"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="emergencyRelationship">Relationship</Label>
              <Input
                id="emergencyRelationship"
                value={checkInData.emergencyContact.relationship}
                onChange={(e) => updateEmergencyContact("relationship", e.target.value)}
                placeholder="e.g., Spouse, Parent, Friend"
              />
            </div>
          </div>

          {/* Special Requests */}
          <div className="space-y-2">
            <Label htmlFor="specialRequests">Special Requests</Label>
            <Textarea
              id="specialRequests"
              placeholder="Any special requests or preferences..."
              value={checkInData.specialRequests}
              onChange={(e) => updateCheckInData("specialRequests", e.target.value)}
              rows={3}
            />
          </div>

          {/* Arrival Notes */}
          <div className="space-y-2">
            <Label htmlFor="arrivalNotes">Arrival Notes</Label>
            <Textarea
              id="arrivalNotes"
              placeholder="Any notes about the guest's arrival..."
              value={checkInData.arrivalNotes}
              onChange={(e) => updateCheckInData("arrivalNotes", e.target.value)}
              rows={2}
            />
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button onClick={onCheckIn} className="w-full" disabled={isLoading} size="lg">
              <UserCheck className="mr-2 h-4 w-4" />
              {isLoading ? "Processing..." : "Complete Check-in"}
            </Button>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => onPrintReceipt({ selectedGuest, selectedRoom, selectedBooking, checkInData })}
              >
                <Receipt className="mr-2 h-4 w-4" />
                Print Receipt
              </Button>
              <Button
                variant="outline"
                onClick={() => onPrintInvoice({ selectedGuest, selectedRoom, selectedBooking, checkInData })}
              >
                <FileText className="mr-2 h-4 w-4" />
                Print Invoice
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
