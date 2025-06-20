"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  PlusIcon,
  SearchIcon,
  MoreHorizontalIcon,
  PackageIcon,
  TrendingUpIcon,
  UsersIcon,
  DollarSignIcon,
  EyeIcon,
  EditIcon,
  TrashIcon,
  CopyIcon,
  StarIcon,
  Loader2,
} from "lucide-react"
import { useEventPackages } from "@/hooks/use-event-packages"
import { useEventTypes } from "@/hooks/use-event-types"
import { toast } from "sonner"

export default function EventPackagesPage() {
  const router = useRouter()
  const { packages, isLoading, error, fetchPackages, deletePackage, updatePackage, clearError } = useEventPackages()
  const { eventTypes } = useEventTypes()

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedEventType, setSelectedEventType] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    fetchPackages()
  }, [fetchPackages])

  // Filter packages based on search and filters
  const filteredPackages = packages.filter((pkg) => {
    const matchesSearch =
      pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.description?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesEventType = selectedEventType === "all" || pkg.eventTypes.includes(selectedEventType)

    const matchesStatus =
      selectedStatus === "all" ||
      (selectedStatus === "active" && pkg.isActive) ||
      (selectedStatus === "inactive" && !pkg.isActive) ||
      (selectedStatus === "promoted" && pkg.isPromoted)

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "active" && pkg.isActive) ||
      (activeTab === "promoted" && pkg.isPromoted) ||
      (activeTab === "inactive" && !pkg.isActive)

    return matchesSearch && matchesEventType && matchesStatus && matchesTab
  })

  const handleDeletePackage = async (packageId: string) => {
    try {
      await deletePackage(packageId)
      toast.success("Package deleted successfully")
    } catch (error) {
      toast.error("Failed to delete package")
    }
  }

  const handleToggleStatus = async (packageId: string, currentStatus: boolean) => {
    try {
      await updatePackage(packageId, { isActive: !currentStatus })
      toast.success(`Package ${!currentStatus ? "activated" : "deactivated"} successfully`)
    } catch (error) {
      toast.error("Failed to update package status")
    }
  }

  const handleTogglePromotion = async (packageId: string, currentStatus: boolean) => {
    try {
      await updatePackage(packageId, { isPromoted: !currentStatus })
      toast.success(`Package ${!currentStatus ? "promoted" : "unpromoted"} successfully`)
    } catch (error) {
      toast.error("Failed to update package promotion")
    }
  }

  const getStatusBadge = (pkg: any) => {
    if (!pkg.isActive) {
      return <Badge variant="secondary">Inactive</Badge>
    }
    if (pkg.isPromoted) {
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">Promoted</Badge>
    }
    return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
  }

  const getCancellationPolicyBadge = (policy: string) => {
    const colors = {
      flexible: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      moderate: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      strict: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    }

    return (
      <Badge className={colors[policy as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {policy.charAt(0).toUpperCase() + policy.slice(1)}
      </Badge>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-red-500 text-center">
          <p className="text-lg font-semibold">Error loading packages</p>
          <p className="text-sm">{error}</p>
        </div>
        <Button
          onClick={() => {
            clearError()
            fetchPackages()
          }}
        >
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 dark:border-slate-700/20">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Event Packages
            </h1>
            <p className="text-slate-600 dark:text-slate-300 mt-2 text-lg">
              Manage pre-configured event packages and pricing
            </p>
          </div>
          <Button
            asChild
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 dark:from-emerald-600 dark:to-teal-700 dark:hover:from-emerald-700 dark:hover:to-teal-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            size="lg"
          >
            <Link href="/dashboard/events/packages/new">
              <PlusIcon className="mr-2 h-5 w-5" />
              Create Package
            </Link>
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Packages</p>
                  <p className="text-3xl font-bold">{packages.length}</p>
                </div>
                <PackageIcon className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Active Packages</p>
                  <p className="text-3xl font-bold">{packages.filter((pkg) => pkg.isActive).length}</p>
                </div>
                <TrendingUpIcon className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Promoted</p>
                  <p className="text-3xl font-bold">{packages.filter((pkg) => pkg.isPromoted).length}</p>
                </div>
                <StarIcon className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Avg. Price</p>
                  <p className="text-3xl font-bold">
                    $
                    {packages.length > 0
                      ? Math.round(packages.reduce((sum, pkg) => sum + pkg.basePrice, 0) / packages.length)
                      : 0}
                  </p>
                </div>
                <DollarSignIcon className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-slate-700 to-slate-800 dark:from-slate-800 dark:to-slate-900 text-white rounded-t-lg">
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
              <CardTitle className="text-xl">Package Management</CardTitle>
              <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-4">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    type="search"
                    placeholder="Search packages..."
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-slate-300 focus:bg-white/20 w-full md:w-64"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Select value={selectedEventType} onValueChange={setSelectedEventType}>
                <SelectTrigger className="w-full md:w-[180px] bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Filter by event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Event Types</SelectItem>
                  {eventTypes.map((type) => (
                    <SelectItem key={type._id} value={type._id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full md:w-[180px] bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="promoted">Promoted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="px-6 pt-6">
                <TabsList className="grid w-full grid-cols-4 bg-slate-100 dark:bg-slate-700">
                  <TabsTrigger
                    value="all"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-600"
                  >
                    All Packages
                  </TabsTrigger>
                  <TabsTrigger
                    value="active"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-600"
                  >
                    Active
                  </TabsTrigger>
                  <TabsTrigger
                    value="promoted"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-600"
                  >
                    Promoted
                  </TabsTrigger>
                  <TabsTrigger
                    value="inactive"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-600"
                  >
                    Inactive
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value={activeTab} className="mt-6">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex flex-col items-center space-y-4">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
                      <p className="text-slate-600 dark:text-slate-400">Loading packages...</p>
                    </div>
                  </div>
                ) : filteredPackages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 rounded-full p-6 mb-4">
                      <PackageIcon className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">No packages found</p>
                    <p className="text-slate-500 dark:text-slate-500 text-sm mt-1">
                      {searchQuery || selectedEventType !== "all" || selectedStatus !== "all"
                        ? "Try adjusting your search criteria"
                        : "Create your first event package to get started"}
                    </p>
                    {!searchQuery && selectedEventType === "all" && selectedStatus === "all" && (
                      <Button
                        variant="outline"
                        className="mt-6 border-2 hover:bg-blue-50 dark:hover:bg-blue-900"
                        asChild
                      >
                        <Link href="/dashboard/events/packages/new">
                          <PlusIcon className="mr-2 h-4 w-4" />
                          Create Package
                        </Link>
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600">
                          <TableHead className="font-semibold text-slate-700 dark:text-slate-200">Package</TableHead>
                          <TableHead className="hidden md:table-cell font-semibold text-slate-700 dark:text-slate-200">
                            Capacity
                          </TableHead>
                          <TableHead className="hidden md:table-cell font-semibold text-slate-700 dark:text-slate-200">
                            Duration
                          </TableHead>
                          <TableHead className="font-semibold text-slate-700 dark:text-slate-200">Price</TableHead>
                          <TableHead className="hidden md:table-cell font-semibold text-slate-700 dark:text-slate-200">
                            Policy
                          </TableHead>
                          <TableHead className="font-semibold text-slate-700 dark:text-slate-200">Status</TableHead>
                          <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-200">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPackages.map((pkg, index) => (
                          <TableRow
                            key={pkg._id}
                            className={`hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${
                              index % 2 === 0 ? "bg-white dark:bg-slate-800" : "bg-slate-25 dark:bg-slate-750"
                            }`}
                          >
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                                  {pkg.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-semibold text-slate-900 dark:text-slate-100">{pkg.name}</div>
                                  <div className="text-sm text-slate-500 dark:text-slate-400">
                                    {pkg.description?.substring(0, 50)}
                                    {pkg.description && pkg.description.length > 50 ? "..." : ""}
                                  </div>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {pkg.eventTypes.slice(0, 2).map((typeId) => {
                                      const eventType = eventTypes.find((t) => t._id === typeId)
                                      return eventType ? (
                                        <Badge key={typeId} variant="outline" className="text-xs">
                                          {eventType.name}
                                        </Badge>
                                      ) : null
                                    })}
                                    {pkg.eventTypes.length > 2 && (
                                      <Badge variant="outline" className="text-xs">
                                        +{pkg.eventTypes.length - 2} more
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-slate-700 dark:text-slate-300">
                              <div className="flex items-center">
                                <UsersIcon className="h-4 w-4 mr-2 text-slate-500 dark:text-slate-400" />
                                {pkg.minCapacity}-{pkg.maxCapacity}
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-slate-700 dark:text-slate-300">
                              {pkg.duration}h
                            </TableCell>
                            <TableCell>
                              <div className="text-slate-900 dark:text-slate-100">
                                <div className="font-semibold">${pkg.basePrice}</div>
                                {pkg.pricePerPerson > 0 && (
                                  <div className="text-sm text-slate-500 dark:text-slate-400">
                                    +${pkg.pricePerPerson}/person
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {getCancellationPolicyBadge(pkg.cancellationPolicy)}
                            </TableCell>
                            <TableCell>{getStatusBadge(pkg)}</TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="hover:bg-slate-100 dark:hover:bg-slate-600"
                                  >
                                    <MoreHorizontalIcon className="h-4 w-4" />
                                    <span className="sr-only">Actions</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem
                                    onClick={() => router.push(`/dashboard/events/packages/${pkg._id}`)}
                                  >
                                    <EyeIcon className="mr-2 h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => router.push(`/dashboard/events/packages/${pkg._id}/edit`)}
                                  >
                                    <EditIcon className="mr-2 h-4 w-4" />
                                    Edit Package
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => router.push(`/dashboard/events/packages/${pkg._id}/duplicate`)}
                                  >
                                    <CopyIcon className="mr-2 h-4 w-4" />
                                    Duplicate
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleToggleStatus(pkg._id, pkg.isActive)}>
                                    {pkg.isActive ? "Deactivate" : "Activate"}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleTogglePromotion(pkg._id, pkg.isPromoted)}>
                                    <StarIcon className="mr-2 h-4 w-4" />
                                    {pkg.isPromoted ? "Remove Promotion" : "Promote"}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <DropdownMenuItem
                                        className="text-red-600 dark:text-red-400"
                                        onSelect={(e) => e.preventDefault()}
                                      >
                                        <TrashIcon className="mr-2 h-4 w-4" />
                                        Delete Package
                                      </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Package</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to delete "{pkg.name}"? This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleDeletePackage(pkg._id)}
                                          className="bg-red-600 hover:bg-red-700"
                                        >
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
