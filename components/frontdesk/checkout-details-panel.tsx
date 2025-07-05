"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CurrencyInput } from "@/components/ui/currency-input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { UserX, Phone, Mail, Plus, Trash2 } from "lucide-react"
import { format } from "date-fns"

interface CheckOutDetailsPanelProps {
  selectedCheckIn: any
  checkOutData: any
  onCheckOutDataChange: (data: any) => void
  onAddCharge: (charge: any) => void
  onAddDiscount: (discount: any) => void
  onCheckOut: () => void
  isLoading: boolean
  configuration?: any
}

export function CheckOutDetailsPanel({
  selectedCheckIn,
  checkOutData,
  onCheckOutDataChange,
  onAddCharge,
  onAddDiscount,
  onCheckOut,
  isLoading,
  configuration,
}: CheckOutDetailsPanelProps) {
  const [showAddChargeDialog, setShowAddChargeDialog] = useState(false)
  const [showAddDiscountDialog, setShowAddDiscountDialog] = useState(false)
  const [newCharge, setNewCharge] = useState({
    description: "",
    amount: 0,
    category: "miscellaneous",
  })
  const [newDiscount, setNewDiscount] = useState({
    description: "",
    amount: 0,
    type: "fixed" as "fixed" | "percentage",
  })

  if (!selectedCheckIn) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Check-out Details</CardTitle>
          <CardDescription>Select a guest to continue</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <UserX className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Select a guest to begin checkout process</p>
        </CardContent>
      </Card>
    )
  }

  const formatCurrency = (amount: number) => {
    const currency = configuration?.financial?.currency
    if (!currency) return `$${amount.toFixed(2)}`

    const formatted = amount.toFixed(2)
    return currency.position === "before" ? `${currency.symbol}${formatted}` : `${formatted}${currency.symbol}`
  }

  const calculateTotals = () => {
    const roomCharges = selectedCheckIn.total_room_charges || 0
    const additionalCharges =
      (selectedCheckIn.additional_charges?.reduce((sum: number, charge: any) => sum + charge.amount, 0) || 0) +
      checkOutData.additionalCharges.reduce((sum: number, charge: any) => sum + charge.amount, 0)

    const existingDiscounts =
      selectedCheckIn.discounts?.reduce((sum: number, discount: any) => {
        if (discount.type === "percentage") {
          return sum + (roomCharges * discount.amount) / 100
        }
        return sum + discount.amount
      }, 0) || 0

    const newDiscounts = checkOutData.discounts.reduce((sum: number, discount: any) => {
      if (discount.type === "percentage") {
        return sum + (roomCharges * discount.amount) / 100
      }
      return sum + discount.amount
    }, 0)

    const totalDiscounts = existingDiscounts + newDiscounts
    const subtotal = roomCharges + additionalCharges - totalDiscounts
    const taxAmount = selectedCheckIn.tax_amount || 0
    const totalAmount = subtotal + taxAmount
    const previousPayments = selectedCheckIn.deposit_amount || 0
    const newPayment = checkOutData.paymentAmount || 0
    const totalPaid = previousPayments + newPayment
    const balanceDue = Math.max(0, totalAmount - totalPaid)

    return {
      roomCharges,
      additionalCharges,
      totalDiscounts,
      subtotal,
      taxAmount,
      totalAmount,
      previousPayments,
      newPayment,
      totalPaid,
      balanceDue,
    }
  }

  const totals = calculateTotals()

  const handleAddCharge = () => {
    if (!newCharge.description || newCharge.amount <= 0) {
      return
    }

    onAddCharge(newCharge)
    setNewCharge({ description: "", amount: 0, category: "miscellaneous" })
    setShowAddChargeDialog(false)
  }

  const handleAddDiscount = () => {
    if (!newDiscount.description || newDiscount.amount <= 0) {
      return
    }

    onAddDiscount(newDiscount)
    setNewDiscount({ description: "", amount: 0, type: "fixed" })
    setShowAddDiscountDialog(false)
  }

  const removeCharge = (index: number) => {
    const updatedCharges = [...checkOutData.additionalCharges]
    updatedCharges.splice(index, 1)
    onCheckOutDataChange({ ...checkOutData, additionalCharges: updatedCharges })
  }

  const removeDiscount = (index: number) => {
    const updatedDiscounts = [...checkOutData.discounts]
    updatedDiscounts.splice(index, 1)
    onCheckOutDataChange({ ...checkOutData, discounts: updatedDiscounts })
  }

  return (
    <div className="space-y-6">
      {/* Guest & Stay Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Check-out Summary</CardTitle>
          <CardDescription>Review guest stay and finalize billing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Guest Info */}
          <div className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg">
            <Avatar className="h-12 w-12">
              <AvatarImage src={selectedCheckIn.guest?.avatar || "/placeholder.svg"} />
              <AvatarFallback>
                {selectedCheckIn.guest?.full_name
                  ?.split(" ")
                  .map((n: string) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold">{selectedCheckIn.guest?.full_name}</h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {selectedCheckIn.guest?.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {selectedCheckIn.guest.email}
                  </div>
                )}
                {selectedCheckIn.guest?.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {selectedCheckIn.guest.phone}
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {selectedCheckIn.guest?.vip && <Badge className="bg-purple-100 text-purple-800">VIP</Badge>}
            </div>
          </div>

          {/* Stay Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold">Room Details</h4>
              <p className="text-lg font-bold">Room {selectedCheckIn.room?.roomNumber}</p>
              <p className="text-sm text-muted-foreground">Floor {selectedCheckIn.room?.floor}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold">Stay Duration</h4>
              <p className="text-lg font-bold">{selectedCheckIn.number_of_nights} nights</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(selectedCheckIn.check_in_date), "MMM dd")} - {format(new Date(), "MMM dd, yyyy")}
              </p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-semibold">Folio Number</h4>
              <p className="text-lg font-bold font-mono">{selectedCheckIn.folio_number}</p>
              <p className="text-sm text-muted-foreground">{selectedCheckIn.number_of_guests} guests</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billing Details */}
      <Card>
        <CardHeader>
          <CardTitle>Billing Details</CardTitle>
          <CardDescription>Review and modify charges before checkout</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing Charges */}
          <div>
            <h4 className="font-medium mb-3">Room Charges</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>
                    Room Rate × {selectedCheckIn.number_of_nights} nights
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(selectedCheckIn.check_in_date), "MMM dd")} - {format(new Date(), "MMM dd, yyyy")}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(selectedCheckIn.total_room_charges || 0)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Additional Charges */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Additional Charges</h4>
              <Dialog open={showAddChargeDialog} onOpenChange={setShowAddChargeDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Charge
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Additional Charge</DialogTitle>
                    <DialogDescription>Add a new charge to the guest's bill</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="chargeDescription">Description</Label>
                      <Input
                        id="chargeDescription"
                        value={newCharge.description}
                        onChange={(e) => setNewCharge({ ...newCharge, description: e.target.value })}
                        placeholder="e.g., Minibar, Room Service, etc."
                      />
                    </div>
                    <CurrencyInput
                      label="Amount"
                      value={newCharge.amount}
                      onChange={(usdValue) => setNewCharge({ ...newCharge, amount: usdValue })}
                    />
                    <div>
                      <Label htmlFor="chargeCategory">Category</Label>
                      <Select
                        value={newCharge.category}
                        onValueChange={(value) => setNewCharge({ ...newCharge, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="food">Food</SelectItem>
                          <SelectItem value="beverage">Beverage</SelectItem>
                          <SelectItem value="room_service">Room Service</SelectItem>
                          <SelectItem value="laundry">Laundry</SelectItem>
                          <SelectItem value="spa">Spa & Wellness</SelectItem>
                          <SelectItem value="parking">Parking</SelectItem>
                          <SelectItem value="phone">Telephone</SelectItem>
                          <SelectItem value="miscellaneous">Miscellaneous</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowAddChargeDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddCharge}>Add Charge</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Existing charges */}
                {selectedCheckIn.additional_charges?.map((charge: any, index: number) => (
                  <TableRow key={`existing-${index}`}>
                    <TableCell>{charge.description}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{charge.category}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(charge.amount)}</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                ))}
                {/* New charges */}
                {checkOutData.additionalCharges.map((charge: any, index: number) => (
                  <TableRow key={`new-${index}`}>
                    <TableCell>{charge.description}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{charge.category}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(charge.amount)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => removeCharge(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {(!selectedCheckIn.additional_charges || selectedCheckIn.additional_charges.length === 0) &&
                  checkOutData.additionalCharges.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                        No additional charges
                      </TableCell>
                    </TableRow>
                  )}
              </TableBody>
            </Table>
          </div>

          {/* Discounts */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Discounts</h4>
              <Dialog open={showAddDiscountDialog} onOpenChange={setShowAddDiscountDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Discount
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Discount</DialogTitle>
                    <DialogDescription>Apply a discount to the guest's bill</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="discountDescription">Description</Label>
                      <Input
                        id="discountDescription"
                        value={newDiscount.description}
                        onChange={(e) => setNewDiscount({ ...newDiscount, description: e.target.value })}
                        placeholder="e.g., Senior Discount, Loyalty Discount, etc."
                      />
                    </div>
                    <div>
                      <Label htmlFor="discountType">Type</Label>
                      <Select
                        value={newDiscount.type}
                        onValueChange={(value: "fixed" | "percentage") =>
                          setNewDiscount({ ...newDiscount, type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fixed">Fixed Amount</SelectItem>
                          <SelectItem value="percentage">Percentage</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <CurrencyInput
                      label={newDiscount.type === "percentage" ? "Percentage (%)" : "Amount"}
                      value={newDiscount.amount}
                      onChange={(usdValue) => setNewDiscount({ ...newDiscount, amount: usdValue })}
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowAddDiscountDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddDiscount}>Add Discount</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Existing discounts */}
                {selectedCheckIn.discounts?.map((discount: any, index: number) => (
                  <TableRow key={`existing-discount-${index}`}>
                    <TableCell>{discount.description}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{discount.type === "percentage" ? "Percentage" : "Fixed"}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {discount.type === "percentage" ? `${discount.amount}%` : formatCurrency(discount.amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      {discount.type === "percentage"
                        ? formatCurrency((selectedCheckIn.total_room_charges * discount.amount) / 100)
                        : formatCurrency(discount.amount)}
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                ))}
                {/* New discounts */}
                {checkOutData.discounts.map((discount: any, index: number) => (
                  <TableRow key={`new-discount-${index}`}>
                    <TableCell>{discount.description}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{discount.type === "percentage" ? "Percentage" : "Fixed"}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {discount.type === "percentage" ? `${discount.amount}%` : formatCurrency(discount.amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      {discount.type === "percentage"
                        ? formatCurrency((selectedCheckIn.total_room_charges * discount.amount) / 100)
                        : formatCurrency(discount.amount)}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => removeDiscount(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {(!selectedCheckIn.discounts || selectedCheckIn.discounts.length === 0) &&
                  checkOutData.discounts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                        No discounts applied
                      </TableCell>
                    </TableRow>
                  )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Payment Collection */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Collection</CardTitle>
          <CardDescription>Collect any outstanding balance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CurrencyInput
              label="Payment Amount"
              value={checkOutData.paymentAmount || 0}
              onChange={(usdValue) =>
                onCheckOutDataChange({
                  ...checkOutData,
                  paymentAmount: usdValue,
                })
              }
              placeholder="0.00"
              helperText={`Outstanding balance: ${formatCurrency(totals.balanceDue)}`}
            />

            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select
                value={checkOutData.paymentMethod || ""}
                onValueChange={(value) => onCheckOutDataChange({ ...checkOutData, paymentMethod: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="debit_card">Debit Card</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="mobile_money">Mobile Payment</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="checkoutNotes">Checkout Notes</Label>
            <Textarea
              id="checkoutNotes"
              placeholder="Any notes about the checkout process..."
              value={checkOutData.notes || ""}
              onChange={(e) => onCheckOutDataChange({ ...checkOutData, notes: e.target.value })}
            />
          </div>

          {/* Bill Summary */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-3">Final Bill Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Room Charges:</span>
                <span>{formatCurrency(totals.roomCharges)}</span>
              </div>
              <div className="flex justify-between">
                <span>Additional Charges:</span>
                <span>{formatCurrency(totals.additionalCharges)}</span>
              </div>
              <div className="flex justify-between">
                <span>Discounts:</span>
                <span className="text-green-600">-{formatCurrency(totals.totalDiscounts)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>{formatCurrency(totals.taxAmount)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total Amount:</span>
                <span>{formatCurrency(totals.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Previous Payments:</span>
                <span>-{formatCurrency(totals.previousPayments)}</span>
              </div>
              {totals.newPayment > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Payment Now:</span>
                  <span>-{formatCurrency(totals.newPayment)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Balance Due:</span>
                <span className={totals.balanceDue > 0 ? "text-red-600" : "text-green-600"}>
                  {formatCurrency(totals.balanceDue)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button onClick={onCheckOut} className="flex-1" disabled={isLoading}>
          <UserX className="mr-2 h-4 w-4" />
          {isLoading ? "Processing..." : "Complete Check-out"}
        </Button>
      </div>
    </div>
  )
}
