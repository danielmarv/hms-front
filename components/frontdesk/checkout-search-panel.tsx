"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { EmptyState } from "@/components/ui/empty-state"
import { Search, Calendar, Users, Clock } from "lucide-react"
import { format, differenceInDays } from "date-fns"

interface CheckOutSearchPanelProps {
  checkIns: any[]
  onCheckInSelect: (checkIn: any) => void
  isLoading: boolean
}

export function CheckOutSearchPanel({ checkIns, onCheckInSelect, isLoading }: CheckOutSearchPanelProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState({
    overdue: false,
    vip: false,
  })

  const filteredCheckIns = checkIns.filter((checkIn) => {
    const matchesSearch =
      checkIn.guest?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      checkIn.guest?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      checkIn.guest?.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      checkIn.room?.roomNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      checkIn.folio_number?.toLowerCase().includes(searchQuery.toLowerCase())

    const isOverdue = new Date() > new Date(checkIn.expected_check_out)
    const matchesOverdue = !filters.overdue || isOverdue
    const matchesVip = !filters.vip || checkIn.guest?.vip

    return matchesSearch && matchesOverdue && matchesVip
  })

  const getStatusBadge = (checkIn: any) => {
    const isOverdue = new Date() > new Date(checkIn.expected_check_out)
    const isToday = format(new Date(), "yyyy-MM-dd") === format(new Date(checkIn.expected_check_out), "yyyy-MM-dd")

    if (isOverdue) {
      return <Badge className="bg-red-100 text-red-800">Overdue</Badge>
    } else if (isToday) {
      return <Badge className="bg-yellow-100 text-yellow-800">Due Today</Badge>
    } else {
      return <Badge className="bg-green-100 text-green-800">Active</Badge>
    }
  }

  const calculateStayDuration = (checkIn: any) => {
    const checkInDate = new Date(checkIn.check_in_date)
    const today = new Date()
    return differenceInDays(today, checkInDate) + 1
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Find Guest to Check Out</CardTitle>
          <CardDescription>Search for guests currently checked in</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Find Guest to Check Out</CardTitle>
        <CardDescription>Search for guests currently checked in and ready for departure</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, phone, room number, or folio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.overdue}
              onChange={(e) => setFilters((prev) => ({ ...prev, overdue: e.target.checked }))}
              className="rounded"
            />
            <span className="text-sm">Overdue Only</span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.vip}
              onChange={(e) => setFilters((prev) => ({ ...prev, vip: e.target.checked }))}
              className="rounded"
            />
            <span className="text-sm">VIP Only</span>
          </label>
        </div>

        {/* Check-ins List */}
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {filteredCheckIns.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No check-ins found"
              description="Try adjusting your search criteria or filters"
            />
          ) : (
            filteredCheckIns.map((checkIn) => (
              <div
                key={checkIn.id || checkIn._id}
                className="p-4 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50"
                onClick={() => onCheckInSelect(checkIn)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={checkIn.guest?.avatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        {checkIn.guest?.full_name
                          ?.split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{checkIn.guest?.full_name}</h3>
                      <p className="text-sm text-muted-foreground font-mono">
                        Room {checkIn.room?.roomNumber} • Folio {checkIn.folio_number}
                      </p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Checked in: {format(new Date(checkIn.check_in_date), "MMM dd")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {calculateStayDuration(checkIn)} nights
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {checkIn.number_of_guests} guests
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {getStatusBadge(checkIn)}
                    {checkIn.guest?.vip && (
                      <Badge variant="outline" className="text-xs bg-purple-100 text-purple-800">
                        VIP
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t">
                  <div className="flex justify-between items-center">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Expected checkout: </span>
                      <span className="font-medium">
                        {format(new Date(checkIn.expected_check_out), "MMM dd, yyyy")}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Balance: </span>
                      <span className="font-bold text-lg">
                        ${(checkIn.balance_due || checkIn.total_amount || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  {checkIn.special_requests && (
                    <p className="text-xs text-muted-foreground mt-1">{checkIn.special_requests}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
