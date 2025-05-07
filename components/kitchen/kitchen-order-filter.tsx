"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Search, Filter, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import { DatePicker } from "@/components/ui/date-picker"

interface KitchenOrderFilterProps {
  onFilterChange: (filters: any) => void
}

export function KitchenOrderFilter({ onFilterChange }: KitchenOrderFilterProps) {
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [priority, setPriority] = useState("")
  const [orderType, setOrderType] = useState("")
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [activeFilters, setActiveFilters] = useState<string[]>([])

  // Apply filters when any filter changes
  useEffect(() => {
    const filters: Record<string, any> = {}

    if (status) filters.status = status
    if (priority) filters.priority = priority
    if (orderType) filters.orderType = orderType
    if (startDate) filters.startDate = startDate.toISOString().split("T")[0]
    if (endDate) filters.endDate = endDate.toISOString().split("T")[0]

    // Update active filters for display
    const active = []
    if (status) active.push(`Status: ${status}`)
    if (priority) active.push(`Priority: ${priority}`)
    if (orderType) active.push(`Type: ${orderType}`)
    if (startDate) active.push(`From: ${startDate.toLocaleDateString()}`)
    if (endDate) active.push(`To: ${endDate.toLocaleDateString()}`)

    setActiveFilters(active)
    onFilterChange(filters)
  }, [status, priority, orderType, startDate, endDate, onFilterChange])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // You can implement search functionality here
    console.log("Searching for:", search)
  }

  const clearFilters = () => {
    setStatus("")
    setPriority("")
    setOrderType("")
    setStartDate(undefined)
    setEndDate(undefined)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search orders..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button type="submit">Search</Button>
        </form>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="flex gap-2">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
              {activeFilters.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFilters.length}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filter Orders</SheetTitle>
              <SheetDescription>Apply filters to narrow down kitchen orders</SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Ready">Ready</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Normal">Normal</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="orderType">Order Type</Label>
                <Select value={orderType} onValueChange={setOrderType}>
                  <SelectTrigger id="orderType">
                    <SelectValue placeholder="Select order type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Dine In">Dine In</SelectItem>
                    <SelectItem value="Takeaway">Takeaway</SelectItem>
                    <SelectItem value="Delivery">Delivery</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date Range</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="startDate" className="text-xs">
                      From
                    </Label>
                    <DatePicker date={startDate} setDate={setStartDate} className="w-full" />
                  </div>
                  <div>
                    <Label htmlFor="endDate" className="text-xs">
                      To
                    </Label>
                    <DatePicker date={endDate} setDate={setEndDate} className="w-full" />
                  </div>
                </div>
              </div>
            </div>
            <SheetFooter>
              <Button variant="outline" onClick={clearFilters} type="button">
                Reset Filters
              </Button>
              <SheetClose asChild>
                <Button type="submit">Apply Filters</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              {filter}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => {
                  // Remove this specific filter
                  if (filter.startsWith("Status:")) setStatus("")
                  if (filter.startsWith("Priority:")) setPriority("")
                  if (filter.startsWith("Type:")) setOrderType("")
                  if (filter.startsWith("From:")) setStartDate(undefined)
                  if (filter.startsWith("To:")) setEndDate(undefined)
                }}
              />
            </Badge>
          ))}
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 px-2">
            Clear all
          </Button>
        </div>
      )}
    </div>
  )
}
