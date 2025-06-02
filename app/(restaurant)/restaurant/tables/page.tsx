"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Users, Clock, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useTables } from "@/hooks/use-tables"
import { toast } from "sonner"

// Import consistent components
import { PageHeader } from "@/components/ui/page-header"
import { StatsGrid, StatCard } from "@/components/ui/stats-grid"
import { FilterBar } from "@/components/ui/filter-bar"
import { StatusBadge } from "@/components/ui/status-badge"
import { EmptyState } from "@/components/ui/empty-state"
import { LoadingSkeleton } from "@/components/ui/loading-skeleton"
import { Card, CardContent } from "@/components/ui/card"

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

    if (searchTerm) {
      filtered = filtered.filter(
        (table) =>
          table.number.toString().includes(searchTerm) ||
          table.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          table.assignedServer?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

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

  const getTablesByStatus = (status: string) => {
    return tables.filter((table) => table.status === status)
  }

  const calculateStats = () => {
    return {
      total: tables.length,
      available: getTablesByStatus("available").length,
      occupied: getTablesByStatus("occupied").length,
      reserved: getTablesByStatus("reserved").length,
      cleaning: getTablesByStatus("cleaning").length,
    }
  }

  const stats = calculateStats()

  if (loading) {
    return <LoadingSkeleton variant="page" />
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <PageHeader
        title="Table Management"
        description="Manage restaurant tables and their current status"
        action={
          <Button asChild>
            <Link href="/restaurant/tables/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Table
            </Link>
          </Button>
        }
      />

      {/* Stats */}
      <StatsGrid className="md:grid-cols-5">
        <StatCard title="Total Tables" value={stats.total} icon={Users} />
        <StatCard title="Available" value={stats.available} icon={CheckCircle} />
        <StatCard title="Occupied" value={stats.occupied} icon={Users} />
        <StatCard title="Reserved" value={stats.reserved} icon={Clock} />
        <StatCard title="Cleaning" value={stats.cleaning} icon={AlertCircle} />
      </StatsGrid>

      {/* Filters */}
      <FilterBar
        searchPlaceholder="Search tables by number, location, or server..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        filters={[
          {
            placeholder: "Filter by status",
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: "all", label: "All Statuses" },
              { value: "available", label: "Available" },
              { value: "occupied", label: "Occupied" },
              { value: "reserved", label: "Reserved" },
              { value: "cleaning", label: "Cleaning" },
              { value: "maintenance", label: "Maintenance" },
            ],
          },
        ]}
      />

      {/* Tables Grid */}
      {filteredTables.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredTables.map((table) => (
            <Card key={table._id}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Table {table.number}</h3>
                    <StatusBadge status={table.status} variant={table.status} />
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
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Users}
          title="No tables found"
          description={
            searchTerm || statusFilter !== "all"
              ? "No tables match your current filters."
              : "Start by adding your first table."
          }
          action={{
            label: "Add Table",
            href: "/restaurant/tables/new",
          }}
        />
      )}
    </div>
  )
}
