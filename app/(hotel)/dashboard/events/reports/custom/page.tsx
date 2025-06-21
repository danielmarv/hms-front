"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
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
import { Settings, Play, Save, Download, Minus, BarChart3, PieChartIcon, TrendingUp } from "lucide-react"
import { subMonths } from "date-fns"
import { toast } from "sonner"
import { exportReportToPDF, exportReportToExcel, exportReportToCSV } from "@/utils/export-reports"

interface CustomReportConfig {
  name: string
  description: string
  metrics: string[]
  dimensions: string[]
  filters: Record<string, any>
  sortBy: string
  limit: number
  chartType: "bar" | "line" | "pie"
  groupBy: string
}

export default function CustomReportsPage() {
  const { currentHotel } = useCurrentHotel()
  const { generateCustomReport, getCustomReport, loading, error } = useEventReports(currentHotel?.id)

  // State for report configuration
  const [config, setConfig] = useState<CustomReportConfig>({
    name: "",
    description: "",
    metrics: [],
    dimensions: [],
    filters: {},
    sortBy: "total_revenue",
    limit: 100,
    chartType: "bar",
    groupBy: "month",
  })

  // State for date range
  const [startDate, setStartDate] = useState<Date | undefined>(subMonths(new Date(), 6))
  const [endDate, setEndDate] = useState<Date | undefined>(new Date())

  // State for results
  const [reportResults, setReportResults] = useState<any>(null)
  const [savedReports, setSavedReports] = useState<CustomReportConfig[]>([])

  // Available options
  const availableMetrics = [
    { value: "total_events", label: "Total Events", description: "Count of all events" },
    { value: "total_revenue", label: "Total Revenue", description: "Sum of all revenue" },
    { value: "avg_attendees", label: "Average Attendees", description: "Average number of attendees" },
    { value: "cancellation_rate", label: "Cancellation Rate", description: "Percentage of cancelled events" },
    { value: "venue_utilization", label: "Venue Utilization", description: "Venue usage percentage" },
    { value: "staff_hours", label: "Staff Hours", description: "Total staff working hours" },
    { value: "service_revenue", label: "Service Revenue", description: "Revenue from additional services" },
    { value: "customer_rating", label: "Customer Rating", description: "Average customer satisfaction" },
    { value: "profit_margin", label: "Profit Margin", description: "Profit percentage" },
    { value: "booking_lead_time", label: "Booking Lead Time", description: "Days between booking and event" },
  ]

  const availableDimensions = [
    { value: "event_type", label: "Event Type", description: "Group by event category" },
    { value: "venue", label: "Venue", description: "Group by venue location" },
    { value: "staff_member", label: "Staff Member", description: "Group by assigned staff" },
    { value: "service", label: "Service", description: "Group by additional services" },
    { value: "month", label: "Month", description: "Group by month" },
    { value: "quarter", label: "Quarter", description: "Group by quarter" },
    { value: "year", label: "Year", description: "Group by year" },
    { value: "day_of_week", label: "Day of Week", description: "Group by weekday" },
    { value: "customer_segment", label: "Customer Segment", description: "Group by customer type" },
    { value: "booking_source", label: "Booking Source", description: "Group by how booking was made" },
  ]

  const filterOptions = [
    { key: "event_type", label: "Event Type", type: "select" },
    { key: "venue", label: "Venue", type: "select" },
    { key: "min_attendees", label: "Min Attendees", type: "number" },
    { key: "max_attendees", label: "Max Attendees", type: "number" },
    { key: "min_revenue", label: "Min Revenue", type: "number" },
    { key: "max_revenue", label: "Max Revenue", type: "number" },
    { key: "status", label: "Status", type: "select" },
    { key: "customer_type", label: "Customer Type", type: "select" },
  ]

  // Generate report
  const handleGenerateReport = async () => {
    if (!currentHotel?.id || config.metrics.length === 0) {
      toast.error("Please select at least one metric")
      return
    }

    try {
      const result = await generateCustomReport(
        currentHotel.id,
        startDate,
        endDate,
        config.metrics,
        config.dimensions,
        config.filters,
        config.sortBy,
        config.limit,
      )
      setReportResults(result)
      toast.success("Report generated successfully")
    } catch (error) {
      toast.error("Failed to generate report")
    }
  }

  // Save report configuration
  const handleSaveReport = () => {
    if (!config.name) {
      toast.error("Please enter a report name")
      return
    }

    const newReport = { ...config, id: Date.now().toString() }
    setSavedReports((prev) => [...prev, newReport])
    toast.success("Report configuration saved")
  }

  // Load saved report
  const handleLoadReport = (savedConfig: CustomReportConfig) => {
    setConfig(savedConfig)
    toast.success("Report configuration loaded")
  }

  // Add filter
  const addFilter = (key: string, value: any) => {
    setConfig((prev) => ({
      ...prev,
      filters: { ...prev.filters, [key]: value },
    }))
  }

  // Remove filter
  const removeFilter = (key: string) => {
    const newFilters = { ...config.filters }
    delete newFilters[key]
    setConfig((prev) => ({ ...prev, filters: newFilters }))
  }

  // Render chart based on type
  const renderChart = () => {
    if (!reportResults?.results) return null

    const data = reportResults.results.slice(0, 10) // Limit for visualization

    switch (config.chartType) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={config.dimensions[0] || "name"} />
              <YAxis />
              <Tooltip />
              <Legend />
              {config.metrics.map((metric, index) => (
                <Bar key={metric} dataKey={metric} fill={`hsl(${index * 60}, 70%, 50%)`} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )

      case "line":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={config.dimensions[0] || "name"} />
              <YAxis />
              <Tooltip />
              <Legend />
              {config.metrics.map((metric, index) => (
                <Line
                  key={metric}
                  type="monotone"
                  dataKey={metric}
                  stroke={`hsl(${index * 60}, 70%, 50%)`}
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )

      case "pie":
        const pieData = data.map((item, index) => ({
          name: item[config.dimensions[0]] || `Item ${index + 1}`,
          value: item[config.metrics[0]] || 0,
        }))

        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 50%)`} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )

      default:
        return null
    }
  }

  const handleExportPDF = (reportType: string) => {
    if (reportResults) {
      exportReportToPDF(reportResults, reportType)
      toast.success("Report exported to PDF")
    } else {
      toast.error("No report to export")
    }
  }

  const handleExportExcel = (reportType: string) => {
    if (reportResults) {
      exportReportToExcel(reportResults, reportType)
      toast.success("Report exported to Excel")
    } else {
      toast.error("No report to export")
    }
  }

  const handleExportCSV = (reportType: string) => {
    if (reportResults) {
      exportReportToCSV(reportResults, reportType)
      toast.success("Report exported to CSV")
    } else {
      toast.error("No report to export")
    }
  }

  if (!currentHotel) {
    return <div>Please select a hotel to create custom reports</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Custom Report Builder</h1>
        <p className="text-muted-foreground">
          Create and customize detailed reports with specific metrics and dimensions
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Configuration Panel */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Report Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Basic Info */}
              <div className="space-y-2">
                <Label>Report Name</Label>
                <Input
                  placeholder="Enter report name"
                  value={config.name}
                  onChange={(e) => setConfig((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Enter report description"
                  value={config.description}
                  onChange={(e) => setConfig((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <Separator />

              {/* Date Range */}
              <div className="space-y-2">
                <Label>Date Range</Label>
                <div className="grid grid-cols-2 gap-2">
                  <DatePicker date={startDate} setDate={setStartDate} />
                  <DatePicker date={endDate} setDate={setEndDate} />
                </div>
              </div>

              <Separator />

              {/* Metrics Selection */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Metrics</Label>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {availableMetrics.map((metric) => (
                      <div key={metric.value} className="flex items-start space-x-2">
                        <Checkbox
                          id={metric.value}
                          checked={config.metrics.includes(metric.value)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setConfig((prev) => ({ ...prev, metrics: [...prev.metrics, metric.value] }))
                            } else {
                              setConfig((prev) => ({
                                ...prev,
                                metrics: prev.metrics.filter((m) => m !== metric.value),
                              }))
                            }
                          }}
                        />
                        <div className="grid gap-1.5 leading-none">
                          <Label htmlFor={metric.value} className="text-sm font-medium">
                            {metric.label}
                          </Label>
                          <p className="text-xs text-muted-foreground">{metric.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <Separator />

              {/* Dimensions Selection */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Dimensions</Label>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {availableDimensions.map((dimension) => (
                      <div key={dimension.value} className="flex items-start space-x-2">
                        <Checkbox
                          id={dimension.value}
                          checked={config.dimensions.includes(dimension.value)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setConfig((prev) => ({ ...prev, dimensions: [...prev.dimensions, dimension.value] }))
                            } else {
                              setConfig((prev) => ({
                                ...prev,
                                dimensions: prev.dimensions.filter((d) => d !== dimension.value),
                              }))
                            }
                          }}
                        />
                        <div className="grid gap-1.5 leading-none">
                          <Label htmlFor={dimension.value} className="text-sm font-medium">
                            {dimension.label}
                          </Label>
                          <p className="text-xs text-muted-foreground">{dimension.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <Separator />

              {/* Filters */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Filters</Label>
                <div className="space-y-2">
                  {Object.entries(config.filters).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">
                        {key}: {value}
                      </span>
                      <Button variant="ghost" size="sm" onClick={() => removeFilter(key)}>
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Select
                  onValueChange={(value) => {
                    const option = filterOptions.find((f) => f.key === value)
                    if (option) {
                      addFilter(value, option.type === "number" ? 0 : "")
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Add filter" />
                  </SelectTrigger>
                  <SelectContent>
                    {filterOptions
                      .filter((f) => !config.filters[f.key])
                      .map((filter) => (
                        <SelectItem key={filter.key} value={filter.key}>
                          {filter.label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Chart Configuration */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Visualization</Label>
                <div className="space-y-2">
                  <div className="space-y-2">
                    <Label>Chart Type</Label>
                    <Select
                      value={config.chartType}
                      onValueChange={(value: any) => setConfig((prev) => ({ ...prev, chartType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bar">Bar Chart</SelectItem>
                        <SelectItem value="line">Line Chart</SelectItem>
                        <SelectItem value="pie">Pie Chart</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Sort By</Label>
                    <Select
                      value={config.sortBy}
                      onValueChange={(value) => setConfig((prev) => ({ ...prev, sortBy: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {config.metrics.map((metric) => (
                          <SelectItem key={metric} value={metric}>
                            {metric.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Limit Results</Label>
                    <Input
                      type="number"
                      value={config.limit}
                      onChange={(e) =>
                        setConfig((prev) => ({ ...prev, limit: Number.parseInt(e.target.value) || 100 }))
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Actions */}
              <div className="space-y-2">
                <Button
                  onClick={handleGenerateReport}
                  disabled={loading || config.metrics.length === 0}
                  className="w-full"
                >
                  <Play className="h-4 w-4 mr-2" />
                  {loading ? "Generating..." : "Generate Report"}
                </Button>
                <Button onClick={handleSaveReport} variant="outline" className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Save Configuration
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Saved Reports */}
          {savedReports.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Saved Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {savedReports.map((report, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <div className="font-medium text-sm">{report.name}</div>
                          <div className="text-xs text-muted-foreground">{report.description}</div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleLoadReport(report)}>
                          Load
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-4">
          {reportResults ? (
            <>
              {/* Report Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{config.name || "Custom Report"}</span>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleExportPDF("custom")}>
                        <Download className="h-4 w-4 mr-2" />
                        PDF
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleExportExcel("custom")}>
                        <Download className="h-4 w-4 mr-2" />
                        Excel
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleExportCSV("custom")}>
                        <Download className="h-4 w-4 mr-2" />
                        CSV
                      </Button>
                    </div>
                  </CardTitle>
                  <CardDescription>
                    {config.description} • {reportResults.results?.length || 0} results
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{reportResults.results?.length || 0}</div>
                      <div className="text-sm text-muted-foreground">Total Records</div>
                    </div>
                    {config.metrics.slice(0, 3).map((metric) => {
                      const total =
                        reportResults.results?.reduce((sum: number, item: any) => sum + (item[metric] || 0), 0) || 0
                      return (
                        <div key={metric} className="text-center">
                          <div className="text-2xl font-bold">{total.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground capitalize">{metric.replace(/_/g, " ")}</div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Chart Visualization */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {config.chartType === "bar" && <BarChart3 className="h-5 w-5" />}
                    {config.chartType === "line" && <TrendingUp className="h-5 w-5" />}
                    {config.chartType === "pie" && <PieChartIcon className="h-5 w-5" />}
                    Data Visualization
                  </CardTitle>
                </CardHeader>
                <CardContent>{renderChart()}</CardContent>
              </Card>

              {/* Data Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2">
                      {reportResults.results?.map((result: any, index: number) => (
                        <div key={index} className="grid gap-2 p-3 border rounded-lg">
                          {Object.entries(result).map(([key, value]) => (
                            <div key={key} className="flex justify-between text-sm">
                              <span className="font-medium capitalize">{key.replace(/_/g, " ")}:</span>
                              <span>{typeof value === "number" ? value.toLocaleString() : (value as string)}</span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-[400px]">
                <div className="text-center">
                  <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Configure Your Report</h3>
                  <p className="text-muted-foreground">
                    Select metrics and dimensions from the configuration panel to generate your custom report.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
