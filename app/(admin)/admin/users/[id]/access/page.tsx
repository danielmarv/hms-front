"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Building, Loader2, Plus, Trash } from "lucide-react"

export default function UserAccessPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string
  const [user, setUser] = useState<any>(null)
  const [hotelAccess, setHotelAccess] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [chains, setChains] = useState<any[]>([])
  const [hotels, setHotels] = useState<any[]>([])
  const [selectedChain, setSelectedChain] = useState("")
  const [selectedHotel, setSelectedHotel] = useState("")
  const [accessLevel, setAccessLevel] = useState("read-only")
  const [accessAllBranches, setAccessAllBranches] = useState(false)
  const [isAddingAccess, setIsAddingAccess] = useState(false)

  useEffect(() => {
    const fetchUserAccess = async () => {
      try {
        // In a real app, you would fetch this data from your API
        // const userResponse = await fetch(`/api/users/${userId}`)
        // const userData = await userResponse.json()
        // const accessResponse = await fetch(`/api/users/${userId}/hotels`)
        // const accessData = await accessResponse.json()

        // For now, we'll use mock data
        setUser({
          _id: userId,
          full_name: "Sarah Johnson",
          email: "sarah.johnson@example.com",
          role: "hotel manager",
          status: "active",
        })

        setHotelAccess([
          {
            _id: "access1",
            hotel: {
              _id: "h1",
              name: "Luxe New York",
              code: "LHI-NY",
              chainCode: "LUXE",
            },
            accessLevel: "full",
            accessAllBranches: true,
            isDefault: true,
            accessSource: "direct",
          },
          {
            _id: "access2",
            hotel: {
              _id: "h2",
              name: "Luxe London",
              code: "LHI-LON",
              chainCode: "LUXE",
            },
            accessLevel: "limited",
            accessAllBranches: false,
            isDefault: false,
            accessSource: "direct",
          },
        ])

        setChains([
          { _id: "1", name: "Luxe Hotels International", chainCode: "LUXE" },
          { _id: "2", name: "Comfort Inn Group", chainCode: "COMF" },
          { _id: "3", name: "Budget Stays", chainCode: "BUDG" },
        ])

        setHotels([
          { _id: "h1", name: "Luxe New York", code: "LHI-NY", chainCode: "LUXE" },
          { _id: "h2", name: "Luxe London", code: "LHI-LON", chainCode: "LUXE" },
          { _id: "h3", name: "Luxe Paris", code: "LHI-PAR", chainCode: "LUXE" },
          { _id: "h4", name: "Comfort Boston", code: "CIG-BOS", chainCode: "COMF" },
          { _id: "h5", name: "Comfort Chicago", code: "CIG-CHI", chainCode: "COMF" },
          { _id: "h6", name: "Budget NYC", code: "BST-NYC", chainCode: "BUDG" },
        ])
      } catch (error) {
        console.error("Error fetching user access:", error)
        toast.error("Failed to load user access information")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserAccess()
  }, [userId])

  const handleAddAccess = async () => {
    if (!selectedHotel) {
      toast.error("Please select a hotel")
      return
    }

    setIsAddingAccess(true)

    try {
      // In a real app, you would call an API to add access
      // const response = await fetch(`/api/users/${userId}/hotels/${selectedHotel}`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ accessLevel, accessAllBranches })
      // })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Find the selected hotel
      const hotel = hotels.find((h) => h._id === selectedHotel)

      // Add new access to the list
      setHotelAccess((prev) => [
        ...prev,
        {
          _id: `access-${Date.now()}`,
          hotel,
          accessLevel,
          accessAllBranches,
          isDefault: false,
          accessSource: "direct",
        },
      ])

      // Reset form
      setSelectedHotel("")
      setAccessLevel("read-only")
      setAccessAllBranches(false)

      toast.success("Hotel access added successfully")
    } catch (error) {
      console.error("Error adding hotel access:", error)
      toast.error("Failed to add hotel access")
    } finally {
      setIsAddingAccess(false)
    }
  }

  const handleRemoveAccess = async (accessId: string) => {
    try {
      // In a real app, you would call an API to remove access
      // const response = await fetch(`/api/users/${userId}/access/${accessId}`, {
      //   method: 'DELETE'
      // })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Remove access from the list
      setHotelAccess((prev) => prev.filter((access) => access._id !== accessId))

      toast.success("Hotel access removed successfully")
    } catch (error) {
      console.error("Error removing hotel access:", error)
      toast.error("Failed to remove hotel access")
    }
  }

  const handleChainChange = (value: string) => {
    setSelectedChain(value)
    setSelectedHotel("")
  }

  const filteredHotels = selectedChain ? hotels.filter((hotel) => hotel.chainCode === selectedChain) : hotels

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/users">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-[600px] w-full" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <h2 className="text-xl font-semibold">User not found</h2>
        <p className="text-muted-foreground">The requested user could not be found.</p>
        <Button className="mt-4" asChild>
          <Link href="/admin/users">Back to Users</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/users">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage User Access</h1>
          <p className="text-muted-foreground">
            {user.full_name} ({user.email})
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hotel Access</CardTitle>
          <CardDescription>Manage which hotels this user can access and their permission level</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-md border p-4">
            <h3 className="text-sm font-medium mb-4">Add Hotel Access</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="chain">Hotel Chain</Label>
                <Select value={selectedChain} onValueChange={handleChainChange}>
                  <SelectTrigger id="chain">
                    <SelectValue placeholder="Select chain" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Chains</SelectItem>
                    {chains.map((chain) => (
                      <SelectItem key={chain._id} value={chain.chainCode}>
                        {chain.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hotel">Hotel</Label>
                <Select value={selectedHotel} onValueChange={setSelectedHotel}>
                  <SelectTrigger id="hotel">
                    <SelectValue placeholder="Select hotel" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredHotels.map((hotel) => (
                      <SelectItem key={hotel._id} value={hotel._id}>
                        {hotel.name} ({hotel.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accessLevel">Access Level</Label>
                <Select value={accessLevel} onValueChange={setAccessLevel}>
                  <SelectTrigger id="accessLevel">
                    <SelectValue placeholder="Select access level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="read-only">Read Only</SelectItem>
                    <SelectItem value="limited">Limited</SelectItem>
                    <SelectItem value="full">Full Access</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button onClick={handleAddAccess} disabled={isAddingAccess || !selectedHotel}>
                  {isAddingAccess ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Access
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="mt-4 flex items-center space-x-2">
              <Switch id="accessAllBranches" checked={accessAllBranches} onCheckedChange={setAccessAllBranches} />
              <Label htmlFor="accessAllBranches">Access all branches (for chain headquarters)</Label>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-4">Current Access</h3>
            {hotelAccess.length === 0 ? (
              <div className="rounded-md border p-8 text-center">
                <p className="text-muted-foreground mb-4">This user doesn't have access to any hotels yet.</p>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Hotel Access
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hotel</TableHead>
                    <TableHead>Chain</TableHead>
                    <TableHead>Access Level</TableHead>
                    <TableHead>Branch Access</TableHead>
                    <TableHead>Default</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hotelAccess.map((access) => (
                    <TableRow key={access._id}>
                      <TableCell className="font-medium">
                        {access.hotel.name} ({access.hotel.code})
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span>{access.hotel.chainCode}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            access.accessLevel === "full"
                              ? "default"
                              : access.accessLevel === "limited"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {access.accessLevel}
                        </Badge>
                      </TableCell>
                      <TableCell>{access.accessAllBranches ? "All Branches" : "This Hotel Only"}</TableCell>
                      <TableCell>
                        {access.isDefault ? (
                          <Badge variant="default">Default</Badge>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // In a real app, you would call an API to set as default
                              toast.success("Set as default hotel")
                            }}
                          >
                            Set Default
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{access.accessSource === "direct" ? "Direct" : "Chain"}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveAccess(access._id)}>
                          <Trash className="h-4 w-4 text-destructive" />
                          <span className="sr-only">Remove access</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
