"use client"

import { useEffect, useState } from "react"
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
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { Plus, Search, ArrowUpDown, Eye, Edit, Trash2, BedDouble, Users, DollarSign, Tag } from "lucide-react"
import { useRoomTypes, type RoomType } from "@/hooks/use-room-types"

export default function RoomTypesPage() {
  const { roomTypes, isLoading, fetchRoomTypes, deleteRoomType } = useRoomTypes()

  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [filteredRoomTypes, setFilteredRoomTypes] = useState<RoomType[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(8)
  const [viewRoomType, setViewRoomType] = useState<RoomType | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [roomTypeToDelete, setRoomTypeToDelete] = useState<string | null>(null)

  useEffect(() => {
    fetchRoomTypes()
  }, [])

  useEffect(() => {
    if (!roomTypes) return

    // Filter room types
    let filtered = [...roomTypes]

    if (searchQuery) {
      filtered = filtered.filter(
        (type) =>
          type.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          type.description?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((type) => type.category === categoryFilter)
    }

    // Sort room types
    filtered.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name)
          break
        case "price":
          comparison = a.base_price - b.base_price
          break
        case "occupancy":
          comparison = a.max_occupancy - b.max_occupancy
          break
        default:
          comparison = 0
      }

      return sortOrder === "asc" ? comparison : -comparison
    })

    setFilteredRoomTypes(filtered)
  }, [roomTypes, searchQuery, categoryFilter, sortBy, sortOrder])

  // Calculate pagination
  const totalPages = Math.ceil(filteredRoomTypes.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedRoomTypes = filteredRoomTypes.slice(startIndex, startIndex + itemsPerPage)

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("asc")
    }
  }

  const handleDeleteClick = (id: string) => {
    setRoomTypeToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!roomTypeToDelete) return

    const result = await deleteRoomType(roomTypeToDelete)

    if (result.success) {
      toast.success("Room type deleted successfully")
      fetchRoomTypes()
    } else {
      toast.error(`Failed to delete room type: ${result.message}`)
    }

    setIsDeleteDialogOpen(false)
    setRoomTypeToDelete(null)
  }

  // Get unique categories for filter
  const categories = roomTypes ? Array.from(new Set(roomTypes.map((type) => type.category))) : []

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Room Types</h1>
          <p className="text-muted-foreground">Manage room categories, pricing, and features</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/room-types/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Room Type
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Room Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <BedDouble className="h-5 w-5 text-muted-foreground mr-2" />
              <div className="text-2xl font-bold">{roomTypes?.length || 0}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-muted-foreground mr-2" />
              <div className="text-2xl font-bold">
                {roomTypes && roomTypes.length > 0
                  ? `$${(roomTypes.reduce((sum, type) => sum + type.base_price, 0) / roomTypes.length).toFixed(2)}`
                  : "$0.00"}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Tag className="h-5 w-5 text-muted-foreground mr-2" />
              <div className="text-2xl font-bold">{categories.length}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Max Capacity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-5 w-5 text-muted-foreground mr-2" />
              <div className="text-2xl font-bold">
                {roomTypes && roomTypes.length > 0 ? Math.max(...roomTypes.map((type) => type.max_occupancy)) : 0}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>All Room Types</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search room types..."
                className="w-full pl-8 sm:w-[200px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
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
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort("name")}>
                      Name
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort("price")}>
                      Base Price
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort("occupancy")}>
                      Max Occupancy
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">Amenities</TableHead>
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
                          <Skeleton className="h-6 w-[180px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-24" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-16" />
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Skeleton className="h-6 w-12" />
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <Skeleton className="h-6 w-32" />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Skeleton className="h-8 w-8" />
                            <Skeleton className="h-8 w-8" />
                            <Skeleton className="h-8 w-8" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                ) : paginatedRoomTypes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No room types found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedRoomTypes.map((roomType) => (
                    <TableRow key={roomType._id}>
                      <TableCell className="font-medium">{roomType.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{roomType.category}</Badge>
                      </TableCell>
                      <TableCell>${roomType.base_price}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center">
                          <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                          {roomType.max_occupancy}
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {roomType.amenities && roomType.amenities.length > 0 ? (
                            roomType.amenities.slice(0, 3).map((amenity, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {amenity}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-sm">None</span>
                          )}
                          {roomType.amenities && roomType.amenities.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{roomType.amenities.length - 3}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Dialog
                            open={viewRoomType?._id === roomType._id}
                            onOpenChange={(open) => !open && setViewRoomType(null)}
                          >
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => setViewRoomType(roomType)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[600px]">
                              <DialogHeader>
                                <DialogTitle>{roomType.name}</DialogTitle>
                                <DialogDescription>Room type details and information</DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <Tabs defaultValue="details">
                                  <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="details">Details</TabsTrigger>
                                    <TabsTrigger value="amenities">Amenities</TabsTrigger>
                                  </TabsList>
                                  <TabsContent value="details" className="space-y-4 pt-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <h4 className="text-sm font-medium text-muted-foreground">Category</h4>
                                        <p>{roomType.category}</p>
                                      </div>
                                      <div>
                                        <h4 className="text-sm font-medium text-muted-foreground">Base Price</h4>
                                        <p>${roomType.base_price}</p>
                                      </div>
                                      <div>
                                        <h4 className="text-sm font-medium text-muted-foreground">Max Occupancy</h4>
                                        <p>{roomType.max_occupancy} persons</p>
                                      </div>
                                      <div>
                                        <h4 className="text-sm font-medium text-muted-foreground">Created</h4>
                                        <p>{new Date(roomType.createdAt).toLocaleDateString()}</p>
                                      </div>
                                    </div>
                                    {roomType.description && (
                                      <div>
                                        <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
                                        <p className="text-sm">{roomType.description}</p>
                                      </div>
                                    )}
                                  </TabsContent>
                                  <TabsContent value="amenities" className="pt-4">
                                    {roomType.amenities && roomType.amenities.length > 0 ? (
                                      <div className="grid grid-cols-2 gap-2">
                                        {roomType.amenities.map((amenity, index) => (
                                          <div key={index} className="flex items-center">
                                            <div className="h-2 w-2 rounded-full bg-primary mr-2" />
                                            <span>{amenity}</span>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-muted-foreground">No amenities listed for this room type.</p>
                                    )}
                                  </TabsContent>
                                </Tabs>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/dashboard/room-types/${roomType._id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteClick(roomType._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (currentPage > 1) {
                          setCurrentPage(currentPage - 1)
                        }
                      }}
                      className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>

                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    // Show pages around current page
                    let pageNum = i + 1
                    if (totalPages > 5) {
                      if (currentPage > 3) {
                        pageNum = currentPage - 3 + i
                      }
                      if (pageNum > totalPages - 4 && currentPage > totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      }
                    }

                    return (
                      <PaginationItem key={i}>
                        <PaginationLink
                          href="#"
                          isActive={pageNum === currentPage}
                          onClick={(e) => {
                            e.preventDefault()
                            setCurrentPage(pageNum)
                          }}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  })}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (currentPage < totalPages) {
                          setCurrentPage(currentPage + 1)
                        }
                      }}
                      className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete this room type and may affect any rooms
              currently using it.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
