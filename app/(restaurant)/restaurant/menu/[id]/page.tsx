"use client"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useMenuItems } from "@/hooks/use-menu-items"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ArrowLeft, Edit, Trash, Clock, Tag, DollarSign, AlertCircle, Loader2, Star } from "lucide-react"
import { toast } from "sonner"

export default function MenuItemDetail() {
  const params = useParams()
  const router = useRouter()
  const { getMenuItem, getMenuItems, toggleAvailability, toggleFeatured, deleteMenuItem, loading } = useMenuItems()
  const [menuItem, setMenuItem] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [relatedItems, setRelatedItems] = useState<any[]>([])

  useEffect(() => {
    fetchMenuItem()
  }, [params.id])

  const fetchMenuItem = async () => {
    if (!params.id) return

    setIsLoading(true)
    try {
      const item = await getMenuItem(params.id as string)
      if (item) {
        setMenuItem(item)
        // Fetch related items in the same category
        await fetchRelatedItems(item.category)
      }
    } catch (error) {
      console.error("Error fetching menu item:", error)
      toast.error("Failed to load menu item")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchRelatedItems = async (category: string) => {
    try {
      const result = await getMenuItems({
        category,
        limit: 4,
        sort: "name",
      })
      if (result && result.data) {
        // Filter out the current item
        const filtered = result.data.filter((item: any) => item._id !== params.id)
        setRelatedItems(filtered.slice(0, 3)) // Show only 3 related items
      }
    } catch (error) {
      console.error("Error fetching related items:", error)
    }
  }

  const handleToggleAvailability = async () => {
    if (!menuItem) return

    const result = await toggleAvailability(menuItem._id)
    if (result) {
      setMenuItem({
        ...menuItem,
        availability: result.availability,
      })
      toast.success(`Menu item is now ${result.availability ? "available" : "unavailable"}`)
    }
  }

  const handleToggleFeatured = async () => {
    if (!menuItem) return

    const result = await toggleFeatured(menuItem._id)
    if (result) {
      setMenuItem({
        ...menuItem,
        featured: result.featured,
      })
      toast.success(`Menu item is ${result.featured ? "now featured" : "no longer featured"}`)
    }
  }

  const handleDeleteMenuItem = async () => {
    if (!menuItem) return

    const result = await deleteMenuItem(menuItem._id)
    if (result) {
      toast.success("Menu item deleted successfully")
      router.push("/restaurant/menu")
    }
  }

  const handleEditClick = () => {
    router.push(`/restaurant/menu/${menuItem._id}/edit`)
  }

  if (isLoading || loading) {
    return (
      <div className="container mx-auto py-6 flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!menuItem) {
    return (
      <div className="container mx-auto py-6">
        <Button variant="outline" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Menu Item Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The requested menu item could not be found.</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={() => router.push("/restaurant/menu")}>
              Return to Menu Management
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <Button variant="outline" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Menu
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-2xl">{menuItem.name}</CardTitle>
                  {menuItem.featured && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                  {!menuItem.availability && <Badge variant="destructive">Unavailable</Badge>}
                </div>
                <CardDescription className="mt-2">{menuItem.description}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleEditClick}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="icon">
                      <Trash className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete the menu item "{menuItem.name}". This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteMenuItem}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="lg:w-1/3">
                  <div className="relative">
                    <img
                      src={menuItem.imageUrl || "/placeholder.svg?height=300&width=300"}
                      alt={menuItem.name}
                      className="w-full h-64 rounded-lg object-cover"
                    />
                    {!menuItem.imageUrl && (
                      <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg">
                        <DollarSign className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Price</span>
                      </div>
                      <span className="text-lg font-bold text-green-600">${menuItem.price?.toFixed(2)}</span>
                    </div>

                    {menuItem.cost && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Cost</span>
                        </div>
                        <span>${menuItem.cost.toFixed(2)}</span>
                      </div>
                    )}

                    {menuItem.preparationTime && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Prep Time</span>
                        </div>
                        <span>{menuItem.preparationTime} min</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Category</span>
                      </div>
                      <span>{menuItem.category}</span>
                    </div>

                    {menuItem.subcategory && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Subcategory</span>
                        </div>
                        <span>{menuItem.subcategory}</span>
                      </div>
                    )}
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-base">Availability</Label>
                      <Switch
                        checked={menuItem.availability}
                        onCheckedChange={handleToggleAvailability}
                        disabled={loading}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-base">Featured</Label>
                      <Switch checked={menuItem.featured} onCheckedChange={handleToggleFeatured} disabled={loading} />
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-3">
                    <Label className="text-base">Dietary Information</Label>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${menuItem.isVegetarian ? "bg-green-500" : "bg-gray-300"}`}
                        />
                        <span>Vegetarian</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${menuItem.isVegan ? "bg-green-500" : "bg-gray-300"}`} />
                        <span>Vegan</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${menuItem.isGlutenFree ? "bg-green-500" : "bg-gray-300"}`}
                        />
                        <span>Gluten Free</span>
                      </div>
                    </div>
                  </div>

                  {menuItem.allergens && menuItem.allergens.length > 0 && (
                    <>
                      <Separator className="my-4" />
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-amber-500" />
                          <Label className="text-base">Allergens</Label>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {menuItem.allergens.map((allergen: string, index: number) => (
                            <Badge key={index} variant="outline" className="bg-amber-50">
                              {allergen}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {menuItem.spicyLevel && menuItem.spicyLevel > 0 && (
                    <>
                      <Separator className="my-4" />
                      <div className="flex items-center justify-between">
                        <Label className="text-base">Spicy Level</Label>
                        <div className="flex gap-1">
                          {Array.from({ length: 5 }, (_, i) => (
                            <div
                              key={i}
                              className={`w-2 h-2 rounded-full ${
                                i < menuItem.spicyLevel ? "bg-red-500" : "bg-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="lg:w-2/3">
                  <Tabs defaultValue="ingredients" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
                      <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
                      <TabsTrigger value="details">Details</TabsTrigger>
                    </TabsList>

                    <TabsContent value="ingredients" className="mt-4">
                      <div className="space-y-4">
                        <h3 className="font-medium">Ingredients List</h3>
                        {menuItem.ingredients && menuItem.ingredients.length > 0 ? (
                          <ul className="space-y-2">
                            {menuItem.ingredients.map((ingredient: string, index: number) => (
                              <li key={index} className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                <span>{ingredient}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-muted-foreground">No ingredients listed</p>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="nutrition" className="mt-4">
                      <div className="space-y-4">
                        <h3 className="font-medium">Nutritional Information</h3>
                        {menuItem.calories ? (
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 rounded-lg border">
                              <div className="text-sm text-muted-foreground">Calories</div>
                              <div className="text-xl font-bold">{menuItem.calories} kcal</div>
                            </div>
                          </div>
                        ) : (
                          <p className="text-muted-foreground">No nutritional information available</p>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="details" className="mt-4">
                      <div className="space-y-4">
                        <h3 className="font-medium">Additional Details</h3>
                        <div className="space-y-3">
                          {menuItem.tags && menuItem.tags.length > 0 && (
                            <div>
                              <Label className="text-sm font-medium">Tags</Label>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {menuItem.tags.map((tag: string, index: number) => (
                                  <Badge key={index} variant="secondary">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {menuItem.menuSections && menuItem.menuSections.length > 0 && (
                            <div>
                              <Label className="text-sm font-medium">Menu Sections</Label>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {menuItem.menuSections.map((section: string, index: number) => (
                                  <Badge key={index} variant="outline">
                                    {section}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {menuItem.availableDays && menuItem.availableDays.length > 0 && (
                            <div>
                              <Label className="text-sm font-medium">Available Days</Label>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {menuItem.availableDays.map((day: string, index: number) => (
                                  <Badge key={index} variant="outline">
                                    {day}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {(menuItem.availableTimeStart || menuItem.availableTimeEnd) && (
                            <div>
                              <Label className="text-sm font-medium">Available Hours</Label>
                              <p className="text-sm text-muted-foreground mt-1">
                                {menuItem.availableTimeStart || "00:00"} - {menuItem.availableTimeEnd || "23:59"}
                              </p>
                            </div>
                          )}

                          {menuItem.isDiscounted && menuItem.discountPercentage && (
                            <div>
                              <Label className="text-sm font-medium">Discount</Label>
                              <p className="text-sm text-green-600 mt-1">{menuItem.discountPercentage}% off</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Item History</CardTitle>
              <CardDescription>Creation and modification history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-2">
                  <div className="mt-0.5">
                    <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                      <Clock className="h-3 w-3 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <p className="font-medium">Created</p>
                    <p className="text-sm text-muted-foreground">
                      {menuItem.createdAt
                        ? new Date(menuItem.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "Unknown"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="mt-0.5">
                    <div className="h-6 w-6 rounded-full bg-amber-100 flex items-center justify-center">
                      <Edit className="h-3 w-3 text-amber-600" />
                    </div>
                  </div>
                  <div>
                    <p className="font-medium">Last Updated</p>
                    <p className="text-sm text-muted-foreground">
                      {menuItem.updatedAt
                        ? new Date(menuItem.updatedAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "Unknown"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {relatedItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Related Items</CardTitle>
                <CardDescription>Items in the same category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {relatedItems.map((item) => (
                    <div
                      key={item._id}
                      className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors"
                      onClick={() => router.push(`/restaurant/menu/${item._id}`)}
                    >
                      <img
                        src={item.imageUrl || "/placeholder.svg?height=40&width=40"}
                        alt={item.name}
                        className="h-10 w-10 rounded-md object-cover"
                      />
                      <div className="flex-1">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">${item.price?.toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => router.push(`/restaurant/menu?category=${encodeURIComponent(menuItem.category)}`)}
                >
                  View All {menuItem.category}
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
