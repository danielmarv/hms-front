"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Loader2, Plus, Eye, Building, Calendar, User } from "lucide-react"

export default function DataSyncPage() {
  const [syncLogs, setSyncLogs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchSyncLogs = async () => {
      try {
        // In a real app, you would fetch this data from your API
        // const response = await fetch('/api/sync/logs')
        // const data = await response.json()

        // For now, we'll use mock data
        setSyncLogs([
          {
            _id: "1",
            chainCode: "LUXE",
            syncType: "configuration",
            status: "completed",
            startTime: "2023-06-15T14:30:00Z",
            endTime: "2023-06-15T14:32:00Z",
            initiatedBy: {
              _id: "u1",
              full_name: "John Smith",
            },
            sourceHotel: {
              _id: "h1",
              name: "Luxe Hotels International HQ",
              code: "LHI-HQ",
            },
            details: {
              success: 5,
              failed: 0,
              skipped: 1,
            },
          },
          {
            _id: "2",
            chainCode: "COMF",
            syncType: "configuration",
            status: "completed with errors",
            startTime: "2023-06-14T10:15:00Z",
            endTime: "2023-06-14T10:18:00Z",
            initiatedBy: {
              _id: "u2",
              full_name: "Sarah Johnson",
            },
            sourceHotel: {
              _id: "h4",
              name: "Comfort Inn Group HQ",
              code: "CIG-HQ",
            },
            details: {
              success: 18,
              failed: 2,
              skipped: 4,
            },
          },
          {
            _id: "3",
            chainCode: "BUDG",
            syncType: "configuration",
            status: "completed",
            startTime: "2023-06-13T09:00:00Z",
            endTime: "2023-06-13T09:01:00Z",
            initiatedBy: {
              _id: "u3",
              full_name: "Michael Brown",
            },
            sourceHotel: {
              _id: "h6",
              name: "Budget Stays HQ",
              code: "BST-HQ",
            },
            details: {
              success: 12,
              failed: 0,
              skipped: 0,
            },
          },
        ])
      } catch (error) {
        console.error("Error fetching sync logs:", error)
        toast.error("Failed to load synchronization logs")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSyncLogs()
  }, [])

  const filteredLogs = syncLogs.filter(
    (log) =>
      log.chainCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.sourceHotel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.initiatedBy.full_name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Data Synchronization</h1>
          <p className="text-muted-foreground">View and manage configuration synchronization across hotel chains</p>
        </div>
        <Button asChild>
          <Link href="/admin/sync/new">
            <Plus className="mr-2 h-4 w-4" />
            New Sync
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Synchronization Logs</CardTitle>
          <CardDescription>History of configuration synchronization across hotel chains</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search by chain code or hotel name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center">
              <p className="text-muted-foreground">No synchronization logs found</p>
              <Button asChild className="mt-4">
                <Link href="/admin/sync/new">
                  <Plus className="mr-2 h-4 w-4" />
                  New Sync
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Chain</TableHead>
                  <TableHead>Source Hotel</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Results</TableHead>
                  <TableHead>Initiated By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log._id}>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span>{log.chainCode}</span>
                      </div>
                    </TableCell>
                    <TableCell>{log.sourceHotel.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          log.status === "completed"
                            ? "default"
                            : log.status === "completed with errors"
                              ? "secondary"
                              : log.status === "in-progress"
                                ? "outline"
                                : "destructive"
                        }
                      >
                        {log.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-xs text-green-600">Success: {log.details.success}</span>
                        {log.details.failed > 0 && (
                          <span className="text-xs text-destructive">Failed: {log.details.failed}</span>
                        )}
                        {log.details.skipped > 0 && (
                          <span className="text-xs text-muted-foreground">Skipped: {log.details.skipped}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{log.initiatedBy.full_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{formatDate(log.startTime)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/sync/${log._id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Details
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
