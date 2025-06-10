"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Plus, RefreshCw, Users, ShieldCheck } from "lucide-react"
import { useRoles } from "@/hooks/use-roles"
import { useRouter } from "next/navigation"

export default function RoleSettings() {
  const router = useRouter()
  const { getAllRoles, isLoading } = useRoles()
  const [roles, setRoles] = useState<any[]>([])

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const rolesData = await getAllRoles()
        setRoles(rolesData || [])
      } catch (error) {
        toast.error("Failed to load roles")
      }
    }

    loadRoles()
  }, [])

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Role Management</CardTitle>
            <CardDescription>Configure user roles and their permissions</CardDescription>
          </div>
          <Button onClick={() => router.push("/admin/roles/new")}>
            <Plus className="mr-2 h-4 w-4" />
            New Role
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role Name</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Users</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.slice(0, 5).map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">
                      {role.name}
                      {(role.name === "super admin" || role.name === "admin") && (
                        <Badge variant="outline" className="ml-2">
                          System
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{role.permissionCount || role.permissions?.length || 0} permissions</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/roles/${role.id}`)}>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {roles.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                      No roles found. Add a role to get started.
                    </TableCell>
                  </TableRow>
                )}
                {roles.length > 5 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-2">
                      <Button variant="link" onClick={() => router.push("/admin/roles")}>
                        View all {roles.length} roles
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Access Control</CardTitle>
            <CardDescription>Manage role-based permissions for system access</CardDescription>
          </div>
          <Button onClick={() => router.push("/admin/settings/access-control")}>
            <ShieldCheck className="mr-2 h-4 w-4" />
            Manage Access
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border p-4">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-1">
                <h4 className="font-medium">Role-Based Access Control</h4>
                <p className="text-sm text-muted-foreground">
                  Configure which users can access specific features and perform actions
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-md border p-4">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-1">
                <h4 className="font-medium">User Role Assignment</h4>
                <p className="text-sm text-muted-foreground">
                  Assign roles to users to control their access and permissions
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <Button variant="outline" className="w-full" onClick={() => router.push("/admin/settings/access-control")}>
              Configure Access Control
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
