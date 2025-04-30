"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Loader2, MoreHorizontal, Plus, Hotel, Trash, Edit, Eye, FolderSyncIcon as Sync } from "lucide-react"
import { useHotelChains, type HotelChain } from "@/hooks/use-hotel-chains"
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

export default function HotelChainsPage() {
  const { getAllChains, isLoading } = useHotelChains()
  const [chains, setChains] = useState<HotelChain[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteChainId, setDeleteChainId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const fetchHotelChains = async () => {
      try {
        const response = await getAllChains()
        if (response.data) {
          setChains(response.data)
        }
      } catch (error) {
        console.error("Error fetching hotel chains:", error)
        toast.error("Failed to load hotel chains")
      }
    }

    fetchHotelChains()
  }, [getAllChains])

  const filteredChains = chains.filter(
    (chain) =>
      chain.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chain.chainCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chain.code.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleDeleteChain = async () => {
    if (!deleteChainId) return

    setIsDeleting(true)
    try {
      // In a real implementation, you would call the API to delete the chain
      // await deleteChain(deleteChainId)

      // For now, we'll just simulate the deletion
      setChains(chains.filter((chain) => chain._id !== deleteChainId))
      toast.success("Hotel chain deleted successfully")
    } catch (error) {
      console.error("Error deleting hotel chain:", error)
      toast.error("Failed to delete hotel chain")
    } finally {
      setIsDeleting(false)
      setDeleteChainId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hotel Chains</h1>
          <p className="text-muted-foreground">Manage your hotel chains and their properties</p>
        </div>
        <Button asChild>
          <Link href="/admin/chains/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Chain
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Hotel Chains</CardTitle>
          <CardDescription>View and manage all hotel chains in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search by name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredChains.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center">
              <p className="text-muted-foreground">No hotel chains found</p>
              <Button asChild className="mt-4">
                <Link href="/admin/chains/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Chain
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Chain Name</TableHead>
                  <TableHead>Chain Code</TableHead>
                  <TableHead>Hotels</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredChains.map((chain) => (
                  <TableRow key={chain._id}>
                    <TableCell className="font-medium">{chain.name}</TableCell>
                    <TableCell>{chain.chainCode}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Hotel className="h-4 w-4 text-muted-foreground" />
                        <span>{chain.hotelCount || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={chain.active ? "default" : "outline"}>
                        {chain.active ? "Active" : "Inactive"}
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
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/chains/${chain.chainCode}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/chains/${chain.chainCode}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/chains/${chain.chainCode}/hotels`}>
                              <Hotel className="mr-2 h-4 w-4" />
                              Manage Hotels
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/chains/${chain.chainCode}/sync`}>
                              <Sync className="mr-2 h-4 w-4" />
                              Sync Configuration
                            </Link>
                          </DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onSelect={(e) => {
                                  e.preventDefault()
                                  setDeleteChainId(chain._id)
                                }}
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action will permanently delete the hotel chain "{chain.name}" and cannot be
                                  undone. All hotels in this chain will be unlinked.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setDeleteChainId(null)}>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={handleDeleteChain}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  disabled={isDeleting}
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
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
