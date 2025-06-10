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
import { Skeleton } from "@/components/ui/skeleton"
import { useHotelChains, type HotelChain } from "@/hooks/use-hotel-chains"
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

export default function HotelChainsPage() {
  const router = useRouter()
  const { getAllChains, isLoading } = useHotelChains()
  const [chains, setChains] = useState<HotelChain[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoadingChains, setIsLoadingChains] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [chainToDelete, setChainToDelete] = useState<string | null>(null)

  useEffect(() => {
    fetchChains()
  }, [])

  const fetchChains = async () => {
    try {
      setIsLoadingChains(true)
      const response = await getAllChains()
      if (response.data) {
        setChains(response.data)
      } else {
        throw new Error("Failed to fetch chains")
      }
    } catch (error) {
      console.error("Error fetching hotel chains:", error)
      toast.error("Failed to load hotel chains")
    } finally {
      setIsLoadingChains(false)
    }
  }

  const handleDeleteChain = async (chainCode: string) => {
    setChainToDelete(chainCode)
  }

  const confirmDeleteChain = async () => {
    if (!chainToDelete) return

    try {
      setIsDeleting(true)
      // In a real implementation, you would call an API to delete the chain
      // await deleteChain(chainToDelete)

      // For now, we'll just simulate the deletion
      setChains(chains.filter((chain) => chain.chainCode !== chainToDelete))
      toast.success("Hotel chain deleted successfully")
    } catch (error) {
      console.error("Error deleting hotel chain:", error)
      toast.error("Failed to delete hotel chain")
    } finally {
      setIsDeleting(false)
      setChainToDelete(null)
    }
  }

  const filteredChains = chains.filter(
    (chain) =>
      chain.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chain.chainCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chain.code.toLowerCase().includes(searchQuery.toLowerCase()),
  )

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

  const renderChainTypeIcon = (type: string) => {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hotel Chains</h1>
          <p className="text-muted-foreground">Manage your hotel chains and their properties</p>
        </div>
        <Button onClick={() => router.push("/admin/chains/new")}>
          <Plus className="mr-2 h-4 w-4" />
          New Chain
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Hotel Chains</CardTitle>
          <CardDescription>View and manage all your hotel chains</CardDescription>
          <div className="mt-4 flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search chains..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingChains ? (
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
          ) : filteredChains.length === 0 ? (
            <div className="flex h-[300px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
              <Building2 className="h-10 w-10 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No hotel chains found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {searchQuery ? "No chains match your search criteria" : "Get started by creating a new hotel chain"}
              </p>
              {!searchQuery && (
                <Button onClick={() => router.push("/admin/chains/new")} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  New Chain
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Chain Name</TableHead>
                    <TableHead>Chain Code</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Hotels</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredChains.map((chain) => (
                    <TableRow key={chain._id}>
                      <TableCell className="font-medium">
                        <Link href={`/admin/chains/${chain.chainCode}`} className="hover:underline">
                          {chain.name}
                        </Link>
                      </TableCell>
                      <TableCell>{chain.chainCode}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {renderChainTypeIcon(chain.type)}
                          <span className="capitalize">{chain.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>{renderStarRating(chain.starRating)}</TableCell>
                      <TableCell>{chain.hotelCount || chain.hotels?.length || 1}</TableCell>
                      <TableCell>
                        <Badge variant={chain.active ? "success" : "destructive"}>
                          {chain.active ? "Active" : "Inactive"}
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
                            <DropdownMenuItem onClick={() => router.push(`/admin/chains/${chain.chainCode}`)}>
                              <Building2 className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => router.push(`/admin/chains/${chain.chainCode}/hotels/new`)}
                            >
                              <Hotel className="mr-2 h-4 w-4" />
                              Add Hotel
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/admin/chains/${chain.chainCode}/users`)}>
                              <Users className="mr-2 h-4 w-4" />
                              Manage Users
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/admin/chains/${chain.chainCode}/sync`)}>
                              <Settings className="mr-2 h-4 w-4" />
                              Sync Configuration
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => router.push(`/admin/chains/${chain.chainCode}/edit`)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Chain
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDeleteChain(chain.chainCode)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Chain
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
            Showing {filteredChains.length} of {chains.length} chains
          </div>
          <Button variant="outline" onClick={fetchChains} disabled={isLoadingChains}>
            {isLoadingChains ? (
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

      <AlertDialog open={!!chainToDelete} onOpenChange={(open) => !open && setChainToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete this hotel chain and all associated configuration. Hotels in this
              chain will be unlinked but not deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteChain}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Chain"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
