"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useBackups } from "@/hooks/use-backups"
import {
  Calendar,
  Check,
  ChevronDown,
  Clock,
  Database,
  Download,
  Files,
  Filter,
  HardDrive,
  MoreVertical,
  Plus,
  RefreshCw,
  Search,
  Server,
  Trash2,
  XCircle,
} from "lucide-react"

export default function BackupsPage() {
  const router = useRouter()
  const { backups, fetchBackups, deleteBackup, isLoading } = useBackups()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [backupToDelete, setBackupToDelete] = useState<string | null>(null)

  useEffect(() => {
    fetchBackups()
  }, [])

  const handleDeleteBackup = async () => {
    if (backupToDelete) {
      try {
        await deleteBackup(backupToDelete)
        setDeleteDialogOpen(false)
        setBackupToDelete(null)
      } catch (error) {
        console.error("Error deleting backup:", error)
      }
    }
  }

  const confirmDelete = (id: string) => {
    setBackupToDelete(id)
    setDeleteDialogOpen(true)
  }

  const filteredBackups = backups.filter((backup) => {
    let matches = true

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      matches =
        matches &&
        (backup.name.toLowerCase().includes(searchLower) ||
          backup.description?.toLowerCase().includes(searchLower) ||
          false ||
          backup.tags?.some((tag) => tag.toLowerCase().includes(searchLower)) ||
          false)
    }

    if (statusFilter) {
      matches = matches && backup.status === statusFilter
    }

    if (typeFilter) {
      matches = matches && backup.type === typeFilter
    }

    return matches
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            <Check className="h-3 w-3 mr-1" /> Completed
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline" className="border-amber-200 text-amber-800">
            <Clock className="h-3 w-3 mr-1" /> Pending
          </Badge>
        )
      case "in-progress":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
            <RefreshCw className="h-3 w-3 mr-1 animate-spin" /> In Progress
          </Badge>
        )
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
            <XCircle className="h-3 w-3 mr-1" /> Failed
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "full":
        return <HardDrive className="h-4 w-4" />
      case "database":
        return <Database className="h-4 w-4" />
      case "files":
        return <Files className="h-4 w-4" />
      case "incremental":
        return <RefreshCw className="h-4 w-4" />
      case "differential":
        return <Server className="h-4 w-4" />
      default:
        return <HardDrive className="h-4 w-4" />
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Backups</h1>
        <div className="flex gap-2">
          <Button onClick={() => router.push("/admin/backups/create")}>
            <Plus className="h-4 w-4 mr-2" />
            Create Backup
          </Button>
          <Button variant="outline" onClick={() => router.push("/admin/backups/schedule")}>
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Backup
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="all">All Backups</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search backups..."
                className="pl-8 w-[200px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <div className="p-2">
                  <p className="text-sm font-medium mb-2">Status</p>
                  <Select value={statusFilter || ""} onValueChange={(value) => setStatusFilter(value || null)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="p-2 border-t">
                  <p className="text-sm font-medium mb-2">Type</p>
                  <Select value={typeFilter || ""} onValueChange={(value) => setTypeFilter(value || null)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      <SelectItem value="full">Full</SelectItem>
                      <SelectItem value="database">Database</SelectItem>
                      <SelectItem value="files">Files</SelectItem>
                      <SelectItem value="incremental">Incremental</SelectItem>
                      <SelectItem value="differential">Differential</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <TabsContent value="all" className="mt-0">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>All Backups</CardTitle>
              <CardDescription>Manage your system backups and restore points</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                </div>
              ) : filteredBackups.length === 0 ? (
                <div className="text-center py-8">
                  <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No backups found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || statusFilter || typeFilter
                      ? "No backups match your current filters."
                      : "Get started by creating your first backup."}
                  </p>
                  <Button onClick={() => router.push("/admin/backups/create")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Backup
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBackups.map((backup) => (
                      <TableRow key={backup._id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{backup.name}</p>
                            {backup.description && (
                              <p className="text-sm text-muted-foreground">{backup.description}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTypeIcon(backup.type)}
                            <span className="capitalize">{backup.type}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(backup.status)}</TableCell>
                        <TableCell>{formatFileSize(backup.size)}</TableCell>
                        <TableCell>{formatDate(backup.createdAt)}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {backup.tags?.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {backup.tags && backup.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{backup.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Restore
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600" onClick={() => confirmDelete(backup._id)}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Backups</CardTitle>
              <CardDescription>View and manage your automated backup schedules</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No scheduled backups</h3>
                <p className="text-muted-foreground mb-4">Set up automated backups to run on a schedule.</p>
                <Button onClick={() => router.push("/admin/backups/schedule")}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Backup
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Backups</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{backups.length}</div>
                <p className="text-xs text-muted-foreground">+2 from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {backups.length > 0
                    ? Math.round((backups.filter((b) => b.status === "completed").length / backups.length) * 100)
                    : 0}
                  %
                </div>
                <p className="text-xs text-muted-foreground">Last 30 days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatFileSize(backups.reduce((total, backup) => total + (backup.size || 0), 0))}
                </div>
                <p className="text-xs text-muted-foreground">Across all backups</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Backup</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this backup? This action cannot be undone and will permanently remove the
              backup files.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBackup} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
