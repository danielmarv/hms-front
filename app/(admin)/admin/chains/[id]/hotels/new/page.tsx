"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Loader2, FolderSyncIcon as Sync } from "lucide-react"
import { useHotelChains, type Hotel } from "@/hooks/use-hotel-chains"

export default function SyncConfigurationPage() {
  const params = useParams()
  const router = useRouter()
  const chainCode = params.id as string
  const { getChainDetails, syncChainConfiguration, isLoading: isLoadingChain } = useHotelChains()

  const [chain, setChain] = useState<any>(null)
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [syncType, setSyncType] = useState("all")
  const [selectedHotels, setSelectedHotels] = useState<string[]>([])
  const [configSections, setConfigSections] = useState({
    branding: true,
    documentPrefixes: true,
    systemSettings: true,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchChainDetails = async () => {
      try {
        const response = await getChainDetails(chainCode)
        if (response.data) {
          setChain(response.data)
          // Filter out headquarters
          const chainHotels = response.data.hotels?.filter((hotel: Hotel) => !hotel.isHeadquarters) || []
          setHotels(chainHotels)
          // Pre-select all hotels
          setSelectedHotels(chainHotels.map((hotel: Hotel) => hotel._id))
        } else {
          toast.error("Failed to load chain details")
        }
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching chain details:", error)
        toast.error("Failed to load chain details")
        setIsLoading(false)
      }
    }

    if (chainCode) {
      fetchChainDetails()
    }
  }, [chainCode, getChainDetails])

  const handleConfigSectionChange = (section: string) => {
    setConfigSections((prev) => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev],
    }))
  }

  const handleHotelSelection = (hotelId: string, checked: boolean) => {
    if (checked) {
      setSelectedHotels((prev) => [...prev, hotelId])
    } else {
      setSelectedHotels((prev) => prev.filter((id) => id !== hotelId))
    }
  }

  const handleSelectAllHotels = (checked: boolean) => {
    if (checked) {
      setSelectedHotels(hotels.map((hotel) => hotel._id))
    } else {
      setSelectedHotels([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (syncType === "selected" && selectedHotels.length === 0) {
      toast.error("Please select at least one hotel")
      return
    }

    const selectedSections = Object.entries(configSections)
      .filter(([_, value]) => value)
      .map(([key]) => key)

    if (selectedSections.length === 0) {
      toast.error("Please select at least one configuration section")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await syncChainConfiguration(chainCode, {
        syncAll: syncType === "all",
        targetHotels: syncType === "selected" ? selectedHotels : undefined,
        configSections: selectedSections,
      })

      if (response.data) {
        toast.success("Configuration synchronized successfully")
        router.push(`/admin/chains/${chainCode}?tab=configuration`)
      } else {
        throw new Error("Failed to synchronize configuration")
      }
    } catch (error) {
      console.error("Error syncing configuration:", error)
      toast.error("Failed to synchronize configuration")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading || isLoadingChain) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/admin/chains/${chainCode}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-[600px] w-full" />
      </div>
    )
  }

  if (!chain) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <h2 className="text-xl font-semibold">Hotel chain not found</h2>
        <p className="text-muted-foreground">The requested hotel chain could not be found.</p>
        <Button className="mt-4" asChild>
          <Link href="/admin/chains">Back to Chains</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/admin/chains/${chainCode}`}>
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
                  <Label htmlFor="all">All hotels in chain ({hotels.length})</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="selected" id="selected" />
                  <Label htmlFor="selected">Selected hotels only</Label>
                </div>
              </RadioGroup>

              {syncType === "selected" && (
                <div className="pl-6 pt-2">
                  <div className="flex items-center space-x-2 mb-2">
                    <Checkbox
                      id="selectAll"
                      checked={selectedHotels.length === hotels.length}
                      onCheckedChange={handleSelectAllHotels}
                    />
                    <label htmlFor="selectAll" className="text-sm font-medium leading-none">
                      Select all
                    </label>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {hotels.map((hotel) => (
                      <div key={hotel._id} className="flex items-center space-x-2">
                        <Checkbox
                          id={hotel._id}
                          checked={selectedHotels.includes(hotel._id)}
                          onCheckedChange={(checked) => handleHotelSelection(hotel._id, checked as boolean)}
                        />
                        <label htmlFor={hotel._id} className="text-sm font-medium leading-none">
                          {hotel.name} ({hotel.code})
                        </label>
                      </div>
                    ))}
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
                  <label htmlFor="branding" className="text-sm font-medium leading-none">
                    Branding (colors, logo, fonts)
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="documentPrefixes"
                    checked={configSections.documentPrefixes}
                    onCheckedChange={() => handleConfigSectionChange("documentPrefixes")}
                  />
                  <label htmlFor="documentPrefixes" className="text-sm font-medium leading-none">
                    Document Prefixes (invoice, receipt, booking formats)
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="systemSettings"
                    checked={configSections.systemSettings}
                    onCheckedChange={() => handleConfigSectionChange("systemSettings")}
                  />
                  <label htmlFor="systemSettings" className="text-sm font-medium leading-none">
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
            <Button type="button" variant="outline" onClick={() => router.push(`/admin/chains/${chainCode}`)}>
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
