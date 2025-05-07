import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChefHat, Utensils, ClipboardList, BarChart3 } from "lucide-react"

export default function Home() {
  return (
    <main className="min-h-screen bg-muted/40">
      <div className="container mx-auto py-10">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight">Restaurant Management System</h1>
          <p className="mt-4 text-muted-foreground">Manage kitchen orders, menu items, and restaurant operations</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <ChefHat className="h-5 w-5" />
                Kitchen Dashboard
              </CardTitle>
              <CardDescription>Manage kitchen orders and operations</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-sm">View and manage kitchen orders, assign chefs, and update order statuses.</p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/kitchen">Open Kitchen Dashboard</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Utensils className="h-5 w-5" />
                Menu Management
              </CardTitle>
              <CardDescription>Manage menu items and categories</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-sm">Create, edit, and manage menu items, categories, and availability.</p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link href="/menu">Manage Menu</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Order Management
              </CardTitle>
              <CardDescription>Manage customer orders</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-sm">Create and manage customer orders, track status, and process payments.</p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link href="/orders">Manage Orders</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Analytics
              </CardTitle>
              <CardDescription>View restaurant analytics</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-sm">View kitchen and order statistics, performance metrics, and reports.</p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link href="/analytics">View Analytics</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </main>
  )
}
