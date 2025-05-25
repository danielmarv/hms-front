"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Building2,
  Plus,
  Search,
  Hotel,
  Star,
  MoreHorizontal,
  Edit,
  Trash2,
  Users,
  Settings,
  Loader2,
  MapPin,
  Phone,
  Mail,
  Filter,
  Download,
  Eye,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useHotels, type Hotel as HotelType } from "@/hooks/use-hotels"
import { useHotelChains } from "@/hooks/use-hotel-chains"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface HotelFilters {
  search: string
  chainCode: string
  type: string
  status: string
  starRating: string
}

export default function AdminHotelsPage() {
  const router = useRouter()
  const { getAllHotels, deleteHotel, isLoading } = useHotels()
  const { getAllChains } = useHotelChains()

  const [hotels, setHotels] = useState<HotelType[]>([])
  const [chains, setChains] = useState<any[]>([])
  const [isLoadingHotels, setIsLoadingHotels] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [hotelToDelete, setHotelToDelete] = useState<string | null>(null)

  const [filters, setFilters] = useState<HotelFilters>({
    search: "",
    chainCode: "",
    type: "",
    status: "",
    starRating: "",
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoadingHotels(true)

      // Fetch hotels
      const hotelsResponse = await getAllHotels()
      if (hotelsResponse.data) {
        setHotels(hotelsResponse.data)
      }

      // Fetch chains for filter dropdown
      const chainsResponse = await getAllChains()
      if (chainsResponse.data) {
        setChains(chainsResponse.data)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Failed to load hotels data")
    } finally {
      setIsLoadingHotels(false)
    }
  }

  const handleDeleteHotel = async (hotelId: string) => {
    setHotelToDelete(hotelId)
  }

  const confirmDeleteHotel = async () => {
    if (!hotelToDelete) return

    try {
      setIsDeleting(true)
      const response = await deleteHotel(hotelToDelete)

      if (response.success) {
        toast.success("Hotel deleted successfully")
        setHotels(hotels.filter((hotel) => hotel._id !== hotelToDelete))
      } else {
        toast.error(response.message || "Failed to delete hotel")
      }
    } catch (error: any) {
      console.error("Error deleting hotel:", error)
      toast.error(error.message || "Failed to delete hotel")
    } finally {
      setIsDeleting(false)
      setHotelToDelete(null)
    }
  }

  const handleFilterChange = (key: keyof HotelFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      search: "",
      chainCode: "",
      type: "",
      status: "",
      starRating: "",
    })
  }

  const filteredHotels = hotels.filter((hotel) => {
    const matchesSearch =
      hotel.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      hotel.code.toLowerCase().includes(filters.search.toLowerCase()) ||
      (hotel.address?.city || "").toLowerCase().includes(filters.search.toLowerCase())

    const matchesChain = !filters.chainCode || hotel.chainCode === filters.chainCode
    const matchesType = !filters.type || hotel.type === filters.type
    const matchesStatus = !filters.status || (filters.status === "active" ? hotel.active : !hotel.active)
    const matchesRating = !filters.starRating || String(hotel.starRating || 0) === filters.starRating

    return matchesSearch && matchesChain && matchesType && matchesStatus && matchesRating
  })

  const renderStarRating = (rating: number) => {
    if (rating === 0) return <span className="text-muted-foreground">N/A</span>

    return (
      <div className="flex items-center">
        {Array.from({ length: rating }).map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
    )
  }

  const renderHotelTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "hotel":
        return <Hotel className="h-4 w-4 text-blue-500" />
      case "resort":
        return <Hotel className="h-4 w-4 text-green-500" />
      case "motel":
        return <Hotel className="h-4 w-4 text-orange-500" />
      case "boutique":
        return <Hotel className="h-4 w-4 text-purple-500" />
      case "apartment":
        return <Building2 className="h-4 w-4 text-indigo-500" />
      default:
        return <Building2 className="h-4 w-4 text-gray-500" />
    }
  }

  const getChainName = (chainCode: string) => {
    const chain = chains.find((c) => c.chainCode === chainCode)
    return chain ? chain.name : chainCode
  }

  const exportHotels = () => {
    const csvContent = [
      ["Name", "Code", "Type", "Chain", "Rating", "Status", "City", "Phone", "Email"].join(","),
      ...filteredHotels.map((hotel) =>
        [
          hotel.name,
          hotel.code,
          hotel.type,
          getChainName(hotel.chainCode || ""),
          hotel.starRating || 0,
          hotel.active ? "Active" : "Inactive",
          hotel.address?.city || "",
          hotel.contactInfo?.phone || "",
          hotel.contactInfo?.email || "",
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "hotels.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hotels Management</h1>
          <p className="text-muted-foreground">Manage all hotels across your organization</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportHotels}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => router.push("/admin/hotels/new")}>
            <Plus className="mr-2 h-4 w-4" />
            New Hotel
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search hotels..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Chain</label>
              <Select value={filters.chainCode} onValueChange={(value) => handleFilterChange("chainCode", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All chains" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All chains</SelectItem>
                  {chains.map((chain) => (
                    <SelectItem key={chain.chainCode} value={chain.chainCode}>
                      {chain.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select value={filters.type} onValueChange={(value) => handleFilterChange("type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="hotel">Hotel</SelectItem>
                  <SelectItem value="resort">Resort</SelectItem>
                  <SelectItem value="motel">Motel</SelectItem>
                  <SelectItem value="boutique">Boutique</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Rating</label>
              <Select value={filters.starRating} onValueChange={(value) => handleFilterChange("starRating", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All ratings" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All ratings</SelectItem>
                  <SelectItem value="0">Not Rated</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={clearFilters} className="w-full">
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hotels Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Hotels</CardTitle>
          <CardDescription>
            Showing {filteredHotels.length} of {hotels.length} hotels
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingHotels ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredHotels.length === 0 ? (
            <div className="flex h-[300px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
              <Hotel className="h-10 w-10 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No hotels found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {Object.values(filters).some((f) => f)
                  ? "No hotels match your search criteria"
                  : "Get started by creating a new hotel"}
              </p>
              {!Object.values(filters).some((f) => f) && (
                <Button onClick={() => router.push("/admin/hotels/new")} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  New Hotel
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hotel Details</TableHead>
                    <TableHead>Chain</TableHead>
                    <TableHead>Type & Rating</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHotels.map((hotel) => (
                    <TableRow key={hotel._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            {renderHotelTypeIcon(hotel.type)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <Link href={`/admin/hotels/${hotel._id}`} className="font-medium hover:underline">
                                {hotel.name}
                              </Link>
                              {hotel.isHeadquarters && (
                                <Badge variant="outline" className="text-xs">
                                  HQ
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">{hotel.code}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {hotel.chainCode ? (
                          <Link href={`/admin/chains/${hotel.chainCode}`} className="text-primary hover:underline">
                            {getChainName(hotel.chainCode)}
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">Independent</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            {renderHotelTypeIcon(hotel.type)}
                            <span className="capitalize text-sm">{hotel.type}</span>
                          </div>
                          {renderStarRating(hotel.starRating || 0)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {hotel.address?.city && (
                            <div className="flex items-center gap-1 text-sm">
                              <MapPin className="h-3 w-3" />
                              {hotel.address.city}
                              {hotel.address.country && `, ${hotel.address.country}`}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {hotel.contactInfo?.phone && (
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3" />
                              {hotel.contactInfo.phone}
                            </div>
                          )}
                          {hotel.contactInfo?.email && (
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="h-3 w-3" />
                              {hotel.contactInfo.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={hotel.active ? "success" : "destructive"}>
                          {hotel.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => router.push(`/admin/hotels/${hotel._id}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/admin/hotels/${hotel._id}/edit`)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Hotel
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/admin/hotels/${hotel._id}/users`)}>
                              <Users className="mr-2 h-4 w-4" />
                              Manage Users
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/admin/hotels/${hotel._id}/settings`)}>
                              <Settings className="mr-2 h-4 w-4" />
                              Settings
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDeleteHotel(hotel._id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Hotel
                            </DropdownMenuItem>
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
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {filteredHotels.length} of {hotels.length} hotels
          </div>
          <Button variant="outline" onClick={fetchData} disabled={isLoadingHotels}>
            {isLoadingHotels ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              "Refresh"
            )}
          </Button>
        </CardFooter>
      </Card>

      <AlertDialog open={!!hotelToDelete} onOpenChange={(open) => !open && setHotelToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete this hotel and all associated data including rooms, bookings, and
              staff assignments. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteHotel}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Hotel"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
