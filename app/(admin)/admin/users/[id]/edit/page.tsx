"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useUsers } from "@/hooks/use-users"
import { useHotels } from "@/hooks/use-hotels"

const formSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  dob: z.string().optional(),
  role: z.string().min(1, "Please select a role"),
  national_id: z.string().optional(),
  address: z.string().optional(),
  department: z.string().optional(),
  job_title: z.string().optional(),
  is_global_admin: z.boolean().default(false),
  primary_hotel: z.string().optional(),
  status: z.boolean().default(true),
})

export default function EditUserPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string
  const { getUserById, updateUser, getUserRoles } = useUsers()
  const { getAllHotels } = useHotels()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [roles, setRoles] = useState<{ _id: string; name: string }[]>([])
  const [isLoadingRoles, setIsLoadingRoles] = useState(true)
  const [hotels, setHotels] = useState<{ _id: string; name: string; code: string }[]>([])
  const [isLoadingHotels, setIsLoadingHotels] = useState(true)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      gender: undefined,
      dob: "",
      role: "",
      national_id: "",
      address: "",
      department: "",
      job_title: "",
      is_global_admin: false,
      primary_hotel: "",
      status: true,
    },
  })

  useEffect(() => {
    const fetchUserAndRoles = async () => {
      setIsLoading(true)
      try {
        // Fetch user data
        const userData = await getUserById(userId)
        form.reset({
          full_name: userData.full_name || "",
          email: userData.email || "",
          phone: userData.phone || "",
          gender: userData.gender,
          dob: userData.dob ? userData.dob.split("T")[0] : "", // Format date for input
          role: typeof userData.role === "object" ? userData.role._id : userData.role,
          national_id: userData.national_id || "",
          address: userData.address || "",
          department: userData.department || "",
          job_title: userData.job_title || "",
          is_global_admin: userData.is_global_admin || false,
          primary_hotel:
            typeof userData.primary_hotel === "object" ? userData.primary_hotel._id : userData.primary_hotel || "",
          status: userData.status === "active",
        })

        // Fetch roles
        try {
          const rolesData = await getUserRoles()
          console.log("Fetched roles data:", rolesData)
          if (rolesData.data && Array.isArray(rolesData.data)) {
            setRoles(rolesData.data)
          } else {
            console.error("Roles data is not an array:", rolesData)
            setRoles([])
            toast.error("Failed to load roles")
          }
        } catch (error) {
          console.error("Error fetching roles:", error)
          setRoles([])
          toast.error("Failed to load roles")
        }

        try {
          const hotelsData = await getAllHotels()
          if (hotelsData.data && Array.isArray(hotelsData.data)) {
            setHotels(hotelsData.data)
          } else {
            setHotels([])
          }
        } catch (error) {
          console.error("Error fetching hotels:", error)
          setHotels([])
        } finally {
          setIsLoadingHotels(false)
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
        toast.error("Failed to load user information")
      } finally {
        setIsLoading(false)
        setIsLoadingRoles(false)
      }
    }

    fetchUserAndRoles()
  }, [userId, getUserById, getUserRoles, form, getAllHotels])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)
    try {
      await updateUser(userId, {
        full_name: values.full_name,
        email: values.email,
        phone: values.phone,
        gender: values.gender,
        dob: values.dob,
        role: values.role,
        national_id: values.national_id,
        address: values.address,
        department: values.department,
        job_title: values.job_title,
        is_global_admin: values.is_global_admin,
        primary_hotel: values.primary_hotel,
        status: values.status ? "active" : "inactive",
      })

      toast.success("User updated successfully")
      router.push(`/admin/users/${userId}`)
    } catch (error) {
      console.error("Error updating user:", error)
      toast.error("Failed to update user")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/admin/users/${userId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="space-y-1">
            <div className="h-6 w-48 bg-muted rounded animate-pulse" />
            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
          </div>
        </div>
        <div className="h-[500px] bg-muted rounded animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/admin/users/${userId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit User</h1>
          <p className="text-muted-foreground">Update user information</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>Edit the user's details</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john.smith@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+1234567890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dob"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select disabled={isLoadingRoles} onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingRoles ? (
                          <div className="flex items-center justify-center p-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="ml-2">Loading roles...</span>
                          </div>
                        ) : Array.isArray(roles) && roles.length > 0 ? (
                          roles.map((role) => (
                            <SelectItem key={role.id} value={role.id}>
                              {role.name}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="flex items-center justify-center p-2 text-muted-foreground">
                            No roles available
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>The role determines what permissions the user will have</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="national_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>National ID</FormLabel>
                    <FormControl>
                      <Input placeholder="National ID number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Full address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <FormControl>
                      <Input placeholder="Department name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="job_title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Job title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="primary_hotel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Hotel</FormLabel>
                    <Select disabled={isLoadingHotels} onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select primary hotel" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No primary hotel</SelectItem>
                        {isLoadingHotels ? (
                          <div className="flex items-center justify-center p-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="ml-2">Loading hotels...</span>
                          </div>
                        ) : Array.isArray(hotels) && hotels.length > 0 ? (
                          hotels.map((hotel) => (
                            <SelectItem key={hotel._id} value={hotel._id}>
                              {hotel.name} ({hotel.code})
                            </SelectItem>
                          ))
                        ) : (
                          <div className="flex items-center justify-center p-2 text-muted-foreground">
                            No hotels available
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>The main hotel this user is associated with</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_global_admin"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Global Admin</FormLabel>
                      <FormDescription>Global admins have access to all system features</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Status</FormLabel>
                      <FormDescription>Inactive users cannot log in to the system</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" asChild>
                <Link href={`/admin/users/${userId}`}>Cancel</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  )
}
