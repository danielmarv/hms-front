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
import { Loader2, MoreHorizontal, Plus, Trash, Edit, Key } from "lucide-react"

export default function RolesPage() {
  const [roles, setRoles] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        // In a real app, you would fetch this data from your API
        // const response = await fetch('/api/roles')
        // const data = await response.json()

        // For now, we'll use mock data
        setRoles([
          {
            _id: "1",
            name: "super admin",
            description: "Full system access with all permissions",
            permissions: [
              { _id: "p1", key: "manage_hotel", description: "Manage hotels" },
              { _id: "p2", key: "manage_users", description: "Manage users" },
              { _id: "p3", key: "manage_configuration", description: "Manage configuration" },
              { _id: "p4", key: "view_all_data", description: "View all data" },
            ],
          },
          {
            _id: "2",
            name: "hotel manager",
            description: "Manage a specific hotel and its operations",
            permissions: [
              { _id: "p1", key: "manage_hotel", description: "Manage hotels" },
              { _id: "p5", key: "manage_bookings", description: "Manage bookings" },
              { _id: "p6", key: "manage_staff", description: "Manage staff" },
            ],
          },
          {
            _id: "3",
            name: "receptionist",
            description: "Front desk operations",
            permissions: [
              { _id: "p5", key: "manage_bookings", description: "Manage bookings" },
              { _id: "p7", key: "check_in_out", description: "Check-in/out guests" },
            ],
          },
          {
            _id: "4",
            name: "chain manager",
            description: "Manage hotels across a chain",
            permissions: [
              { _id: "p1", key: "manage_hotel", description: "Manage hotels" },
              { _id: "p3", key: "manage_configuration", description: "Manage configuration" },
              { _id: "p4", key: "view_all_data", description: "View all data" },
            ],
          },
        ])
      } catch (error) {
        console.error("Error fetching roles:", error)
        toast.error("Failed to load roles")
      } finally {
        setIsLoading(false)
      }
    }

    fetchRoles()
  }, [])

  const filteredRoles = roles.filter(
    (role) =>
      role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Roles & Permissions</h1>
          <p className="text-muted-foreground">Manage user roles and their permissions</p>
        </div>
        <Button asChild>
          <Link href="/admin/roles/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Role
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Roles</CardTitle>
          <CardDescription>View and manage all roles in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredRoles.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center">
              <p className="text-muted-foreground">No roles found</p>
              <Button asChild className="mt-4">
                <Link href="/admin/roles/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Role
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoles.map((role) => (
                  <TableRow key={role._id}>
                    <TableCell className="font-medium capitalize">{role.name}</TableCell>
                    <TableCell>{role.description}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {role.permissions.slice(0, 3).map((permission: any) => (
                          <Badge key={permission._id} variant="outline">
                            {permission.key}
                          </Badge>
                        ))}
                        {role.permissions.length > 3 && (
                          <Badge variant="outline">+{role.permissions.length - 3} more</Badge>
                        )}
                      </div>
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
                            <Link href={`/admin/roles/${role._id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/roles/${role._id}/permissions`}>
                              <Key className="mr-2 h-4 w-4" />
                              Manage Permissions
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => {
                              // In a real app, you would call an API to delete the role
                              toast.success(`${role.name} would be deleted (demo only)`)
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
