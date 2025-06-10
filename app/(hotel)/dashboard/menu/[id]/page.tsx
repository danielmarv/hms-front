"use client"

import { TableCell } from "@/components/ui/table"

import { TableBody } from "@/components/ui/table"

import { TableHead } from "@/components/ui/table"

import { TableRow } from "@/components/ui/table"

import { TableHeader } from "@/components/ui/table"

import { Table } from "@/components/ui/table"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useApi } from "@/hooks/use-api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Edit, Trash, Clock, Tag, DollarSign, Utensils, AlertCircle, Loader2 } from "lucide-react"

export default function MenuItemDetail() {
  const params = useParams()
  const router = useRouter()
  const { request } = useApi()
  const [menuItem, setMenuItem] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchMenuItem = async () => {
      setIsLoading(true)
      try {
        // In a real app, this would be an actual API call
        // Simulating API response for demonstration
        const response = await Promise.resolve({
          data: {
            data: {
              _id: params.id,
              name: "Classic Burger",
              description:
                "Beef patty with lettuce, tomato, and special sauce on a brioche bun. Served with a side of fries.",
              price: 12.99,
              category: { _id: "1", name: "Main Dishes" },
              preparationTime: 15,
              available: true,
              image: "/placeholder.svg?height=300&width=300",
              allergens: ["Gluten", "Dairy", "Eggs"],
              isVegetarian: false,
              isVegan: false,
              isGlutenFree: false,
              calories: 650,
              ingredients: [
                "Beef patty (150g)",
                "Brioche bun",
                "Lettuce",
                "Tomato",
                "Special sauce",
                "Cheddar cheese",
                "Pickles",
                "French fries",
              ],
              nutritionalInfo: {
                calories: 650,
                protein: 35,
                carbs: 45,
                fat: 38,
                sodium: 980,
              },
              modifiers: [
                { name: "Extra cheese", price: 1.5 },
                { name: "Bacon", price: 2.0 },
                { name: "Gluten-free bun", price: 1.5 },
                { name: "Extra patty", price: 3.5 },
              ],
              popularity: 4.8,
              reviews: 127,
              createdAt: "2023-05-15T10:30:00Z",
              updatedAt: "2023-11-20T14:45:00Z",
            },
          },
        })

        setMenuItem(response.data.data)
      } catch (error) {
        console.error("Error fetching menu item:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMenuItem()
  }, [params.id, request])

  const toggleAvailability = () => {
    if (!menuItem) return

    // In a real app, this would update via API
    setMenuItem({
      ...menuItem,
      available: !menuItem.available,
    })
  }

  if (isLoading) {
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
            <Button variant="outline" onClick={() => router.push("/dashboard/menu")}>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{menuItem.name}</CardTitle>
                <CardDescription className="mt-2">{menuItem.description}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => router.push(`/dashboard/menu/${menuItem._id}/edit`)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="destructive" size="icon">
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3">
                  <img
                    src={menuItem.image || "/placeholder.svg"}
                    alt={menuItem.name}
                    className="w-full h-auto rounded-lg object-cover"
                  />

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Price</span>
                      </div>
                      <span>${menuItem.price.toFixed(2)}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Prep Time</span>
                      </div>
                      <span>{menuItem.preparationTime} min</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Category</span>
                      </div>
                      <span>{menuItem.category.name}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Utensils className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Popularity</span>
                      </div>
                      <span>
                        {menuItem.popularity}/5 ({menuItem.reviews} reviews)
                      </span>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-3">
                    <Label className="text-base">Availability</Label>
                    <div className="flex items-center justify-between">
                      <span>Item is {menuItem.available ? "available" : "unavailable"}</span>
                      <Switch checked={menuItem.available} onCheckedChange={toggleAvailability} />
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-3">
                    <Label className="text-base">Dietary Information</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${menuItem.isVegetarian ? "bg-green-500" : "bg-gray-300"}`}
                        ></div>
                        <span>Vegetarian</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${menuItem.isVegan ? "bg-green-500" : "bg-gray-300"}`}
                        ></div>
                        <span>Vegan</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${menuItem.isGlutenFree ? "bg-green-500" : "bg-gray-300"}`}
                        ></div>
                        <span>Gluten Free</span>
                      </div>
                    </div>
                  </div>

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
                </div>

                <div className="md:w-2/3">
                  <Tabs defaultValue="ingredients">
                    <TabsList className="w-full">
                      <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
                      <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
                      <TabsTrigger value="modifiers">Modifiers</TabsTrigger>
                    </TabsList>

                    <TabsContent value="ingredients" className="mt-4">
                      <div className="space-y-4">
                        <h3 className="font-medium">Ingredients List</h3>
                        <ul className="space-y-2">
                          {menuItem.ingredients.map((ingredient: string, index: number) => (
                            <li key={index} className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                              <span>{ingredient}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </TabsContent>

                    <TabsContent value="nutrition" className="mt-4">
                      <div className="space-y-4">
                        <h3 className="font-medium">Nutritional Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 rounded-lg border">
                            <div className="text-sm text-muted-foreground">Calories</div>
                            <div className="text-xl font-bold">{menuItem.nutritionalInfo.calories} kcal</div>
                          </div>
                          <div className="p-3 rounded-lg border">
                            <div className="text-sm text-muted-foreground">Protein</div>
                            <div className="text-xl font-bold">{menuItem.nutritionalInfo.protein} g</div>
                          </div>
                          <div className="p-3 rounded-lg border">
                            <div className="text-sm text-muted-foreground">Carbohydrates</div>
                            <div className="text-xl font-bold">{menuItem.nutritionalInfo.carbs} g</div>
                          </div>
                          <div className="p-3 rounded-lg border">
                            <div className="text-sm text-muted-foreground">Fat</div>
                            <div className="text-xl font-bold">{menuItem.nutritionalInfo.fat} g</div>
                          </div>
                          <div className="p-3 rounded-lg border">
                            <div className="text-sm text-muted-foreground">Sodium</div>
                            <div className="text-xl font-bold">{menuItem.nutritionalInfo.sodium} mg</div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="modifiers" className="mt-4">
                      <div className="space-y-4">
                        <h3 className="font-medium">Available Modifiers</h3>
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Modifier</TableHead>
                                <TableHead className="text-right">Price</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {menuItem.modifiers.map((modifier: any, index: number) => (
                                <TableRow key={index}>
                                  <TableCell>{modifier.name}</TableCell>
                                  <TableCell className="text-right">${modifier.price.toFixed(2)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
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
                      {new Date(menuItem.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
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
                      {new Date(menuItem.updatedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Related Items</CardTitle>
              <CardDescription>Items in the same category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <img
                    src="/placeholder.svg?height=40&width=40"
                    alt="Cheeseburger"
                    className="h-10 w-10 rounded-md object-cover"
                  />
                  <div>
                    <div className="font-medium">Cheeseburger</div>
                    <div className="text-sm text-muted-foreground">$11.99</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <img
                    src="/placeholder.svg?height=40&width=40"
                    alt="Veggie Burger"
                    className="h-10 w-10 rounded-md object-cover"
                  />
                  <div>
                    <div className="font-medium">Veggie Burger</div>
                    <div className="text-sm text-muted-foreground">$10.99</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <img
                    src="/placeholder.svg?height=40&width=40"
                    alt="Chicken Burger"
                    className="h-10 w-10 rounded-md object-cover"
                  />
                  <div>
                    <div className="font-medium">Chicken Burger</div>
                    <div className="text-sm text-muted-foreground">$12.49</div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => router.push("/dashboard/menu?category=1")}>
                View All Main Dishes
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
