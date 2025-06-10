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
import { Label } from "@/components/ui/label"
import { ArrowLeft, Building, Loader2, Plus, Trash, ShieldCheck } from "lucide-react"
import { useUsers } from "@/hooks/use-users"
import { useUserAccess, type Hotel, type HotelChain, type UserAccess, type Role } from "@/hooks/use-user-access"

export default function UserAccessPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string

  // State
  const [user, setUser] = useState<any>(null)
  const [hotelAccess, setHotelAccess] = useState<UserAccess[]>([])
  const [chains, setChains] = useState<HotelChain[]>([])
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [selectedChain, setSelectedChain] = useState("")
  const [selectedHotel, setSelectedHotel] = useState("")
  const [selectedRole, setSelectedRole] = useState("")
  const [accessLevel, setAccessLevel] = useState<"read" | "write" | "admin">("read")
  const [accessAllBranches, setAccessAllBranches] = useState(false)
  const [isAddingAccess, setIsAddingAccess] = useState(false)

  // Hooks
  const { getUserById } = useUsers()
  const {
    isLoading: isAccessLoading,
    getUserHotelAccess,
    addUserHotelAccess,
    removeUserHotelAccess,
    setDefaultHotel,
    getAllHotels,
    getAllChains,
    getAllRoles,
  } = useUserAccess()

  const isLoading = isAccessLoading || !user

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user details
        const userData = await getUserById(userId)
        setUser(userData)

        // Fetch user's hotel access
        const accessData = await getUserHotelAccess(userId)
        setHotelAccess(Array.isArray(accessData) ? accessData : [])

        // Fetch all hotel chains
        try {
          const chainsData = await getAllChains()
          setChains(Array.isArray(chainsData) ? chainsData : [])
        } catch (error) {
          console.error("Error fetching chains:", error)
          setChains([])
        }

        // Fetch all hotels
        try {
          const hotelsData = await getAllHotels()
          setHotels(Array.isArray(hotelsData) ? hotelsData : [])
        } catch (error) {
          console.error("Error fetching hotels:", error)
          setHotels([])
        }

        // Fetch all roles
        try {
          const rolesData = await getAllRoles()
          setRoles(Array.isArray(rolesData) ? rolesData : [])
        } catch (error) {
          console.error("Error fetching roles:", error)
          setRoles([])
        }
      } catch (error) {
        console.error("Error fetching user access data:", error)
        toast.error("Failed to load user access information")
      }
    }

    fetchData()
  }, [userId, getUserById, getUserHotelAccess, getAllChains, getAllHotels, getAllRoles])

  const handleAddAccess = async () => {
    if (!selectedHotel) {
      toast.error("Please select a hotel")
      return
    }

    setIsAddingAccess(true)

    try {
      const accessData = {
        roleId: selectedRole || undefined,
        accessLevel,
      }

      const newAccess = await addUserHotelAccess(userId, selectedHotel, accessData)

      // Add new access to the list
      setHotelAccess((prev) => [...prev, newAccess])

      // Reset form
      setSelectedHotel("")
      setSelectedRole("")
      setAccessLevel("read")
      setAccessAllBranches(false)

      toast.success("Hotel access added successfully")
    } catch (error) {
      console.error("Error adding hotel access:", error)
      toast.error("Failed to add hotel access")
    } finally {
      setIsAddingAccess(false)
    }
  }

  const handleRemoveAccess = async (hotelId: string) => {
    try {
      await removeUserHotelAccess(userId, hotelId)

      // Remove access from the list
      setHotelAccess((prev) =>
        prev.filter((access) => {
          const accessHotelId = typeof access.hotel === "string" ? access.hotel : access.hotel._id
          return accessHotelId !== hotelId
        }),
      )

      toast.success("Hotel access removed successfully")
    } catch (error) {
      console.error("Error removing hotel access:", error)
      toast.error("Failed to remove hotel access")
    }
  }

  const handleSetDefault = async (hotelId: string) => {
    try {
      const updatedUser = await setDefaultHotel(userId, hotelId)

      // Update the access list to reflect the new default
      if (updatedUser && updatedUser.accessible_hotels) {
        setHotelAccess(updatedUser.accessible_hotels)
      }

      toast.success("Default hotel set successfully")
    } catch (error) {
      console.error("Error setting default hotel:", error)
      toast.error("Failed to set default hotel")
    }
  }

  const handleChainChange = (value: string) => {
    setSelectedChain(value)
    setSelectedHotel("")
  }

  // Ensure filteredHotels is always an array
  const filteredHotels = Array.isArray(hotels)
    ? selectedChain === "all"
      ? hotels
      : selectedChain
        ? hotels.filter((hotel) => hotel.chainCode === selectedChain)
        : hotels
    : []

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
                    {Array.isArray(chains) &&
                      chains.map((chain) => (
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
                    {Array.isArray(filteredHotels) &&
                      filteredHotels.map((hotel) => (
                        <SelectItem key={hotel._id} value={hotel._id}>
                          {hotel.name} ({hotel.code})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role (Optional)</Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No specific role</SelectItem>
                    {Array.isArray(roles) &&
                      roles.map((role) => (
                        <SelectItem key={role._id} value={role._id}>
                          {role.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accessLevel">Access Level</Label>
                <Select
                  value={accessLevel}
                  onValueChange={(value: "read" | "write" | "admin") => setAccessLevel(value)}
                >
                  <SelectTrigger id="accessLevel">
                    <SelectValue placeholder="Select access level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="read">Read Only</SelectItem>
                    <SelectItem value="write">Write</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
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

          <div>
            <h3 className="text-sm font-medium mb-4">Current Access</h3>
            {!Array.isArray(hotelAccess) || hotelAccess.length === 0 ? (
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
                    <TableHead>Role</TableHead>
                    <TableHead>Access Level</TableHead>
                    <TableHead>Default</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hotelAccess.map((access, index) => {
                    // Handle both string and object references for hotel
                    const hotel =
                      typeof access.hotel === "string" ? hotels.find((h) => h._id === access.hotel) : access.hotel

                    // Handle both string and object references for role
                    const role =
                      typeof access.role === "string" ? roles.find((r) => r._id === access.role) : access.role

                    if (!hotel) return null

                    const hotelId = typeof hotel === "string" ? hotel : hotel._id
                    const hotelName = typeof hotel === "string" ? "Unknown Hotel" : `${hotel.name} (${hotel.code})`
                    const chainCode = typeof hotel === "string" ? "" : hotel.chainCode || ""

                    return (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{hotelName}</TableCell>
                        <TableCell>
                          {chainCode && (
                            <div className="flex items-center gap-1">
                              <Building className="h-4 w-4 text-muted-foreground" />
                              <span>{chainCode}</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {role ? (
                            <div className="flex items-center gap-1">
                              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                              <span>{typeof role === "string" ? role : role.name}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Default</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              access.access_level === "admin"
                                ? "default"
                                : access.access_level === "write"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {access.access_level}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {access.isDefault ? (
                            <Badge variant="default">Default</Badge>
                          ) : (
                            <Button variant="outline" size="sm" onClick={() => handleSetDefault(hotelId)}>
                              Set Default
                            </Button>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => handleRemoveAccess(hotelId)}>
                            <Trash className="h-4 w-4 text-destructive" />
                            <span className="sr-only">Remove access</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
