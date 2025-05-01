"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useHotelChains, type HotelChain, type SyncLog } from "@/hooks/use-hotel-chains"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Clock, Hotel, Server, User } from "lucide-react"

export default function SyncLogDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const chainCode = params.id as string
  const logId = params.logId as string
  const { getChainDetails, getSyncLogDetails, isLoading } = useHotelChains()

  const [chain, setChain] = useState<HotelChain | null>(null)
  const [syncLog, setSyncLog] = useState<SyncLog | null>(null)
  const [isLoadingChain, setIsLoadingChain] = useState(true)
  const [isLoadingLog, setIsLoadingLog] = useState(true)

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

    const fetchSyncLogDetails = async () => {
      try {
        setIsLoadingLog(true)
        const response = await getSyncLogDetails(logId)
        if (response.data) {
          setSyncLog(response.data)
        }
      } catch (error) {
        console.error("Error fetching sync log details:", error)
        toast.error("Failed to load synchronization log details")
      } finally {
        setIsLoadingLog(false)
      }
    }

    if (chainCode) {
      fetchChainDetails()
    }

    if (logId) {
      fetchSyncLogDetails()
    }
  }, [chainCode, logId, getChainDetails, getSyncLogDetails])

  const formatDate = (dateString: string) => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date)
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "success"
      case "failed":
        return "destructive"
      case "in_progress":
        return "default"
      case "pending":
        return "outline"
      default:
        return "secondary"
    }
  }

  const calculateDuration = (start: string, end: string) => {
    if (!start || !end) return "-"

    const startDate = new Date(start)
    const endDate = new Date(end)
    const durationMs = endDate.getTime() - startDate.getTime()

    // Format duration
    const seconds = Math.floor(durationMs / 1000)
    if (seconds < 60) {
      return `${seconds} seconds`
    }

    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    if (minutes < 60) {
      return `${minutes} min ${remainingSeconds} sec`
    }

    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours} hr ${remainingMinutes} min`
  }

  if (isLoadingChain || isLoadingLog) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
        <Skeleton className="h-[300px] w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={() => router.back()} aria-label="Go back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Sync Log Details</h1>
            <p className="text-muted-foreground">
              {chain?.name} - {syncLog?.syncType} Synchronization
            </p>
          </div>
        </div>
        <Badge variant={getStatusBadgeVariant(syncLog?.status || "")}>{syncLog?.status}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Synchronization Summary</CardTitle>
          <CardDescription>Details about the configuration synchronization process</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Start Time</span>
              </div>
              <p className="font-medium">{formatDate(syncLog?.startTime || "")}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>End Time</span>
              </div>
              <p className="font-medium">{formatDate(syncLog?.endTime || "")}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Duration</span>
              </div>
              <p className="font-medium">{calculateDuration(syncLog?.startTime || "", syncLog?.endTime || "")}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>Initiated By</span>
              </div>
              <p className="font-medium">{syncLog?.initiatedBy?.full_name || "System"}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Hotel className="h-4 w-4" />
                <span>Source Hotel</span>
              </div>
              <p className="font-medium">{syncLog?.sourceHotel?.name || "Headquarters"}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Server className="h-4 w-4" />
                <span>Sync Type</span>
              </div>
              <p className="font-medium">{syncLog?.syncType || "Configuration"}</p>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="mb-4 text-lg font-medium">Results</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-green-600">Success</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{syncLog?.details?.success || 0}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-red-600">Failed</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{syncLog?.details?.failed || 0}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-yellow-600">Skipped</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{syncLog?.details?.skipped || 0}</p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={() => router.push(`/admin/chains/${chainCode}/sync-logs`)}>
              View All Logs
            </Button>
            <Button variant="default" onClick={() => router.push(`/admin/chains/${chainCode}`)}>
              Back to Chain
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
