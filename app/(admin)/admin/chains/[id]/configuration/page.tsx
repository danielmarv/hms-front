"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useHotelChains, type HotelChain, type SharedConfiguration } from "@/hooks/use-hotel-chains"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Edit, FileText, Globe, Palette, Settings, FolderSyncIcon as Sync } from "lucide-react"

export default function ChainConfigurationPage() {
  const params = useParams()
  const router = useRouter()
  const chainCode = params.id as string
  const { getChainDetails, getSharedConfiguration, isLoading } = useHotelChains()

  const [chain, setChain] = useState<HotelChain | null>(null)
  const [config, setConfig] = useState<SharedConfiguration | null>(null)
  const [isLoadingChain, setIsLoadingChain] = useState(true)
  const [isLoadingConfig, setIsLoadingConfig] = useState(true)

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

    const fetchConfiguration = async () => {
      try {
        setIsLoadingConfig(true)
        const response = await getSharedConfiguration(chainCode)
        if (response.data) {
          setConfig(response.data)
        }
      } catch (error) {
        console.error("Error fetching configuration:", error)
        toast.error("Failed to load chain configuration")
      } finally {
        setIsLoadingConfig(false)
      }
    }

    if (chainCode) {
      fetchChainDetails()
      fetchConfiguration()
    }
  }, [chainCode, getChainDetails, getSharedConfiguration])

  if (isLoadingChain || isLoadingConfig) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
        <Skeleton className="h-[500px] w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push(`/admin/chains/${chainCode}`)}
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Chain Configuration</h1>
            <p className="text-muted-foreground">{chain?.name} - Shared Configuration Settings</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => router.push(`/admin/chains/${chainCode}/sync`)}>
            <Sync className="mr-2 h-4 w-4" />
            Sync Configuration
          </Button>
          <Button onClick={() => router.push(`/admin/chains/${chainCode}/configuration/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Configuration
          </Button>
        </div>
      </div>

      <Tabs defaultValue="branding" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="branding">
            <Palette className="mr-2 h-4 w-4" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FileText className="mr-2 h-4 w-4" />
            Document Prefixes
          </TabsTrigger>
          <TabsTrigger value="system">
            <Settings className="mr-2 h-4 w-4" />
            System Settings
          </TabsTrigger>
          <TabsTrigger value="overrides">
            <Globe className="mr-2 h-4 w-4" />
            Override Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="branding" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Branding Configuration</CardTitle>
              <CardDescription>Visual identity settings shared across all hotels in the chain</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Colors</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <div
                        className="h-16 w-full rounded-md border"
                        style={{ backgroundColor: config?.branding?.primaryColor || "#000000" }}
                      />
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Primary Color</p>
                        <p className="text-xs text-muted-foreground">{config?.branding?.primaryColor || "Not set"}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div
                        className="h-16 w-full rounded-md border"
                        style={{ backgroundColor: config?.branding?.secondaryColor || "#000000" }}
                      />
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Secondary Color</p>
                        <p className="text-xs text-muted-foreground">{config?.branding?.secondaryColor || "Not set"}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div
                        className="h-16 w-full rounded-md border"
                        style={{ backgroundColor: config?.branding?.accentColor || "#000000" }}
                      />
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Accent Color</p>
                        <p className="text-xs text-muted-foreground">{config?.branding?.accentColor || "Not set"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Typography</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Primary Font</p>
                      <div className="rounded-md border p-3">
                        <p style={{ fontFamily: config?.branding?.font?.primary || "inherit" }}>
                          The quick brown fox jumps over the lazy dog
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {config?.branding?.font?.primary || "System default"}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Secondary Font</p>
                      <div className="rounded-md border p-3">
                        <p style={{ fontFamily: config?.branding?.font?.secondary || "inherit" }}>
                          The quick brown fox jumps over the lazy dog
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {config?.branding?.font?.secondary || "System default"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Document Prefixes</CardTitle>
              <CardDescription>Standardized document numbering formats across the chain</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="rounded-md border p-4">
                    <h3 className="mb-2 text-lg font-medium">Invoice</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Prefix:</span>
                        <span className="font-medium">{config?.documentPrefixes?.invoice?.prefix || "INV"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Starting Number:</span>
                        <span className="font-medium">
                          {config?.documentPrefixes?.invoice?.startingNumber || "1000"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Format:</span>
                        <span className="font-medium">
                          {config?.documentPrefixes?.invoice?.format || "{PREFIX}-{YEAR}-{NUMBER}"}
                        </span>
                      </div>
                      <div className="mt-2 rounded-md bg-muted p-2">
                        <span className="text-sm">
                          Example: {config?.documentPrefixes?.invoice?.prefix || "INV"}-2023-
                          {config?.documentPrefixes?.invoice?.startingNumber || "1000"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-md border p-4">
                    <h3 className="mb-2 text-lg font-medium">Receipt</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Prefix:</span>
                        <span className="font-medium">{config?.documentPrefixes?.receipt?.prefix || "RCT"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Starting Number:</span>
                        <span className="font-medium">
                          {config?.documentPrefixes?.receipt?.startingNumber || "1000"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Format:</span>
                        <span className="font-medium">
                          {config?.documentPrefixes?.receipt?.format || "{PREFIX}-{YEAR}-{NUMBER}"}
                        </span>
                      </div>
                      <div className="mt-2 rounded-md bg-muted p-2">
                        <span className="text-sm">
                          Example: {config?.documentPrefixes?.receipt?.prefix || "RCT"}-2023-
                          {config?.documentPrefixes?.receipt?.startingNumber || "1000"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-md border p-4">
                    <h3 className="mb-2 text-lg font-medium">Booking</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Prefix:</span>
                        <span className="font-medium">{config?.documentPrefixes?.booking?.prefix || "BKG"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Starting Number:</span>
                        <span className="font-medium">
                          {config?.documentPrefixes?.booking?.startingNumber || "1000"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Format:</span>
                        <span className="font-medium">
                          {config?.documentPrefixes?.booking?.format || "{PREFIX}-{YEAR}-{NUMBER}"}
                        </span>
                      </div>
                      <div className="mt-2 rounded-md bg-muted p-2">
                        <span className="text-sm">
                          Example: {config?.documentPrefixes?.booking?.prefix || "BKG"}-2023-
                          {config?.documentPrefixes?.booking?.startingNumber || "1000"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-md border p-4">
                    <h3 className="mb-2 text-lg font-medium">Guest</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Prefix:</span>
                        <span className="font-medium">{config?.documentPrefixes?.guest?.prefix || "GST"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Starting Number:</span>
                        <span className="font-medium">{config?.documentPrefixes?.guest?.startingNumber || "1000"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Format:</span>
                        <span className="font-medium">
                          {config?.documentPrefixes?.guest?.format || "{PREFIX}-{YEAR}-{NUMBER}"}
                        </span>
                      </div>
                      <div className="mt-2 rounded-md bg-muted p-2">
                        <span className="text-sm">
                          Example: {config?.documentPrefixes?.guest?.prefix || "GST"}-2023-
                          {config?.documentPrefixes?.guest?.startingNumber || "1000"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Global system preferences for all hotels in the chain</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="rounded-md border p-4">
                    <h3 className="mb-2 text-lg font-medium">Date & Time</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Date Format:</span>
                        <span className="font-medium">{config?.systemSettings?.dateFormat || "MM/DD/YYYY"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Time Format:</span>
                        <span className="font-medium">{config?.systemSettings?.timeFormat || "12-hour"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Timezone:</span>
                        <span className="font-medium">{config?.systemSettings?.timezone || "UTC"}</span>
                      </div>
                      <div className="mt-2 rounded-md bg-muted p-2">
                        <span className="text-sm">
                          Example: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-md border p-4">
                    <h3 className="mb-2 text-lg font-medium">Localization</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Language:</span>
                        <span className="font-medium">{config?.systemSettings?.language || "English"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Measurement System:</span>
                        <span className="font-medium">{config?.systemSettings?.measurementSystem || "Metric"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-md border p-4">
                    <h3 className="mb-2 text-lg font-medium">Currency</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Currency Code:</span>
                        <span className="font-medium">{config?.systemSettings?.currency?.code || "USD"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Symbol:</span>
                        <span className="font-medium">{config?.systemSettings?.currency?.symbol || "$"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Position:</span>
                        <span className="font-medium">{config?.systemSettings?.currency?.position || "Before"}</span>
                      </div>
                      <div className="mt-2 rounded-md bg-muted p-2">
                        <span className="text-sm">
                          Example:{" "}
                          {config?.systemSettings?.currency?.position === "After"
                            ? "100" + (config?.systemSettings?.currency?.symbol || "$")
                            : (config?.systemSettings?.currency?.symbol || "$") + "100"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overrides" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Override Settings</CardTitle>
              <CardDescription>Control which settings can be overridden by individual hotels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">Branding</h3>
                      <p className="text-sm text-muted-foreground">Allow hotels to override chain branding</p>
                    </div>
                    <div
                      className={`rounded-full px-3 py-1 text-xs font-medium ${config?.overrideSettings?.branding ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                    >
                      {config?.overrideSettings?.branding ? "Allowed" : "Not Allowed"}
                    </div>
                  </div>
                </div>

                <div className="rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">Document Prefixes</h3>
                      <p className="text-sm text-muted-foreground">Allow hotels to use custom document prefixes</p>
                    </div>
                    <div
                      className={`rounded-full px-3 py-1 text-xs font-medium ${config?.overrideSettings?.documentPrefixes ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                    >
                      {config?.overrideSettings?.documentPrefixes ? "Allowed" : "Not Allowed"}
                    </div>
                  </div>
                </div>

                <div className="rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">System Settings</h3>
                      <p className="text-sm text-muted-foreground">Allow hotels to customize system settings</p>
                    </div>
                    <div
                      className={`rounded-full px-3 py-1 text-xs font-medium ${config?.overrideSettings?.systemSettings ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                    >
                      {config?.overrideSettings?.systemSettings ? "Allowed" : "Not Allowed"}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                Note: When overrides are not allowed, all hotels in the chain will use the shared configuration settings
                defined here.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
