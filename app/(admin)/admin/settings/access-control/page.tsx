"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { ArrowLeft, RefreshCw, Save } from "lucide-react"
import { useRoles } from "@/hooks/use-roles"
import { usePermissions } from "@/hooks/use-permissions"

export default function AccessControlPage() {
  const router = useRouter()
  const { getAllRoles, updateRole, isLoading: rolesLoading } = useRoles()
  const { getAllPermissions, isLoading: permissionsLoading } = usePermissions()

  const [roles, setRoles] = useState<any[]>([])
  const [permissions, setPermissions] = useState<any[]>([])
  const [permissionsByCategory, setPermissionsByCategory] = useState<any[]>([])
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>({})
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load roles
        const rolesData = await getAllRoles()
        setRoles(rolesData || [])

        // Load permissions
        const permissionsData = await getAllPermissions()
        setPermissions(permissionsData || [])

        // Group permissions by category
        const groupedPermissions = groupPermissionsByCategory(permissionsData || [])
        setPermissionsByCategory(groupedPermissions)

        // Initialize role permissions mapping
        const permissionsMap: Record<string, string[]> = {}
        rolesData?.forEach((role: any) => {
          permissionsMap[role.id] = role.permissions.map((p: any) => p.id)
        })
        setRolePermissions(permissionsMap)
      } catch (error) {
        toast.error("Failed to load roles and permissions")
      }
    }

    loadData()
  }, [])

  const groupPermissionsByCategory = (permissions: any[]) => {
    const grouped: Record<string, any[]> = {}

    permissions.forEach((permission) => {
      if (!grouped[permission.category]) {
        grouped[permission.category] = []
      }
      grouped[permission.category].push(permission)
    })

    return Object.entries(grouped).map(([category, permissions]) => ({
      category,
      permissions,
    }))
  }

  const handlePermissionChange = (roleId: string, permissionId: string, checked: boolean) => {
    setRolePermissions((prev) => {
      const updatedPermissions = { ...prev }

      if (checked) {
        // Add permission
        if (!updatedPermissions[roleId]) {
          updatedPermissions[roleId] = []
        }
        updatedPermissions[roleId] = [...updatedPermissions[roleId], permissionId]
      } else {
        // Remove permission
        updatedPermissions[roleId] = updatedPermissions[roleId].filter((id) => id !== permissionId)
      }

      return updatedPermissions
    })
  }

  const handleSelectAllInCategory = (roleId: string, categoryPermissions: any[], checked: boolean) => {
    const permissionIds = categoryPermissions.map((p) => p.id)

    setRolePermissions((prev) => {
      const updatedPermissions = { ...prev }

      if (!updatedPermissions[roleId]) {
        updatedPermissions[roleId] = []
      }

      if (checked) {
        // Add all permissions in this category
        const currentPermissions = new Set(updatedPermissions[roleId])
        permissionIds.forEach((id) => currentPermissions.add(id))
        updatedPermissions[roleId] = Array.from(currentPermissions)
      } else {
        // Remove all permissions in this category
        updatedPermissions[roleId] = updatedPermissions[roleId].filter((id) => !permissionIds.includes(id))
      }

      return updatedPermissions
    })
  }

  const savePermissions = async () => {
    setIsSaving(true)

    try {
      // Save permissions for each role
      for (const roleId in rolePermissions) {
        await updateRole(roleId, {
          permissions: rolePermissions[roleId],
        })
      }

      toast.success("Access control settings saved successfully")
    } catch (error) {
      toast.error("Failed to save access control settings")
    } finally {
      setIsSaving(false)
    }
  }

  const isLoading = rolesLoading || permissionsLoading

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.push("/admin/settings")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Access Control</h1>
            <p className="text-muted-foreground">Manage role-based permissions for system access</p>
          </div>
        </div>
        <Button onClick={savePermissions} disabled={isSaving}>
          {isSaving ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Role Permissions Matrix</CardTitle>
          <CardDescription>Configure which permissions are granted to each role in the system</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-8">
                {permissionsByCategory.map((category) => (
                  <div key={category.category} className="space-y-4">
                    <h3 className="text-lg font-medium capitalize">{category.category}</h3>
                    <Separator />

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[300px]">Permission</TableHead>
                          {roles.map((role) => (
                            <TableHead key={role.id} className="text-center">
                              {role.name}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Select All {category.category}</TableCell>
                          {roles.map((role) => (
                            <TableCell key={role.id} className="text-center">
                              <Checkbox
                                checked={category.permissions.every((p: any) =>
                                  rolePermissions[role.id]?.includes(p.id),
                                )}
                                onCheckedChange={(checked) =>
                                  handleSelectAllInCategory(role.id, category.permissions, !!checked)
                                }
                                disabled={role.name === "super admin"}
                              />
                            </TableCell>
                          ))}
                        </TableRow>

                        {category.permissions.map((permission: any) => (
                          <TableRow key={permission.id}>
                            <TableCell className="font-medium">
                              <div className="space-y-1">
                                <div>{permission.key}</div>
                                <div className="text-xs text-muted-foreground">{permission.description}</div>
                              </div>
                            </TableCell>
                            {roles.map((role) => (
                              <TableCell key={role.id} className="text-center">
                                <Checkbox
                                  checked={rolePermissions[role.id]?.includes(permission.id)}
                                  onCheckedChange={(checked) =>
                                    handlePermissionChange(role.id, permission.id, !!checked)
                                  }
                                  disabled={role.name === "super admin"}
                                />
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
