"use client"
import { useRouter } from "next/navigation"
import { useTables } from "@/hooks/use-tables"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

const tableSchema = z.object({
  number: z.string().min(1, { message: "Table number is required" }),
  section: z.string().min(1, { message: "Section is required" }),
  capacity: z.coerce.number().min(1, { message: "Capacity must be at least 1" }),
  minCapacity: z.coerce.number().min(1).optional(),
  shape: z.string().min(1, { message: "Shape is required" }),
  width: z.coerce.number().min(1).optional(),
  length: z.coerce.number().min(1).optional(),
  positionX: z.coerce.number().optional(),
  positionY: z.coerce.number().optional(),
  rotation: z.coerce.number().min(0).max(360).optional(),
  notes: z.string().optional(),
})

type TableFormValues = z.infer<typeof tableSchema>

const TABLE_SHAPES = ["Round", "Square", "Rectangle", "Oval"]
const TABLE_SECTIONS = ["Main", "Outdoor", "Bar", "Private", "Lounge"]

export default function NewTablePage() {
  const router = useRouter()
  const { createTable, loading } = useTables()

  const form = useForm<TableFormValues>({
    resolver: zodResolver(tableSchema),
    defaultValues: {
      number: "",
      section: "",
      capacity: 4,
      minCapacity: 1,
      shape: "",
      width: 0,
      length: 0,
      positionX: 0,
      positionY: 0,
      rotation: 0,
      notes: "",
    },
  })

  const onSubmit = async (data: TableFormValues) => {
    const result = await createTable(data)
    if (result) {
      router.push("/restaurant/tables")
    }
  }

  return (
    <div className="container mx-auto p-6">
      <Link href="/restaurant/tables">
        <Button variant="outline" className="mb-6 bg-transparent">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Tables
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Add New Table</CardTitle>
          <CardDescription>Create a new table for your restaurant</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Table Number</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 1, A1, T-01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="section"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Section</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a section" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {TABLE_SECTIONS.map((section) => (
                              <SelectItem key={section} value={section}>
                                {section}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="capacity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Capacity</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="minCapacity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Min Capacity</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="shape"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shape</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select table shape" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {TABLE_SHAPES.map((shape) => (
                              <SelectItem key={shape} value={shape}>
                                {shape}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Dimensions (Optional)</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="width"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Width (cm)</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="length"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Length (cm)</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <h3 className="text-lg font-medium">Position (Optional)</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="positionX"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>X Position</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="positionY"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Y Position</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="rotation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rotation (degrees)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" max="360" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Any additional notes about this table..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Table"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
