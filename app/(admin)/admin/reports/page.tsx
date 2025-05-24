"use client"

import { useEffect, useState } from "react"
import { Plus, FileText, Calendar, MoreHorizontal, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useReports, type Report } from "@/hooks/use-reports"
import { CreateReportForm } from "@/components/admin/create-report-form"
import { ScheduleReportForm } from "@/components/admin/schedule-report-form"

export default function ReportsPage() {
  const { reports, analytics, isLoading, fetchReports, fetchReportAnalytics, deleteReport, downloadReport } =
    useReports()

  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [typeFilter, setTypeFilter] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<string>("")

  useEffect(() => {
    fetchReports()
    fetchReportAnalytics()
  }, [])

  const filteredReports = reports.filter((report) => {
    const matchesType = !typeFilter || report.type === typeFilter
    const matchesStatus = !statusFilter || report.status === statusFilter
    return matchesType && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "analytics":
        return <TrendingUp className="h-4 w-4" />
      case "financial":
        return <FileText className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const handleDeleteReport = async (id: string) => {
    if (confirm("Are you sure you want to delete this report?")) {
      await deleteReport(id)
    }
  }

  const handleDownloadReport = async (report: Report, format: "json" | "excel" | "pdf" | "csv") => {
    await downloadReport(report._id, format)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Report Management</h1>
          <p className="text-muted-foreground">Generate, schedule, and manage system reports</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Report
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Schedule Report</DialogTitle>
              </DialogHeader>
              <ScheduleReportForm onSuccess={() => setShowScheduleDialog(false)} />
            </DialogContent>
          </Dialog>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Generate New Report</DialogTitle>
              </DialogHeader>
              <CreateReportForm onSuccess={() => setShowCreateDialog(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Analytics Cards */}
      {analytics && analytics.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.reduce((sum, item) => sum + item.totalReports, 0)}</div>
              <p className="text-xs text-muted-foreground">All generated reports</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {analytics.reduce((sum, item) => {
                  const completed = item.statuses.find((s) => s.status === "completed")
                  return sum + (completed?.count || 0)
                }, 0)}
              </div>
              <p className="text-xs text-muted-foreground">Successfully generated</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {analytics.reduce((sum, item) => {
                  const failed = item.statuses.find((s) => s.status === "failed")
                  return sum + (failed?.count || 0)
                }, 0)}
              </div>
              <p className="text-xs text-muted-foreground">Generation failed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics.length > 0
                  ? Math.round(
                      analytics.reduce((sum, item) => {
                        const avgTime =
                          item.statuses.reduce((s, status) => s + status.avgExecutionTime, 0) / item.statuses.length
                        return sum + avgTime
                      }, 0) /
                        analytics.length /
                        1000,
                    )
                  : 0}
                s
              </div>
              <p className="text-xs text-muted-foreground">Average generation time</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Report History</CardTitle>
          <CardDescription>View and manage all generated reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="analytics">Analytics</SelectItem>
                <SelectItem value="financial">Financial</SelectItem>
                <SelectItem value="operational">Operational</SelectItem>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="audit">Audit</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Records</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Generated</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => (
                  <TableRow key={report._id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(report.type)}
                        <div>
                          <div className="font-medium">{report.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {report.parameters.startDate &&
                              report.parameters.endDate &&
                              `${new Date(report.parameters.startDate).toLocaleDateString()} - ${new Date(report.parameters.endDate).toLocaleDateString()}`}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{report.type}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(report.status)}>{report.status}</Badge>
                    </TableCell>
                    <TableCell>{report.metadata.recordCount?.toLocaleString() || "-"}</TableCell>
                    <TableCell>
                      {report.metadata.executionTime ? `${Math.round(report.metadata.executionTime / 1000)}s` : "-"}
                    </TableCell>
                    <TableCell>{new Date(report.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {report.isScheduled ? (
                        <Badge variant="outline">{report.schedule?.frequency}</Badge>
                      ) : (
                        <span className="text-muted-foreground">Manual</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {report.status === "completed" && (
                            <>
                              <DropdownMenuItem onClick={() => handleDownloadReport(report, "json")}>
                                Download JSON
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDownloadReport(report, "excel")}>
                                Download Excel
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDownloadReport(report, "pdf")}>
                                Download PDF
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDownloadReport(report, "csv")}>
                                Download CSV
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem onClick={() => handleDeleteReport(report._id)} className="text-red-600">
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
