"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, Loader2, Tag } from "lucide-react"
import { useEventTypes } from "@/hooks/use-event-types"
import { toast } from "sonner"

export default function EventTypesPage() {
  const router = useRouter()
  const { eventTypes, loading, deleteEventType } = useEventTypes()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")

  // Filter event types based on search and filters
  const filteredEventTypes = eventTypes.filter((eventType) => {
    const matchesSearch =
      eventType.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (eventType.description || "").toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || eventType.status === statusFilter
    const matchesCategory = categoryFilter === "all" || eventType.category === categoryFilter

    return matchesSearch && matchesStatus && matchesCategory
  })

  // Get unique categories for filter
  const categories = Array.from(new Set(eventTypes.map((et) => et.category).filter(Boolean)))

  const handleDelete = async (id: string, name: string) => {
    try {
      await deleteEventType(id)
      toast.success(`Event type "${name}" deleted successfully`)
    } catch (error) {
      toast.error("Failed to delete event type")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-200">
            Active
          </Badge>
        )
      case "inactive":
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-200">
            Inactive
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatPrice = (price: number | undefined) => {
    return price ? `$${price.toFixed(2)}` : "N/A"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-indigo-900 dark:to-purple-900">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600 dark:text-indigo-400" />
          <p className="text-lg font-medium text-slate-700 dark:text-slate-300">Loading event types...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-indigo-900 dark:to-purple-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 dark:border-slate-700/20">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              Event Types
            </h1>
            <p className="text-slate-600 dark:text-slate-300 mt-2 text-lg">Manage different types of events</p>
          </div>
          <Button
            asChild
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 dark:from-indigo-600 dark:to-purple-700 dark:hover:from-indigo-700 dark:hover:to-purple-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            size="lg"
          >
            <Link href="/dashboard/events/event-types/new">
              <Plus className="mr-2 h-5 w-5" />
              New Event Type
            </Link>
          </Button>
        </div>

        {/* Main Content */}
        <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-slate-700 to-slate-800 dark:from-slate-800 dark:to-slate-900 text-white rounded-t-lg">
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
              <CardTitle className="flex items-center text-xl">
                <Tag className="mr-2 h-5 w-5" />
                All Event Types
              </CardTitle>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    type="search"
                    placeholder="Search event types..."
                    className="w-full pl-8 sm:w-[200px] bg-white/10 border-white/20 text-white placeholder:text-slate-300 focus:bg-white/20"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[150px] bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full sm:w-[150px] bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filteredEventTypes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-full p-6 mb-4">
                  <Tag className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">No event types found.</p>
                <p className="text-slate-500 dark:text-slate-500 text-sm mt-1">
                  Create your first event type to get started
                </p>
                <Button variant="outline" className="mt-6 border-2 hover:bg-indigo-50 dark:hover:bg-indigo-900" asChild>
                  <Link href="/dashboard/events/event-types/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Event Type
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600">
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-200">Name</TableHead>
                      <TableHead className="hidden md:table-cell font-semibold text-slate-700 dark:text-slate-200">
                        Category
                      </TableHead>
                      <TableHead className="hidden md:table-cell font-semibold text-slate-700 dark:text-slate-200">
                        Base Price
                      </TableHead>
                      <TableHead className="hidden lg:table-cell font-semibold text-slate-700 dark:text-slate-200">
                        Duration
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-200">Status</TableHead>
                      <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-200">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEventTypes.map((eventType, index) => (
                      <TableRow
                        key={eventType._id}
                        className={`hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${
                          index % 2 === 0 ? "bg-white dark:bg-slate-800" : "bg-slate-25 dark:bg-slate-750"
                        }`}
                      >
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div
                              className="w-4 h-4 rounded-full border-2 border-white dark:border-slate-700 shadow-sm flex-shrink-0"
                              style={{ backgroundColor: eventType.color || "#6366f1" }}
                            />
                            <div>
                              <div className="font-semibold text-slate-900 dark:text-slate-100">{eventType.name}</div>
                              {eventType.description && (
                                <div className="text-xs text-slate-500 dark:text-slate-400 md:hidden">
                                  {eventType.description.substring(0, 50)}...
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-slate-700 dark:text-slate-300">
                          {eventType.category || "General"}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-slate-700 dark:text-slate-300">
                          {formatPrice(eventType.base_price)}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-slate-700 dark:text-slate-300">
                          {eventType.default_duration ? `${eventType.default_duration} min` : "N/A"}
                        </TableCell>
                        <TableCell>{getStatusBadge(eventType.status)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="hover:bg-slate-100 dark:hover:bg-slate-600"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => router.push(`/dashboard/events/event-types/${eventType._id}`)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => router.push(`/dashboard/events/event-types/${eventType._id}/edit`)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem
                                    onSelect={(e) => e.preventDefault()}
                                    className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will permanently delete the event type "{eventType.name}". This action cannot
                                      be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(eventType._id, eventType.name)}
                                      className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
