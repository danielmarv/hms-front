"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"

interface CreateGuestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateGuest: (guestData: any) => void
}

export function CreateGuestDialog({ open, onOpenChange, onCreateGuest }: CreateGuestDialogProps) {
  const [guestData, setGuestData] = useState({
    full_name: "",
    email: "",
    phone: "",
    gender: "",
    dob: "",
    nationality: "",
    id_type: "",
    id_number: "",
    id_expiry: "",
    address: {
      street: "",
      city: "",
      state: "",
      country: "",
      zip: "",
    },
    preferences: {
      bed_type: "",
      smoking: false,
      floor_preference: "",
      room_location: "",
      dietary_requirements: [],
      special_requests: "",
      amenities: [],
    },
    loyalty_program: {
      member: false,
      points: 0,
      tier: "standard",
      membership_number: "",
    },
    marketing_preferences: {
      email_opt_in: true,
      sms_opt_in: false,
      mail_opt_in: false,
    },
    notes: "",
    tags: [],
    vip: false,
    company: {
      name: "",
      position: "",
      address: "",
      tax_id: "",
    },
    emergency_contact: {
      name: "",
      relationship: "",
      phone: "",
      email: "",
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    if (!guestData.full_name || !guestData.phone) {
      toast.error("Name and phone number are required")
      return
    }

    onCreateGuest(guestData)
  }

  const handleInputChange = (field: string, value: any) => {
    setGuestData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleNestedInputChange = (parent: string, field: string, value: any) => {
    setGuestData((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof typeof prev],
        [field]: value,
      },
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Guest</DialogTitle>
          <DialogDescription>Add a new guest to the system for walk-in check-ins</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="address">Address</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="additional">Additional</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    value={guestData.full_name}
                    onChange={(e) => handleInputChange("full_name", e.target.value)}
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={guestData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Enter email address"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={guestData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="Enter phone number"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={guestData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={guestData.dob}
                    onChange={(e) => handleInputChange("dob", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nationality">Nationality</Label>
                  <Input
                    id="nationality"
                    value={guestData.nationality}
                    onChange={(e) => handleInputChange("nationality", e.target.value)}
                    placeholder="Enter nationality"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="id_type">ID Type</Label>
                  <Select value={guestData.id_type} onValueChange={(value) => handleInputChange("id_type", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select ID type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="passport">Passport</SelectItem>
                      <SelectItem value="national_id">National ID</SelectItem>
                      <SelectItem value="driver_license">Driver's License</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="id_number">ID Number</Label>
                  <Input
                    id="id_number"
                    value={guestData.id_number}
                    onChange={(e) => handleInputChange("id_number", e.target.value)}
                    placeholder="Enter ID number"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="address" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    value={guestData.address.street}
                    onChange={(e) => handleNestedInputChange("address", "street", e.target.value)}
                    placeholder="Enter street address"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={guestData.address.city}
                    onChange={(e) => handleNestedInputChange("address", "city", e.target.value)}
                    placeholder="Enter city"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    value={guestData.address.state}
                    onChange={(e) => handleNestedInputChange("address", "state", e.target.value)}
                    placeholder="Enter state or province"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={guestData.address.country}
                    onChange={(e) => handleNestedInputChange("address", "country", e.target.value)}
                    placeholder="Enter country"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zip">ZIP/Postal Code</Label>
                  <Input
                    id="zip"
                    value={guestData.address.zip}
                    onChange={(e) => handleNestedInputChange("address", "zip", e.target.value)}
                    placeholder="Enter ZIP or postal code"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bed_type">Bed Type Preference</Label>
                  <Select
                    value={guestData.preferences.bed_type}
                    onValueChange={(value) => handleNestedInputChange("preferences", "bed_type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select bed type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="double">Double</SelectItem>
                      <SelectItem value="queen">Queen</SelectItem>
                      <SelectItem value="king">King</SelectItem>
                      <SelectItem value="twin">Twin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="floor_preference">Floor Preference</Label>
                  <Input
                    id="floor_preference"
                    value={guestData.preferences.floor_preference}
                    onChange={(e) => handleNestedInputChange("preferences", "floor_preference", e.target.value)}
                    placeholder="e.g., High floor, Ground floor"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="smoking"
                    checked={guestData.preferences.smoking}
                    onCheckedChange={(checked) => handleNestedInputChange("preferences", "smoking", checked)}
                  />
                  <Label htmlFor="smoking">Smoking Room</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="vip"
                    checked={guestData.vip}
                    onCheckedChange={(checked) => handleInputChange("vip", checked)}
                  />
                  <Label htmlFor="vip">VIP Guest</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="special_requests">Special Requests</Label>
                <Textarea
                  id="special_requests"
                  value={guestData.preferences.special_requests}
                  onChange={(e) => handleNestedInputChange("preferences", "special_requests", e.target.value)}
                  placeholder="Any special requests or preferences"
                />
              </div>
            </TabsContent>

            <TabsContent value="additional" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergency_name">Emergency Contact Name</Label>
                  <Input
                    id="emergency_name"
                    value={guestData.emergency_contact.name}
                    onChange={(e) => handleNestedInputChange("emergency_contact", "name", e.target.value)}
                    placeholder="Emergency contact name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergency_phone">Emergency Contact Phone</Label>
                  <Input
                    id="emergency_phone"
                    value={guestData.emergency_contact.phone}
                    onChange={(e) => handleNestedInputChange("emergency_contact", "phone", e.target.value)}
                    placeholder="Emergency contact phone"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergency_relationship">Relationship</Label>
                  <Input
                    id="emergency_relationship"
                    value={guestData.emergency_contact.relationship}
                    onChange={(e) => handleNestedInputChange("emergency_contact", "relationship", e.target.value)}
                    placeholder="Relationship to guest"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company_name">Company Name</Label>
                  <Input
                    id="company_name"
                    value={guestData.company.name}
                    onChange={(e) => handleNestedInputChange("company", "name", e.target.value)}
                    placeholder="Company name (if business traveler)"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Marketing Preferences</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="email_opt_in"
                      checked={guestData.marketing_preferences.email_opt_in}
                      onCheckedChange={(checked) =>
                        handleNestedInputChange("marketing_preferences", "email_opt_in", checked)
                      }
                    />
                    <Label htmlFor="email_opt_in">Email Marketing</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="sms_opt_in"
                      checked={guestData.marketing_preferences.sms_opt_in}
                      onCheckedChange={(checked) =>
                        handleNestedInputChange("marketing_preferences", "sms_opt_in", checked)
                      }
                    />
                    <Label htmlFor="sms_opt_in">SMS Marketing</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={guestData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="Any additional notes about the guest"
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Guest</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
