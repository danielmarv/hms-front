"use client"

import type React from "react"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Loader2, FolderSyncIcon as Sync } from "lucide-react"

export default function SyncConfigurationPage() {
  const params = useParams()
  const router = useRouter()
  const chainId = params.id as string

  const [syncType, setSyncType] = useState("all")
  const [configSections, setConfigSections] = useState({
    branding: true,
    documentPrefixes: true,
    systemSettings: true,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleConfigSectionChange = (section: string) => {
    setConfigSections((prev) => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // In a real app, you would call an API to sync configuration
      // const response = await fetch(`/api/chains/${chainId}/sync`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     syncAll: syncType === 'all',
      //     configSections: Object.entries(configSections)
      //       .filter(([_, value]) => value)
      //       .map(([key]) => key)
      //   })
      // })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast.success("Configuration synchronized successfully")
      router.push(`/admin/chains/${chainId}?tab=configuration`)
    } catch (error) {
      console.error("Error syncing configuration:", error)
      toast.error("Failed to synchronize configuration")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/admin/chains/${chainId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sync Configuration</h1>
          <p className="text-muted-foreground">Synchronize shared configuration to hotels in this chain</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Synchronization Options</CardTitle>
            <CardDescription>Choose which hotels and configuration sections to sync</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Target Hotels</h3>
              <RadioGroup value={syncType} onValueChange={setSyncType}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all" />
                  <Label htmlFor="all">All hotels in chain</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="selected" id="selected" />
                  <Label htmlFor="selected">Selected hotels only</Label>
                </div>
              </RadioGroup>

              {syncType === "selected" && (
                <div className="pl-6 pt-2">
                  <p className="text-sm text-muted-foreground mb-2">Select specific hotels to synchronize:</p>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="hotel1" checked />
                      <label
                        htmlFor="hotel1"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Luxe New York
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="hotel2" checked />
                      <label
                        htmlFor="hotel2"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Luxe London
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="hotel3" checked />
                      <label
                        htmlFor="hotel3"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Luxe Paris
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="hotel4" checked />
                      <label
                        htmlFor="hotel4"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Luxe Tokyo
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="hotel5" checked />
                      <label
                        htmlFor="hotel5"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Luxe Sydney
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Configuration Sections</h3>
              <p className="text-sm text-muted-foreground">Select which configuration sections to synchronize:</p>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="branding"
                    checked={configSections.branding}
                    onCheckedChange={() => handleConfigSectionChange("branding")}
                  />
                  <label
                    htmlFor="branding"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Branding (colors, logo, fonts)
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="documentPrefixes"
                    checked={configSections.documentPrefixes}
                    onCheckedChange={() => handleConfigSectionChange("documentPrefixes")}
                  />
                  <label
                    htmlFor="documentPrefixes"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Document Prefixes (invoice, receipt, booking formats)
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="systemSettings"
                    checked={configSections.systemSettings}
                    onCheckedChange={() => handleConfigSectionChange("systemSettings")}
                  />
                  <label
                    htmlFor="systemSettings"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    System Settings (date format, currency, timezone)
                  </label>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Synchronization Warning</h3>
              <p className="text-sm text-muted-foreground">
                This action will overwrite the selected configuration sections in all target hotels. Hotels with
                override settings enabled will not be affected.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.push(`/admin/chains/${chainId}`)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Synchronizing...
                </>
              ) : (
                <>
                  <Sync className="mr-2 h-4 w-4" />
                  Synchronize Configuration
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
