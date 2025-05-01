"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { useRoomTypes } from "@/hooks/use-room-types"
import { Plus, Search, MoreHorizontal, Edit, Trash2, BedDouble, Users } from "lucide-react"

export default function RoomTypesPage() {
  const router = useRouter()
  const { roomTypes, isLoading, fetchRoomTypes, deleteRoomType } = useRoomTypes()
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [roomTypeToDelete, setRoomTypeToDelete] = useState<string | null>(null)

  useEffect(() => {
    fetchRoomTypes()
  }, [])

  const handleDeleteClick = (id: string) => {
    setRoomTypeToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!roomTypeToDelete) return

    try {
      const { success, message } = await deleteRoomType(roomTypeToDelete)

      if (success) {
        toast.success("Room type deleted successfully")
        fetchRoomTypes()
      } else {
        toast.error(`Failed to delete room type: ${message}`)
      }
    } catch (error) {
      toast.error(`An error occurred: ${error.message}`)
    } finally {
      setDeleteDialogOpen(false)
      setRoomTypeToDelete(null)
    }
  }
  console.log("Room Types:", roomTypes)
  const filteredRoomTypes = roomTypes.filter((type) => type.name.toLowerCase().includes(searchQuery.toLowerCase()))
  console.log("Filtered Room Types:", filteredRoomTypes)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Room Types</h1>
          <p className="text-muted-foreground">Manage your hotel room categories, pricing, and features</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/room-types/new">
            <Plus className="mr-2 h-4 w-4" /> Add New Room Type
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">Total Room Types</CardTitle>
            <CardDescription>All room categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{roomTypes.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">Average Price</CardTitle>
            <CardDescription>Per night</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {roomTypes.length > 0
                ? formatCurrency(roomTypes.reduce((sum, type) => sum + type.basePrice, 0) / roomTypes.length)
                : "$0.00"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">Active Types</CardTitle>
            <CardDescription>Available for booking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{roomTypes.filter((type) => type.isActive !== false).length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Room Types</CardTitle>
          <CardDescription>View and manage all room types in your hotel</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search room types..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {Array(3)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="w-full h-16 bg-muted rounded animate-pulse" />
                ))}
            </div>
          ) : filteredRoomTypes.length === 0 ? (
            <div className="text-center py-10">
              <BedDouble className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No room types found</h3>
              <p className="mt-2 text-muted-foreground">
                {searchQuery ? "No room types match your search query" : "Get started by adding your first room type"}
              </p>
              {!searchQuery && (
                <Button className="mt-4" asChild>
                  <Link href="/dashboard/room-types/new">
                    <Plus className="mr-2 h-4 w-4" /> Add Room Type
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Bed Configuration</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="w-[100px]">Status</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRoomTypes.map((roomType) => (
                    <TableRow key={roomType._id}>
                      <TableCell className="font-medium">
                        <div className="font-medium">{roomType.name}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                          {roomType.description?.substring(0, 50)}
                          {roomType.description?.length > 50 ? "..." : ""}
                        </div>
                      </TableCell>
                      <TableCell>{roomType.bedConfiguration}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span>
                            {roomType.capacity?.adults || 0} adults, {roomType.capacity?.children || 0} children
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{roomType.size} sq ft</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(roomType.basePrice)}</TableCell>
                      <TableCell>
                        <Badge variant={roomType.isActive !== false ? "default" : "secondary"}>
                          {roomType.isActive !== false ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/room-types/${roomType._id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" /> Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDeleteClick(roomType._id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
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
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the room type and may affect existing rooms of
              this type.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
