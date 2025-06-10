"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Building2, ChevronRight, Clock, Download, Eye, RefreshCw, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useHotelChains, type HotelChain, type SyncLog } from "@/hooks/use-hotel-chains"
import { toast } from "sonner"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export default function SyncLogsPage() {
  const params = useParams()
  const router = useRouter()
  const chainCode = params.id as string
  const { getChainDetails, getSyncLogs, isLoading } = useHotelChains()

  const [chain, setChain] = useState<HotelChain | null>(null)
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([])
  const [isLoadingChain, setIsLoadingChain] = useState(true)
  const [isLoadingLogs, setIsLoadingLogs] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalLogs, setTotalLogs] = useState(0)
  const logsPerPage = 10

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

  useEffect(() => {
    fetchSyncLogs()
  }, [chainCode, currentPage])

  const fetchSyncLogs = async () => {
    if (!chainCode) return

    try {
      setIsLoadingLogs(true)
      const response = await getSyncLogs(chainCode, currentPage, logsPerPage)

      if (response.data) {
        setSyncLogs(response.data.data)
        setTotalPages(response.data.pagination.totalPages)
        setTotalLogs(response.data.total)
      }
    } catch (error) {
      console.error("Error fetching sync logs:", error)
      toast.error("Failed to load synchronization logs")
    } finally {
      setIsLoadingLogs(false)
    }
  }

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "default"
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

  const filteredLogs = syncLogs.filter(
    (log) =>
      log.syncType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.initiatedBy.full_name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/admin/chains/${chainCode}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
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
              <span className="font-medium">Sync Logs</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Synchronization Logs</h1>
            <p className="text-muted-foreground">View history of configuration synchronization for {chain.name}</p>
          </div>
        </div>
        <Button onClick={() => router.push(`/admin/chains/${chainCode}/sync`)}>
          <RefreshCw className="mr-2 h-4 w-4" />
          New Sync
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sync History</CardTitle>
          <CardDescription>Records of configuration synchronization across hotels</CardDescription>
          <div className="mt-4 flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingLogs ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="flex h-[300px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
              <Clock className="h-10 w-10 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No sync logs found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {searchQuery ? "No logs match your search criteria" : "No synchronization has been performed yet"}
              </p>
              {!searchQuery && (
                <Button onClick={() => router.push(`/admin/chains/${chainCode}/sync`)} className="mt-4">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sync Configuration
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sync Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Initiated By</TableHead>
                    <TableHead>Start Time</TableHead>
                    <TableHead>End Time</TableHead>
                    <TableHead>Results</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log._id}>
                      <TableCell className="font-medium capitalize">{log.syncType.replace("_", " ")}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(log.status)}>{log.status.replace("_", " ")}</Badge>
                      </TableCell>
                      <TableCell>{log.initiatedBy.full_name}</TableCell>
                      <TableCell>{formatDate(log.startTime)}</TableCell>
                      <TableCell>{log.endTime ? formatDate(log.endTime) : "-"}</TableCell>
                      <TableCell>
                        <div className="flex flex-col text-sm">
                          <span className="text-green-600">{log.details.success} successful</span>
                          {log.details.failed > 0 && <span className="text-red-600">{log.details.failed} failed</span>}
                          {log.details.skipped > 0 && (
                            <span className="text-amber-600">{log.details.skipped} skipped</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/admin/chains/${chainCode}/sync-logs/${log._id}`)}
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                            <span className="sr-only">Download</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {filteredLogs.length} of {totalLogs} logs
          </div>

          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(currentPage - 1)}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>

                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  let pageNumber: number

                  if (totalPages <= 5) {
                    pageNumber = i + 1
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i
                  } else {
                    pageNumber = currentPage - 2 + i
                  }

                  return (
                    <PaginationItem key={i}>
                      <PaginationLink
                        onClick={() => handlePageChange(pageNumber)}
                        isActive={currentPage === pageNumber}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  )
                })}

                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <>
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink onClick={() => handlePageChange(totalPages)}>{totalPages}</PaginationLink>
                    </PaginationItem>
                  </>
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(currentPage + 1)}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
