"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { KITCHEN_ORDER_STATUS, PRIORITY_LEVELS, ORDER_TYPES } from "@/config/constants"

interface KitchenOrderFilterProps {
  onFilterChange: (filters: Record<string, any>) => void
}

export function KitchenOrderFilter({ onFilterChange }: KitchenOrderFilterProps) {
  const [filters, setFilters] = useState<Record<string, any>>({})
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value }

    // Remove filter if value is empty or "all"
    if (value === "" || value === "all") {
      delete newFilters[key]
    }

    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleDateRangeChange = (range: { from?: Date; to?: Date }) => {
    setDateRange(range)

    const newFilters = { ...filters }

    if (range.from) {
      newFilters.startDate = format(range.from, "yyyy-MM-dd")
    } else {
      delete newFilters.startDate
    }

    if (range.to) {
      newFilters.endDate = format(range.to, "yyyy-MM-dd")
    } else {
      delete newFilters.endDate
    }

    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const resetFilters = () => {
    setFilters({})
    setDateRange({})
    onFilterChange({})
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={filters.status || "all"} onValueChange={(value) => handleFilterChange("status", value)}>
              <SelectTrigger id="status">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value={KITCHEN_ORDER_STATUS.PENDING}>Pending</SelectItem>
                <SelectItem value={KITCHEN_ORDER_STATUS.COOKING}>Cooking</SelectItem>
                <SelectItem value={KITCHEN_ORDER_STATUS.READY}>Ready</SelectItem>
                <SelectItem value={KITCHEN_ORDER_STATUS.COMPLETED}>Completed</SelectItem>
                <SelectItem value={KITCHEN_ORDER_STATUS.CANCELLED}>Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select value={filters.priority || "all"} onValueChange={(value) => handleFilterChange("priority", value)}>
              <SelectTrigger id="priority">
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value={PRIORITY_LEVELS.HIGH}>High</SelectItem>
                <SelectItem value={PRIORITY_LEVELS.NORMAL}>Normal</SelectItem>
                <SelectItem value={PRIORITY_LEVELS.LOW}>Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="orderType">Order Type</Label>
            <Select
              value={filters.orderType || "all"}
              onValueChange={(value) => handleFilterChange("orderType", value)}
            >
              <SelectTrigger id="orderType">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value={ORDER_TYPES.DINE_IN}>Dine In</SelectItem>
                <SelectItem value={ORDER_TYPES.TAKEAWAY}>Takeaway</SelectItem>
                <SelectItem value={ORDER_TYPES.DELIVERY}>Delivery</SelectItem>
                <SelectItem value={ORDER_TYPES.ROOM_SERVICE}>Room Service</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Date Range</Label>
            <DateRangePicker value={dateRange} onChange={handleDateRangeChange} />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button variant="outline" onClick={resetFilters}>
            Reset Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
