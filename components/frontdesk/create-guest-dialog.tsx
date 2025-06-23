"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { User, MapPin, Phone, CreditCard, Heart } from "lucide-react"

interface CreateGuestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateGuest: (guestData: any) => Promise<void>
}

export function CreateGuestDialog({ open, onOpenChange, onCreateGuest }: CreateGuestDialogProps) {
  const [guestData, setGuestData] = useState({
    full_name: "",
    email: "",
    phone: "",
    gender: "",
    dob: "",
    nationality: "",
    id_type: "passport",
    id_number: "",
    id_expiry: "",
    address: {
      street: "",
      city: "",
      state: "",
      postal_code: "",
      country: "",
    },
    emergency_contact: {
      name: "",
      phone: "",
      relationship: "",
    },
    preferences: {
      room_type: "",
      floor_preference: "",
      bed_type: "",
      smoking: false,
      dietary_restrictions: "",
    },
    marketing_preferences: {
      email_marketing: false,
      sms_marketing: false,
      promotional_offers: false,
    },
    notes: "",
    vip: false,
  })

  const updateGuestData = (field: string, value: any) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".")
      setGuestData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value,
        },
      }))
    } else {
      setGuestData((prev) => ({ ...prev, [field]: value }))
    }
  }

  const handleSubmit = async () => {
    // Validate required fields
    if (!guestData.full_name.trim()) {
      toast.error("Full name is required")
      return
    }

    if (!guestData.email.trim() && !guestData.phone.trim()) {
      toast.error("Either email or phone number is required")
      return
    }

    try {
      await onCreateGuest(guestData)
      // Reset form
      setGuestData({
        full_name: "",
        email: "",
        phone: "",
        gender: "",
        dob: "",
        nationality: "",
        id_type: "passport",
        id_number: "",
        id_expiry: "",
        address: {
          street: "",
          city: "",
          state: "",
          postal_code: "",
          country: "",
        },
        emergency_contact: {
          name: "",
          phone: "",
          relationship: "",
        },
        preferences: {
          room_type: "",
          floor_preference: "",
          bed_type: "",
          smoking: false,
          dietary_restrictions: "",
        },
        marketing_preferences: {
          email_marketing: false,
          sms_marketing: false,
          promotional_offers: false,
        },
        notes: "",
        vip: false,
      })
    } catch (error) {
      // Error handling is done in the parent component
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Create New Guest
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="address">Address</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="additional">Additional</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={guestData.full_name}
                    onChange={(e) => updateGuestData("full_name", e.target.value)}
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={guestData.email}
                    onChange={(e) => updateGuestData("email", e.target.value)}
                    placeholder="guest@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={guestData.phone}
                    onChange={(e) => updateGuestData("phone", e.target.value)}
                    placeholder="+1-555-0123"
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={guestData.gender} onValueChange={(value) => updateGuestData("gender", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={guestData.dob}
                    onChange={(e) => updateGuestData("dob", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="nationality">Nationality</Label>
                  <Input
                    id="nationality"
                    value={guestData.nationality}
                    onChange={(e) => updateGuestData("nationality", e.target.value)}
                    placeholder="e.g., American, British"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Identification
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="idType">ID Type</Label>
                  <Select value={guestData.id_type} onValueChange={(value) => updateGuestData("id_type", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="passport">Passport</SelectItem>
                      <SelectItem value="drivers_license">Driver's License</SelectItem>
                      <SelectItem value="national_id">National ID</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="idNumber">ID Number</Label>
                  <Input
                    id="idNumber"
                    value={guestData.id_number}
                    onChange={(e) => updateGuestData("id_number", e.target.value)}
                    placeholder="Enter ID number"
                  />
                </div>
                <div>
                  <Label htmlFor="idExpiry">ID Expiry Date</Label>
                  <Input
                    id="idExpiry"
                    type="date"
                    value={guestData.id_expiry}
                    onChange={(e) => updateGuestData("id_expiry", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="address" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Address Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    value={guestData.address.street}
                    onChange={(e) => updateGuestData("address.street", e.target.value)}
                    placeholder="123 Main Street"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={guestData.address.city}
                      onChange={(e) => updateGuestData("address.city", e.target.value)}
                      placeholder="New York"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State/Province</Label>
                    <Input
                      id="state"
                      value={guestData.address.state}
                      onChange={(e) => updateGuestData("address.state", e.target.value)}
                      placeholder="NY"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      value={guestData.address.postal_code}
                      onChange={(e) => updateGuestData("address.postal_code", e.target.value)}
                      placeholder="10001"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={guestData.address.country}
                      onChange={(e) => updateGuestData("address.country", e.target.value)}
                      placeholder="United States"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Emergency Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emergencyName">Contact Name</Label>
                  <Input
                    id="emergencyName"
                    value={guestData.emergency_contact.name}
                    onChange={(e) => updateGuestData("emergency_contact.name", e.target.value)}
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyPhone">Contact Phone</Label>
                  <Input
                    id="emergencyPhone"
                    value={guestData.emergency_contact.phone}
                    onChange={(e) => updateGuestData("emergency_contact.phone", e.target.value)}
                    placeholder="+1-555-0123"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="emergencyRelationship">Relationship</Label>
                  <Input
                    id="emergencyRelationship"
                    value={guestData.emergency_contact.relationship}
                    onChange={(e) => updateGuestData("emergency_contact.relationship", e.target.value)}
                    placeholder="e.g., Spouse, Parent, Friend"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Room Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="roomType">Preferred Room Type</Label>
                  <Select
                    value={guestData.preferences.room_type}
                    onValueChange={(value) => updateGuestData("preferences.room_type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select room type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="deluxe">Deluxe</SelectItem>
                      <SelectItem value="suite">Suite</SelectItem>
                      <SelectItem value="presidential">Presidential Suite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="floorPreference">Floor Preference</Label>
                  <Select
                    value={guestData.preferences.floor_preference}
                    onValueChange={(value) => updateGuestData("preferences.floor_preference", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select floor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Floor (1-3)</SelectItem>
                      <SelectItem value="mid">Mid Floor (4-7)</SelectItem>
                      <SelectItem value="high">High Floor (8+)</SelectItem>
                      <SelectItem value="no_preference">No Preference</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="bedType">Bed Type Preference</Label>
                  <Select
                    value={guestData.preferences.bed_type}
                    onValueChange={(value) => updateGuestData("preferences.bed_type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select bed type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="double">Double</SelectItem>
                      <SelectItem value="queen">Queen</SelectItem>
                      <SelectItem value="king">King</SelectItem>
                      <SelectItem value="twin">Twin Beds</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="smoking"
                    checked={guestData.preferences.smoking}
                    onCheckedChange={(checked) => updateGuestData("preferences.smoking", checked)}
                  />
                  <Label htmlFor="smoking">Smoking Room</Label>
                </div>
                <div className="col-span-2">
                  <Label htmlFor="dietaryRestrictions">Dietary Restrictions</Label>
                  <Textarea
                    id="dietaryRestrictions"
                    value={guestData.preferences.dietary_restrictions}
                    onChange={(e) => updateGuestData("preferences.dietary_restrictions", e.target.value)}
                    placeholder="Any dietary restrictions or allergies..."
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Marketing Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="emailMarketing"
                    checked={guestData.marketing_preferences.email_marketing}
                    onCheckedChange={(checked) => updateGuestData("marketing_preferences.email_marketing", checked)}
                  />
                  <Label htmlFor="emailMarketing">Email Marketing</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="smsMarketing"
                    checked={guestData.marketing_preferences.sms_marketing}
                    onCheckedChange={(checked) => updateGuestData("marketing_preferences.sms_marketing", checked)}
                  />
                  <Label htmlFor="smsMarketing">SMS Marketing</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="promotionalOffers"
                    checked={guestData.marketing_preferences.promotional_offers}
                    onCheckedChange={(checked) => updateGuestData("marketing_preferences.promotional_offers", checked)}
                  />
                  <Label htmlFor="promotionalOffers">Promotional Offers</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="additional" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="vip"
                    checked={guestData.vip}
                    onCheckedChange={(checked) => updateGuestData("vip", checked)}
                  />
                  <Label htmlFor="vip">VIP Guest</Label>
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={guestData.notes}
                    onChange={(e) => updateGuestData("notes", e.target.value)}
                    placeholder="Any additional notes about the guest..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex gap-3 pt-4">
          <Button onClick={handleSubmit} className="flex-1">
            Create Guest
          </Button>
          <Button onClick={() => onOpenChange(false)} variant="outline">
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
