"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMenuItems } from "@/hooks/use-menu-items"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

const menuItemSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  description: z.string().min(5, { message: "Description must be at least 5 characters" }),
  price: z.coerce.number().min(0, { message: "Price must be a positive number" }),
  cost: z.coerce.number().min(0, { message: "Cost must be a positive number" }),
  category: z.string().min(1, { message: "Category is required" }),
  subcategory: z.string().optional(),
  imageUrl: z.string().optional(),
  availability: z.boolean().default(true),
  preparationTime: z.coerce.number().min(1, { message: "Preparation time must be at least 1 minute" }),
  isVegetarian: z.boolean().default(false),
  isVegan: z.boolean().default(false),
  isGlutenFree: z.boolean().default(false),
  allergens: z.array(z.string()).optional(),
  spicyLevel: z.coerce.number().min(0).max(5).optional(),
  calories: z.coerce.number().min(0).optional(),
  ingredients: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().default(false),
  menuSections: z.array(z.string()).optional(),
  availableDays: z.array(z.string()).optional(),
  availableTimeStart: z.string().optional(),
  availableTimeEnd: z.string().optional(),
  discountPercentage: z.coerce.number().min(0).max(100).optional(),
  isDiscounted: z.boolean().default(false),
})

type MenuItemFormValues = z.infer<typeof menuItemSchema>

const CATEGORIES = [
  "Appetizers",
  "Soups",
  "Salads",
  "Main Courses",
  "Sides",
  "Desserts",
  "Beverages",
  "Breakfast",
  "Lunch",
  "Dinner",
  "Specials",
]

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

const MENU_SECTIONS = ["Breakfast Menu", "Lunch Menu", "Dinner Menu", "Kids Menu", "Specials", "Seasonal"]

const ALLERGENS = [
  "Dairy",
  "Eggs",
  "Fish",
  "Shellfish",
  "Tree Nuts",
  "Peanuts",
  "Wheat",
  "Soy",
  "Sesame",
  "Gluten",
  "Mustard",
  "Celery",
  "Lupin",
  "Molluscs",
  "Sulphites",
]

export default function NewMenuItemPage() {
  const router = useRouter()
  const { createMenuItem, loading } = useMenuItems()
  const [ingredients, setIngredients] = useState<string[]>([])
  const [newIngredient, setNewIngredient] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")

  const form = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      cost: 0,
      category: "",
      subcategory: "",
      imageUrl: "",
      availability: true,
      preparationTime: 15,
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      allergens: [],
      spicyLevel: 0,
      calories: 0,
      ingredients: [],
      tags: [],
      featured: false,
      menuSections: [],
      availableDays: DAYS,
      availableTimeStart: "06:00",
      availableTimeEnd: "22:00",
      discountPercentage: 0,
      isDiscounted: false,
    },
  })

  const addIngredient = () => {
    if (newIngredient.trim() !== "") {
      setIngredients([...ingredients, newIngredient.trim()])
      setNewIngredient("")
    }
  }

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index))
  }

  const addTag = () => {
    if (newTag.trim() !== "") {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: MenuItemFormValues) => {
    // Add the ingredients and tags to the form data
    data.ingredients = ingredients
    data.tags = tags

    const result = await createMenuItem(data)
    if (result) {
      router.push("/dashboard/menu")
    }
  }

  return (
    <div className="container mx-auto p-6">
      <Link href="/dashboard/menu">
        <Button variant="outline" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Menu
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Add New Menu Item</CardTitle>
          <CardDescription>Create a new dish or beverage for your restaurant menu</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Item Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Grilled Salmon" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Describe the dish, flavors, and preparation method" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price ($)</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cost ($)</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CATEGORIES.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subcategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subcategory (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Pasta, Seafood, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="preparationTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preparation Time (minutes)</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URL (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/image.jpg" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Dietary Information</h3>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="isVegetarian"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Vegetarian</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="isVegan"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Vegan</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="isGlutenFree"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Gluten Free</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="allergens"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Allergens</FormLabel>
                          <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                              {ALLERGENS.map((allergen) => (
                                <div key={allergen} className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    id={`allergen-${allergen}`}
                                    checked={field.value?.includes(allergen) || false}
                                    onChange={(e) => {
                                      const currentAllergens = field.value || []
                                      if (e.target.checked) {
                                        field.onChange([...currentAllergens, allergen])
                                      } else {
                                        field.onChange(currentAllergens.filter((a) => a !== allergen))
                                      }
                                    }}
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                  />
                                  <label htmlFor={`allergen-${allergen}`} className="text-sm">
                                    {allergen}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="spicyLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Spicy Level (0-5)</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" max="5" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="calories"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Calories (Optional)</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Ingredients</h3>
                      <div className="flex space-x-2">
                        <Input
                          value={newIngredient}
                          onChange={(e) => setNewIngredient(e.target.value)}
                          placeholder="Add ingredient"
                          className="flex-1"
                        />
                        <Button type="button" onClick={addIngredient} variant="outline">
                          Add
                        </Button>
                      </div>
                      {ingredients.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {ingredients.map((ingredient, index) => (
                            <div key={index} className="flex items-center justify-between rounded-md border p-2">
                              <span>{ingredient}</span>
                              <Button type="button" onClick={() => removeIngredient(index)} variant="ghost" size="sm">
                                Remove
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Tags</h3>
                      <div className="flex space-x-2">
                        <Input
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          placeholder="Add tag"
                          className="flex-1"
                        />
                        <Button type="button" onClick={addTag} variant="outline">
                          Add
                        </Button>
                      </div>
                      {tags.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {tags.map((tag, index) => (
                            <div key={index} className="flex items-center justify-between rounded-md border p-2">
                              <span>{tag}</span>
                              <Button type="button" onClick={() => removeTag(index)} variant="ghost" size="sm">
                                Remove
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <FormField
                      control={form.control}
                      name="featured"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Featured Item</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="menuSections"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Menu Sections</FormLabel>
                          <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                              {MENU_SECTIONS.map((section) => (
                                <div key={section} className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    id={`section-${section}`}
                                    checked={field.value?.includes(section) || false}
                                    onChange={(e) => {
                                      const currentSections = field.value || []
                                      if (e.target.checked) {
                                        field.onChange([...currentSections, section])
                                      } else {
                                        field.onChange(currentSections.filter((s) => s !== section))
                                      }
                                    }}
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                  />
                                  <label htmlFor={`section-${section}`} className="text-sm">
                                    {section}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Availability</h3>
                      <FormField
                        control={form.control}
                        name="availability"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Available</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="availableDays"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Available Days</FormLabel>
                            <div className="space-y-2">
                              <div className="grid grid-cols-2 gap-2">
                                {DAYS.map((day) => (
                                  <div key={day} className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      id={`day-${day}`}
                                      checked={field.value?.includes(day) || false}
                                      onChange={(e) => {
                                        const currentDays = field.value || []
                                        if (e.target.checked) {
                                          field.onChange([...currentDays, day])
                                        } else {
                                          field.onChange(currentDays.filter((d) => d !== day))
                                        }
                                      }}
                                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <label htmlFor={`day-${day}`} className="text-sm">
                                      {day}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="availableTimeStart"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Available From</FormLabel>
                              <FormControl>
                                <Input type="time" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="availableTimeEnd"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Available Until</FormLabel>
                              <FormControl>
                                <Input type="time" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Discount</h3>
                      <FormField
                        control={form.control}
                        name="isDiscounted"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Apply Discount</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="discountPercentage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Discount Percentage (%)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                disabled={!form.watch("isDiscounted")}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save Menu Item"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
