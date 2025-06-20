"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { DatePicker } from "@/components/ui/date-picker"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Calendar, TrendingUp, Users, DollarSign, Building, Star, Target, Activity, BarChart3 } from "lucide-react"
import { format, subMonths, subDays } from "date-fns"
import { toast } from "sonner"
import Link from "next/link"

export default function EventReportsPage() {
  const { currentHotel } = useCurrentHotel()
  const {
    getEventsSummaryReport,
    getRevenueAnalysisReport,
    getVenueUtilizationReport,
    getStaffPerformanceReport,
    getServicePopularityReport,
    getCustomerSatisfactionReport,
    getDashboardData,
    getKPIs,
    loading,
    error,
  } = useEventReports(currentHotel?.id)

  // State for date range
  const [dateRange, setDateRange] = useState("last30days")
  const [startDate, setStartDate] = useState<Date | undefined>(subDays(new Date(), 30))
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

  // Handle date range presets
  const handleDateRangeChange = (range: string) => {
    setDateRange(range)
    const now = new Date()

    switch (range) {
      case "last7days":
        setStartDate(subDays(now, 7))
        setEndDate(now)
        break
      case "last30days":
        setStartDate(subDays(now, 30))
        setEndDate(now)
        break
      case "last3months":
        setStartDate(subMonths(now, 3))
        setEndDate(now)
        break
      case "last6months":
        setStartDate(subMonths(now, 6))
        setEndDate(now)
        break
      case "lastyear":
        setStartDate(subMonths(now, 12))
        setEndDate(now)
        break
      case "custom":
        // Keep current dates for custom range
        break
    }
  }

  // Load all reports
  const loadReports = async () => {
    if (!currentHotel?.id || !startDate || !endDate) return

    try {
      const [summary, revenue, venue, staff, service, satisfaction, dashboard, kpis] = await Promise.all([
        getEventsSummaryReport(currentHotel.id, startDate, endDate),
        getRevenueAnalysisReport(currentHotel.id, startDate, endDate, "month"),
        getVenueUtilizationReport(currentHotel.id, startDate, endDate),
        getStaffPerformanceReport(currentHotel.id, startDate, endDate),
        getServicePopularityReport(currentHotel.id, startDate, endDate),
        getCustomerSatisfactionReport(currentHotel.id, startDate, endDate),
        getDashboardData(currentHotel.id),
        getKPIs(currentHotel.id),
      ])

      setSummaryReport(summary)
      setRevenueReport(revenue)
      setVenueReport(venue)
      setStaffReport(staff)
      setServiceReport(service)
      setSatisfactionReport(satisfaction)
      setDashboardData(dashboard)
      setKpiData(kpis)
    } catch (error) {
      toast.error("Failed to load reports")
    }
  }

  useEffect(() => {
    loadReports()
  }, [currentHotel?.id, startDate, endDate])

  if (!currentHotel) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No Hotel Selected</h3>
          <p className="text-muted-foreground">Please select a hotel to view event reports</p>
        </div>
      </div>
    )
  }

  const COLORS = ["#3498db", "#e74c3c", "#2ecc71", "#f39c12", "#9b59b6", "#1abc9c"]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Event Reports</h1>
          <p className="text-muted-foreground">Comprehensive analytics and insights for {currentHotel.name}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Link href="/dashboard/events/reports/advanced">
            <Button variant="outline">
              <BarChart3 className="h-4 w-4 mr-2" />
              Advanced Reports
            </Button>
          </Link>
          <Button onClick={loadReports} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </Button>
        </div>
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
              <Label>Quick Select</Label>
              <Select value={dateRange} onValueChange={handleDateRangeChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last7days">Last 7 days</SelectItem>
                  <SelectItem value="last30days">Last 30 days</SelectItem>
                  <SelectItem value="last3months">Last 3 months</SelectItem>
                  <SelectItem value="last6months">Last 6 months</SelectItem>
                  <SelectItem value="lastyear">Last year</SelectItem>
                  <SelectItem value="custom">Custom range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {dateRange === "custom" && (
              <>
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <DatePicker date={startDate} setDate={setStartDate} />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <DatePicker date={endDate} setDate={setEndDate} />
                </div>
              </>
            )}
            <div className="text-sm text-muted-foreground">
              {startDate && endDate && (
                <>
                  {format(startDate, "MMM dd, yyyy")} - {format(endDate, "MMM dd, yyyy")}
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <Activity className="h-4 w-4" />
              <span>Error loading reports: {error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI Overview */}
      {dashboardData && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.dashboard_data?.total_events || 0}</div>
              <p className="text-xs text-muted-foreground">
                {dashboardData.dashboard_data?.confirmed_events || 0} confirmed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${(dashboardData.dashboard_data?.total_revenue || 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Event revenue</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Attendees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.dashboard_data?.avg_attendees || 0}</div>
              <p className="text-xs text-muted-foreground">Per event</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summaryReport
                  ? Math.round((summaryReport.summary.confirmed_events / summaryReport.summary.total_events) * 100)
                  : 0}
                %
              </div>
              <p className="text-xs text-muted-foreground">Event confirmation rate</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="venues">Venues</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
          <TabsTrigger value="satisfaction">Satisfaction</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Events Summary */}
            {summaryReport && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Events Summary
                  </CardTitle>
                  <CardDescription>
                    {format(summaryReport.date_range.start, "MMM dd")} -{" "}
                    {format(summaryReport.date_range.end, "MMM dd, yyyy")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Events</span>
                    <span className="text-2xl font-bold">{summaryReport.summary.total_events}</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Confirmed</span>
                      <span className="font-medium text-green-600">{summaryReport.summary.confirmed_events}</span>
                    </div>
                    <Progress
                      value={(summaryReport.summary.confirmed_events / summaryReport.summary.total_events) * 100}
                      className="h-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Cancelled</span>
                      <span className="font-medium text-red-600">{summaryReport.summary.cancelled_events}</span>
                    </div>
                    <Progress
                      value={(summaryReport.summary.cancelled_events / summaryReport.summary.total_events) * 100}
                      className="h-2"
                    />
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Cancellation Rate</span>
                      <Badge
                        variant={
                          Number.parseFloat(summaryReport.summary.cancellation_rate) > 20 ? "destructive" : "secondary"
                        }
                      >
                        {summaryReport.summary.cancellation_rate}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Revenue</span>
                    <span className="text-lg font-bold text-green-600">
                      ${summaryReport.summary.total_revenue?.toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Customer Satisfaction Overview */}
            {satisfactionReport && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Customer Satisfaction
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-500">
                      {satisfactionReport.summary.overall_rating}
                    </div>
                    <div className="text-sm text-muted-foreground">Overall Rating</div>
                    <div className="text-xs text-muted-foreground">
                      Based on {satisfactionReport.summary.total_feedback} reviews
                    </div>
                  </div>

                  <div className="space-y-3">
                    {Object.entries(satisfactionReport.summary.category_ratings).map(([category, rating]) => (
                      <div key={category} className="flex justify-between items-center">
                        <span className="text-sm capitalize">{category.replace(/_/g, " ")}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{rating as string}</span>
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Service Popularity */}
          {serviceReport && (
            <Card>
              <CardHeader>
                <CardTitle>Service Popularity</CardTitle>
                <CardDescription>Most requested services and their performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {serviceReport.services.slice(0, 5).map((service: any, index: number) => (
                    <div key={service.service_id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{service.service_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {service.booking_count} bookings ({service.booking_percentage})
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">${service.total_revenue?.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">Qty: {service.total_quantity}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-4">
          {revenueReport && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Revenue Analysis
                </CardTitle>
                <CardDescription>Revenue trends over time ({revenueReport.group_by} view)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueReport.data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip
                        formatter={(value, name) => [
                          name === "revenue" ? `$${value.toLocaleString()}` : value,
                          name === "revenue" ? "Revenue" : "Events",
                        ]}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" stroke="#3498db" strokeWidth={3} name="Revenue" />
                      <Line type="monotone" dataKey="count" stroke="#e74c3c" strokeWidth={2} name="Event Count" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      ${revenueReport.total_revenue?.toLocaleString()}
                    </div>
                    <div className="text-sm text-blue-600">Total Revenue</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{revenueReport.total_events}</div>
                    <div className="text-sm text-red-600">Total Events</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Venues Tab */}
        <TabsContent value="venues" className="space-y-4">
          {venueReport && (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Venues</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{venueReport.summary.total_venues}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Overall Utilization</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{venueReport.summary.overall_utilization_rate}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Revenue per Hour</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${venueReport.summary.revenue_per_hour?.toFixed(2)}</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Venue Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={venueReport.venues} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="name" width={120} />
                        <Tooltip
                          formatter={(value, name) => [
                            name === "revenue"
                              ? `$${value.toLocaleString()}`
                              : name === "utilization_rate"
                                ? `${value}`
                                : value,
                            name === "revenue" ? "Revenue" : name === "utilization_rate" ? "Utilization" : name,
                          ]}
                        />
                        <Legend />
                        <Bar dataKey="revenue" fill="#3498db" name="Revenue" />
                        <Bar dataKey="events" fill="#e74c3c" name="Events" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Venue Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {venueReport.venues.map((venue: any) => (
                      <div key={venue.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-semibold">{venue.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {venue.type} • Capacity: {venue.capacity}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {venue.events} events • {venue.total_duration}h total
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{venue.utilization_rate}</div>
                          <div className="text-sm text-muted-foreground">${venue.revenue?.toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Staff Tab */}
        <TabsContent value="staff" className="space-y-4">
          {staffReport && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Staff Performance
                </CardTitle>
                <CardDescription>Staff assignments and performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {staffReport.staff_performance.map((staff: any, index: number) => (
                    <div key={staff._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-semibold">{staff.staff_name}</div>
                          <div className="text-sm text-muted-foreground">{staff.role}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{staff.events_assigned} events</div>
                        <div className="text-sm text-muted-foreground">
                          {staff.total_hours}h • ${staff.total_cost?.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Satisfaction Tab */}
        <TabsContent value="satisfaction" className="space-y-4">
          {satisfactionReport && (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Rating Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
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
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Venue Ratings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {satisfactionReport.venue_ratings.map((venue: any) => (
                      <div key={venue.id} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{venue.name}</div>
                          <div className="text-sm text-muted-foreground">{venue.count} reviews</div>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-semibold">{venue.rating}</span>
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Event Type Ratings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {satisfactionReport.event_type_ratings.map((eventType: any) => (
                      <div key={eventType.id} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{eventType.name}</div>
                          <div className="text-sm text-muted-foreground">{eventType.count} reviews</div>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-semibold">{eventType.rating}</span>
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={satisfactionReport.monthly_ratings}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis domain={[0, 5]} />
                        <Tooltip />
                        <Line type="monotone" dataKey="rating" stroke="#f39c12" strokeWidth={2} name="Rating" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
