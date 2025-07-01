"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { useParams, useRouter } from "next/navigation"
import { useMenuItems } from "@/hooks/use-menu-items"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Save, Loader2, X, Plus } from "lucide-react"
import { toast } from "sonner"
import { MENU_CATEGORIES } from "@/config/constants"

export default function EditMenuItemPage() {
  const params = useParams()
  const router = useRouter()
  const { getMenuItem, updateMenuItem, loading } = useMenuItems()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    cost: 0,
    category: "",
    subcategory: "",
    imageUrl: "",
    availability: true,
    preparationTime: 0,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    allergens: [] as string[],
    spicyLevel: 0,
    calories: 0,
    ingredients: [] as string[],
    tags: [] as string[],
    featured: false,
    menuSections: [] as string[],
    availableDays: [] as string[],
    availableTimeStart: "",
    availableTimeEnd: "",
    discountPercentage: 0,
    isDiscounted: false,
  })

  const [newAllergen, setNewAllergen] = useState("")
  const [newIngredient, setNewIngredient] = useState("")
  const [newTag, setNewTag] = useState("")

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
  const menuSectionOptions = ["Breakfast", "Lunch", "Dinner", "Appetizers", "Desserts", "Beverages", "Specials"]

  useEffect(() => {
    fetchMenuItem()
  }, [params.id])

  const fetchMenuItem = async () => {
    if (!params.id) return

    setIsLoading(true)
    try {
      const item = await getMenuItem(params.id as string)
      if (item) {
        setFormData({
          name: item.name || "",
          description: item.description || "",
          price: item.price || 0,
          cost: item.cost || 0,
          category: item.category || "",
          subcategory: item.subcategory || "",
          imageUrl: item.imageUrl || "",
          availability: item.availability !== undefined ? item.availability : true,
          preparationTime: item.preparationTime || 0,
          isVegetarian: item.isVegetarian || false,
          isVegan: item.isVegan || false,
          isGlutenFree: item.isGlutenFree || false,
          allergens: Array.isArray(item.allergens) ? item.allergens : [],
          spicyLevel: item.spicyLevel || 0,
          calories: item.calories || 0,
          ingredients: Array.isArray(item.ingredients) ? item.ingredients : [],
          tags: Array.isArray(item.tags) ? item.tags : [],
          featured: item.featured || false,
          menuSections: Array.isArray(item.menuSections) ? item.menuSections : [],
          availableDays: Array.isArray(item.availableDays) ? item.availableDays : [],
          availableTimeStart: item.availableTimeStart || "",
          availableTimeEnd: item.availableTimeEnd || "",
          discountPercentage: item.discountPercentage || 0,
          isDiscounted: item.isDiscounted || false,
        })
      }
    } catch (error) {
      console.error("Error fetching menu item:", error)
      toast.error("Failed to load menu item")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number.parseFloat(value) || 0 : value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }))
  }

  const handleArrayAdd = (arrayName: string, value: string, setValue: (value: string) => void) => {
    if (!value.trim()) return

    setFormData((prev) => ({
      ...prev,
      [arrayName]: [...(prev[arrayName as keyof typeof prev] as string[]), value.trim()],
    }))
    setValue("")
  }

  const handleArrayRemove = (arrayName: string, index: number) => {
    setFormData((prev) => ({
      ...prev,
      [arrayName]: (prev[arrayName as keyof typeof prev] as string[]).filter((_, i) => i !== index),
    }))
  }

  const handleDayToggle = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter((d) => d !== day)
        : [...prev.availableDays, day],
    }))
  }

  const handleMenuSectionToggle = (section: string) => {
    setFormData((prev) => ({
      ...prev,
      menuSections: prev.menuSections.includes(section)
        ? prev.menuSections.filter((s) => s !== section)
        : [...prev.menuSections, section],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error("Menu item name is required")
      return
    }

    if (formData.price <= 0) {
      toast.error("Price must be greater than 0")
      return
    }

    setIsSaving(true)
    try {
      const result = await updateMenuItem(params.id as string, formData)
      if (result) {
        toast.success("Menu item updated successfully")
        router.push(`/restaurant/menu/${params.id}`)
      }
    } catch (error) {
      console.error("Error updating menu item:", error)
      toast.error("Failed to update menu item")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Button variant="outline" onClick={() => router.back()} className="mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Edit Menu Item</h1>
          <p className="text-muted-foreground">Update menu item details and settings</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Essential details about the menu item</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter menu item name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {MENU_CATEGORIES.filter((cat) => cat !== "All").map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe the menu item"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost">Cost</Label>
                <Input
                  id="cost"
                  name="cost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.cost}
                  onChange={handleInputChange}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preparationTime">Prep Time (minutes)</Label>
                <Input
                  id="preparationTime"
                  name="preparationTime"
                  type="number"
                  min="0"
                  value={formData.preparationTime}
                  onChange={handleInputChange}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subcategory">Subcategory</Label>
              <Input
                id="subcategory"
                name="subcategory"
                value={formData.subcategory}
                onChange={handleInputChange}
                placeholder="Enter subcategory"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Availability and feature settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Available</Label>
                <p className="text-sm text-muted-foreground">Item is available for ordering</p>
              </div>
              <Switch
                checked={formData.availability}
                onCheckedChange={(checked) => handleSwitchChange("availability", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Featured</Label>
                <p className="text-sm text-muted-foreground">Highlight this item as featured</p>
              </div>
              <Switch
                checked={formData.featured}
                onCheckedChange={(checked) => handleSwitchChange("featured", checked)}
              />
            </div>

            <Separator />

            <div className="space-y-3">
              <Label>Dietary Options</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isVegetarian"
                    checked={formData.isVegetarian}
                    onCheckedChange={(checked) => handleSwitchChange("isVegetarian", checked)}
                  />
                  <Label htmlFor="isVegetarian">Vegetarian</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isVegan"
                    checked={formData.isVegan}
                    onCheckedChange={(checked) => handleSwitchChange("isVegan", checked)}
                  />
                  <Label htmlFor="isVegan">Vegan</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isGlutenFree"
                    checked={formData.isGlutenFree}
                    onCheckedChange={(checked) => handleSwitchChange("isGlutenFree", checked)}
                  />
                  <Label htmlFor="isGlutenFree">Gluten Free</Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="spicyLevel">Spicy Level (0-5)</Label>
              <Input
                id="spicyLevel"
                name="spicyLevel"
                type="number"
                min="0"
                max="5"
                value={formData.spicyLevel}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="calories">Calories</Label>
              <Input
                id="calories"
                name="calories"
                type="number"
                min="0"
                value={formData.calories}
                onChange={handleInputChange}
                placeholder="0"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ingredients & Allergens</CardTitle>
            <CardDescription>List ingredients and allergen information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label>Ingredients</Label>
              <div className="flex gap-2">
                <Input
                  value={newIngredient}
                  onChange={(e) => setNewIngredient(e.target.value)}
                  placeholder="Add ingredient"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleArrayAdd("ingredients", newIngredient, setNewIngredient)
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleArrayAdd("ingredients", newIngredient, setNewIngredient)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.ingredients.map((ingredient, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {ingredient}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => handleArrayRemove("ingredients", index)} />
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Allergens</Label>
              <div className="flex gap-2">
                <Input
                  value={newAllergen}
                  onChange={(e) => setNewAllergen(e.target.value)}
                  placeholder="Add allergen"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleArrayAdd("allergens", newAllergen, setNewAllergen)
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleArrayAdd("allergens", newAllergen, setNewAllergen)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.allergens.map((allergen, index) => (
                  <Badge key={index} variant="outline" className="flex items-center gap-1 bg-amber-50">
                    {allergen}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => handleArrayRemove("allergens", index)} />
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add tag"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleArrayAdd("tags", newTag, setNewTag)
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={() => handleArrayAdd("tags", newTag, setNewTag)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => handleArrayRemove("tags", index)} />
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Availability Schedule</CardTitle>
            <CardDescription>Set when this item is available</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label>Available Days</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {daysOfWeek.map((day) => (
                  <div key={day} className="flex items-center space-x-2">
                    <Switch
                      id={day}
                      checked={formData.availableDays.includes(day)}
                      onCheckedChange={() => handleDayToggle(day)}
                    />
                    <Label htmlFor={day} className="text-sm">
                      {day}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="availableTimeStart">Available From</Label>
                <Input
                  id="availableTimeStart"
                  name="availableTimeStart"
                  type="time"
                  value={formData.availableTimeStart}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="availableTimeEnd">Available Until</Label>
                <Input
                  id="availableTimeEnd"
                  name="availableTimeEnd"
                  type="time"
                  value={formData.availableTimeEnd}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Menu Sections</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {menuSectionOptions.map((section) => (
                  <div key={section} className="flex items-center space-x-2">
                    <Switch
                      id={section}
                      checked={formData.menuSections.includes(section)}
                      onCheckedChange={() => handleMenuSectionToggle(section)}
                    />
                    <Label htmlFor={section} className="text-sm">
                      {section}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Discount Settings</CardTitle>
            <CardDescription>Configure discount options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Discount</Label>
                <p className="text-sm text-muted-foreground">Apply discount to this item</p>
              </div>
              <Switch
                checked={formData.isDiscounted}
                onCheckedChange={(checked) => handleSwitchChange("isDiscounted", checked)}
              />
            </div>

            {formData.isDiscounted && (
              <div className="space-y-2">
                <Label htmlFor="discountPercentage">Discount Percentage</Label>
                <Input
                  id="discountPercentage"
                  name="discountPercentage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.discountPercentage}
                  onChange={handleInputChange}
                  placeholder="0"
                />
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving || loading}>
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
        </div>
      </form>
    </div>
  )
}
