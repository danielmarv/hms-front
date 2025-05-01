"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Loader2, Save } from "lucide-react"
import { useRoles, type PermissionsByCategory, type Role } from "@/hooks/use-roles"

export default function EditRolePage() {
  const params = useParams()
  const router = useRouter()
  const roleId = params.id as string
  const { getRoleById, updateRole, getAvailablePermissions } = useRoles()

  const [role, setRole] = useState<Role | null>(null)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [availablePermissions, setAvailablePermissions] = useState<PermissionsByCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("details")

  useEffect(() => {
    const fetchRoleAndPermissions = async () => {
      try {
        setIsLoading(true)

        // Fetch role details
        const roleData = await getRoleById(roleId)
        if (roleData) {
          setRole(roleData)
          setName(roleData.name)
          setDescription(roleData.description)
          setSelectedPermissions(roleData.permissions.map((p) => p.id))
        } else {
          toast.error("Role not found")
          router.push("/admin/roles")
          return
        }

        // Fetch available permissions
        const permissions = await getAvailablePermissions()
        setAvailablePermissions(Array.isArray(permissions) ? permissions : [])
      } catch (error) {
        console.error("Error fetching role data:", error)
        toast.error("Failed to load role data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchRoleAndPermissions()
  }, [roleId, getRoleById, getAvailablePermissions, router])

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    if (checked) {
      setSelectedPermissions((prev) => [...prev, permissionId])
    } else {
      setSelectedPermissions((prev) => prev.filter((id) => id !== permissionId))
    }
  }

  const handleSelectAllInCategory = (category: string, permissions: any[], checked: boolean) => {
    const permissionIds = permissions.map((p) => p.id)

    if (checked) {
      // Add all permissions in this category that aren't already selected
      setSelectedPermissions((prev) => [...prev, ...permissionIds.filter((id) => !prev.includes(id))])
    } else {
      // Remove all permissions in this category
      setSelectedPermissions((prev) => prev.filter((id) => !permissionIds.includes(id)))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error("Role name is required")
      return
    }

    try {
      setIsSaving(true)
      await updateRole(roleId, {
        name: name.trim(),
        description: description.trim(),
        permissions: selectedPermissions,
      })

      toast.success("Role updated successfully")
      router.push("/admin/roles")
    } catch (error: any) {
      console.error("Error updating role:", error)
      if (error.message.includes("already exists")) {
        toast.error("A role with this name already exists")
      } else if (error.message.includes("super admin")) {
        toast.error("Cannot modify permissions for super admin role")
      } else {
        toast.error("Failed to update role")
      }
    } finally {
      setIsSaving(false)
    }
  }

  const isFormValid = name.trim().length > 0
  const isSystemRole = role?.name === "super admin" || role?.name === "admin"

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" disabled>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Skeleton className="h-[600px] w-full" />
      </div>
    )
  }

  if (!role) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <h2 className="text-xl font-semibold">Role not found</h2>
        <p className="text-muted-foreground">The requested role could not be found.</p>
        <Button className="mt-4" asChild>
          <Link href="/admin/roles">Back to Roles</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/roles">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Role</h1>
          <p className="text-muted-foreground">
            {isSystemRole ? "System role - limited editing capabilities" : "Update role details and permissions"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>Role Details</CardTitle>
                <TabsList>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="permissions" disabled={role.name === "super admin"}>
                    Permissions
                  </TabsTrigger>
                </TabsList>
              </div>
              <CardDescription>
                {activeTab === "details"
                  ? "Update basic information about the role"
                  : "Modify the permissions for this role"}
              </CardDescription>
            </CardHeader>

            <TabsContent value="details">
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Role Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter role name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isSystemRole}
                  />
                  {isSystemRole && <p className="text-sm text-muted-foreground">System role names cannot be changed</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the purpose of this role"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                  />
                </div>
              </CardContent>
            </TabsContent>

            <TabsContent value="permissions">
              <CardContent>
                {role.name === "super admin" ? (
                  <div className="flex h-40 flex-col items-center justify-center text-center">
                    <p className="text-muted-foreground mb-2">
                      The super admin role has all permissions by default and cannot be modified.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      This is a system-level role with full access to all features.
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-6">
                      {availablePermissions.map((category) => (
                        <div key={category.category} className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium capitalize">{category.category}</h3>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`select-all-${category.category}`}
                                checked={
                                  category.permissions.length > 0 &&
                                  category.permissions.every((p) => selectedPermissions.includes(p.id))
                                }
                                onCheckedChange={(checked) =>
                                  handleSelectAllInCategory(category.category, category.permissions, checked === true)
                                }
                              />
                              <Label htmlFor={`select-all-${category.category}`}>Select All</Label>
                            </div>
                          </div>
                          <Separator />
                          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {category.permissions.map((permission) => (
                              <div key={permission.id} className="flex items-start space-x-3 rounded-md border p-3">
                                <Checkbox
                                  id={permission.id}
                                  checked={selectedPermissions.includes(permission.id)}
                                  onCheckedChange={(checked) => handlePermissionChange(permission.id, checked === true)}
                                />
                                <div className="space-y-1">
                                  <Label htmlFor={permission.id} className="font-medium cursor-pointer">
                                    {permission.key}
                                  </Label>
                                  <p className="text-sm text-muted-foreground">{permission.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </TabsContent>

            <CardFooter className="flex justify-between">
              <Button variant="outline" asChild>
                <Link href="/admin/roles">Cancel</Link>
              </Button>
              <Button
                type="submit"
                disabled={!isFormValid || isSaving || (role.name === "super admin" && activeTab === "permissions")}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Tabs>
        </Card>
      </form>
    </div>
  )
}
