"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Mail, Phone, Filter, RefreshCcw } from "lucide-react"
import { useGuests, type Guest, type GuestFilters } from "@/hooks/use-guests"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

export default function GuestsPage() {
  const { getGuests, isLoading } = useGuests()
  const [guests, setGuests] = useState<Guest[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<GuestFilters>({
    page: 1,
    limit: 10,
    sort: "-createdAt",
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    total: 0,
  })
  const [isRefreshing, setIsRefreshing] = useState(false)

  const loadGuests = async () => {
    try {
      const response = await getGuests({
        ...filters,
        search: searchQuery,
      })

      if (response.data && Array.isArray(response.data.data)) {
        setGuests(response.data.data)
        setPagination({
          page: response.data.pagination?.page || 1,
          limit: response.data.pagination?.limit || 10,
          totalPages: response.data.pagination?.totalPages || 1,
          total: response.data.total || 0,
        })
      } else {
        // If response doesn't have the expected structure, set empty array
        setGuests([])
        console.error("Unexpected API response format:", response)
      }
    } catch (error) {
      console.error("Failed to load guests:", error)
      setGuests([]) // Ensure guests is an array even on error
    }
  }

  useEffect(() => {
    loadGuests()
  }, [filters])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setFilters({ ...filters, page: 1 })
    loadGuests()
  }

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page })
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadGuests()
    setIsRefreshing(false)
    toast.success("Guest list refreshed")
  }

  const handleFilterChange = (filterUpdate: Partial<GuestFilters>) => {
    setFilters({ ...filters, ...filterUpdate, page: 1 })
  }

  // Function to get badge variant based on status
  const getStatusBadge = (guest: Guest) => {
    if (guest.blacklisted) {
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          Blacklisted
        </Badge>
      )
    } else if (guest.vip) {
      return (
        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
          VIP
        </Badge>
      )
    } else if (guest.loyalty_program.member) {
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          {guest.loyalty_program.tier || "Loyalty Member"}
        </Badge>
      )
    }
    return null
  }

  // Format date to display in a more readable format
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Guests</h1>
          <p className="text-muted-foreground">Manage guest information and history</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCcw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="sr-only">Refresh</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
                <span className="sr-only">Filter</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Filter Guests</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => handleFilterChange({ vip: true })}>VIP Guests Only</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterChange({ blacklisted: true })}>
                  Blacklisted Guests
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterChange({ loyalty_member: true })}>
                  Loyalty Members
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleFilterChange({ sort: "-createdAt" })}>
                  Newest First
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterChange({ sort: "createdAt" })}>
                  Oldest First
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterChange({ sort: "full_name" })}>
                  Name (A-Z)
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setFilters({ page: 1, limit: 10, sort: "-createdAt" })}>
                Reset Filters
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button asChild>
            <Link href="/dashboard/guests/new">
              <Plus className="mr-2 h-4 w-4" />
              Register Guest
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>All Guests</CardTitle>
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search guests..."
              className="w-full pl-8 sm:w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Guest ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Contact</TableHead>
                  <TableHead className="hidden md:table-cell">Nationality</TableHead>
                  <TableHead className="hidden md:table-cell">Visits</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(5)
                    .fill(0)
                    .map((_, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Skeleton className="h-4 w-16" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-32" />
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-4 w-24" />
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Skeleton className="h-4 w-16" />
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Skeleton className="h-4 w-8" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-20" />
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Skeleton className="h-8 w-16 ml-auto" />
                        </TableCell>
                      </TableRow>
                    ))
                ) : !guests || guests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      No guests found.
                    </TableCell>
                  </TableRow>
                ) : (
                  guests.map((guest) => (
                    <TableRow key={guest._id}>
                      <TableCell className="font-medium">{guest._id.substring(0, 8)}</TableCell>
                      <TableCell>{guest.full_name}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex flex-col">
                          <div className="flex items-center text-sm">
                            <Mail className="mr-1 h-3 w-3" />
                            {guest.email || "N/A"}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Phone className="mr-1 h-3 w-3" />
                            {guest.phone || "N/A"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{guest.nationality || "N/A"}</TableCell>
                      <TableCell className="hidden md:table-cell">{guest.stay_history?.total_stays || 0}</TableCell>
                      <TableCell>{getStatusBadge(guest)}</TableCell>
                      <TableCell className="hidden md:table-cell">{formatDate(guest.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/guests/${guest._id}`}>View</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {guests.length} of {pagination.total} guests
            </div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (pagination.page > 1) handlePageChange(pagination.page - 1)
                    }}
                    className={pagination.page <= 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  // Show pages around the current page
                  let pageNum = i + 1
                  if (pagination.totalPages > 5) {
                    if (pagination.page > 3) {
                      pageNum = pagination.page - 3 + i
                    }
                    if (pagination.page > pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i
                    }
                  }
                  return (
                    <PaginationItem key={i}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          handlePageChange(pageNum)
                        }}
                        isActive={pageNum === pagination.page}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  )
                })}
                {pagination.totalPages > 5 && pagination.page < pagination.totalPages - 2 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (pagination.page < pagination.totalPages) handlePageChange(pagination.page + 1)
                    }}
                    className={pagination.page >= pagination.totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Add missing PaginationEllipsis component
function PaginationEllipsis() {
  return (
    <div className="flex h-9 w-9 items-center justify-center">
      <div className="h-4 w-4">...</div>
    </div>
  )
}
