"use client"

import { useState, useEffect } from "react"
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
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Loader2,
  FileIcon as FileTemplate,
  BuildingIcon,
  StarIcon,
  CheckCircleIcon,
  RefreshCwIcon,
  Clock,
  Users,
  DollarSign,
} from "lucide-react"
import { useHotels, type Hotel } from "@/hooks/use-hotels"
import { toast } from "sonner"
import { useEventTemplates } from "@/hooks/use-event-templates"

export default function EventTemplatesPage() {
  const router = useRouter()
  const { getAllHotels } = useHotels()

  // Hotel selection state
  const [selectedHotelId, setSelectedHotelId] = useState<string>("")
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [hotelsLoading, setHotelsLoading] = useState(true)
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null)

  const {
    templates,
    loading: templatesLoading,
    error,
    deleteTemplate,
    refreshTemplates,
  } = useEventTemplates(selectedHotelId)

  // Filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [eventTypeFilter, setEventTypeFilter] = useState("all")

  // Fetch hotels on component mount
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setHotelsLoading(true)
        const savedHotelId = localStorage.getItem("selectedHotelId")

        const response = await getAllHotels({ active: true })
        console.log("Hotels API response:", response)

        let hotelsData = []
        if (response?.data?.data) {
          hotelsData = response.data.data
        } else if (response?.data && Array.isArray(response.data)) {
          hotelsData = response.data
        } else if (response && Array.isArray(response)) {
          hotelsData = response
        }

        setHotels(hotelsData)

        if (hotelsData.length > 0) {
          let hotelToSelect = hotelsData[0]

          if (savedHotelId) {
            const savedHotel = hotelsData.find((h: Hotel) => h._id === savedHotelId)
            if (savedHotel) {
              hotelToSelect = savedHotel
            }
          }

          setSelectedHotelId(hotelToSelect._id)
          setSelectedHotel(hotelToSelect)
          localStorage.setItem("selectedHotelId", hotelToSelect._id)
        }
      } catch (error) {
        console.error("Failed to fetch hotels:", error)
        toast.error("Failed to load hotels")
      } finally {
        setHotelsLoading(false)
      }
    }

    fetchHotels()
  }, [getAllHotels])

  // Handle hotel selection
  const handleHotelChange = (hotelId: string) => {
    setSelectedHotelId(hotelId)
    const hotel = hotels.find((h) => h._id === hotelId)
    setSelectedHotel(hotel || null)
    localStorage.setItem("selectedHotelId", hotelId)
  }

  // Filter templates based on search and filters
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (template.description || "").toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || (template.isActive ? "active" : "inactive") === statusFilter
    const matchesEventType = eventTypeFilter === "all" || template.eventType?._id === eventTypeFilter

    return matchesSearch && matchesStatus && matchesEventType
  })

  const handleDelete = async (id: string, name: string) => {
    try {
      await deleteTemplate(id)
      toast.success(`Template "${name}" deleted successfully`)
    } catch (error) {
      toast.error("Failed to delete template")
    }
  }

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Inactive</Badge>
    )
  }

  const formatPrice = (price: number | undefined) => {
    return price ? `$${price.toFixed(2)}` : "N/A"
  }

  const formatDuration = (minutes: number | undefined) => {
    if (!minutes) return "N/A"
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  if (hotelsLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-slate-900 dark:via-blue-900 dark:to-cyan-900">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400" />
          <p className="text-lg font-medium text-slate-700 dark:text-slate-300">Loading hotels...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-slate-900 dark:via-blue-900 dark:to-cyan-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hotel Selection Section */}
        <Card className="border-2 border-dashed border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50/80 to-cyan-50/80 dark:from-blue-900/20 dark:to-cyan-900/20 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-2">
              <BuildingIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <CardTitle className="text-lg text-blue-900 dark:text-blue-100">Select Hotel</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Choose Hotel</label>
                <Select value={selectedHotelId} onValueChange={handleHotelChange} disabled={hotelsLoading}>
                  <SelectTrigger className="w-full bg-white/80 dark:bg-slate-800/80">
                    <SelectValue
                      placeholder={hotelsLoading ? "Loading hotels..." : "Select a hotel to manage templates"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {hotels.length === 0 ? (
                      <SelectItem value="no-hotels" disabled>
                        No hotels available
                      </SelectItem>
                    ) : (
                      hotels.map((hotel) => (
                        <SelectItem key={hotel._id} value={hotel._id}>
                          <div className="flex items-center space-x-2">
                            <BuildingIcon className="h-4 w-4" />
                            <span>{hotel.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {hotel.code}
                            </Badge>
                            {hotel.isHeadquarters && (
                              <Badge className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                <StarIcon className="h-3 w-3 mr-1" />
                                HQ
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {selectedHotel && (
                <div className="bg-white/60 dark:bg-slate-800/60 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-sm text-slate-700 dark:text-slate-300">Selected Hotel</h3>
                    <CheckCircleIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{selectedHotel.name}</p>
                    <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                      <Badge variant="outline">{selectedHotel.code}</Badge>
                      <span>•</span>
                      <span className="capitalize">{selectedHotel.type}</span>
                      {selectedHotel.starRating && (
                        <>
                          <span>•</span>
                          <div className="flex items-center">
                            {Array.from({ length: selectedHotel.starRating }).map((_, i) => (
                              <StarIcon key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                    {selectedHotel.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {selectedHotel.description}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Header */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 dark:border-slate-700/20">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 dark:from-blue-400 dark:via-cyan-400 dark:to-teal-400 bg-clip-text text-transparent">
              Event Templates
            </h1>
            <p className="text-slate-600 dark:text-slate-300 mt-2 text-lg">
              {selectedHotel
                ? `Manage event templates for ${selectedHotel.name}`
                : "Select a hotel to manage event templates"}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshTemplates}
              disabled={!selectedHotelId || templatesLoading}
              className="border-blue-200 hover:bg-blue-50 dark:border-blue-700 dark:hover:bg-blue-900"
            >
              <RefreshCwIcon className={`h-4 w-4 mr-2 ${templatesLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              asChild
              disabled={!selectedHotelId}
              className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 dark:from-blue-600 dark:to-cyan-700 dark:hover:from-blue-700 dark:hover:to-cyan-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              size="lg"
            >
              <Link href="/dashboard/events/templats/new">
                <Plus className="mr-2 h-5 w-5" />
                New Template
              </Link>
            </Button>
          </div>
        </div>

        {!selectedHotelId ? (
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="flex flex-col items-center justify-center h-64">
              <BuildingIcon className="h-12 w-12 text-slate-400 dark:text-slate-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-slate-700 dark:text-slate-300">No Hotel Selected</h3>
              <p className="text-slate-500 dark:text-slate-400 text-center mb-4">
                Please select a hotel from the dropdown above to view and manage event templates.
              </p>
            </CardContent>
          </Card>
        ) : (
          /* Main Content */
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-slate-700 to-slate-800 dark:from-slate-800 dark:to-slate-900 text-white rounded-t-lg">
              <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                <CardTitle className="flex items-center text-xl">
                  <FileTemplate className="mr-2 h-5 w-5" />
                  All Templates ({filteredTemplates.length})
                </CardTitle>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      type="search"
                      placeholder="Search templates..."
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
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {templatesLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin mr-2 text-blue-600 dark:text-blue-400" />
                  <span className="text-slate-600 dark:text-slate-400">Loading templates...</span>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-32">
                  <p className="text-red-600 dark:text-red-400 mb-4">Error loading templates: {error}</p>
                  <Button onClick={refreshTemplates} variant="outline">
                    <RefreshCwIcon className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                </div>
              ) : filteredTemplates.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 rounded-full p-6 mb-4">
                    <FileTemplate className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">
                    {templates.length === 0
                      ? "No templates found for this hotel."
                      : "No templates match your search criteria."}
                  </p>
                  <p className="text-slate-500 dark:text-slate-500 text-sm mt-1">
                    Create your first event template to get started
                  </p>
                  <Button variant="outline" className="mt-6 border-2 hover:bg-blue-50 dark:hover:bg-blue-900" asChild>
                    <Link href="/dashboard/events/templats/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Template
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
                          Event Type
                        </TableHead>
                        <TableHead className="hidden md:table-cell font-semibold text-slate-700 dark:text-slate-200">
                          Duration
                        </TableHead>
                        <TableHead className="hidden lg:table-cell font-semibold text-slate-700 dark:text-slate-200">
                          Capacity
                        </TableHead>
                        <TableHead className="hidden lg:table-cell font-semibold text-slate-700 dark:text-slate-200">
                          Base Price
                        </TableHead>
                        <TableHead className="font-semibold text-slate-700 dark:text-slate-200">Status</TableHead>
                        <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-200">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTemplates.map((template, index) => (
                        <TableRow
                          key={template._id}
                          className={`hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${
                            index % 2 === 0 ? "bg-white dark:bg-slate-800" : "bg-slate-25 dark:bg-slate-750"
                          }`}
                        >
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 rounded-lg p-2">
                                <FileTemplate className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div>
                                <div className="font-semibold text-slate-900 dark:text-slate-100">{template.name}</div>
                                {template.description && (
                                  <div className="text-xs text-slate-500 dark:text-slate-400 md:hidden">
                                    {template.description.substring(0, 50)}...
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-slate-700 dark:text-slate-300">
                            {template.eventType?.name || "N/A"}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-slate-700 dark:text-slate-300">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1 text-slate-400" />
                              {formatDuration(template.duration)}
                            </div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-slate-700 dark:text-slate-300">
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-1 text-slate-400" />
                              {template.capacity || "N/A"}
                            </div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-slate-700 dark:text-slate-300">
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-1 text-slate-400" />
                              {formatPrice(template.basePrice)}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(template.isActive)}</TableCell>
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
                                  onClick={() => router.push(`/dashboard/events/templats/${template._id}`)}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => router.push(`/dashboard/events/templats/${template._id}/edit`)}
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
                                        This will permanently delete the template "{template.name}". This action cannot
                                        be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDelete(template._id, template.name)}
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
        )}
      </div>
    </div>
  )
}
