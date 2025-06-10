"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Plus, Edit, Trash2, Star, Utensils, DollarSign, Eye } from "lucide-react"
import Link from "next/link"
import { useMenuItems } from "@/hooks/use-menu-items"
import { toast } from "sonner"

// Import consistent components
import { PageHeader } from "@/components/ui/page-header"
import { StatsGrid, StatCard } from "@/components/ui/stats-grid"
import { FilterBar } from "@/components/ui/filter-bar"
import { StatusBadge } from "@/components/ui/status-badge"
import { EmptyState } from "@/components/ui/empty-state"
import { LoadingSkeleton } from "@/components/ui/loading-skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function MenuPage() {
  const { getMenuItems, deleteMenuItem, toggleAvailability, toggleFeatured, loading } = useMenuItems()

  const [menuItems, setMenuItems] = useState<any[]>([])
  const [filteredItems, setFilteredItems] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [availabilityFilter, setAvailabilityFilter] = useState("all")

  useEffect(() => {
    loadMenuItems()
  }, [])

  useEffect(() => {
    filterItems()
  }, [menuItems, searchTerm, categoryFilter, availabilityFilter])

  const loadMenuItems = async () => {
    try {
      const response = await getMenuItems({ limit: 100 })
      if (response?.data && Array.isArray(response.data)) {
        setMenuItems(response.data)
      }
    } catch (error) {
      console.error("Error loading menu items:", error)
      toast.error("Failed to load menu items")
    }
  }

  const filterItems = () => {
    let filtered = menuItems

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.category?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((item) => item.category === categoryFilter)
    }

    if (availabilityFilter !== "all") {
      const isAvailable = availabilityFilter === "available"
      filtered = filtered.filter((item) => item.available === isAvailable)
    }

    setFilteredItems(filtered)
  }

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      const success = await deleteMenuItem(id)
      if (success) {
        await loadMenuItems()
      }
    }
  }

  const handleToggleAvailability = async (id: string) => {
    const result = await toggleAvailability(id)
    if (result) {
      await loadMenuItems()
    }
  }

  const handleToggleFeatured = async (id: string) => {
    const result = await toggleFeatured(id)
    if (result) {
      await loadMenuItems()
    }
  }

  const categories = [...new Set(menuItems.map((item) => item.category))].filter(Boolean)

  const calculateStats = () => {
    const available = menuItems.filter((item) => item.available).length
    const featured = menuItems.filter((item) => item.featured).length
    const avgPrice = menuItems.length > 0 ? menuItems.reduce((sum, item) => sum + item.price, 0) / menuItems.length : 0

    return {
      total: menuItems.length,
      available,
      featured,
      avgPrice,
    }
  }

  const stats = calculateStats()

  if (loading) {
    return <LoadingSkeleton variant="page" />
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <PageHeader
        title="Menu Management"
        description="Manage your restaurant menu items and categories"
        action={
          <Button asChild>
            <Link href="/restaurant/menu/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Menu Item
            </Link>
          </Button>
        }
      />

      {/* Stats */}
      <StatsGrid>
        <StatCard title="Total Items" value={stats.total} icon={Utensils} />
        <StatCard title="Available" value={stats.available} icon={Eye} />
        <StatCard title="Featured" value={stats.featured} icon={Star} />
        <StatCard title="Avg Price" value={`$${stats.avgPrice.toFixed(2)}`} icon={DollarSign} />
      </StatsGrid>

      {/* Filters */}
      <FilterBar
        searchPlaceholder="Search menu items..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        filters={[
          {
            placeholder: "Filter by category",
            value: categoryFilter,
            onChange: setCategoryFilter,
            options: [
              { value: "all", label: "All Categories" },
              ...categories.map((category) => ({ value: category, label: category })),
            ],
          },
          {
            placeholder: "Filter by availability",
            value: availabilityFilter,
            onChange: setAvailabilityFilter,
            options: [
              { value: "all", label: "All Items" },
              { value: "available", label: "Available" },
              { value: "unavailable", label: "Unavailable" },
            ],
          },
        ]}
      />

      {/* Menu Items Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <Card key={item._id}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{item.name}</h3>
                        {item.featured && <StatusBadge status="featured" showIcon />}
                      </div>
                      {item.category && <Badge variant="outline">{item.category}</Badge>}
                    </div>
                    <StatusBadge status={item.available ? "active" : "inactive"} />
                  </div>

                  {item.description && <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>}

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">${item.price.toFixed(2)}</span>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={item.available}
                        onCheckedChange={() => handleToggleAvailability(item._id)}
                        size="sm"
                      />
                      <Label className="text-xs">Available</Label>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleFeatured(item._id)}
                      className="flex-1"
                    >
                      <Star className="h-4 w-4 mr-1" />
                      {item.featured ? "Unfeature" : "Feature"}
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/restaurant/menu/${item._id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(item._id, item.name)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Utensils}
          title="No menu items found"
          description={
            searchTerm || categoryFilter !== "all" || availabilityFilter !== "all"
              ? "No items match your current filters."
              : "Start by adding your first menu item."
          }
          action={{
            label: "Add Menu Item",
            href: "/restaurant/menu/new",
          }}
        />
      )}
    </div>
  )
}
