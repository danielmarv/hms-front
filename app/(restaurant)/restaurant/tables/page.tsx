"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Search, Edit, Trash2, Users, Clock, CheckCircle, AlertCircle, XCircle } from "lucide-react"
import Link from "next/link"
import { useTables } from "@/hooks/use-tables"
import { toast } from "sonner"

export default function TablesPage() {
  const { getTables, deleteTable, updateTableStatus, loading } = useTables()
  const [tables, setTables] = useState<any[]>([])
  const [filteredTables, setFilteredTables] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    loadTables()
  }, [])

  useEffect(() => {
    filterTables()
  }, [tables, searchTerm, statusFilter])

  const loadTables = async () => {
    try {
      const response = await getTables()
      if (response?.data && Array.isArray(response.data)) {
        setTables(response.data)
      }
    } catch (error) {
      console.error("Error loading tables:", error)
      toast.error("Failed to load tables")
    }
  }

  const filterTables = () => {
    let filtered = tables

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (table) =>
          table.number.toString().includes(searchTerm) ||
          table.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          table.assignedServer?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((table) => table.status === statusFilter)
    }

    setFilteredTables(filtered)
  }

  const handleDelete = async (id: string, number: string) => {
    if (window.confirm(`Are you sure you want to delete Table ${number}?`)) {
      const success = await deleteTable(id)
      if (success) {
        await loadTables()
      }
    }
  }

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await updateTableStatus(id, newStatus)
      await loadTables()
    } catch (error) {
      console.error("Error updating table status:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      available: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      occupied: { color: "bg-red-100 text-red-800", icon: Users },
      reserved: { color: "bg-blue-100 text-blue-800", icon: Clock },
      cleaning: { color: "bg-yellow-100 text-yellow-800", icon: AlertCircle },
      maintenance: { color: "bg-gray-100 text-gray-800", icon: XCircle },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.available
    const Icon = config.icon

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getTablesByStatus = (status: string) => {
    return tables.filter((table) => table.status === status)
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-4 w-[400px]" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-4 w-[80px]" />
                  <Skeleton className="h-4 w-[120px]" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Table Management</h1>
          <p className="text-muted-foreground">Manage restaurant tables and their current status</p>
        </div>
        <Button asChild>
          <Link href="/restaurant/tables/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Table
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Total Tables</p>
                <p className="text-2xl font-bold">{tables.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-2xl font-bold">{getTablesByStatus("available").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Occupied</p>
                <p className="text-2xl font-bold">{getTablesByStatus("occupied").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Reserved</p>
                <p className="text-2xl font-bold">{getTablesByStatus("reserved").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">Cleaning</p>
                <p className="text-2xl font-bold">{getTablesByStatus("cleaning").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search tables by number, location, or server..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="occupied">Occupied</SelectItem>
                <SelectItem value="reserved">Reserved</SelectItem>
                <SelectItem value="cleaning">Cleaning</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tables Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredTables.length > 0 ? (
          filteredTables.map((table) => (
            <Card key={table._id} className="relative">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Table {table.number}</h3>
                    {getStatusBadge(table.status)}
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Capacity:</span>
                      <span className="font-medium">{table.capacity} guests</span>
                    </div>

                    {table.location && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Location:</span>
                        <span className="font-medium">{table.location}</span>
                      </div>
                    )}

                    {table.currentGuests > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Current Guests:</span>
                        <span className="font-medium">{table.currentGuests}</span>
                      </div>
                    )}

                    {table.assignedServer && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Server:</span>
                        <span className="font-medium">{table.assignedServer}</span>
                      </div>
                    )}

                    {table.reservationName && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Reserved for:</span>
                        <span className="font-medium">{table.reservationName}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Select value={table.status} onValueChange={(value) => handleStatusUpdate(table._id, value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="occupied">Occupied</SelectItem>
                        <SelectItem value="reserved">Reserved</SelectItem>
                        <SelectItem value="cleaning">Cleaning</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link href={`/restaurant/tables/${table._id}/edit`}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(table._id, table.number)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="col-span-full">
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tables found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== "all"
                  ? "No tables match your current filters."
                  : "Start by adding your first table."}
              </p>
              <Button asChild>
                <Link href="/restaurant/tables/new">Add Table</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
