"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import { FileText, Clock, User, Database, Settings } from "lucide-react"
import type { Report } from "@/hooks/use-reports"

interface ReportDetailsDialogProps {
  report: Report | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReportDetailsDialog({ report, open, onOpenChange }: ReportDetailsDialogProps) {
  if (!report) return null

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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {report.title}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="parameters">Parameters</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
            <TabsTrigger value="metadata">Metadata</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Report Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Title</label>
                    <p>{report.title}</p>
                  </div>
                  {report.description && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Description</label>
                      <p>{report.description}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Type</label>
                    <p className="capitalize">{report.type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Format</label>
                    <p className="uppercase">{report.format}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <Badge className={getStatusColor(report.status)}>{report.status}</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Timing Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Created</label>
                    <p>{format(new Date(report.createdAt), "PPpp")}</p>
                  </div>
                  {report.metadata?.startTime && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Started</label>
                      <p>{format(new Date(report.metadata.startTime), "PPpp")}</p>
                    </div>
                  )}
                  {report.metadata?.endTime && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Completed</label>
                      <p>{format(new Date(report.metadata.endTime), "PPpp")}</p>
                    </div>
                  )}
                  {report.metadata?.executionTime && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Execution Time</label>
                      <p>{Math.round(report.metadata.executionTime / 1000)}s</p>
                    </div>
                  )}
                  {report.isScheduled && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Schedule</label>
                      <Badge variant="outline">{report.frequency}</Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {report.recipients && report.recipients.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Email Recipients
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {report.recipients.map((recipient, index) => (
                      <Badge key={index} variant="outline">
                        {recipient.email}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="parameters" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Report Parameters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {report.parameters?.startDate && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                    <p>{format(new Date(report.parameters.startDate), "PPP")}</p>
                  </div>
                )}
                {report.parameters?.endDate && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">End Date</label>
                    <p>{format(new Date(report.parameters.endDate), "PPP")}</p>
                  </div>
                )}
                {report.parameters?.modules && report.parameters.modules.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Modules</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {report.parameters.modules.map((module, index) => (
                        <Badge key={index} variant="secondary" className="capitalize">
                          {module}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {report.parameters?.groupBy && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Group By</label>
                    <p className="capitalize">{report.parameters.groupBy}</p>
                  </div>
                )}
                {report.parameters?.filters && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Filters</label>
                    <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto">
                      {JSON.stringify(report.parameters.filters, null, 2)}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Report Data
                </CardTitle>
                <CardDescription>
                  {report.metadata?.recordCount && `${report.metadata.recordCount.toLocaleString()} records`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {report.status === "completed" && report.data ? (
                  <div className="space-y-4">
                    {report.data.summary && (
                      <div>
                        <h4 className="font-medium mb-2">Summary</h4>
                        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                          {Object.entries(report.data.summary).map(([key, value]) => (
                            <div key={key} className="p-2 bg-muted rounded">
                              <div className="text-xs text-muted-foreground capitalize">{key}</div>
                              <div className="font-medium">
                                {typeof value === "number" ? value.toLocaleString() : String(value)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {report.data.modules && (
                      <div>
                        <h4 className="font-medium mb-2">Module Data</h4>
                        <div className="space-y-2">
                          {Object.entries(report.data.modules).map(([moduleName, moduleData]) => (
                            <div key={moduleName} className="border rounded p-3">
                              <h5 className="font-medium capitalize mb-2">{moduleName}</h5>
                              <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                                {Object.entries(moduleData as Record<string, any>).map(([key, value]) => (
                                  <div key={key} className="text-sm">
                                    <span className="text-muted-foreground capitalize">{key}:</span>{" "}
                                    <span className="font-medium">
                                      {typeof value === "number" ? value.toLocaleString() : String(value)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    {report.status === "pending" && "Report is pending generation"}
                    {report.status === "processing" && "Report is being generated"}
                    {report.status === "failed" && "Report generation failed"}
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metadata" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Technical Metadata</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-muted p-4 rounded overflow-auto">
                  {JSON.stringify(
                    {
                      id: report._id,
                      status: report.status,
                      metadata: report.metadata,
                      filePath: report.filePath,
                      fileSize: report.fileSize,
                      isScheduled: report.isScheduled,
                      frequency: report.frequency,
                      nextRun: report.nextRun,
                      createdAt: report.createdAt,
                      updatedAt: report.updatedAt,
                    },
                    null,
                    2,
                  )}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
