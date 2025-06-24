"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UserCheck, Phone, Mail, FileText, Receipt } from "lucide-react"

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
  if (!selectedGuest || !selectedRoom) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Check-in Details</CardTitle>
          <CardDescription>Complete guest and room selection first</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <UserCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Select a guest and room to continue</p>
        </CardContent>
      </Card>
    )
  }

  const calculateTotal = () => {
    const roomRate = selectedRoom.roomType?.basePrice || 0
    const nights = checkInData.numberOfNights || selectedBooking?.duration || 1
    const roomCharges = roomRate * nights
    const taxRate = 10 // This should come from configuration
    const taxAmount = (roomCharges * taxRate) / 100
    const totalCharges = roomCharges + taxAmount

    // Deposit is a payment made by guest towards the bill
    const depositPaid = checkInData.depositAmount || 0
    const balanceDue = totalCharges - depositPaid

    return {
      roomCharges,
      taxAmount,
      totalCharges,
      depositPaid,
      balanceDue: Math.max(0, balanceDue), // Balance can't be negative
    }
  }

  const totals = calculateTotal()

  return (
    <div className="space-y-6">
      {/* Guest & Room Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Check-in Summary</CardTitle>
          <CardDescription>Review guest and room details before completing check-in</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Guest Info */}
          <div className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg">
            <Avatar className="h-12 w-12">
              <AvatarImage src={selectedGuest.avatar || "/placeholder.svg"} />
              <AvatarFallback>
                {selectedGuest.full_name
                  ?.split(" ")
                  .map((n: string) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold">{selectedGuest.full_name}</h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {selectedGuest.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {selectedGuest.email}
                  </div>
                )}
                {selectedGuest.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {selectedGuest.phone}
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {selectedGuest.vip && <Badge className="bg-purple-100 text-purple-800">VIP</Badge>}
              {selectedGuest.loyalty_program?.member && (
                <Badge variant="outline">{selectedGuest.loyalty_program.tier}</Badge>
              )}
            </div>
          </div>

          {/* Room Info */}
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div>
              <h4 className="font-semibold">Room {selectedRoom.roomNumber}</h4>
              <p className="text-sm text-muted-foreground">{selectedRoom.roomType?.name}</p>
              <p className="text-xs text-muted-foreground">Floor {selectedRoom.floor}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">${selectedRoom.roomType?.basePrice}/night</p>
              {selectedRoom.view && <p className="text-xs text-muted-foreground">{selectedRoom.view} view</p>}
            </div>
          </div>

          {/* Booking Info (if exists) */}
          {selectedBooking && (
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold mb-2">Booking Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Confirmation:</span>
                  <p className="font-mono">{selectedBooking.confirmation_number}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Duration:</span>
                  <p>
                    {selectedBooking.check_in} to {selectedBooking.check_out}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Guests:</span>
                  <p>{selectedBooking.number_of_guests}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Amount:</span>
                  <p className="font-semibold">${selectedBooking.total_amount}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Check-in Details Form */}
      <Card>
        <CardHeader>
          <CardTitle>Check-in Details</CardTitle>
          <CardDescription>Complete the check-in information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Key Cards */}
            <div className="space-y-2">
              <Label htmlFor="keyCards">Number of Key Cards</Label>
              <Select
                value={checkInData.keyCards.toString()}
                onValueChange={(value) => onCheckInDataChange({ ...checkInData, keyCards: Number.parseInt(value) })}
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

            {/* Number of Nights */}
            <div className="space-y-2">
              <Label htmlFor="numberOfNights">Number of Nights</Label>
              <Input
                id="numberOfNights"
                type="number"
                min="1"
                value={checkInData.numberOfNights || selectedBooking?.duration || 1}
                onChange={(e) =>
                  onCheckInDataChange({
                    ...checkInData,
                    numberOfNights: Number.parseInt(e.target.value) || 1,
                  })
                }
              />
            </div>
          </div>

          {/* Payment Collection */}
          <div className="space-y-4">
            <h4 className="font-medium">Payment Collection</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="depositAmount">Payment Amount ($)</Label>
                <Input
                  id="depositAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={checkInData.depositAmount || ""}
                  onChange={(e) =>
                    onCheckInDataChange({
                      ...checkInData,
                      depositAmount: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Amount paid by guest towards their bill (Total: ${totals.totalCharges.toFixed(2)})
                </p>
              </div>

              {checkInData.depositAmount > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="depositPaymentMethod">Payment Method</Label>
                  <Select
                    value={checkInData.depositPaymentMethod || ""}
                    onValueChange={(value) => onCheckInDataChange({ ...checkInData, depositPaymentMethod: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                      <SelectItem value="debit_card">Debit Card</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="mobile_payment">Mobile Payment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {checkInData.depositAmount > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-400 mt-0.5 flex-shrink-0"></div>
                  <div className="text-sm">
                    <p className="font-medium text-green-800">Payment Information</p>
                    <p className="text-green-700">
                      Guest is paying ${checkInData.depositAmount} towards their bill. Remaining balance: $
                      {totals.balanceDue.toFixed(2)} will be collected at checkout.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Parking Space */}
          <div className="space-y-2">
            <Label htmlFor="parkingSpace">Parking Space (Optional)</Label>
            <Input
              id="parkingSpace"
              placeholder="e.g., P-101"
              value={checkInData.parkingSpace || ""}
              onChange={(e) =>
                onCheckInDataChange({
                  ...checkInData,
                  parkingSpace: e.target.value,
                })
              }
            />
          </div>

          {/* Vehicle Details */}
          {checkInData.parkingSpace && (
            <div className="space-y-4">
              <h4 className="font-medium">Vehicle Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="licensePlate">License Plate</Label>
                  <Input
                    id="licensePlate"
                    placeholder="License plate number"
                    value={checkInData.vehicleDetails?.license_plate || ""}
                    onChange={(e) =>
                      onCheckInDataChange({
                        ...checkInData,
                        vehicleDetails: {
                          ...checkInData.vehicleDetails,
                          license_plate: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicleMake">Make</Label>
                  <Input
                    id="vehicleMake"
                    placeholder="Vehicle make"
                    value={checkInData.vehicleDetails?.make || ""}
                    onChange={(e) =>
                      onCheckInDataChange({
                        ...checkInData,
                        vehicleDetails: {
                          ...checkInData.vehicleDetails,
                          make: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicleModel">Model</Label>
                  <Input
                    id="vehicleModel"
                    placeholder="Vehicle model"
                    value={checkInData.vehicleDetails?.model || ""}
                    onChange={(e) =>
                      onCheckInDataChange({
                        ...checkInData,
                        vehicleDetails: {
                          ...checkInData.vehicleDetails,
                          model: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicleColor">Color</Label>
                  <Input
                    id="vehicleColor"
                    placeholder="Vehicle color"
                    value={checkInData.vehicleDetails?.color || ""}
                    onChange={(e) =>
                      onCheckInDataChange({
                        ...checkInData,
                        vehicleDetails: {
                          ...checkInData.vehicleDetails,
                          color: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* Emergency Contact */}
          <div className="space-y-4">
            <h4 className="font-medium">Emergency Contact</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergencyName">Name</Label>
                <Input
                  id="emergencyName"
                  placeholder="Emergency contact name"
                  value={checkInData.emergencyContact?.name || ""}
                  onChange={(e) =>
                    onCheckInDataChange({
                      ...checkInData,
                      emergencyContact: {
                        ...checkInData.emergencyContact,
                        name: e.target.value,
                      },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyPhone">Phone</Label>
                <Input
                  id="emergencyPhone"
                  placeholder="Emergency contact phone"
                  value={checkInData.emergencyContact?.phone || ""}
                  onChange={(e) =>
                    onCheckInDataChange({
                      ...checkInData,
                      emergencyContact: {
                        ...checkInData.emergencyContact,
                        phone: e.target.value,
                      },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyRelationship">Relationship</Label>
                <Input
                  id="emergencyRelationship"
                  placeholder="Relationship"
                  value={checkInData.emergencyContact?.relationship || ""}
                  onChange={(e) =>
                    onCheckInDataChange({
                      ...checkInData,
                      emergencyContact: {
                        ...checkInData.emergencyContact,
                        relationship: e.target.value,
                      },
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* Special Requests */}
          <div className="space-y-2">
            <Label htmlFor="specialRequests">Special Requests</Label>
            <Textarea
              id="specialRequests"
              placeholder="Any special requests or preferences..."
              value={checkInData.specialRequests || ""}
              onChange={(e) => onCheckInDataChange({ ...checkInData, specialRequests: e.target.value })}
            />
          </div>

          {/* Arrival Notes */}
          <div className="space-y-2">
            <Label htmlFor="arrivalNotes">Arrival Notes</Label>
            <Textarea
              id="arrivalNotes"
              placeholder="Any notes about the guest's arrival..."
              value={checkInData.arrivalNotes || ""}
              onChange={(e) => onCheckInDataChange({ ...checkInData, arrivalNotes: e.target.value })}
            />
          </div>

          {/* Payment Summary */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-3">Payment Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Room Rate ({checkInData.numberOfNights || 1} night(s)):</span>
                <span>${totals.roomCharges.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (10%):</span>
                <span>${totals.taxAmount.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total Amount:</span>
                <span>${totals.totalCharges.toFixed(2)}</span>
              </div>
              {checkInData.depositAmount > 0 && (
                <>
                  <div className="flex justify-between text-green-600">
                    <span>Payment Received:</span>
                    <span>-${totals.depositPaid.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Balance Due:</span>
                    <span className={totals.balanceDue > 0 ? "text-red-600" : "text-green-600"}>
                      ${totals.balanceDue.toFixed(2)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button onClick={onCheckIn} className="flex-1" disabled={isLoading}>
          <UserCheck className="mr-2 h-4 w-4" />
          {isLoading ? "Processing..." : "Complete Check-in"}
        </Button>

        <Button
          variant="outline"
          onClick={() => onPrintReceipt({ guest: selectedGuest, room: selectedRoom, booking: selectedBooking })}
        >
          <Receipt className="mr-2 h-4 w-4" />
          Preview Receipt
        </Button>

        <Button
          variant="outline"
          onClick={() => onPrintInvoice({ guest: selectedGuest, room: selectedRoom, booking: selectedBooking })}
        >
          <FileText className="mr-2 h-4 w-4" />
          Preview Invoice
        </Button>
      </div>
    </div>
  )
}
