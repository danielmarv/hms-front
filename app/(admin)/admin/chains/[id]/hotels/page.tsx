"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Building2, ChevronRight, Edit, Hotel, Loader2, MoreHorizontal, Plus, Star, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useHotelChains, type HotelChain, type Hotel as HotelType } from "@/hooks/use-hotel-chains"

export default function ChainHotelsPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const chainCode = params.id as string
  const { getChainDetails, removeHotelFromChain, isLoading } = useHotelChains()

  const [chain, setChain] = useState<HotelChain | null>(null)
  const [hotels, setHotels] = useState<HotelType[]>([])
  const [isLoadingChain, setIsLoadingChain] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [hotelToDelete, setHotelToDelete] = useState<HotelType | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const fetchChainDetails = async () => {
      try {
        setIsLoadingChain(true)
        const response = await getChainDetails(chainCode)
        if (response.data) {
          setChain(response.data)
          setHotels(response.data.hotels || [])
        } else {
          toast.error("Failed to load chain details")
        }
      } catch (error) {
        console.error("Error fetching chain details:", error)
        toast.error("Failed to load chain details")
      } finally {
        setIsLoadingChain(false)
      }
    }

    if (chainCode) {
      fetchChainDetails()
    }
  }, [chainCode, getChainDetails])

  const handleDeleteClick = (hotel: HotelType) => {
    setHotelToDelete(hotel)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!hotelToDelete) return

    try {
      setIsDeleting(true)
      const response = await removeHotelFromChain(chainCode, hotelToDelete._id)

      if (response.success) {
        toast.success("Hotel removed from chain successfully")
        // Update the hotels list
        setHotels(hotels.filter((hotel) => hotel._id !== hotelToDelete._id))
      } else {
        toast.error(response.message || "Failed to remove hotel from chain")
      }
    } catch (error: any) {
      console.error("Error removing hotel from chain:", error)
      toast.error(error.message || "Failed to remove hotel from chain")
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setHotelToDelete(null)
    }
  }

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

  if (isLoadingChain) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-[250px]" />
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <Skeleton className="h-8 w-[150px]" />
        </div>
        <Skeleton className="h-[500px] w-full" />
      </div>
    )
  }

  if (!chain) {
    return (
      <div className="flex h-[600px] flex-col items-center justify-center">
        <Building2 className="h-16 w-16 text-muted-foreground" />
        <h2 className="mt-4 text-2xl font-bold">Chain Not Found</h2>
        <p className="mt-2 text-muted-foreground">The hotel chain you're looking for doesn't exist</p>
        <Button className="mt-6" onClick={() => router.push("/admin/chains")}>
          Back to Chains
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <div className="flex items-center space-x-2">
            <Link href={`/admin/chains/${chainCode}`} className="text-muted-foreground hover:text-foreground">
              {chain.name}
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Hotels</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Hotels</h1>
          <p className="text-muted-foreground">Add, edit, or remove hotels in the {chain.name} chain</p>
        </div>
        <Button onClick={() => router.push(`/admin/chains/${chainCode}/hotels/new`)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Hotel
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hotels in Chain</CardTitle>
          <CardDescription>All properties in the {chain.name} chain</CardDescription>
        </CardHeader>
        <CardContent>
          {hotels.length === 0 ? (
            <div className="flex h-[200px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
              <Hotel className="h-10 w-10 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No hotels found</h3>
              <p className="mt-2 text-sm text-muted-foreground">This chain doesn't have any hotels yet</p>
              <Button onClick={() => router.push(`/admin/chains/${chainCode}/hotels/new`)} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Add Hotel
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hotel Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hotels.map((hotel) => (
                    <TableRow key={hotel._id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          {hotel.isHeadquarters && (
                            <Badge variant="outline" className="mr-2">
                              HQ
                            </Badge>
                          )}
                          {hotel.name}
                        </div>
                      </TableCell>
                      <TableCell>{hotel.code}</TableCell>
                      <TableCell className="capitalize">{hotel.type}</TableCell>
                      <TableCell>{renderStarRating(hotel.starRating || 0)}</TableCell>
                      <TableCell>
                        <Badge variant={hotel.active ? "success" : "destructive"}>
                          {hotel.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => router.push(`/admin/hotels/${hotel._id}`)}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/admin/hotels/${hotel._id}/edit`)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Hotel
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(hotel)}
                              disabled={hotel.isHeadquarters}
                              className={
                                hotel.isHeadquarters
                                  ? "text-muted-foreground"
                                  : "text-destructive focus:text-destructive"
                              }
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              {hotel.isHeadquarters ? "Cannot Remove HQ" : "Remove from Chain"}
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

      {chain.hierarchy && (
        <Card>
          <CardHeader>
            <CardTitle>Chain Hierarchy</CardTitle>
            <CardDescription>Organizational structure of hotels in this chain</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border p-4">
              <ChainHierarchyTree node={chain.hierarchy} />
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Hotel from Chain</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {hotelToDelete?.name} from the {chain.name} chain? This action will not
              delete the hotel, but it will no longer be part of this chain.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                "Remove Hotel"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Helper component to render the chain hierarchy tree
function ChainHierarchyTree({ node }: { node: any }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        {node.isHeadquarters ? (
          <Building2 className="h-5 w-5 text-primary" />
        ) : (
          <Hotel className="h-5 w-5 text-primary" />
        )}
        <span className="font-medium">{node.name}</span>
        <span className="text-sm text-muted-foreground">({node.code})</span>
        {node.isHeadquarters && <Badge variant="outline">Headquarters</Badge>}
      </div>

      {node.children && node.children.length > 0 && (
        <div className="ml-6 border-l pl-6">
          {node.children.map((child: any) => (
            <ChainHierarchyTree key={child.id} node={child} />
          ))}
        </div>
      )}
    </div>
  )
}
