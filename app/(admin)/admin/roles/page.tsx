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
import { Loader2, MoreHorizontal, Plus, Trash, Edit, Key, AlertCircle } from "lucide-react"
import { useRoles, type Role } from "@/hooks/use-roles"

export default function RolesPage() {
  const { getAllRoles, deleteRole, isLoading: apiLoading } = useRoles()
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setIsLoading(true)
        const fetchedRoles = await getAllRoles()
        setRoles(Array.isArray(fetchedRoles) ? fetchedRoles : [])
      } catch (error) {
        console.error("Error fetching roles:", error)
        toast.error("Failed to load roles")
      } finally {
        setIsLoading(false)
      }
    }

    fetchRoles()
  }, [getAllRoles])

  const filteredRoles = roles.filter(
    (role) =>
      role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleDeleteClick = (role: Role) => {
    setRoleToDelete(role)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!roleToDelete) return

    try {
      setIsDeleting(true)
      await deleteRole(roleToDelete.id)
      setRoles((prevRoles) => prevRoles.filter((role) => role.id !== roleToDelete.id))
      toast.success(`Role "${roleToDelete.name}" deleted successfully`)
    } catch (error: any) {
      console.error("Error deleting role:", error)
      if (error.message.includes("assigned to")) {
        toast.error("Cannot delete role that is assigned to users")
      } else if (error.message.includes("system roles")) {
        toast.error("Cannot delete system roles")
      } else {
        toast.error("Failed to delete role")
      }
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setRoleToDelete(null)
    }
  }

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
                  <TableRow key={role.id}>
                    <TableCell className="font-medium capitalize">{role.name}</TableCell>
                    <TableCell>{role.description}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {role.permissions && role.permissions.length > 0 ? (
                          <>
                            {role.permissions.slice(0, 3).map((permission) => (
                              <Badge key={permission.id} variant="outline">
                                {permission.key}
                              </Badge>
                            ))}
                            {role.permissions.length > 3 && (
                              <Badge variant="outline">+{role.permissions.length - 3} more</Badge>
                            )}
                          </>
                        ) : (
                          <span className="text-muted-foreground">{role.permissionCount || 0} permissions</span>
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
                            <Link href={`/admin/roles/${role.id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/roles/${role.id}/permissions`}>
                              <Key className="mr-2 h-4 w-4" />
                              Manage Permissions
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDeleteClick(role)}
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Delete Role
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the role "{roleToDelete?.name}"? This action cannot be undone.
              {roleToDelete?.name === "super admin" || roleToDelete?.name === "admin" ? (
                <p className="mt-2 text-destructive font-semibold">System roles cannot be deleted.</p>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDeleteConfirm()
              }}
              disabled={isDeleting || roleToDelete?.name === "super admin" || roleToDelete?.name === "admin"}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash className="mr-2 h-4 w-4" />}
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
