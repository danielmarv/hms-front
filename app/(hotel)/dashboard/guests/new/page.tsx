"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { useGuests } from "@/hooks/use-guests"
import { toast } from "sonner"
import { ChevronLeft, Loader2 } from "lucide-react"
import Link from "next/link"

export default function NewGuestPage() {
  const router = useRouter()
  const { createGuest, isLoading } = useGuests()
  const [activeTab, setActiveTab] = useState("basic")
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    gender: "",
    dob: "",
    nationality: "",

    id_type: "",
    id_number: "",
    id_expiry: "",

    // Address
    address: {
      street: "",
      city: "",
      state: "",
      country: "",
      zip: "",
    },

    // Preferences
    preferences: {
      bed_type: "",
      smoking: false,
      floor_preference: "",
      room_location: "",
      dietary_requirements: [],
      special_requests: "",
      amenities: [],
    },

    // Loyalty program
    loyalty_program: {
      member: false,
      points: 0,
      tier: "standard",
      membership_number: "",
    },

    // Marketing preferences
    marketing_preferences: {
      email_opt_in: false,
      sms_opt_in: false,
      mail_opt_in: false,
    },

    // Additional information
    notes: "",
    tags: [],
    vip: false,

    // Company information
    company: {
      name: "",
      position: "",
      address: "",
      tax_id: "",
    },

    // Emergency contact
    emergency_contact: {
      name: "",
      relationship: "",
      phone: "",
      email: "",
    },
  })

  const [submitting, setSubmitting] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    // Handle nested objects
    if (name.includes(".")) {
      const [parent, child] = name.split(".")
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent as keyof typeof formData],
          [child]: value,
        },
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    // Handle nested objects
    if (name.includes(".")) {
      const [parent, child] = name.split(".")
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent as keyof typeof formData],
          [child]: checked,
        },
      })
    } else {
      setFormData({
        ...formData,
        [name]: checked,
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Clean the form data to remove empty enum values
      const cleanedData = { ...formData }

      // Set default bed type if empty
      if (cleanedData.preferences.bed_type === "") {
        cleanedData.preferences.bed_type = "double"
      }

      // Clean other enum values
      if (cleanedData.gender === "") {
        delete cleanedData.gender
      }

      if (cleanedData.id_type === "") {
        delete cleanedData.id_type
      }

      // Clean loyalty program tier if it's empty
      if (cleanedData.loyalty_program.tier === "") {
        cleanedData.loyalty_program.tier = "standard"
      }

      const response = await createGuest(cleanedData)

      if (response.data?.success) {
        toast.success("Guest created successfully")
        router.push(`/dashboard/guests/${response.data.data._id}`)
      } else {
        toast.error("Failed to create guest")
      }
    } catch (error) {
      console.error("Error creating guest:", error)
      toast.error("An error occurred while creating the guest")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/guests">
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Register New Guest</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="contact">Contact & ID</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="loyalty">Loyalty & Marketing</TabsTrigger>
            <TabsTrigger value="additional">Additional Info</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Enter the guest's basic personal information.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name *</Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      name="gender"
                      value={formData.gender}
                      onValueChange={(value) => handleInputChange({ target: { name: "gender", value } } as any)}
                    >
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
                    <Input id="dob" name="dob" type="date" value={formData.dob} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nationality">Nationality</Label>
                    <Input
                      id="nationality"
                      name="nationality"
                      value={formData.nationality}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>Enter the guest's contact details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} required />
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Address Information</h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="address.street">Street Address</Label>
                      <Input
                        id="address.street"
                        name="address.street"
                        value={formData.address.street}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address.city">City</Label>
                      <Input
                        id="address.city"
                        name="address.city"
                        value={formData.address.city}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address.state">State/Province</Label>
                      <Input
                        id="address.state"
                        name="address.state"
                        value={formData.address.state}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address.zip">Postal Code</Label>
                      <Input
                        id="address.zip"
                        name="address.zip"
                        value={formData.address.zip}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address.country">Country</Label>
                      <Input
                        id="address.country"
                        name="address.country"
                        value={formData.address.country}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Identification</h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="id_type">ID Type</Label>
                      <Select
                        name="id_type"
                        value={formData.id_type}
                        onValueChange={(value) => handleInputChange({ target: { name: "id_type", value } } as any)}
                      >
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
                      <Input id="id_number" name="id_number" value={formData.id_number} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="id_expiry">Expiry Date</Label>
                      <Input
                        id="id_expiry"
                        name="id_expiry"
                        type="date"
                        value={formData.id_expiry}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Guest Preferences</CardTitle>
                <CardDescription>Record the guest's preferences for their stay.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="preferences.bed_type">Preferred Bed Type</Label>
                    <Select
                      name="preferences.bed_type"
                      value={formData.preferences.bed_type}
                      onValueChange={(value) =>
                        handleInputChange({ target: { name: "preferences.bed_type", value } } as any)
                      }
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
                        <SelectItem value="sofa">Sofa Bed</SelectItem>
                        <SelectItem value="bunk">Bunk Bed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preferences.floor_preference">Floor Preference</Label>
                    <Input
                      id="preferences.floor_preference"
                      name="preferences.floor_preference"
                      value={formData.preferences.floor_preference}
                      onChange={handleInputChange}
                      placeholder="e.g., High floor, Ground floor"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="preferences.smoking"
                    checked={formData.preferences.smoking}
                    onCheckedChange={(checked) => handleSwitchChange("preferences.smoking", checked)}
                  />
                  <Label htmlFor="preferences.smoking">Smoking Room Preference</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preferences.room_location">Room Location Preference</Label>
                  <Input
                    id="preferences.room_location"
                    name="preferences.room_location"
                    value={formData.preferences.room_location}
                    onChange={handleInputChange}
                    placeholder="e.g., Ocean view, City view, Quiet area"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dietary_requirements">Dietary Requirements</Label>
                  <Textarea
                    id="dietary_requirements"
                    placeholder="Enter dietary requirements (e.g., vegetarian, gluten-free, etc.)"
                    value={formData.preferences.dietary_requirements.join(", ")}
                    onChange={(e) => {
                      const requirements = e.target.value
                        .split(",")
                        .map((item) => item.trim())
                        .filter(Boolean)
                      setFormData({
                        ...formData,
                        preferences: {
                          ...formData.preferences,
                          dietary_requirements: requirements,
                        },
                      })
                    }}
                  />
                  <p className="text-sm text-muted-foreground">Separate multiple requirements with commas</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preferences.special_requests">Special Requests</Label>
                  <Textarea
                    id="preferences.special_requests"
                    name="preferences.special_requests"
                    placeholder="Enter any special requests"
                    value={formData.preferences.special_requests}
                    onChange={handleInputChange}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="loyalty" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Loyalty Program</CardTitle>
                <CardDescription>Manage the guest's loyalty program membership.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="loyalty_program.member"
                    checked={formData.loyalty_program.member}
                    onCheckedChange={(checked) => handleSwitchChange("loyalty_program.member", checked)}
                  />
                  <Label htmlFor="loyalty_program.member">Loyalty Program Member</Label>
                </div>

                {formData.loyalty_program.member && (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="loyalty_program.tier">Membership Tier</Label>
                      <Select
                        name="loyalty_program.tier"
                        value={formData.loyalty_program.tier}
                        onValueChange={(value) =>
                          handleInputChange({ target: { name: "loyalty_program.tier", value } } as any)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select tier" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="silver">Silver</SelectItem>
                          <SelectItem value="gold">Gold</SelectItem>
                          <SelectItem value="platinum">Platinum</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="loyalty_program.points">Initial Points</Label>
                      <Input
                        id="loyalty_program.points"
                        name="loyalty_program.points"
                        type="number"
                        min="0"
                        value={formData.loyalty_program.points}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="loyalty_program.membership_number">Membership Number</Label>
                      <Input
                        id="loyalty_program.membership_number"
                        name="loyalty_program.membership_number"
                        value={formData.loyalty_program.membership_number}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                )}

                <Separator className="my-4" />

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Marketing Preferences</h3>
                  <p className="text-sm text-muted-foreground">
                    Select how the guest would like to receive marketing communications.
                  </p>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="marketing_preferences.email_opt_in"
                        checked={formData.marketing_preferences.email_opt_in}
                        onCheckedChange={(checked) => handleSwitchChange("marketing_preferences.email_opt_in", checked)}
                      />
                      <Label htmlFor="marketing_preferences.email_opt_in">Email Marketing</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="marketing_preferences.sms_opt_in"
                        checked={formData.marketing_preferences.sms_opt_in}
                        onCheckedChange={(checked) => handleSwitchChange("marketing_preferences.sms_opt_in", checked)}
                      />
                      <Label htmlFor="marketing_preferences.sms_opt_in">SMS Marketing</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="marketing_preferences.mail_opt_in"
                        checked={formData.marketing_preferences.mail_opt_in}
                        onCheckedChange={(checked) => handleSwitchChange("marketing_preferences.mail_opt_in", checked)}
                      />
                      <Label htmlFor="marketing_preferences.mail_opt_in">Postal Mail Marketing</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="additional" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
                <CardDescription>Add any additional details about the guest.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="vip"
                    checked={formData.vip}
                    onCheckedChange={(checked) => handleSwitchChange("vip", checked)}
                  />
                  <Label htmlFor="vip">VIP Guest</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    placeholder="Enter tags separated by commas"
                    value={formData.tags.join(", ")}
                    onChange={(e) => {
                      const tags = e.target.value
                        .split(",")
                        .map((item) => item.trim())
                        .filter(Boolean)
                      setFormData({
                        ...formData,
                        tags,
                      })
                    }}
                  />
                  <p className="text-sm text-muted-foreground">Separate multiple tags with commas</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    placeholder="Add any additional notes about the guest"
                    value={formData.notes}
                    onChange={handleInputChange}
                  />
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Company Information</h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="company.name">Company Name</Label>
                      <Input
                        id="company.name"
                        name="company.name"
                        value={formData.company.name}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company.position">Position</Label>
                      <Input
                        id="company.position"
                        name="company.position"
                        value={formData.company.position}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company.tax_id">Tax ID / VAT Number</Label>
                      <Input
                        id="company.tax_id"
                        name="company.tax_id"
                        value={formData.company.tax_id}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Emergency Contact</h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="emergency_contact.name">Contact Name</Label>
                      <Input
                        id="emergency_contact.name"
                        name="emergency_contact.name"
                        value={formData.emergency_contact.name}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergency_contact.relationship">Relationship</Label>
                      <Input
                        id="emergency_contact.relationship"
                        name="emergency_contact.relationship"
                        value={formData.emergency_contact.relationship}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergency_contact.phone">Phone Number</Label>
                      <Input
                        id="emergency_contact.phone"
                        name="emergency_contact.phone"
                        value={formData.emergency_contact.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergency_contact.email">Email Address</Label>
                      <Input
                        id="emergency_contact.email"
                        name="emergency_contact.email"
                        type="email"
                        value={formData.emergency_contact.email}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-end gap-4">
          <Button variant="outline" type="button" asChild>
            <Link href="/dashboard/guests">Cancel</Link>
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Register Guest
          </Button>
        </div>
      </form>
    </div>
  )
}
