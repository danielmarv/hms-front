"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useEventReports } from "@/hooks/use-event-reports"
import { useCurrentHotel } from "@/hooks/use-current-hotel"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import {
  Download,
  Calendar,
  TrendingUp,
  Users,
  DollarSign,
  Building,
  Star,
  FileText,
  Settings,
  Plus,
  Trash2,
  Send,
} from "lucide-react"
import { format, subMonths } from "date-fns"
import { toast } from "sonner"

export default function AdvancedEventReportsPage() {
  const { currentHotel } = useCurrentHotel()
  const {
    getEventsSummaryReport,
    getRevenueAnalysisReport,
    getVenueUtilizationReport,
    getStaffPerformanceReport,
    getServicePopularityReport,
    getCustomerSatisfactionReport,
    generateCustomReport,
    getDashboardData,
    getKPIs,
    getScheduledReports,
    scheduleReport,
    deleteScheduledReport,
    exportReportToPDF,
    exportReportToExcel,
    exportReportToCSV,
    loading,
    error,
  } = useEventReports(currentHotel?.id)

  // State for date range
  const [startDate, setStartDate] = useState<Date | undefined>(subMonths(new Date(), 6))
  const [endDate, setEndDate] = useState<Date | undefined>(new Date())

  // State for reports data
  const [summaryReport, setSummaryReport] = useState<any>(null)
  const [revenueReport, setRevenueReport] = useState<any>(null)
  const [venueReport, setVenueReport] = useState<any>(null)
  const [staffReport, setStaffReport] = useState<any>(null)
  const [serviceReport, setServiceReport] = useState<any>(null)
  const [satisfactionReport, setSatisfactionReport] = useState<any>(null)
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [kpiData, setKpiData] = useState<any>(null)
  const [scheduledReports, setScheduledReports] = useState<any[]>([])

  // State for custom report builder
  const [customMetrics, setCustomMetrics] = useState<string[]>([])
  const [customDimensions, setCustomDimensions] = useState<string[]>([])
  const [customFilters, setCustomFilters] = useState<Record<string, any>>({})
  const [customReport, setCustomReport] = useState<any>(null)

  // State for scheduled reports
  const [newSchedule, setNewSchedule] = useState({
    reportType: "",
    schedule: "",
    recipients: [] as string[],
    recipientInput: "",
  })

  // Available metrics and dimensions for custom reports
  const availableMetrics = [
    "total_events",
    "total_revenue",
    "avg_attendees",
    "cancellation_rate",
    "venue_utilization",
    "staff_hours",
    "service_revenue",
    "customer_rating",
  ]

  const availableDimensions = ["event_type", "venue", "staff_member", "service", "month", "quarter", "year"]

  const reportTypes = [
    "events-summary",
    "revenue-analysis",
    "venue-utilization",
    "staff-performance",
    "service-popularity",
    "customer-satisfaction",
  ]

  // Load all reports
  const loadReports = async () => {
    if (!currentHotel?.id) return

    try {
      const [summary, revenue, venue, staff, service, satisfaction, dashboard, kpis, scheduled] = await Promise.all([
        getEventsSummaryReport(currentHotel.id, startDate, endDate),
        getRevenueAnalysisReport(currentHotel.id, startDate, endDate, "month"),
        getVenueUtilizationReport(currentHotel.id, startDate, endDate),
        getStaffPerformanceReport(currentHotel.id, startDate, endDate),
        getServicePopularityReport(currentHotel.id, startDate, endDate),
        getCustomerSatisfactionReport(currentHotel.id, startDate, endDate),
        getDashboardData(currentHotel.id),
        getKPIs(currentHotel.id),
        getScheduledReports(currentHotel.id),
      ])

      setSummaryReport(summary)
      setRevenueReport(revenue)
      setVenueReport(venue)
      setStaffReport(staff)
      setServiceReport(service)
      setSatisfactionReport(satisfaction)
      setDashboardData(dashboard)
      setKpiData(kpis)
      setScheduledReports(scheduled)
    } catch (error) {
      toast.error("Failed to load reports")
    }
  }

  // Generate custom report
  const handleGenerateCustomReport = async () => {
    if (!currentHotel?.id || customMetrics.length === 0) {
      toast.error("Please select at least one metric")
      return
    }

    try {
      const result = await generateCustomReport(
        currentHotel.id,
        startDate,
        endDate,
        customMetrics,
        customDimensions,
        customFilters,
        "total_revenue",
        100,
      )
      setCustomReport(result)
      toast.success("Custom report generated successfully")
    } catch (error) {
      toast.error("Failed to generate custom report")
    }
  }

  // Schedule report
  const handleScheduleReport = async () => {
    if (!currentHotel?.id || !newSchedule.reportType || !newSchedule.schedule || newSchedule.recipients.length === 0) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      await scheduleReport(currentHotel.id, newSchedule.reportType, newSchedule.schedule, newSchedule.recipients)
      setNewSchedule({ reportType: "", schedule: "", recipients: [], recipientInput: "" })
      loadReports() // Reload to get updated scheduled reports
      toast.success("Report scheduled successfully")
    } catch (error) {
      toast.error("Failed to schedule report")
    }
  }

  // Delete scheduled report
  const handleDeleteScheduledReport = async (scheduleId: string) => {
    try {
      await deleteScheduledReport(scheduleId)
      loadReports() // Reload to get updated scheduled reports
      toast.success("Scheduled report deleted")
    } catch (error) {
      toast.error("Failed to delete scheduled report")
    }
  }

  // Export functions
  const handleExportPDF = async (reportId: string) => {
    try {
      await exportReportToPDF(reportId)
      toast.success("Report exported to PDF")
    } catch (error) {
      toast.error("Failed to export PDF")
    }
  }

  const handleExportExcel = async (reportId: string) => {
    try {
      await exportReportToExcel(reportId)
      toast.success("Report exported to Excel")
    } catch (error) {
      toast.error("Failed to export Excel")
    }
  }

  const handleExportCSV = async (reportId: string) => {
    try {
      await exportReportToCSV(reportId)
      toast.success("Report exported to CSV")
    } catch (error) {
      toast.error("Failed to export CSV")
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

  useEffect(() => {
    loadReports()
  }, [currentHotel?.id, startDate, endDate])

  if (!currentHotel) {
    return <div>Please select a hotel to view reports</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Advanced Event Reports</h1>
        <p className="text-muted-foreground">Comprehensive reporting and analytics for event management</p>
      </div>

      {/* Date Range Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Report Period
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 md:flex-row md:items-end md:space-x-4 md:space-y-0">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <DatePicker date={startDate} setDate={setStartDate} />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <DatePicker date={endDate} setDate={setEndDate} />
            </div>
            <Button onClick={loadReports} disabled={loading}>
              {loading ? "Loading..." : "Update Reports"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="detailed">Detailed Reports</TabsTrigger>
          <TabsTrigger value="custom">Custom Reports</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="exports">Exports</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* KPI Cards */}
          {dashboardData && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.dashboard_data.total_events}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Confirmed Events</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.dashboard_data.confirmed_events}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${dashboardData.dashboard_data.total_revenue?.toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Attendees</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.dashboard_data.avg_attendees}</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Summary Charts */}
          {summaryReport && (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Events Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Events:</span>
                      <span className="font-semibold">{summaryReport.summary.total_events}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Confirmed:</span>
                      <span className="font-semibold text-green-600">{summaryReport.summary.confirmed_events}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cancelled:</span>
                      <span className="font-semibold text-red-600">{summaryReport.summary.cancelled_events}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cancellation Rate:</span>
                      <span className="font-semibold">{summaryReport.summary.cancellation_rate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Revenue:</span>
                      <span className="font-semibold">${summaryReport.summary.total_revenue?.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {venueReport && (
                <Card>
                  <CardHeader>
                    <CardTitle>Venue Utilization</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Total Venues:</span>
                        <span className="font-semibold">{venueReport.summary.total_venues}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Overall Utilization:</span>
                        <span className="font-semibold">{venueReport.summary.overall_utilization_rate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Revenue per Hour:</span>
                        <span className="font-semibold">${venueReport.summary.revenue_per_hour?.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        {/* Detailed Reports Tab */}
        <TabsContent value="detailed" className="space-y-4">
          <div className="grid gap-4">
            {/* Revenue Analysis */}
            {revenueReport && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Revenue Analysis
                  </CardTitle>
                  <CardDescription>
                    Revenue trends from {startDate ? format(startDate, "MMM yyyy") : ""} to{" "}
                    {endDate ? format(endDate, "MMM yyyy") : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueReport.data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" stroke="#3498db" strokeWidth={2} />
                      <Line type="monotone" dataKey="count" stroke="#e74c3c" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Venue Utilization Details */}
            {venueReport && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Venue Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={venueReport.venues} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" width={120} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="utilization_rate" fill="#3498db" name="Utilization %" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Staff Performance */}
            {staffReport && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Staff Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {staffReport.staff_performance.map((staff: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-semibold">{staff.staff_name}</div>
                          <div className="text-sm text-muted-foreground">{staff.role}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{staff.events_assigned} events</div>
                          <div className="text-sm text-muted-foreground">
                            {staff.total_hours}h • ${staff.total_cost}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Customer Satisfaction */}
            {satisfactionReport && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Customer Satisfaction
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold">{satisfactionReport.summary.overall_rating}</div>
                        <div className="text-sm text-muted-foreground">Overall Rating</div>
                      </div>
                      <div className="space-y-2">
                        {Object.entries(satisfactionReport.summary.category_ratings).map(([category, rating]) => (
                          <div key={category} className="flex justify-between">
                            <span className="capitalize">{category}:</span>
                            <span className="font-semibold">{rating as string}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={satisfactionReport.summary.rating_distribution.ratings.map(
                              (rating: number, index: number) => ({
                                name: `${rating} Stars`,
                                value: satisfactionReport.summary.rating_distribution.counts[index],
                                percentage: satisfactionReport.summary.rating_distribution.percentages[index],
                              }),
                            )}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percentage }) => `${name}: ${percentage}`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {satisfactionReport.summary.rating_distribution.ratings.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={`hsl(${index * 60}, 70%, 50%)`} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Custom Reports Tab */}
        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Custom Report Builder
              </CardTitle>
              <CardDescription>Create custom reports with specific metrics and dimensions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Metrics Selection */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Metrics</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {availableMetrics.map((metric) => (
                    <div key={metric} className="flex items-center space-x-2">
                      <Checkbox
                        id={metric}
                        checked={customMetrics.includes(metric)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setCustomMetrics([...customMetrics, metric])
                          } else {
                            setCustomMetrics(customMetrics.filter((m) => m !== metric))
                          }
                        }}
                      />
                      <Label htmlFor={metric} className="text-sm capitalize">
                        {metric.replace(/_/g, " ")}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dimensions Selection */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Dimensions</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {availableDimensions.map((dimension) => (
                    <div key={dimension} className="flex items-center space-x-2">
                      <Checkbox
                        id={dimension}
                        checked={customDimensions.includes(dimension)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setCustomDimensions([...customDimensions, dimension])
                          } else {
                            setCustomDimensions(customDimensions.filter((d) => d !== dimension))
                          }
                        }}
                      />
                      <Label htmlFor={dimension} className="text-sm capitalize">
                        {dimension.replace(/_/g, " ")}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={handleGenerateCustomReport} disabled={loading || customMetrics.length === 0}>
                {loading ? "Generating..." : "Generate Custom Report"}
              </Button>

              {/* Custom Report Results */}
              {customReport && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">Custom Report Results</h3>
                  <div className="border rounded-lg p-4">
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-2">
                        {customReport.results.map((result: any, index: number) => (
                          <div key={index} className="flex justify-between items-center p-2 border-b">
                            <div className="text-sm">
                              {Object.entries(result)
                                .filter(([key]) => !customMetrics.includes(key))
                                .map(([key, value]) => (
                                  <span key={key} className="mr-2">
                                    <strong>{key}:</strong> {value as string}
                                  </span>
                                ))}
                            </div>
                            <div className="text-sm font-semibold">
                              {Object.entries(result)
                                .filter(([key]) => customMetrics.includes(key))
                                .map(([key, value]) => (
                                  <span key={key} className="mr-2">
                                    {key}: {value as string}
                                  </span>
                                ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scheduled Reports Tab */}
        <TabsContent value="scheduled" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Schedule New Report */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Schedule New Report
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                        <SelectItem key={type} value={type}>
                          {type.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
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
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

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
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newSchedule.recipients.map((email) => (
                      <Badge key={email} variant="secondary" className="flex items-center gap-1">
                        {email}
                        <button onClick={() => removeRecipient(email)} className="ml-1 hover:text-red-500">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button onClick={handleScheduleReport} disabled={loading} className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  Schedule Report
                </Button>
              </CardContent>
            </Card>

            {/* Existing Scheduled Reports */}
            <Card>
              <CardHeader>
                <CardTitle>Scheduled Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {scheduledReports.map((report) => (
                      <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-semibold capitalize">{report.report_type.replace(/-/g, " ")}</div>
                          <div className="text-sm text-muted-foreground">
                            {report.schedule} • Next: {format(new Date(report.next_run), "MMM dd, yyyy")}
                          </div>
                          <div className="text-xs text-muted-foreground">{report.recipients.length} recipient(s)</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={report.status === "active" ? "default" : "secondary"}>{report.status}</Badge>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteScheduledReport(report.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          {kpiData && (
            <Card>
              <CardHeader>
                <CardTitle>KPI Trends</CardTitle>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={kpiData.kpis}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id.month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="total_events" stroke="#3498db" name="Total Events" />
                    <Line type="monotone" dataKey="total_revenue" stroke="#e74c3c" name="Revenue" />
                    <Line type="monotone" dataKey="total_attendees" stroke="#2ecc71" name="Attendees" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Exports Tab */}
        <TabsContent value="exports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Export Reports
              </CardTitle>
              <CardDescription>Export your reports in various formats</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Button onClick={() => handleExportPDF("current")} variant="outline" className="h-20 flex-col">
                  <FileText className="h-6 w-6 mb-2" />
                  Export as PDF
                </Button>
                <Button onClick={() => handleExportExcel("current")} variant="outline" className="h-20 flex-col">
                  <FileText className="h-6 w-6 mb-2" />
                  Export as Excel
                </Button>
                <Button onClick={() => handleExportCSV("current")} variant="outline" className="h-20 flex-col">
                  <FileText className="h-6 w-6 mb-2" />
                  Export as CSV
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
