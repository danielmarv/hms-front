"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  Building2,
  ChevronRight,
  Loader2,
  FolderSyncIcon as Sync,
  Check,
  AlertTriangle,
  ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useHotelChains, type HotelChain } from "@/hooks/use-hotel-chains"
import { toast } from "sonner"
import Link from "next/link"

export default function SyncConfigurationPage() {
  const params = useParams()
  const router = useRouter()
  const chainCode = params.id as string
  const { getChainDetails, syncChainConfiguration, isLoading } = useHotelChains()
  const [chain, setChain] = useState<HotelChain | null>(null)
  const [isLoadingChain, setIsLoadingChain] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncMode, setSyncMode] = useState<"all" | "selected">("all")
  const [selectedHotels, setSelectedHotels] = useState<string[]>([])
  const [selectedSections, setSelectedSections] = useState<string[]>(["branding", "documentPrefixes", "systemSettings"])

  useEffect(() => {
    const fetchChainDetails = async () => {
      try {
        setIsLoadingChain(true)
        const response = await getChainDetails(chainCode)
        if (response.data) {
          setChain(response.data)
        }
      } catch (error) {
        console.error("Error fetching chain details:", error)
        toast.error("Failed to load chain details")
      } finally {
        setIsLoadingChain(false)
      }
    }

    if (chainCode) {
      fetchChainDetails()
    }
  }, [chainCode, getChainDetails])

  const handleHotelSelection = (hotelId: string) => {
    setSelectedHotels((prev) => {
      if (prev.includes(hotelId)) {
        return prev.filter((id) => id !== hotelId)
      } else {
        return [...prev, hotelId]
      }
    })
  }

  const handleSectionSelection = (section: string) => {
    setSelectedSections((prev) => {
      if (prev.includes(section)) {
        return prev.filter((s) => s !== section)
      } else {
        return [...prev, section]
      }
    })
  }

  const handleSync = async () => {
    if (!chain) return

    try {
      setIsSyncing(true)

      const syncData = {
        syncAll: syncMode === "all",
        targetHotels: syncMode === "selected" ? selectedHotels : [],
        configSections: selectedSections,
      }

      const response = await syncChainConfiguration(chainCode, syncData)

      if (response.data) {
        toast.success(`Configuration synchronized successfully to ${response.data.syncLog.details.success} hotels`)
        router.push(`/admin/chains/${chainCode}`)
      }
    } catch (error) {
      console.error("Error syncing configuration:", error)
      toast.error("Failed to sync configuration")
    } finally {
      setIsSyncing(false)
    }
  }

  if (isLoadingChain) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-[250px]" />
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <Skeleton className="h-8 w-[150px]" />
        </div>
        <Skeleton className="h-[500px] w-full" />
      </div>
    )
  }

  if (!chain) {
    return (
      <div className="flex h-[600px] flex-col items-center justify-center">
        <Building2 className="h-16 w-16 text-muted-foreground" />
        <h2 className="mt-4 text-2xl font-bold">Chain Not Found</h2>
        <p className="mt-2 text-muted-foreground">The hotel chain you're looking for doesn't exist</p>
        <Button className="mt-6" onClick={() => router.push("/admin/chains")}>
          Back to Chains
        </Button>
      </div>
    )
  }

  // Filter out headquarters from the list of hotels
  const hotelsToSync = chain.hotels?.filter((hotel) => !hotel.isHeadquarters) || []

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center space-x-2">
          <Link href="/admin/chains" className="text-muted-foreground hover:text-foreground">
            Hotel Chains
          </Link>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <Link href={`/admin/chains/${chainCode}`} className="text-muted-foreground hover:text-foreground">
            {chain.name}
          </Link>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">Sync Configuration</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Sync Configuration</h1>
        <p className="text-muted-foreground">
          Synchronize configuration settings from headquarters to other hotels in the chain
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Synchronization Settings</CardTitle>
          <CardDescription>Choose which hotels and configuration sections to synchronize</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="mb-2 text-lg font-medium">Target Hotels</h3>
            <RadioGroup value={syncMode} onValueChange={(value) => setSyncMode(value as "all" | "selected")}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all">All hotels in chain ({hotelsToSync.length} hotels)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="selected" id="selected" />
                <Label htmlFor="selected">Selected hotels only</Label>
              </div>
            </RadioGroup>

            {syncMode === "selected" && (
              <div className="mt-4 rounded-md border p-4">
                <div className="mb-2 font-medium">Select hotels to sync:</div>
                {hotelsToSync.length === 0 ? (
                  <div className="text-muted-foreground">No hotels available for synchronization</div>
                ) : (
                  <div className="grid gap-2 md:grid-cols-2">
                    {hotelsToSync.map((hotel) => (
                      <div key={hotel._id} className="flex items-center space-x-2">
                        <Checkbox
                          id={hotel._id}
                          checked={selectedHotels.includes(hotel._id)}
                          onCheckedChange={() => handleHotelSelection(hotel._id)}
                        />
                        <Label htmlFor={hotel._id} className="flex items-center">
                          {hotel.name} <span className="ml-1 text-sm text-muted-foreground">({hotel.code})</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
                {selectedHotels.length > 0 && (
                  <div className="mt-2 text-sm text-muted-foreground">{selectedHotels.length} hotels selected</div>
                )}
              </div>
            )}
          </div>

          <Separator />

          <div>
            <h3 className="mb-2 text-lg font-medium">Configuration Sections</h3>
            <div className="rounded-md border p-4">
              <div className="mb-2 font-medium">Select sections to sync:</div>
              <div className="grid gap-2 md:grid-cols-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="branding"
                    checked={selectedSections.includes("branding")}
                    onCheckedChange={() => handleSectionSelection("branding")}
                  />
                  <Label htmlFor="branding">Branding</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="documentPrefixes"
                    checked={selectedSections.includes("documentPrefixes")}
                    onCheckedChange={() => handleSectionSelection("documentPrefixes")}
                  />
                  <Label htmlFor="documentPrefixes">Document Prefixes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="systemSettings"
                    checked={selectedSections.includes("systemSettings")}
                    onCheckedChange={() => handleSectionSelection("systemSettings")}
                  />
                  <Label htmlFor="systemSettings">System Settings</Label>
                </div>
              </div>
              {selectedSections.length === 0 && (
                <div className="mt-2 text-sm text-destructive">Please select at least one section to synchronize</div>
              )}
            </div>
          </div>

          <Separator />

          <div className="rounded-md border bg-muted/50 p-4">
            <div className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" />
              <h3 className="font-medium">Synchronization Warning</h3>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              This action will overwrite the selected configuration sections in the target hotels with the settings from
              the headquarters hotel. This cannot be undone. Make sure you have backed up any important custom
              configurations.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push(`/admin/chains/${chainCode}`)}>
            Cancel
          </Button>
          <Button
            onClick={handleSync}
            disabled={
              isSyncing || selectedSections.length === 0 || (syncMode === "selected" && selectedHotels.length === 0)
            }
          >
            {isSyncing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <Sync className="mr-2 h-4 w-4" />
                Sync Configuration
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Synchronization Preview</CardTitle>
          <CardDescription>Review what will be synchronized to the target hotels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-md border p-4">
              <div className="mb-2 font-medium">Source</div>
              <div className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-primary" />
                <span>{chain.headquarters?.name || "Headquarters"}</span>
                <span className="text-sm text-muted-foreground">({chain.headquarters?.code || chain.code})</span>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <ArrowRight className="h-6 w-6 text-muted-foreground" />
            </div>

            <div className="rounded-md border p-4">
              <div className="mb-2 font-medium">Target</div>
              <div className="space-y-1">
                {syncMode === "all" ? (
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>All hotels in chain ({hotelsToSync.length} hotels)</span>
                  </div>
                ) : (
                  <>
                    <div className="text-sm text-muted-foreground mb-1">{selectedHotels.length} selected hotels:</div>
                    {selectedHotels.length === 0 ? (
                      <div className="text-sm text-amber-500">No hotels selected</div>
                    ) : (
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {selectedHotels.map((hotelId) => {
                          const hotel = hotelsToSync.find((h) => h._id === hotelId)
                          return hotel ? (
                            <div key={hotelId} className="flex items-center space-x-2">
                              <Check className="h-4 w-4 text-green-500" />
                              <span>{hotel.name}</span>
                              <span className="text-sm text-muted-foreground">({hotel.code})</span>
                            </div>
                          ) : null
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="rounded-md border p-4">
              <div className="mb-2 font-medium">Sections to Sync</div>
              <div className="space-y-1">
                {selectedSections.length === 0 ? (
                  <div className="text-sm text-amber-500">No sections selected</div>
                ) : (
                  <>
                    {selectedSections.includes("branding") && (
                      <div className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>Branding (colors, fonts, logo)</span>
                      </div>
                    )}
                    {selectedSections.includes("documentPrefixes") && (
                      <div className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>Document Prefixes (invoice, receipt, booking, guest)</span>
                      </div>
                    )}
                    {selectedSections.includes("systemSettings") && (
                      <div className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>System Settings (date format, currency, timezone)</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
