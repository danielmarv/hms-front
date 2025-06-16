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
import { ArrowLeft, Building, CalendarIcon, Edit, Hotel, Mail, User } from "lucide-react"
import { useUsers } from "@/hooks/use-users"
import { format } from "date-fns"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export interface DetailedUser {
  _id: string
  full_name: string
  email: string
  phone?: string
  role: {
    _id: string
    name: string
    description: string
  }
  status: "active" | "inactive"
  createdAt: string
  updatedAt: string
  last_login?: string
  is_email_verified: boolean
  is_global_admin: boolean
  accessible_hotels: Array<{
    _id: string
    hotel: {
      _id: string
      id: string
      name: string
      code: string
      type: string
    }
    access_level: string
  }>
  custom_permissions: string[]
  login_attempts: number
  verification_expires?: string
  verification_token?: string
  updatedBy?: {
    _id: string
    full_name: string
  }
}

export default function UserDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string
  const { getUserById, isLoading: apiLoading } = useUsers()

  const [user, setUser] = useState<DetailedUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingChains, setIsLoadingChains] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true)
      try {
        const userData = await getUserById(userId)
        setUser(userData as DetailedUser)
        console.log("Fetched user data:", userData)
      } catch (error) {
        console.error("Error fetching user data:", error)
        toast.error("Failed to load user information")
      } finally {
        setIsLoading(false)
        setIsLoadingChains(false)
      }
    }

    fetchUserData()
  }, [userId, getUserById])

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
              {user.is_email_verified ? (
                <Badge variant="default" className="ml-2">
                  Verified
                </Badge>
              ) : (
                <Badge variant="outline" className="ml-2">
                  Unverified
                </Badge>
              )}
            </div>

            {user.phone && (
              <div className="flex items-center gap-2 border-b pb-2">
                <span className="font-medium">Phone:</span>
                <span>{user.phone}</span>
              </div>
            )}

            <div className="flex items-center gap-2 border-b pb-2">
              <span className="font-medium">Role:</span>
              <div className="flex flex-col">
                <span className="capitalize font-medium">{user.role.name}</span>
                <span className="text-sm text-muted-foreground">{user.role.description}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 border-b pb-2">
              <span className="font-medium">Status:</span>
              <Badge variant={user.status === "active" ? "default" : "outline"}>{user.status}</Badge>
              {user.is_global_admin && (
                <Badge variant="destructive" className="ml-2">
                  Global Admin
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2 border-b pb-2">
              <Hotel className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Hotel Access:</span>
              <span>{user.accessible_hotels?.length || 0} hotels</span>
            </div>

            {user.last_login && (
              <div className="flex items-center gap-2 border-b pb-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Last Login:</span>
                <span>{format(new Date(user.last_login), "PPp")}</span>
              </div>
            )}

            <div className="flex items-center gap-2 border-b pb-2">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Created:</span>
              <span>
                {user.createdAt && !isNaN(new Date(user.createdAt).getTime())
                  ? format(new Date(user.createdAt), "PPP")
                  : "N/A"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Last Updated:</span>
              <span>
                {user.updatedAt && !isNaN(new Date(user.updatedAt).getTime())
                  ? format(new Date(user.updatedAt), "PPP")
                  : "N/A"}
              </span>
              {user.updatedBy && (
                <span className="text-sm text-muted-foreground ml-2">by {user.updatedBy.full_name}</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hotel Access</CardTitle>
            <CardDescription>Hotels this user has access to</CardDescription>
          </CardHeader>
          <CardContent>
            {user.accessible_hotels && user.accessible_hotels.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hotel Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Access Level</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {user.accessible_hotels.map((access) => (
                    <TableRow key={access._id}>
                      <TableCell className="font-medium">{access.hotel.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span>{access.hotel.code}</span>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{access.hotel.type}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            access.access_level === "admin"
                              ? "default"
                              : access.access_level === "manager"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {access.access_level}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex h-40 flex-col items-center justify-center">
                <p className="text-muted-foreground">No hotel access assigned</p>
                <Button asChild className="mt-4">
                  <Link href={`/admin/users/${userId}/access`}>
                    <Hotel className="mr-2 h-4 w-4" />
                    Manage Access
                  </Link>
                </Button>
              </div>
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
              <CardTitle>Hotel Access Details</CardTitle>
              <CardDescription>Detailed view of hotels this user has access to</CardDescription>
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

              {user.accessible_hotels && user.accessible_hotels.length > 0 ? (
                <div className="space-y-4">
                  {user.accessible_hotels.map((access) => (
                    <Card key={access._id}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{access.hotel.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {access.hotel.code} • {access.hotel.type}
                            </p>
                          </div>
                          <Badge
                            variant={
                              access.access_level === "admin"
                                ? "default"
                                : access.access_level === "manager"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {access.access_level}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex h-40 flex-col items-center justify-center">
                  <p className="text-muted-foreground">This user doesn't have access to any hotels yet.</p>
                  <Button asChild className="mt-4">
                    <Link href={`/admin/users/${userId}/access`}>
                      <Hotel className="mr-2 h-4 w-4" />
                      Add Hotel Access
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>User Permissions</CardTitle>
              <CardDescription>Role-based and custom permissions for this user</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2">Role Permissions</h4>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="font-medium">{user.role.name}</p>
                    <p className="text-sm text-muted-foreground">{user.role.description}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Custom Permissions</h4>
                  {user.custom_permissions && user.custom_permissions.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {user.custom_permissions.map((permission, index) => (
                        <Badge key={index} variant="outline">
                          {permission}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No custom permissions assigned</p>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button asChild>
                    <Link href={`/admin/users/${userId}/permissions`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Manage Permissions
                    </Link>
                  </Button>
                </div>
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
