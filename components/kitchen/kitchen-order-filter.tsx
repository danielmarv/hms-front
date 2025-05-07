"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { format } from "date-fns"
import { Search, Filter, X } from "lucide-react"
import { PRIORITY_LEVELS, ORDER_TYPES } from "@/config/constants"
import type { KitchenOrderFilters } from "@/types"

interface KitchenOrderFilterProps {
  onFilterChange: (filters: Partial<KitchenOrderFilters>) => void
}

export function KitchenOrderFilter({ onFilterChange }: KitchenOrderFilterProps) {
  const [orderNumber, setOrderNumber] = useState("")
  const [priority, setPriority] = useState<string | undefined>(undefined)
  const [orderType, setOrderType] = useState<string | undefined>(undefined)
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})
  const [showFilters, setShowFilters] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onFilterChange({ search: orderNumber })
  }

  const handlePriorityChange = (value: string) => {
    setPriority(value === "all" ? undefined : value)
    onFilterChange({ priority: value === "all" ? undefined : value })
  }

  const handleOrderTypeChange = (value: string) => {
    setOrderType(value === "all" ? undefined : value)
    onFilterChange({ orderType: value === "all" ? undefined : value })
  }

  const handleDateRangeChange = (range: { from?: Date; to?: Date }) => {
    setDateRange(range)
    onFilterChange({
      startDate: range.from ? format(range.from, "yyyy-MM-dd") : undefined,
      endDate: range.to ? format(range.to, "yyyy-MM-dd") : undefined,
    })
  }

  const resetFilters = () => {
    setOrderNumber("")
    setPriority(undefined)
    setOrderType(undefined)
    setDateRange({})
    onFilterChange({})
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2">
          <Input
            type="search"
            placeholder="Search order number..."
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
          />
          <Button type="submit">
            <Search className="h-4 w-4" />
          </Button>
        </form>
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="h-4 w-4 mr-2" />
          {showFilters ? "Hide Filters" : "Show Filters"}
        </Button>
      </div>

      {showFilters && (
        <div className="bg-muted/50 p-4 rounded-md">
          <div className="flex flex-wrap gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <Select value={priority || "all"} onValueChange={handlePriorityChange}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value={PRIORITY_LEVELS.HIGH}>High</SelectItem>
                  <SelectItem value={PRIORITY_LEVELS.MEDIUM}>Medium</SelectItem>
                  <SelectItem value={PRIORITY_LEVELS.LOW}>Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Order Type</label>
              <Select value={orderType || "all"} onValueChange={handleOrderTypeChange}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {ORDER_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <DateRangePicker value={dateRange} onChange={handleDateRangeChange} />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <Button variant="outline" size="sm" onClick={resetFilters}>
              <X className="h-4 w-4 mr-2" />
              Reset Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
