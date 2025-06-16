"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Search, Mail, AlertCircle } from "lucide-react"
import { useUsers } from "@/hooks/use-users"
import { ApiTest } from "@/components/debug/api-test"

export default function StaffPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showDebug, setShowDebug] = useState(false)

  // Enhanced data fetching with error handling
  const { users, isLoading, error, fetchUsers } = useUsers()

  // Fetch users on component mount with error handling
  useEffect(() => {
    const loadStaff = async () => {
      try {
        console.log("Loading staff members...")
        await fetchUsers()
      } catch (err) {
        console.error("Error fetching staff:", err)
      }
    }

    loadStaff()
  }, [fetchUsers])

  // Add retry function
  const handleRetry = async () => {
    try {
      await fetchUsers()
    } catch (err) {
      console.error("Retry failed:", err)
    }
  }

  // Mock departments since the User model doesn't have department field
  const mockDepartments = ["management", "front_desk", "housekeeping", "food_service", "maintenance"]

  // Filter users based on search query and status filter
  const filteredStaff = (users || []).filter((staff) => {
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch =
      staff.full_name.toLowerCase().includes(searchLower) ||
      staff.email.toLowerCase().includes(searchLower) ||
      staff._id.toLowerCase().includes(searchLower)

    const matchesStatus = statusFilter === "all" || staff.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Function to get badge variant based on status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Active
          </Badge>
        )
      case "inactive":
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            Inactive
          </Badge>
        )
      case "on_leave":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            On Leave
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Function to format department name for display
  const formatDepartment = (department: string) => {
    return department
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  // Function to format role name for display
  const formatRole = (role: string | any) => {
    if (typeof role === "string") {
      return role.charAt(0).toUpperCase() + role.slice(1)
    }
    if (role && typeof role === "object" && role.name) {
      return role.name
    }
    return "Unknown"
  }

  // Function to get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
  }

  // Format date to display in a more readable format
  const formatDate = (dateString: string) => {
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
          <h1 className="text-3xl font-bold tracking-tight">Staff</h1>
          <p className="text-muted-foreground">Manage hotel staff and employees</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowDebug(!showDebug)}>
            {showDebug ? "Hide Debug" : "Show Debug"}
          </Button>
          <Button asChild>
            <Link href="/dashboard/staff/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Staff Member
            </Link>
          </Button>
        </div>
      </div>

      {showDebug && (
        <div className="mb-6">
          <ApiTest />
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-col gap-4 space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>All Staff Members</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search staff..."
                className="w-full pl-8 sm:w-[200px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="on_leave">On Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Contact</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="hidden md:table-cell">Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Join Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                        <span>Loading staff members...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      <div className="flex flex-col items-center space-y-3">
                        <AlertCircle className="h-8 w-8 text-red-500" />
                        <div className="text-center">
                          <p className="text-red-600 font-medium">Failed to load staff members</p>
                          <p className="text-sm text-gray-600 mt-1">{error}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={handleRetry}>
                            Try Again
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setShowDebug(true)}>
                            Show Debug Info
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : !users || users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      <div className="flex flex-col items-center space-y-2">
                        <p>No staff members found.</p>
                        <Button asChild variant="outline" size="sm">
                          <Link href="/dashboard/staff/new">Add First Staff Member</Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredStaff.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      No staff members match your search criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStaff.map((staff) => (
                    <TableRow key={staff._id}>
                      <TableCell className="font-medium">{staff._id.slice(-6).toUpperCase()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={`/placeholder.svg?height=32&width=32`} alt={staff.full_name} />
                            <AvatarFallback>{getInitials(staff.full_name)}</AvatarFallback>
                          </Avatar>
                          {staff.full_name}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex flex-col">
                          <div className="flex items-center text-sm">
                            <Mail className="mr-1 h-3 w-3" />
                            {staff.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{formatRole(staff.role)}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {formatDepartment(
                          staff.department || mockDepartments[Math.floor(Math.random() * mockDepartments.length)],
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(staff.status)}</TableCell>
                      <TableCell className="hidden md:table-cell">{formatDate(staff.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/staff/${staff._id}`}>View</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive>
                    1
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
