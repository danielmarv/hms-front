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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useHotels } from "@/hooks/use-hotels"
import { useHotelChains } from "@/hooks/use-hotel-chains"

const formSchema = z.object({
  name: z.string().min(2, "Hotel name must be at least 2 characters"),
  code: z.string().min(2, "Hotel code must be at least 2 characters"),
  description: z.string().optional(),
  type: z.enum(["hotel", "resort", "motel", "inn", "lodge"]),
  starRating: z.number().min(0).max(5).optional(),
  chainCode: z.string().optional(),
  parentHotel: z.string().optional(),
  isHeadquarters: z.boolean().default(false),
  active: z.boolean().default(true),
  address: z
    .object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      country: z.string().optional(),
      zipCode: z.string().optional(),
    })
    .optional(),
  contactInfo: z
    .object({
      phone: z.string().optional(),
      email: z.string().email().optional().or(z.literal("")),
      website: z.string().url().optional().or(z.literal("")),
    })
    .optional(),
})

export default function EditHotelPage() {
  const params = useParams()
  const router = useRouter()
  const hotelId = params.id as string
  const { getHotelById, updateHotel } = useHotels()
  const { getAllHotelChains } = useHotelChains()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [chains, setChains] = useState<{ code: string; name: string }[]>([])
  const [hotels, setHotels] = useState<{ _id: string; name: string; code: string }[]>([])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      type: "hotel",
      starRating: 0,
      chainCode: "",
      parentHotel: "",
      isHeadquarters: false,
      active: true,
      address: {
        street: "",
        city: "",
        state: "",
        country: "",
        zipCode: "",
      },
      contactInfo: {
        phone: "",
        email: "",
        website: "",
      },
    },
  })

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch hotel data
        const hotelResponse = await getHotelById(hotelId)
        if (hotelResponse && hotelResponse.data) {
          const hotel = hotelResponse.data
          form.reset({
            name: hotel.name || "",
            code: hotel.code || "",
            description: hotel.description || "",
            type: hotel.type || "hotel",
            starRating: hotel.starRating || 0,
            chainCode: hotel.chainCode || "",
            parentHotel: hotel.parentHotel || "",
            isHeadquarters: hotel.isHeadquarters || false,
            active: hotel.active !== false,
            address: {
              street: hotel.address?.street || "",
              city: hotel.address?.city || "",
              state: hotel.address?.state || "",
              country: hotel.address?.country || "",
              zipCode: hotel.address?.zipCode || "",
            },
            contactInfo: {
              phone: hotel.contactInfo?.phone || "",
              email: hotel.contactInfo?.email || "",
              website: hotel.contactInfo?.website || "",
            },
          })
        }

        // Fetch chains
        try {
          const chainsResponse = await getAllHotelChains()
          if (chainsResponse && chainsResponse.data) {
            setChains(chainsResponse.data)
          }
        } catch (error) {
          console.error("Error fetching chains:", error)
        }

        // Fetch hotels for parent hotel selection
        // You might need to implement this in your useHotels hook
        // const hotelsResponse = await getAllHotels()
        // if (hotelsResponse && hotelsResponse.data) {
        //   setHotels(hotelsResponse.data.filter(h => h._id !== hotelId))
        // }
      } catch (error) {
        console.error("Error fetching hotel data:", error)
        toast.error("Failed to load hotel information")
      } finally {
        setIsLoading(false)
      }
    }

    if (hotelId) {
      fetchData()
    }
  }, [hotelId, getHotelById, getAllHotelChains, form])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)
    try {
      await updateHotel(hotelId, {
        name: values.name,
        code: values.code,
        description: values.description,
        type: values.type,
        starRating: values.starRating,
        chainCode: values.chainCode || undefined,
        parentHotel: values.parentHotel || undefined,
        isHeadquarters: values.isHeadquarters,
        active: values.active,
        address: values.address,
        contactInfo: values.contactInfo,
      })

      toast.success("Hotel updated successfully")
      router.push(`/admin/hotels/${hotelId}`)
    } catch (error) {
      console.error("Error updating hotel:", error)
      toast.error("Failed to update hotel")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/admin/hotels/${hotelId}`}>
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
          <Link href={`/admin/hotels/${hotelId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Hotel</h1>
          <p className="text-muted-foreground">Update hotel information</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Essential hotel details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hotel Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Grand Hotel" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hotel Code</FormLabel>
                      <FormControl>
                        <Input placeholder="GH001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Hotel description..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hotel Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="hotel">Hotel</SelectItem>
                          <SelectItem value="resort">Resort</SelectItem>
                          <SelectItem value="motel">Motel</SelectItem>
                          <SelectItem value="inn">Inn</SelectItem>
                          <SelectItem value="lodge">Lodge</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="starRating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Star Rating</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number.parseInt(value))}
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select rating" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">No Rating</SelectItem>
                          <SelectItem value="1">1 Star</SelectItem>
                          <SelectItem value="2">2 Stars</SelectItem>
                          <SelectItem value="3">3 Stars</SelectItem>
                          <SelectItem value="4">4 Stars</SelectItem>
                          <SelectItem value="5">5 Stars</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="chainCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chain</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select chain" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">No Chain</SelectItem>
                          {chains.map((chain) => (
                            <SelectItem key={chain.code} value={chain.code}>
                              {chain.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle>Address Information</CardTitle>
              <CardDescription>Hotel location details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="address.street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main Street" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="address.city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="New York" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address.state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State/Province</FormLabel>
                      <FormControl>
                        <Input placeholder="NY" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="address.country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input placeholder="United States" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address.zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ZIP/Postal Code</FormLabel>
                      <FormControl>
                        <Input placeholder="10001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Hotel contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contactInfo.phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 (555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactInfo.email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="info@hotel.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="contactInfo.website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input placeholder="https://www.hotel.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>Hotel configuration options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="isHeadquarters"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Headquarters Hotel</FormLabel>
                      <FormDescription>Mark this hotel as the main headquarters</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Status</FormLabel>
                      <FormDescription>Inactive hotels are hidden from most operations</FormDescription>
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
                <Link href={`/admin/hotels/${hotelId}`}>Cancel</Link>
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
          </Card>
        </form>
      </Form>
    </div>
  )
}
