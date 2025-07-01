"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useMenuItems } from "@/hooks/use-menu-items"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  PlusCircle,
  Search,
  Filter,
  Edit,
  Trash,
  Star,
  DollarSign,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"
import { MENU_CATEGORIES } from "@/config/constants"

export default function MenuPage() {
  const router = useRouter()
  const { getMenuItems, toggleAvailability, toggleFeatured, deleteMenuItem, loading } = useMenuItems()
  const [menuItems, setMenuItems] = useState<any[]>([])
  const [totalItems, setTotalItems] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [activeCategory, setActiveCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  type MenuFilters = {
    page: number
    limit: number
    sort: string
    category?: string
    search?: string
    availability?: boolean
    featured?: boolean
    isVegetarian?: boolean
    isVegan?: boolean
    isGlutenFree?: boolean
    minPrice?: number
    maxPrice?: number
  }

  const [filters, setFilters] = useState<MenuFilters>({
    page: 1,
    limit: 12,
    sort: "name",
  })

  useEffect(() => {
    fetchMenuItems()
  }, [filters])

  const fetchMenuItems = async () => {
    const result = await getMenuItems(filters)
    if (result && result.data) {
      setMenuItems(result.data)
      if ("total" in result && "pagination" in result) {
        setTotalItems(result.total || 0)
        setTotalPages(result.pagination?.totalPages || 1)
        setCurrentPage(result.pagination?.page || 1)
      } else {
        setTotalItems(0)
        setTotalPages(1)
        setCurrentPage(1)
      }
    }
  }

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category)
    setFilters((prev) => ({
      ...prev,
      category: category === "All" ? undefined : category,
      page: 1,
    }))
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setFilters((prev) => ({
      ...prev,
      search: searchQuery,
      page: 1,
    }))
  }

  const handleSortChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      sort: value,
      page: 1,
    }))
  }

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({
      ...prev,
      page,
    }))
  }

  const handleToggleAvailability = async (id: string) => {
    const result = await toggleAvailability(id)
    if (result) {
      fetchMenuItems()
    }
  }

  const handleToggleFeatured = async (id: string) => {
    const result = await toggleFeatured(id)
    if (result) {
      fetchMenuItems()
    }
  }

  const handleDeleteMenuItem = async (id: string) => {
    const result = await deleteMenuItem(id)
    if (result) {
      fetchMenuItems()
    }
  }

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Menu Management</h1>
          <p className="text-muted-foreground">Manage your restaurant menu items and categories</p>
        </div>
        <Link href="/restaurant/menu/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Menu Item
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {MENU_CATEGORIES.map((category) => (
                  <Button
                    key={category}
                    variant={activeCategory === category ? "default" : "ghost"}
                    className="w-full justify-start text-sm"
                    onClick={() => handleCategoryChange(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="available"
                  checked={filters.availability === true}
                  onCheckedChange={(checked) =>
                    setFilters((prev) => ({ ...prev, availability: checked ? true : undefined, page: 1 }))
                  }
                />
                <Label htmlFor="available" className="text-sm">
                  Available Only
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={filters.featured === true}
                  onCheckedChange={(checked) =>
                    setFilters((prev) => ({ ...prev, featured: checked ? true : undefined, page: 1 }))
                  }
                />
                <Label htmlFor="featured" className="text-sm">
                  Featured Only
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="vegetarian"
                  checked={filters.isVegetarian === true}
                  onCheckedChange={(checked) =>
                    setFilters((prev) => ({ ...prev, isVegetarian: checked ? true : undefined, page: 1 }))
                  }
                />
                <Label htmlFor="vegetarian" className="text-sm">
                  Vegetarian
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="vegan"
                  checked={filters.isVegan === true}
                  onCheckedChange={(checked) =>
                    setFilters((prev) => ({ ...prev, isVegan: checked ? true : undefined, page: 1 }))
                  }
                />
                <Label htmlFor="vegan" className="text-sm">
                  Vegan
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="glutenFree"
                  checked={filters.isGlutenFree === true}
                  onCheckedChange={(checked) =>
                    setFilters((prev) => ({ ...prev, isGlutenFree: checked ? true : undefined, page: 1 }))
                  }
                />
                <Label htmlFor="glutenFree" className="text-sm">
                  Gluten Free
                </Label>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="priceRange" className="text-sm">
                  Price Range
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="minPrice"
                    type="number"
                    placeholder="Min"
                    className="w-16 text-xs"
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        minPrice: e.target.value ? Number(e.target.value) : undefined,
                        page: 1,
                      }))
                    }
                  />
                  <span className="text-xs">to</span>
                  <Input
                    id="maxPrice"
                    type="number"
                    placeholder="Max"
                    className="w-16 text-xs"
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        maxPrice: e.target.value ? Number(e.target.value) : undefined,
                        page: 1,
                      }))
                    }
                  />
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full bg-transparent"
                onClick={() =>
                  setFilters({
                    page: 1,
                    limit: 12,
                    sort: "name",
                  })
                }
              >
                Reset Filters
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="space-y-6 min-w-0">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2">
              <Input
                type="search"
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button type="submit" size="sm">
                <Search className="h-4 w-4" />
              </Button>
            </form>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex gap-2 bg-transparent">
                  <Filter className="h-4 w-4" />
                  <span>Sort By</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleSortChange("name")}>Name (A-Z)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSortChange("-name")}>Name (Z-A)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSortChange("price")}>Price (Low to High)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSortChange("-price")}>Price (High to Low)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSortChange("-createdAt")}>Newest First</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSortChange("createdAt")}>Oldest First</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array(6)
                .fill(0)
                .map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="h-48 w-full" />
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4" />
                    </CardContent>
                    <CardFooter>
                      <Skeleton className="h-10 w-full" />
                    </CardFooter>
                  </Card>
                ))}
            </div>
          ) : menuItems.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="mb-4 flex justify-center">
                <Search className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No menu items found</h3>
              <p className="text-muted-foreground mt-2">
                Try adjusting your search or filters to find what you're looking for.
              </p>
              <Button
                className="mt-4"
                onClick={() =>
                  setFilters({
                    page: 1,
                    limit: 12,
                    sort: "name",
                  })
                }
              >
                Reset Filters
              </Button>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {menuItems.map((item) => (
                  <Card key={item._id} className="overflow-hidden flex flex-col h-full">
                    <div className="relative h-48 bg-muted flex-shrink-0">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl || "/placeholder.svg"}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-muted">
                          <DollarSign className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2 flex flex-col gap-1">
                        {item.featured && (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                            Featured
                          </Badge>
                        )}
                        {!item.availability && (
                          <Badge variant="destructive" className="text-xs">
                            Unavailable
                          </Badge>
                        )}
                      </div>
                    </div>

                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start gap-2">
                        <CardTitle className="text-lg leading-tight line-clamp-2 min-w-0 flex-1">{item.name}</CardTitle>
                        <span className="text-green-600 font-bold text-lg flex-shrink-0">${item.price.toFixed(2)}</span>
                      </div>
                      <CardDescription className="text-sm">{item.category}</CardDescription>
                    </CardHeader>

                    <CardContent className="flex-1 pb-3">
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{item.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {item.isVegetarian && (
                          <Badge variant="outline" className="bg-green-50 text-xs">
                            Vegetarian
                          </Badge>
                        )}
                        {item.isVegan && (
                          <Badge variant="outline" className="bg-green-50 text-xs">
                            Vegan
                          </Badge>
                        )}
                        {item.isGlutenFree && (
                          <Badge variant="outline" className="bg-amber-50 text-xs">
                            Gluten Free
                          </Badge>
                        )}
                      </div>
                      {item.preparationTime && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                          <Clock className="h-3 w-3" />
                          <span>{item.preparationTime} min</span>
                        </div>
                      )}
                    </CardContent>

                    <CardFooter className="pt-3 flex-col gap-3">
                      <div className="flex justify-between w-full">
                        <div className="flex space-x-2">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete the menu item. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteMenuItem(item._id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/restaurant/menu/${item._id}`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleFeatured(item._id)}
                            className={item.featured ? "text-yellow-600" : ""}
                          >
                            <Star className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <Button
                        variant={item.availability ? "outline" : "secondary"}
                        size="sm"
                        className="w-full"
                        onClick={() => handleToggleAvailability(item._id)}
                      >
                        {item.availability ? "Available" : "Unavailable"}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center mx-4 text-sm">
                      Page {currentPage} of {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
