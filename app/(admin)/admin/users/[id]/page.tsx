"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Building, CalendarIcon, Edit, Hotel, Loader2, Mail, User } from "lucide-react"
import { useUsers, type User as UserType } from "@/hooks/use-users"
import { format } from "date-fns"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function UserDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string
  const { getUserById, getUserHotelCount, getUserChainAccess, isLoading: apiLoading } = useUsers()

  const [user, setUser] = useState<UserType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hotelCount, setHotelCount] = useState(0)
  const [chainAccess, setChainAccess] = useState<{ chainCode: string; name: string; accessLevel: string }[]>([])
  const [isLoadingChains, setIsLoadingChains] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true)
      try {
        const userData = await getUserById(userId)
        setUser(userData)

        // Get hotel count
        const hotelCountData = await getUserHotelCount(userId)
        setHotelCount(hotelCountData.count)

        // Get chain access
        const chainAccessData = await getUserChainAccess(userId)
        setChainAccess(chainAccessData)
      } catch (error) {
        console.error("Error fetching user data:", error)
        toast.error("Failed to load user information")
      } finally {
        setIsLoading(false)
        setIsLoadingChains(false)
      }
    }

    fetchUserData()
  }, [userId, getUserById, getUserHotelCount, getUserChainAccess])

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/users">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{user.full_name}</h1>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/admin/users/${userId}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit User
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>Basic user details and account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 border-b pb-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Full Name:</span>
              <span>{user.full_name}</span>
            </div>

            <div className="flex items-center gap-2 border-b pb-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Email:</span>
              <span>{user.email}</span>
            </div>

            <div className="flex items-center gap-2 border-b pb-2">
              <span className="font-medium">Role:</span>
              <span className="capitalize">{user.role}</span>
            </div>

            <div className="flex items-center gap-2 border-b pb-2">
              <span className="font-medium">Status:</span>
              <Badge variant={user.status === "active" ? "default" : "outline"}>{user.status}</Badge>
            </div>

            <div className="flex items-center gap-2 border-b pb-2">
              <Hotel className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Hotel Access:</span>
              <span>{hotelCount} hotels</span>
            </div>

            <div className="flex items-center gap-2 border-b pb-2">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Created:</span>
              <span>{format(new Date(user.createdAt), "PPP")}</span>
            </div>

            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Last Updated:</span>
              <span>{format(new Date(user.updatedAt), "PPP")}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Chain Access</CardTitle>
            <CardDescription>Hotel chains this user has access to</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingChains ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : chainAccess.length === 0 ? (
              <div className="flex h-40 flex-col items-center justify-center">
                <p className="text-muted-foreground">No chain access</p>
                <Button asChild className="mt-4">
                  <Link href={`/admin/users/${userId}/access`}>
                    <Hotel className="mr-2 h-4 w-4" />
                    Manage Access
                  </Link>
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Chain</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Access Level</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {chainAccess.map((chain) => (
                    <TableRow key={chain.chainCode}>
                      <TableCell>{chain.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span>{chain.chainCode}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            chain.accessLevel === "full"
                              ? "default"
                              : chain.accessLevel === "limited"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {chain.accessLevel}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="access">
        <TabsList>
          <TabsTrigger value="access">Hotel Access</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
        </TabsList>

        <TabsContent value="access" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Hotel Access</CardTitle>
              <CardDescription>Hotels this user has access to</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end mb-4">
                <Button asChild>
                  <Link href={`/admin/users/${userId}/access`}>
                    <Hotel className="mr-2 h-4 w-4" />
                    Manage Hotel Access
                  </Link>
                </Button>
              </div>

              {hotelCount === 0 ? (
                <div className="flex h-40 flex-col items-center justify-center">
                  <p className="text-muted-foreground">This user doesn't have access to any hotels yet.</p>
                  <Button asChild className="mt-4">
                    <Link href={`/admin/users/${userId}/access`}>
                      <Hotel className="mr-2 h-4 w-4" />
                      Add Hotel Access
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center p-8">
                  <p className="text-lg font-medium">This user has access to {hotelCount} hotels</p>
                  <p className="text-muted-foreground mt-2">
                    Visit the Manage Access page to view and modify hotel access details
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>User Permissions</CardTitle>
              <CardDescription>Permissions granted to this user based on their role</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end mb-4">
                <Button asChild>
                  <Link href={`/admin/users/${userId}/permissions`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Manage Permissions
                  </Link>
                </Button>
              </div>

              <div className="text-center p-8">
                <p className="text-lg font-medium">Permissions are managed through user roles</p>
                <p className="text-muted-foreground mt-2">
                  This user has the <span className="font-medium capitalize">{user.role}</span> role
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
              <CardDescription>Recent user activity and system interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center p-8">
                <p className="text-muted-foreground">Activity logging is not enabled for this user</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
