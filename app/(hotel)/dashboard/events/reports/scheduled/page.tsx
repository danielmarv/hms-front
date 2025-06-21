"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useEventReports } from "@/hooks/use-event-reports"
import { useCurrentHotel } from "@/hooks/use-current-hotel"
import { Calendar, Clock, Mail, Plus, Trash2, Edit, Send, Settings, Users, FileText, Download } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"

interface ScheduleConfig {
  reportType: string
  schedule: string
  recipients: string[]
  recipientInput: string
  name: string
  description: string
  isActive: boolean
  includeCharts: boolean
  format: "pdf" | "excel" | "csv"
}

export default function ScheduledReportsPage() {
  const { currentHotel } = useCurrentHotel()
  const { getScheduledReports, scheduleReport, deleteScheduledReport, loading, error } = useEventReports(
    currentHotel?.id,
  )

  // State
  const [scheduledReports, setScheduledReports] = useState<any[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingReport, setEditingReport] = useState<any>(null)

  // New schedule configuration
  const [newSchedule, setNewSchedule] = useState<ScheduleConfig>({
    reportType: "",
    schedule: "",
    recipients: [],
    recipientInput: "",
    name: "",
    description: "",
    isActive: true,
    includeCharts: true,
    format: "pdf",
  })

  // Available options
  const reportTypes = [
    { value: "events-summary", label: "Events Summary", description: "Overview of all events and key metrics" },
    { value: "revenue-analysis", label: "Revenue Analysis", description: "Detailed revenue breakdown and trends" },
    { value: "venue-utilization", label: "Venue Utilization", description: "Venue usage and efficiency metrics" },
    {
      value: "staff-performance",
      label: "Staff Performance",
      description: "Staff productivity and assignment analysis",
    },
    { value: "service-popularity", label: "Service Popularity", description: "Additional services usage and revenue" },
    { value: "customer-satisfaction", label: "Customer Satisfaction", description: "Feedback and rating analysis" },
  ]

  const scheduleOptions = [
    { value: "daily", label: "Daily", description: "Every day at 9:00 AM" },
    { value: "weekly", label: "Weekly", description: "Every Monday at 9:00 AM" },
    { value: "monthly", label: "Monthly", description: "First day of each month at 9:00 AM" },
    { value: "quarterly", label: "Quarterly", description: "First day of each quarter at 9:00 AM" },
  ]

  const formatOptions = [
    { value: "pdf", label: "PDF", description: "Formatted report with charts" },
    { value: "excel", label: "Excel", description: "Spreadsheet with data tables" },
    { value: "csv", label: "CSV", description: "Raw data in CSV format" },
  ]

  // Load scheduled reports
  const loadScheduledReports = async () => {
    if (!currentHotel?.id) return

    try {
      const reports = await getScheduledReports(currentHotel.id)
      setScheduledReports(reports || [])
    } catch (error) {
      toast.error("Failed to load scheduled reports")
    }
  }

  // Create new scheduled report
  const handleCreateSchedule = async () => {
    if (!currentHotel?.id || !newSchedule.reportType || !newSchedule.schedule || newSchedule.recipients.length === 0) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      await scheduleReport(currentHotel.id, newSchedule.reportType, newSchedule.schedule, newSchedule.recipients)
      setNewSchedule({
        reportType: "",
        schedule: "",
        recipients: [],
        recipientInput: "",
        name: "",
        description: "",
        isActive: true,
        includeCharts: true,
        format: "pdf",
      })
      setShowCreateForm(false)
      loadScheduledReports()
      toast.success("Report scheduled successfully")
    } catch (error) {
      toast.error("Failed to schedule report")
    }
  }

  // Delete scheduled report
  const handleDeleteSchedule = async (scheduleId: string) => {
    try {
      await deleteScheduledReport(scheduleId)
      loadScheduledReports()
      toast.success("Scheduled report deleted")
    } catch (error) {
      toast.error("Failed to delete scheduled report")
    }
  }

  // Add recipient
  const addRecipient = () => {
    if (newSchedule.recipientInput && !newSchedule.recipients.includes(newSchedule.recipientInput)) {
      setNewSchedule((prev) => ({
        ...prev,
        recipients: [...prev.recipients, prev.recipientInput],
        recipientInput: "",
      }))
    }
  }

  // Remove recipient
  const removeRecipient = (email: string) => {
    setNewSchedule((prev) => ({
      ...prev,
      recipients: prev.recipients.filter((r) => r !== email),
    }))
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default"
      case "paused":
        return "secondary"
      case "error":
        return "destructive"
      default:
        return "secondary"
    }
  }

  // Get next run display
  const getNextRunDisplay = (nextRun: string) => {
    try {
      return format(new Date(nextRun), "MMM dd, yyyy 'at' h:mm a")
    } catch {
      return "Not scheduled"
    }
  }

  useEffect(() => {
    loadScheduledReports()
  }, [currentHotel?.id])

  if (!currentHotel) {
    return <div>Please select a hotel to manage scheduled reports</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Scheduled Reports</h1>
          <p className="text-muted-foreground">Automate report generation and delivery</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Schedule New Report
        </Button>
      </div>

      {/* Create/Edit Form */}
      {(showCreateForm || editingReport) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {editingReport ? "Edit Scheduled Report" : "Schedule New Report"}
            </CardTitle>
            <CardDescription>Configure automatic report generation and delivery</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Basic Information */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Report Name</Label>
                  <Input
                    placeholder="Enter report name"
                    value={newSchedule.name}
                    onChange={(e) => setNewSchedule((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Enter report description"
                    value={newSchedule.description}
                    onChange={(e) => setNewSchedule((prev) => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Report Type</Label>
                  <Select
                    value={newSchedule.reportType}
                    onValueChange={(value) => setNewSchedule((prev) => ({ ...prev, reportType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      {reportTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-xs text-muted-foreground">{type.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Schedule</Label>
                  <Select
                    value={newSchedule.schedule}
                    onValueChange={(value) => setNewSchedule((prev) => ({ ...prev, schedule: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select schedule" />
                    </SelectTrigger>
                    <SelectContent>
                      {scheduleOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-xs text-muted-foreground">{option.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Recipients and Options */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Recipients</Label>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Enter email address"
                      value={newSchedule.recipientInput}
                      onChange={(e) => setNewSchedule((prev) => ({ ...prev, recipientInput: e.target.value }))}
                      onKeyPress={(e) => e.key === "Enter" && addRecipient()}
                    />
                    <Button onClick={addRecipient} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newSchedule.recipients.map((email) => (
                      <Badge key={email} variant="secondary" className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {email}
                        <button onClick={() => removeRecipient(email)} className="ml-1 hover:text-red-500">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Format</Label>
                  <Select
                    value={newSchedule.format}
                    onValueChange={(value: any) => setNewSchedule((prev) => ({ ...prev, format: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {formatOptions.map((format) => (
                        <SelectItem key={format.value} value={format.value}>
                          <div>
                            <div className="font-medium">{format.label}</div>
                            <div className="text-xs text-muted-foreground">{format.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Include Charts</Label>
                      <p className="text-xs text-muted-foreground">Add visual charts to the report</p>
                    </div>
                    <Switch
                      checked={newSchedule.includeCharts}
                      onCheckedChange={(checked) => setNewSchedule((prev) => ({ ...prev, includeCharts: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Active</Label>
                      <p className="text-xs text-muted-foreground">Enable automatic report generation</p>
                    </div>
                    <Switch
                      checked={newSchedule.isActive}
                      onCheckedChange={(checked) => setNewSchedule((prev) => ({ ...prev, isActive: checked }))}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateForm(false)
                  setEditingReport(null)
                  setNewSchedule({
                    reportType: "",
                    schedule: "",
                    recipients: [],
                    recipientInput: "",
                    name: "",
                    description: "",
                    isActive: true,
                    includeCharts: true,
                    format: "pdf",
                  })
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateSchedule} disabled={loading}>
                <Send className="h-4 w-4 mr-2" />
                {loading ? "Scheduling..." : "Schedule Report"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scheduled Reports List */}
      <div className="grid gap-4">
        {scheduledReports.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-[200px]">
              <div className="text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Scheduled Reports</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first scheduled report to automate report generation and delivery.
                </p>
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Your First Report
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          scheduledReports.map((report) => (
            <Card key={report.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {report.name || reportTypes.find((t) => t.value === report.report_type)?.label}
                    </CardTitle>
                    <CardDescription>
                      {report.description || reportTypes.find((t) => t.value === report.report_type)?.description}
                    </CardDescription>
                  </div>
                  <Badge variant={getStatusColor(report.status)}>{report.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">Schedule</div>
                      <div className="text-xs text-muted-foreground capitalize">{report.schedule}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">Next Run</div>
                      <div className="text-xs text-muted-foreground">{getNextRunDisplay(report.next_run)}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">Recipients</div>
                      <div className="text-xs text-muted-foreground">{report.recipients?.length || 0} recipient(s)</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Download className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">Format</div>
                      <div className="text-xs text-muted-foreground uppercase">{report.format || "PDF"}</div>
                    </div>
                  </div>
                </div>

                {report.recipients && report.recipients.length > 0 && (
                  <div className="mt-4">
                    <div className="text-sm font-medium mb-2">Recipients:</div>
                    <div className="flex flex-wrap gap-1">
                      {report.recipients.map((email: string) => (
                        <Badge key={email} variant="outline" className="text-xs">
                          <Mail className="h-3 w-3 mr-1" />
                          {email}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingReport(report)
                      setNewSchedule({
                        reportType: report.report_type,
                        schedule: report.schedule,
                        recipients: report.recipients || [],
                        recipientInput: "",
                        name: report.name || "",
                        description: report.description || "",
                        isActive: report.status === "active",
                        includeCharts: report.include_charts !== false,
                        format: report.format || "pdf",
                      })
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDeleteSchedule(report.id)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
