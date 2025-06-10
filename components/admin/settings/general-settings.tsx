"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Building, Save } from "lucide-react"
import { useSettings } from "@/hooks/use-settings"
import { useCurrency } from "@/hooks/use-currency"
import { toast } from "sonner"

export default function GeneralSettings() {
  const { settings, getSettings, updateSettings, uploadLogo } = useSettings()
  const { currencies, getCurrencies } = useCurrency()

  const [formData, setFormData] = useState({
    companyName: "",
    companyAddress: "",
    companyPhone: "",
    companyEmail: "",
    companyWebsite: "",
    taxRate: 18,
    serviceChargeRate: 10,
    defaultCurrency: "USD",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "24h",
    timezone: "Africa/Kampala",
  })

  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    getSettings()
    getCurrencies()
  }, [])

  useEffect(() => {
    if (settings) {
      setFormData({
        companyName: settings.companyName || "",
        companyAddress: settings.companyAddress || "",
        companyPhone: settings.companyPhone || "",
        companyEmail: settings.companyEmail || "",
        companyWebsite: settings.companyWebsite || "",
        taxRate: settings.taxRate || 18,
        serviceChargeRate: settings.serviceChargeRate || 10,
        defaultCurrency: settings.defaultCurrency || "USD",
        dateFormat: settings.dateFormat || "DD/MM/YYYY",
        timeFormat: settings.timeFormat || "24h",
        timezone: settings.timezone || "Africa/Kampala",
      })
    }
  }, [settings])

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        // 2MB limit
        toast.error("Logo file size must be less than 2MB")
        return
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file")
        return
      }
      setLogoFile(file)
    }
  }

  const handleSave = async () => {
    setIsUpdating(true)
    try {
      // Upload logo first if selected
      if (logoFile) {
        await uploadLogo(logoFile)
        setLogoFile(null)
      }

      // Update settings
      await updateSettings(formData)
    } catch (error) {
      toast.error("Failed to update settings")
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            General Settings
          </CardTitle>
          <CardDescription>Configure company information and system preferences</CardDescription>
        </div>
        <Badge variant={settings ? "default" : "secondary"}>{settings ? "Configured" : "Not Set"}</Badge>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Company Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Company Information</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => handleInputChange("companyName", e.target.value)}
                placeholder="Your Company Name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyPhone">Phone Number</Label>
              <Input
                id="companyPhone"
                value={formData.companyPhone}
                onChange={(e) => handleInputChange("companyPhone", e.target.value)}
                placeholder="+256 XXX XXX XXX"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyEmail">Email Address</Label>
              <Input
                id="companyEmail"
                type="email"
                value={formData.companyEmail}
                onChange={(e) => handleInputChange("companyEmail", e.target.value)}
                placeholder="info@company.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyWebsite">Website</Label>
              <Input
                id="companyWebsite"
                value={formData.companyWebsite}
                onChange={(e) => handleInputChange("companyWebsite", e.target.value)}
                placeholder="https://company.com"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyAddress">Address</Label>
            <Textarea
              id="companyAddress"
              value={formData.companyAddress}
              onChange={(e) => handleInputChange("companyAddress", e.target.value)}
              placeholder="Company address..."
              rows={3}
            />
          </div>
        </div>

        {/* Logo Upload */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Company Logo</h3>
          <div className="flex items-center gap-4">
            {settings?.logoUrl && (
              <img
                src={settings.logoUrl || "/placeholder.svg"}
                alt="Company Logo"
                className="h-16 w-16 object-contain border rounded"
              />
            )}
            <div className="space-y-2">
              <Label htmlFor="logo">Upload Logo</Label>
              <Input id="logo" type="file" accept="image/*" onChange={handleLogoChange} className="w-auto" />
              <p className="text-sm text-muted-foreground">Maximum file size: 2MB. Supported formats: JPG, PNG, SVG</p>
            </div>
          </div>
        </div>

        {/* Financial Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Financial Settings</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="defaultCurrency">Default Currency</Label>
              <Select
                value={formData.defaultCurrency}
                onValueChange={(value) => handleInputChange("defaultCurrency", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxRate">Tax Rate (%)</Label>
              <Input
                id="taxRate"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.taxRate}
                onChange={(e) => handleInputChange("taxRate", Number.parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="serviceChargeRate">Service Charge (%)</Label>
              <Input
                id="serviceChargeRate"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.serviceChargeRate}
                onChange={(e) => handleInputChange("serviceChargeRate", Number.parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
        </div>

        {/* Regional Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Regional Settings</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="dateFormat">Date Format</Label>
              <Select value={formData.dateFormat} onValueChange={(value) => handleInputChange("dateFormat", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeFormat">Time Format</Label>
              <Select value={formData.timeFormat} onValueChange={(value) => handleInputChange("timeFormat", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12h">12 Hour</SelectItem>
                  <SelectItem value="24h">24 Hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={formData.timezone} onValueChange={(value) => handleInputChange("timezone", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Africa/Kampala">Africa/Kampala (EAT)</SelectItem>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                  <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isUpdating}>
            <Save className="mr-2 h-4 w-4" />
            {isUpdating ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
