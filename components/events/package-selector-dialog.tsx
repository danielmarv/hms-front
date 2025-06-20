"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Package, Users, Clock, DollarSign, Star, Calculator, CheckCircle, Loader2 } from "lucide-react"
import { useEventPackages, type EventPackage, type PriceCalculation } from "@/hooks/use-event-packages"
import { useEventTypes } from "@/hooks/use-event-types"
import { toast } from "sonner"

interface PackageSelectorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectPackage: (packageData: {
    package: EventPackage
    guestCount: number
    totalPrice: number
    calculation: PriceCalculation
  }) => void
  eventId?: string
  initialGuestCount?: number
}

export function PackageSelectorDialog({
  open,
  onOpenChange,
  onSelectPackage,
  eventId,
  initialGuestCount = 50,
}: PackageSelectorDialogProps) {
  const { packages, isLoading, fetchPackages, calculatePackagePrice, applyPackageToEvent } = useEventPackages()
  const { eventTypes } = useEventTypes()

  const [selectedPackage, setSelectedPackage] = useState<EventPackage | null>(null)
  const [guestCount, setGuestCount] = useState(initialGuestCount)
  const [priceCalculation, setPriceCalculation] = useState<PriceCalculation | null>(null)
  const [calculating, setCalculating] = useState(false)
  const [applying, setApplying] = useState(false)

  useEffect(() => {
    if (open) {
      fetchPackages({ isActive: true })
    }
  }, [open, fetchPackages])

  useEffect(() => {
    if (selectedPackage && guestCount > 0) {
      calculatePrice()
    }
  }, [selectedPackage, guestCount])

  const calculatePrice = async () => {
    if (!selectedPackage) return

    try {
      setCalculating(true)
      const calculation = await calculatePackagePrice({
        packageId: selectedPackage._id,
        guestCount,
      })
      setPriceCalculation(calculation)
    } catch (error) {
      console.error("Failed to calculate price:", error)
      toast.error("Failed to calculate package price")
    } finally {
      setCalculating(false)
    }
  }

  const handleSelectPackage = async () => {
    if (!selectedPackage || !priceCalculation) return

    try {
      setApplying(true)

      if (eventId) {
        // Apply package to existing event
        await applyPackageToEvent(selectedPackage._id, eventId, { guestCount })
        toast.success("Package applied to event successfully")
      }

      // Return package data to parent component
      onSelectPackage({
        package: selectedPackage,
        guestCount,
        totalPrice: priceCalculation.totalPrice,
        calculation: priceCalculation,
      })

      onOpenChange(false)
    } catch (error) {
      console.error("Failed to apply package:", error)
      toast.error("Failed to apply package")
    } finally {
      setApplying(false)
    }
  }

  const getStatusBadge = (pkg: EventPackage) => {
    if (pkg.isPromoted) {
      return (
        <Badge className="bg-yellow-500 hover:bg-yellow-600">
          <Star className="w-3 h-3 mr-1" />
          Promoted
        </Badge>
      )
    }
    return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
  }

  const isPackageValid = (pkg: EventPackage) => {
    return guestCount >= pkg.minCapacity && guestCount <= pkg.maxCapacity
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Package className="mr-2 h-5 w-5" />
            Select Event Package
          </DialogTitle>
          <DialogDescription>
            Choose a pre-configured package for your event and customize the guest count
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-4">
          {/* Package Selection */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <Label htmlFor="guestCount">Number of Guests</Label>
                  <Input
                    id="guestCount"
                    type="number"
                    min="1"
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number.parseInt(e.target.value) || 1)}
                    className="mt-1"
                  />
                </div>
                {selectedPackage && (
                  <div className="text-sm text-muted-foreground">
                    Capacity: {selectedPackage.minCapacity} - {selectedPackage.maxCapacity} guests
                  </div>
                )}
              </div>

              <Separator />

              <ScrollArea className="h-[400px] pr-4">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {packages.map((pkg) => {
                      const isValid = isPackageValid(pkg)
                      const isSelected = selectedPackage?._id === pkg._id

                      return (
                        <Card
                          key={pkg._id}
                          className={`cursor-pointer transition-all ${
                            isSelected
                              ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950"
                              : isValid
                                ? "hover:bg-slate-50 dark:hover:bg-slate-800"
                                : "opacity-50 cursor-not-allowed"
                          }`}
                          onClick={() => isValid && setSelectedPackage(pkg)}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                                  {pkg.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <CardTitle className="text-lg">{pkg.name}</CardTitle>
                                  <CardDescription className="text-sm">
                                    {pkg.description?.substring(0, 60)}
                                    {pkg.description && pkg.description.length > 60 ? "..." : ""}
                                  </CardDescription>
                                </div>
                              </div>
                              <div className="flex flex-col items-end space-y-2">
                                {getStatusBadge(pkg)}
                                {isSelected && <CheckCircle className="h-5 w-5 text-green-500" />}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div className="flex items-center">
                                <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span>
                                  {pkg.minCapacity}-{pkg.maxCapacity}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span>{pkg.duration}h</span>
                              </div>
                              <div className="flex items-center">
                                <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span>${pkg.basePrice}</span>
                              </div>
                            </div>

                            {pkg.eventTypes.length > 0 && (
                              <div className="mt-3">
                                <div className="flex flex-wrap gap-1">
                                  {pkg.eventTypes.slice(0, 3).map((typeId) => {
                                    const eventType = eventTypes.find((t) => t._id === typeId)
                                    return eventType ? (
                                      <Badge key={typeId} variant="outline" className="text-xs">
                                        {eventType.name}
                                      </Badge>
                                    ) : null
                                  })}
                                  {pkg.eventTypes.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{pkg.eventTypes.length - 3} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}

                            {!isValid && (
                              <div className="mt-2 text-xs text-red-500">
                                Guest count must be between {pkg.minCapacity} and {pkg.maxCapacity}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>

          {/* Price Calculation */}
          <div className="lg:col-span-1">
            <Card className="sticky top-0">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calculator className="mr-2 h-4 w-4" />
                  Price Calculation
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedPackage ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold">{selectedPackage.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {guestCount} guests × {selectedPackage.duration} hours
                      </p>
                    </div>

                    <Separator />

                    {calculating ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : priceCalculation ? (
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Base Price</span>
                          <span>${priceCalculation.basePrice}</span>
                        </div>

                        <div className="flex justify-between">
                          <span>Per Guest ({priceCalculation.guestCount})</span>
                          <span>${priceCalculation.totalPrice - priceCalculation.basePrice}</span>
                        </div>

                        {priceCalculation.includedServices.length > 0 && (
                          <>
                            <Separator />
                            <div>
                              <p className="text-sm font-medium mb-2">Included Services</p>
                              {priceCalculation.includedServices.map((service, index) => (
                                <div key={index} className="flex justify-between text-sm">
                                  <span>
                                    {service.name} (×{service.quantity})
                                  </span>
                                  <span>${service.totalPrice}</span>
                                </div>
                              ))}
                            </div>
                          </>
                        )}

                        <Separator />

                        <div className="flex justify-between font-semibold text-lg">
                          <span>Total</span>
                          <span>${priceCalculation.totalPrice}</span>
                        </div>

                        {selectedPackage.isPromoted && selectedPackage.promotionDetails?.discountPercentage && (
                          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                            <div className="flex items-center text-yellow-800 dark:text-yellow-200">
                              <Star className="h-4 w-4 mr-2" />
                              <span className="text-sm font-medium">
                                {selectedPackage.promotionDetails.discountPercentage}% Promotion Active
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        <Calculator className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Select a package to see pricing</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Select a package to see details</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSelectPackage}
            disabled={!selectedPackage || !priceCalculation || applying || !isPackageValid(selectedPackage)}
          >
            {applying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Applying...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                {eventId ? "Apply Package" : "Select Package"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
