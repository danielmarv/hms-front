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

export default function HotelChainsPage() {
  const [chains, setChains] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchHotelChains = async () => {
      try {
        // In a real app, you would fetch this data from your API
        // const response = await fetch('/api/chains')
        // const data = await response.json()

        // For now, we'll use mock data
        setChains([
          {
            _id: "1",
            chainCode: "LUXE",
            name: "Luxe Hotels International",
            code: "LHI",
            description: "Luxury hotel chain with global presence",
            hotelCount: 12,
            active: true,
          },
          {
            _id: "2",
            chainCode: "COMF",
            name: "Comfort Inn Group",
            code: "CIG",
            description: "Mid-range comfortable accommodations",
            hotelCount: 24,
            active: true,
          },
          {
            _id: "3",
            chainCode: "BUDG",
            name: "Budget Stays",
            code: "BST",
            description: "Affordable accommodations for budget travelers",
            hotelCount: 18,
            active: true,
          },
          {
            _id: "4",
            chainCode: "RESO",
            name: "Resort Paradise",
            code: "RPD",
            description: "Luxury beach and mountain resorts",
            hotelCount: 8,
            active: true,
          },
          {
            _id: "5",
            chainCode: "BOUT",
            name: "Boutique Collection",
            code: "BCL",
            description: "Unique boutique hotels with character",
            hotelCount: 6,
            active: false,
          },
        ])
      } catch (error) {
        console.error("Error fetching hotel chains:", error)
        toast.error("Failed to load hotel chains")
      } finally {
        setIsLoading(false)
      }
    }

    fetchHotelChains()
  }, [])

  const filteredChains = chains.filter(
    (chain) =>
      chain.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chain.chainCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chain.code.toLowerCase().includes(searchQuery.toLowerCase()),
  )

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
                        <span>{chain.hotelCount}</span>
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
                            <Link href={`/admin/chains/${chain._id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/chains/${chain._id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/chains/${chain._id}/hotels`}>
                              <Hotel className="mr-2 h-4 w-4" />
                              Manage Hotels
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/chains/${chain._id}/sync`}>
                              <Sync className="mr-2 h-4 w-4" />
                              Sync Configuration
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => {
                              // In a real app, you would call an API to delete the chain
                              toast.success(`${chain.name} would be deleted (demo only)`)
                            }}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
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
