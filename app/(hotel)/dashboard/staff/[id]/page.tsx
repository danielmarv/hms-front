"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Mail, Phone, Edit, Trash2, User, Shield, Clock, Building } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

interface StaffMember {
  _id: string
  full_name: string
  email: string
  phone?: string
  role: string
  status: string
  createdAt: string
  updatedAt?: string
  department?: string
  employee_id?: string
  address?: string
  hire_date?: string
  salary?: number
  emergency_contact?: {
    name: string
    phone: string
    relationship: string
  }
}

export default function StaffDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [staff, setStaff] = useState<StaffMember | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const staffId = params?.id as string

  // Function to get initials from name with null safety
  const getInitials = (name?: string) => {
    if (!name || typeof name !== "string") return "??"
    return name
      .trim()
      .split(" ")
      .filter((part) => part.length > 0)
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2) // Limit to 2 characters
  }

  // Function to format role name for display
  const formatRole = (role?: string) => {
    if (!role || typeof role !== "string") return "No Role"
    return role.charAt(0).toUpperCase() + role.slice(1).replace(/_/g, " ")
  }

  // Function to format department name for display
  const formatDepartment = (department?: string) => {
    if (!department || typeof department !== "string") return "No Department"
    return department
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  // Function to get badge variant based on status
  const getStatusBadge = (status?: string) => {
    if (!status) return <Badge variant="outline">Unknown</Badge>

    switch (status.toLowerCase()) {
      case "active":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Active
          </Badge>
        )
      case "inactive":
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            Inactive
          </Badge>
        )
      case "on_leave":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            On Leave
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Format date to display in a more readable format
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not specified"
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch (error) {
      return "Invalid date"
    }
  }

  // Format currency
  const formatCurrency = (amount?: number) => {
    if (!amount || typeof amount !== "number") return "Not specified"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  // Fetch staff member details
  const fetchStaffDetails = async () => {
    if (!isAuthenticated) {
      setError("Please log in to view staff details")
      setIsLoading(false)
      return
    }

    if (!staffId) {
      setError("Invalid staff ID")
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const token = localStorage.getItem("token") || localStorage.getItem("accessToken")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${staffId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Authentication failed. Please log in again.")
        }
        if (response.status === 404) {
          throw new Error("Staff member not found")
        }
        throw new Error(`Failed to fetch staff details: ${response.statusText}`)
      }

      const data = await response.json()

      // Handle different response formats
      const staffData = data.data || data.user || data
      setStaff(staffData)
    } catch (err) {
      console.error("Error fetching staff details:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch staff details")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStaffDetails()
  }, [staffId, isAuthenticated])

  // Handle delete staff member
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this staff member? This action cannot be undone.")) {
      return
    }

    try {
      const token = localStorage.getItem("token") || localStorage.getItem("accessToken")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${staffId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to delete staff member")
      }

      router.push("/dashboard/staff")
    } catch (err) {
      console.error("Error deleting staff member:", err)
      alert("Failed to delete staff member. Please try again.")
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Authentication Required</h2>
          <p className="text-muted-foreground mt-2">Please log in to view staff details</p>
        </div>
        <Button asChild>
          <Link href="/auth/login">Go to Login</Link>
        </Button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/staff">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Staff
            </Link>
          </Button>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading staff details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/staff">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Staff
            </Link>
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-destructive">Error</h2>
            <p className="text-muted-foreground mt-2">{error}</p>
          </div>
          <Button onClick={fetchStaffDetails} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (!staff) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/staff">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Staff
            </Link>
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Staff Member Not Found</h2>
            <p className="text-muted-foreground mt-2">The requested staff member could not be found.</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/staff">Back to Staff List</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/staff">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Staff
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Staff Details</h1>
            <p className="text-muted-foreground">View and manage staff member information</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/staff/${staffId}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Staff Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={`/placeholder.svg?height=64&width=64`} alt={staff.full_name || "Staff member"} />
              <AvatarFallback className="text-lg">{getInitials(staff.full_name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold">{staff.full_name || "Unknown Name"}</h2>
                {getStatusBadge(staff.status)}
              </div>
              <p className="text-muted-foreground">{formatRole(staff.role)}</p>
              <p className="text-sm text-muted-foreground">
                Staff ID: {staff.employee_id || staff._id?.slice(-6).toUpperCase() || "N/A"}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Detailed Information Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="employment">Employment</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Full Name:</span>
                  <span className="font-medium">{staff.full_name || "Not specified"}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{staff.email || "Not specified"}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone:</span>
                  <span className="font-medium">{staff.phone || "Not specified"}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Department:</span>
                  <span className="font-medium">{formatDepartment(staff.department)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Role & Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Role:</span>
                  <span className="font-medium">{formatRole(staff.role)}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  {getStatusBadge(staff.status)}
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Join Date:</span>
                  <span className="font-medium">{formatDate(staff.hire_date || staff.createdAt)}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Updated:</span>
                  <span className="font-medium">{formatDate(staff.updatedAt)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground">Email Address</span>
                  <p className="font-medium">{staff.email || "Not specified"}</p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground">Phone Number</span>
                  <p className="font-medium">{staff.phone || "Not specified"}</p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground">Address</span>
                  <p className="font-medium">{staff.address || "Not specified"}</p>
                </div>
              </CardContent>
            </Card>

            {staff.emergency_contact && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Emergency Contact
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">Name</span>
                    <p className="font-medium">{staff.emergency_contact.name || "Not specified"}</p>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">Phone</span>
                    <p className="font-medium">{staff.emergency_contact.phone || "Not specified"}</p>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">Relationship</span>
                    <p className="font-medium">{staff.emergency_contact.relationship || "Not specified"}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="employment" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Employment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Employee ID:</span>
                  <span className="font-medium">
                    {staff.employee_id || staff._id?.slice(-6).toUpperCase() || "N/A"}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Department:</span>
                  <span className="font-medium">{formatDepartment(staff.department)}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Position:</span>
                  <span className="font-medium">{formatRole(staff.role)}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hire Date:</span>
                  <span className="font-medium">{formatDate(staff.hire_date || staff.createdAt)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Additional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Salary:</span>
                  <span className="font-medium">{formatCurrency(staff.salary)}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Account Created:</span>
                  <span className="font-medium">{formatDate(staff.createdAt)}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Modified:</span>
                  <span className="font-medium">{formatDate(staff.updatedAt)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
