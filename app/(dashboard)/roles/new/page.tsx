
"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Save } from "lucide-react"
import { usePermissions, Permission } from "@/hooks/use-permissions"

export default function NewRolePage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { isLoading, getAllPermissions } = usePermissions()

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const data = await getAllPermissions()
        if (data) {
          setPermissions(data)
        } else {
          throw new Error("Failed to fetch permissions")
        }
      } catch (error) {
        toast.error("Failed to load permissions")
      }
    }
  
    fetchPermissions()
  }, [getAllPermissions])
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name) {
      toast.error("Role name is required")
      return
    }

    if (selectedPermissions.length === 0) {
      toast.error("Please select at least one permission")
      return
    }

    setIsSubmitting(true)

    try {
      const accessToken = localStorage.getItem("accessToken")
      if (!accessToken) return

      const response = await fetch("/api/roles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name,
          description,
          permissions: selectedPermissions,
        }),
      })

      if (response.ok) {
        toast.success("Role created successfully")
        router.push("/roles")
      } else {
        const data = await response.json()
        throw new Error(data.message || "Failed to create role")
      }
    } catch (error) {
      console.error("Error creating role:", error)
      toast.error(error instanceof Error ? error.message : "Failed to create role")
    } finally {
      setIsSubmitting(false)
    }
  }

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId) ? prev.filter((id) => id !== permissionId) : [...prev, permissionId],
    )
  }

  // Group permissions by category (based on prefix)
  const groupedPermissions = (permissions.data || []).reduce(
    (groups, permission) => {
      const category = permission.key.split("_")[0] || "other";
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(permission);
      return groups;
    },
    {} as Record<string, typeof permissions.data>
  );
  

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Role</h1>
        <p className="text-muted-foreground">Create a new role with specific permissions</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Role Information</CardTitle>
              <CardDescription>Basic information about the role</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Role Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
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
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Permissions</CardTitle>
              <CardDescription>Select permissions for this role</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex h-40 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedPermissions).map(([category, perms]) => (
                    <div key={category} className="space-y-2">
                      <h3 className="text-sm font-medium capitalize">{category}</h3>
                      <div className="grid gap-2 md:grid-cols-2">
                        {perms.map((permission) => (
                          <div key={permission._id} className="flex items-center space-x-2">
                            <Checkbox
                              id={permission._id}
                              checked={selectedPermissions.includes(permission._id)}
                              onCheckedChange={() => togglePermission(permission._id)}
                            />
                            <Label htmlFor={permission._id} className="text-sm font-normal">
                              {permission.description || permission.key}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
}
