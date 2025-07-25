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
import { Checkbox } from "@/components/ui/checkbox"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Loader2,
  BuildingIcon,
  StarIcon,
  CheckCircleIcon,
  RefreshCwIcon,
  Package,
  DollarSign,
  Filter,
  BarChart3,
  ExternalLink,
} from "lucide-react"
import { useHotels, type Hotel } from "@/hooks/use-hotels"
import { useEventServices, type EventService } from "@/hooks/use-event-services"
import { toast } from "sonner"

export default function EventServicesPage() {
  const router = useRouter()
  const { getAllHotels } = useHotels()

  // Hotel selection state
  const [selectedHotelId, setSelectedHotelId] = useState<string>("")
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [hotelsLoading, setHotelsLoading] = useState(true)
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null)

  // Get services for selected hotel
  const {
    services,
    statistics,
    loading: servicesLoading,
    error,
    deleteService,
    fetchServices,
    getServiceStatistics,
    bulkUpdateServices,
    checkServiceAvailability,
  } = useEventServices(selectedHotelId)

  // Filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [priceTypeFilter, setPriceTypeFilter] = useState("all")
  const [providerFilter, setProviderFilter] = useState("all")
  const [priceSort, setPriceSort] = useState<"asc" | "desc" | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  // Bulk operations state
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [bulkAction, setBulkAction] = useState("")
  const [showBulkDialog, setShowBulkDialog] = useState(false)

  // Statistics state
  const [showStatistics, setShowStatistics] = useState(false)
  const [statisticsLoading, setStatisticsLoading] = useState(false)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)

  // Fetch hotels on component mount
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setHotelsLoading(true)
        const savedHotelId = localStorage.getItem("selectedHotelId")

        const response = await getAllHotels({ active: true })
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
    setSelectedServices([]) // Clear selections when changing hotels
  }

  // Get unique categories and subcategories for filters
  const categories = Array.from(new Set(services.map((service) => service.category).filter(Boolean)))
  const priceTypes = Array.from(new Set(services.map((service) => service.priceType).filter(Boolean)))

  // Apply filters and sorting
  const filteredServices = services
    .filter((service) => {
      const matchesSearch =
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (service.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (service.subcategory || "").toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === "all" || service.status === statusFilter
      const matchesCategory = categoryFilter === "all" || service.category === categoryFilter
      const matchesPriceType = priceTypeFilter === "all" || service.priceType === priceTypeFilter
      const matchesProvider =
        providerFilter === "all" ||
        (providerFilter === "internal" && !service.isExternalService) ||
        (providerFilter === "external" && service.isExternalService)

      return matchesSearch && matchesStatus && matchesCategory && matchesPriceType && matchesProvider
    })
    .sort((a, b) => {
      if (priceSort === "asc") {
        return a.price - b.price
      } else if (priceSort === "desc") {
        return b.price - a.price
      }
      return 0
    })

  // Pagination
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage)
  const paginatedServices = filteredServices.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // Handle service deletion
  const handleDelete = async (id: string, name: string) => {
    try {
      await deleteService(id)
      toast.success(`Service "${name}" deleted successfully`)
      setSelectedServices((prev) => prev.filter((serviceId) => serviceId !== id))
    } catch (error) {
      toast.error("Failed to delete service")
    }
  }

  // Handle bulk operations
  const handleBulkAction = async () => {
    if (!bulkAction || selectedServices.length === 0) return

    try {
      let updateData: Partial<EventService> = {}

      switch (bulkAction) {
        case "activate":
          updateData = { status: "active" }
          break
        case "deactivate":
          updateData = { status: "inactive" }
          break
        case "seasonal":
          updateData = { status: "seasonal" }
          break
        default:
          return
      }

      const result = await bulkUpdateServices({
        serviceIds: selectedServices,
        updateData,
      })

      if (result !== null) {
        toast.success(`Updated ${result} services successfully`)
        setSelectedServices([])
        setBulkAction("")
        setShowBulkDialog(false)
      }
    } catch (error) {
      toast.error("Failed to update services")
    }
  }

  // Handle service selection
  const handleServiceSelection = (serviceId: string, checked: boolean) => {
    if (checked) {
      setSelectedServices((prev) => [...prev, serviceId])
    } else {
      setSelectedServices((prev) => prev.filter((id) => id !== serviceId))
    }
  }

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedServices(paginatedServices.map((service) => service._id))
    } else {
      setSelectedServices([])
    }
  }

  // Load statistics
  const loadStatistics = async () => {
    if (!selectedHotelId) return

    try {
      setStatisticsLoading(true)
      await getServiceStatistics({ hotel: selectedHotelId })
      setShowStatistics(true)
    } catch (error) {
      toast.error("Failed to load statistics")
    } finally {
      setStatisticsLoading(false)
    }
  }

  // Get status badge
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
      case "seasonal":
        return (
          <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100 dark:bg-orange-900 dark:text-orange-200">
            Seasonal
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Get category badge
  const getCategoryBadge = (category: string) => {
    const categoryColors: Record<string, string> = {
      catering: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
      decoration: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
      equipment: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      entertainment: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      staffing: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
      photography: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
      transportation: "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200",
      security: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      cleaning: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
      other: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    }

    return (
      <Badge className={categoryColors[category] || "bg-gray-100 text-gray-800"}>
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </Badge>
    )
  }

  // Format price
  const formatPrice = (price: number, priceType: string) => {
    const formattedPrice = `$${price.toFixed(2)}`

    switch (priceType) {
      case "per_person":
        return `${formattedPrice} / person`
      case "per_hour":
        return `${formattedPrice} / hour`
      case "per_day":
        return `${formattedPrice} / day`
      case "custom":
        return `${formattedPrice} (custom)`
      default:
        return formattedPrice
    }
  }

  if (hotelsLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 dark:from-slate-900 dark:via-purple-900 dark:to-pink-900">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 dark:text-purple-400" />
          <p className="text-lg font-medium text-slate-700 dark:text-slate-300">Loading hotels...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 dark:from-slate-900 dark:via-purple-900 dark:to-pink-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 dark:border-slate-700/20">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 dark:from-purple-400 dark:via-pink-400 dark:to-red-400 bg-clip-text text-transparent">
              Event Services
            </h1>
            <p className="text-slate-600 dark:text-slate-300 mt-2 text-lg">
              {selectedHotel ? `Manage event services for ${selectedHotel.name}` : "Select a hotel to manage services"}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadStatistics}
              disabled={!selectedHotelId || statisticsLoading}
              className="border-purple-200 hover:bg-purple-50 dark:border-purple-700 dark:hover:bg-purple-900"
            >
              <BarChart3 className={`h-4 w-4 mr-2 ${statisticsLoading ? "animate-spin" : ""}`} />
              Statistics
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchServices}
              disabled={!selectedHotelId || servicesLoading}
              className="border-purple-200 hover:bg-purple-50 dark:border-purple-700 dark:hover:bg-purple-900"
            >
              <RefreshCwIcon className={`h-4 w-4 mr-2 ${servicesLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              asChild
              disabled={!selectedHotelId}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 dark:from-purple-600 dark:to-pink-700 dark:hover:from-purple-700 dark:hover:to-pink-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              size="lg"
            >
              <Link href="/dashboard/events/services/new">
                <Plus className="mr-2 h-5 w-5" />
                New Service
              </Link>
            </Button>
          </div>
        </div>

        {/* Hotel Selection Section */}
        <Card className="border-2 border-dashed border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-50/80 to-pink-50/80 dark:from-purple-900/20 dark:to-pink-900/20 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-2">
              <BuildingIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <CardTitle className="text-lg text-purple-900 dark:text-purple-100">Select Hotel</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Choose Hotel</label>
                <Select value={selectedHotelId} onValueChange={handleHotelChange} disabled={hotelsLoading}>
                  <SelectTrigger className="w-full bg-white/80 dark:bg-slate-800/80">
                    <SelectValue
                      placeholder={hotelsLoading ? "Loading hotels..." : "Select a hotel to manage services"}
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
                              <Badge className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
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
                <div className="bg-white/60 dark:bg-slate-800/60 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
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

        {!selectedHotelId ? (
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="flex flex-col items-center justify-center h-64">
              <BuildingIcon className="h-12 w-12 text-slate-400 dark:text-slate-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-slate-700 dark:text-slate-300">No Hotel Selected</h3>
              <p className="text-slate-500 dark:text-slate-400 text-center mb-4">
                Please select a hotel from the dropdown above to view and manage event services.
              </p>
            </CardContent>
          </Card>
        ) : (
          /* Main Content */
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-purple-700 to-pink-700 dark:from-purple-800 dark:to-pink-800 text-white rounded-t-lg">
              <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                <CardTitle className="flex items-center text-xl">
                  <Package className="mr-2 h-5 w-5" />
                  All Services ({filteredServices.length})
                  {selectedServices.length > 0 && (
                    <Badge className="ml-2 bg-white/20 text-white">{selectedServices.length} selected</Badge>
                  )}
                </CardTitle>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      type="search"
                      placeholder="Search services..."
                      className="w-full pl-8 sm:w-[200px] bg-white/10 border-white/20 text-white placeholder:text-slate-300 focus:bg-white/20"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </div>
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-white/20">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="seasonal">Seasonal</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={priceTypeFilter} onValueChange={setPriceTypeFilter}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="All Price Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Price Types</SelectItem>
                      {priceTypes.map((priceType) => (
                        <SelectItem key={priceType} value={priceType}>
                          {priceType.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={providerFilter} onValueChange={setProviderFilter}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="All Providers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Providers</SelectItem>
                      <SelectItem value="internal">In-house</SelectItem>
                      <SelectItem value="external">External</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Bulk Actions */}
              {selectedServices.length > 0 && (
                <div className="flex items-center gap-2 pt-4 border-t border-white/20">
                  <Select value={bulkAction} onValueChange={setBulkAction}>
                    <SelectTrigger className="w-[200px] bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Bulk Actions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="activate">Activate Services</SelectItem>
                      <SelectItem value="deactivate">Deactivate Services</SelectItem>
                      <SelectItem value="seasonal">Mark as Seasonal</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowBulkDialog(true)}
                    disabled={!bulkAction}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    Apply to {selectedServices.length} services
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="p-0">
              {servicesLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin mr-2 text-purple-600 dark:text-purple-400" />
                  <span className="text-slate-600 dark:text-slate-400">Loading services...</span>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-32">
                  <p className="text-red-600 dark:text-red-400 mb-4">Error loading services: {error}</p>
                  <Button onClick={fetchServices} variant="outline">
                    <RefreshCwIcon className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                </div>
              ) : filteredServices.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-full p-6 mb-4">
                    <Package className="h-12 w-12 text-purple-600 dark:text-purple-400" />
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">
                    {services.length === 0
                      ? "No services found for this hotel."
                      : "No services match your search criteria."}
                  </p>
                  <p className="text-slate-500 dark:text-slate-500 text-sm mt-1">
                    Create your first event service to get started
                  </p>
                  <Button
                    variant="outline"
                    className="mt-6 border-2 border-purple-200 hover:bg-purple-50 dark:border-purple-700 dark:hover:bg-purple-900"
                    asChild
                  >
                    <Link href="/dashboard/events/services/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Service
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600">
                        <TableHead className="w-12">
                          <Checkbox
                            checked={
                              selectedServices.length === paginatedServices.length && paginatedServices.length > 0
                            }
                            onCheckedChange={handleSelectAll}
                          />
                        </TableHead>
                        <TableHead className="font-semibold text-slate-700 dark:text-slate-200">Name</TableHead>
                        <TableHead className="hidden md:table-cell font-semibold text-slate-700 dark:text-slate-200">
                          Category
                        </TableHead>
                        <TableHead className="hidden md:table-cell font-semibold text-slate-700 dark:text-slate-200">
                          Price
                        </TableHead>
                        <TableHead className="hidden lg:table-cell font-semibold text-slate-700 dark:text-slate-200">
                          Provider
                        </TableHead>
                        <TableHead className="hidden lg:table-cell font-semibold text-slate-700 dark:text-slate-200">
                          Inventory
                        </TableHead>
                        <TableHead className="font-semibold text-slate-700 dark:text-slate-200">Status</TableHead>
                        <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-200">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedServices.map((service, index) => (
                        <TableRow
                          key={service._id}
                          className={`hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${
                            index % 2 === 0 ? "bg-white dark:bg-slate-800" : "bg-slate-25 dark:bg-slate-750"
                          }`}
                        >
                          <TableCell>
                            <Checkbox
                              checked={selectedServices.includes(service._id)}
                              onCheckedChange={(checked) => handleServiceSelection(service._id, checked as boolean)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center"
                                style={{
                                  background: `linear-gradient(135deg, var(--${
                                    service.category || "slate"
                                  }-100), var(--${service.category || "slate"}-200))`,
                                }}
                              >
                                <Package className="h-5 w-5 text-slate-700" />
                              </div>
                              <div>
                                <div className="font-semibold text-slate-900 dark:text-slate-100">{service.name}</div>
                                {service.description && (
                                  <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                                    {service.description}
                                  </div>
                                )}
                                {service.subcategory && (
                                  <Badge variant="outline" className="text-xs mt-1">
                                    {service.subcategory}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-slate-700 dark:text-slate-300">
                            {getCategoryBadge(service.category)}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-slate-700 dark:text-slate-300">
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-1 text-slate-400" />
                              {formatPrice(service.price, service.priceType)}
                            </div>
                            {service.minimumQuantity > 1 && (
                              <div className="text-xs text-slate-500 mt-1">Min: {service.minimumQuantity}</div>
                            )}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-slate-700 dark:text-slate-300">
                            {service.isExternalService ? (
                              <div>
                                <Badge variant="outline" className="font-normal">
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  External
                                </Badge>
                                <div className="text-xs mt-1">{service.externalProvider?.name || "N/A"}</div>
                              </div>
                            ) : (
                              <Badge variant="outline" className="bg-slate-50 font-normal">
                                In-house
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-slate-700 dark:text-slate-300">
                            {service.inventory?.isLimited ? (
                              <div>
                                <Badge variant="outline" className="text-xs">
                                  Limited
                                </Badge>
                                <div className="text-xs mt-1">
                                  {service.inventory.availableQuantity}/{service.inventory.totalQuantity}
                                </div>
                              </div>
                            ) : (
                              <Badge variant="outline" className="text-xs">
                                Unlimited
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>{getStatusBadge(service.status)}</TableCell>
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
                                  onClick={() => router.push(`/dashboard/events/services/${service._id}`)}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => router.push(`/dashboard/events/services/${service._id}/edit`)}
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
                                        This will permanently delete the service "{service.name}". This action cannot be
                                        undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDelete(service._id, service.name)}
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

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t">
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                        {Math.min(currentPage * itemsPerPage, filteredServices.length)} of {filteredServices.length}{" "}
                        services
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          Page {currentPage} of {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Bulk Action Dialog */}
        <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Bulk Update Services</DialogTitle>
              <DialogDescription>
                Are you sure you want to {bulkAction.replace("_", " ")} {selectedServices.length} selected services?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowBulkDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleBulkAction}>Update Services</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Statistics Dialog */}
        <Dialog open={showStatistics} onOpenChange={setShowStatistics}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Service Statistics</DialogTitle>
              <DialogDescription>Performance metrics for event services at {selectedHotel?.name}</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {statistics.map((stat) => {
                const service = services.find((s) => s._id === stat._id)
                return (
                  <Card key={stat._id} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-sm">{service?.name || "Unknown Service"}</h4>
                      <Package className="h-4 w-4 text-slate-400" />
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total Usage:</span>
                        <span className="font-medium">{stat.totalUsage}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Quantity:</span>
                        <span className="font-medium">{stat.totalQuantity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Revenue:</span>
                        <span className="font-medium">${stat.totalRevenue.toFixed(2)}</span>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
