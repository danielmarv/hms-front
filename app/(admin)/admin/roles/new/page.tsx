"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
import { ArrowLeft, Loader2, Save } from "lucide-react"
import { useRoles, type PermissionsByCategory } from "@/hooks/use-roles"

export default function NewRolePage() {
  const router = useRouter()
  const { createRole, getAvailablePermissions } = useRoles()

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [availablePermissions, setAvailablePermissions] = useState<PermissionsByCategory[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("details")

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        setIsLoading(true)
        const permissions = await getAvailablePermissions()
        setAvailablePermissions(Array.isArray(permissions) ? permissions : [])
      } catch (error) {
        console.error("Error fetching permissions:", error)
        toast.error("Failed to load available permissions")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPermissions()
  }, [getAvailablePermissions])

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
      await createRole({
        name: name.trim(),
        description: description.trim(),
        permissions: selectedPermissions,
      })

      toast.success("Role created successfully")
      router.push("/admin/roles")
    } catch (error: any) {
      console.error("Error creating role:", error)
      if (error.message.includes("already exists")) {
        toast.error("A role with this name already exists")
      } else {
        toast.error("Failed to create role")
      }
    } finally {
      setIsSaving(false)
    }
  }

  const isFormValid = name.trim().length > 0

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/roles">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Role</h1>
          <p className="text-muted-foreground">Define a new role and its permissions</p>
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
                  <TabsTrigger value="permissions">Permissions</TabsTrigger>
                </TabsList>
              </div>
              <CardDescription>
                {activeTab === "details"
                  ? "Enter basic information about the role"
                  : "Select the permissions for this role"}
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
                  />
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
                {isLoading ? (
                  <div className="flex h-40 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
              <Button type="submit" disabled={!isFormValid || isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Create Role
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
