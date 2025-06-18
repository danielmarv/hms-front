"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { format } from "date-fns"
import type { Report } from "@/hooks/use-reports"
import { FileText, Clock, User, Calendar, Database, AlertCircle, CheckCircle, Loader2 } from "lucide-react"

interface ReportDetailsDialogProps {
  report: Report | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReportDetailsDialog({ report, open, onOpenChange }: ReportDetailsDialogProps) {
  if (!report) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Report Details</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-8">
            <p className="text-muted-foreground">No report selected</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const reportName = report.title || report.name || "Untitled Report"

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "processing":
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />
    }
  }

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Report Details
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-full pr-4">
          <div className="space-y-6 pb-4">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Title</Label>
                    <p className="text-sm text-muted-foreground">{reportName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Type</Label>
                    <p className="text-sm text-muted-foreground capitalize">{report.type}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusIcon(report.status)}
                      <Badge className={getStatusColor(report.status)}>{report.status}</Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Format</Label>
                    <p className="text-sm text-muted-foreground uppercase">{report.format || "JSON"}</p>
                  </div>
                  {report.description && (
                    <div className="md:col-span-2">
                      <Label className="text-sm font-medium">Description</Label>
                      <p className="text-sm text-muted-foreground">{report.description}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Execution Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Execution Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Created At</Label>
                    <p className="text-sm text-muted-foreground">
                      {report.createdAt ? format(new Date(report.createdAt), "PPpp") : "N/A"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Updated At</Label>
                    <p className="text-sm text-muted-foreground">
                      {report.updatedAt ? format(new Date(report.updatedAt), "PPpp") : "N/A"}
                    </p>
                  </div>
                  {report.metadata?.startTime && (
                    <div>
                      <Label className="text-sm font-medium">Start Time</Label>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(report.metadata.startTime), "PPpp")}
                      </p>
                    </div>
                  )}
                  {report.metadata?.endTime && (
                    <div>
                      <Label className="text-sm font-medium">End Time</Label>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(report.metadata.endTime), "PPpp")}
                      </p>
                    </div>
                  )}
                  {report.metadata?.executionTime && (
                    <div>
                      <Label className="text-sm font-medium">Execution Time</Label>
                      <p className="text-sm text-muted-foreground">
                        {Math.round(report.metadata.executionTime / 1000)}s ({report.metadata.executionTime}ms)
                      </p>
                    </div>
                  )}
                  {report.metadata?.recordCount !== undefined && (
                    <div>
                      <Label className="text-sm font-medium">Record Count</Label>
                      <p className="text-sm text-muted-foreground">
                        {report.metadata.recordCount.toLocaleString()} records
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Parameters */}
            {report.parameters && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Parameters
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {report.parameters.startDate && (
                      <div>
                        <Label className="text-sm font-medium">Start Date</Label>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(report.parameters.startDate), "PPP")}
                        </p>
                      </div>
                    )}
                    {report.parameters.endDate && (
                      <div>
                        <Label className="text-sm font-medium">End Date</Label>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(report.parameters.endDate), "PPP")}
                        </p>
                      </div>
                    )}
                    {report.parameters.modules && report.parameters.modules.length > 0 && (
                      <div className="md:col-span-2">
                        <Label className="text-sm font-medium">Modules</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {report.parameters.modules.map((module) => (
                            <Badge key={module} variant="outline" className="text-xs">
                              {module}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {report.parameters.groupBy && (
                      <div>
                        <Label className="text-sm font-medium">Group By</Label>
                        <p className="text-sm text-muted-foreground">{report.parameters.groupBy}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Schedule Information */}
            {report.isScheduled && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Schedule Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Frequency</Label>
                      <p className="text-sm text-muted-foreground capitalize">
                        {report.frequency || report.schedule?.frequency || "Unknown"}
                      </p>
                    </div>
                    {report.schedule?.time && (
                      <div>
                        <Label className="text-sm font-medium">Time</Label>
                        <p className="text-sm text-muted-foreground">{report.schedule.time}</p>
                      </div>
                    )}
                    {report.schedule?.isActive !== undefined && (
                      <div>
                        <Label className="text-sm font-medium">Active</Label>
                        <Badge variant={report.schedule.isActive ? "default" : "secondary"}>
                          {report.schedule.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    )}
                    {report.schedule?.nextExecution && (
                      <div>
                        <Label className="text-sm font-medium">Next Execution</Label>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(report.schedule.nextExecution), "PPpp")}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Email Notification */}
            {report.emailNotification?.enabled && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Email Notification
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {report.emailNotification.subject && (
                      <div>
                        <Label className="text-sm font-medium">Subject</Label>
                        <p className="text-sm text-muted-foreground">{report.emailNotification.subject}</p>
                      </div>
                    )}
                    {report.emailNotification.recipients && report.emailNotification.recipients.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium">Recipients</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {report.emailNotification.recipients.map((email, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {email}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <Label className="text-sm font-medium">Include Attachment</Label>
                      <Badge variant={report.emailNotification.includeAttachment ? "default" : "secondary"}>
                        {report.emailNotification.includeAttachment ? "Yes" : "No"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* File Information */}
            {(report.filePath || report.fileName) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">File Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {report.fileName && (
                      <div>
                        <Label className="text-sm font-medium">File Name</Label>
                        <p className="text-sm text-muted-foreground">{report.fileName}</p>
                      </div>
                    )}
                    {report.fileSize && (
                      <div>
                        <Label className="text-sm font-medium">File Size</Label>
                        <p className="text-sm text-muted-foreground">{(report.fileSize / 1024).toFixed(2)} KB</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Error Information */}
            {report.status === "failed" && (report.metadata?.error || report.metadata?.errorMessage) && (
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-red-600">
                    <AlertCircle className="h-5 w-5" />
                    Error Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-red-50 p-3 rounded-md">
                    <p className="text-sm text-red-800">{report.metadata.error || report.metadata.errorMessage}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
