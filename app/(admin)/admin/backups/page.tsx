"use client"

import { useEffect, useState } from "react"
import { Plus, Shield, Clock, Database, HardDrive, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { useBackups, type Backup } from "@/hooks/use-backups"
import { CreateBackupForm } from "@/components/admin/create-backup-form"
import { ScheduleBackupForm } from "@/components/admin/schedule-backup-form"
import { RestoreBackupDialog } from "@/components/admin/restore-backup-dialog"

export default function BackupsPage() {
  const {
    backups,
    analytics,
    isLoading,
    fetchBackups,
    fetchBackupAnalytics,
    deleteBackup,
    validateBackup,
    restoreBackup,
  } = useBackups()

  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [showRestoreDialog, setShowRestoreDialog] = useState(false)

  useEffect(() => {
    fetchBackups()
    fetchBackupAnalytics()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "database":
        return <Database className="h-4 w-4" />
      case "files":
        return <HardDrive className="h-4 w-4" />
      default:
        return <Shield className="h-4 w-4" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const handleDeleteBackup = async (id: string) => {
    if (confirm("Are you sure you want to delete this backup?")) {
      await deleteBackup(id)
    }
  }

  const handleValidateBackup = async (backup: Backup) => {
    await validateBackup(backup._id)
  }

  const handleRestoreBackup = (backup: Backup) => {
    setSelectedBackup(backup)
    setShowRestoreDialog(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Backup Management</h1>
          <p className="text-muted-foreground">Create, schedule, and manage system backups</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Clock className="h-4 w-4 mr-2" />
                Schedule Backup
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Schedule Backup</DialogTitle>
              </DialogHeader>
              <ScheduleBackupForm onSuccess={() => setShowScheduleDialog(false)} />
            </DialogContent>
          </Dialog>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Backup
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Backup</DialogTitle>
              </DialogHeader>
              <CreateBackupForm onSuccess={() => setShowCreateDialog(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Backups</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.summary.reduce((sum, item) => sum + item.count, 0)}</div>
              <p className="text-xs text-muted-foreground">All backup records</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatFileSize(analytics.summary.reduce((sum, item) => sum + item.totalSize, 0))}
              </div>
              <p className="text-xs text-muted-foreground">Total backup storage</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {analytics.trends.length > 0
                  ? Math.round(
                      (analytics.trends.reduce((sum, item) => sum + item.successRate, 0) / analytics.trends.length) *
                        100,
                    )
                  : 0}
                %
              </div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics.summary.length > 0
                  ? Math.round(
                      analytics.summary.reduce((sum, item) => sum + item.avgDuration, 0) /
                        analytics.summary.length /
                        1000,
                    )
                  : 0}
                s
              </div>
              <p className="text-xs text-muted-foreground">Average backup time</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Backups Table */}
      <Card>
        <CardHeader>
          <CardTitle>Backup History</CardTitle>
          <CardDescription>View and manage all system backups</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {backups.map((backup) => (
                  <TableRow key={backup._id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(backup.type)}
                        <div>
                          <div className="font-medium">{backup.name}</div>
                          <div className="text-sm text-muted-foreground">{backup.description}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{backup.type}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(backup.status)}>{backup.status}</Badge>
                      {backup.status === "in_progress" && <Progress value={50} className="w-20 mt-1" />}
                    </TableCell>
                    <TableCell>{formatFileSize(backup.size || 0)}</TableCell>
                    <TableCell>
                      {backup.metadata.duration ? `${Math.round(backup.metadata.duration / 1000)}s` : "-"}
                    </TableCell>
                    <TableCell>{new Date(backup.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {backup.schedule?.isScheduled ? (
                        <Badge variant="outline">{backup.schedule.frequency}</Badge>
                      ) : (
                        <span className="text-muted-foreground">Manual</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {backup.status === "completed" && (
                            <>
                              <DropdownMenuItem onClick={() => handleRestoreBackup(backup)}>Restore</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleValidateBackup(backup)}>Validate</DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem onClick={() => handleDeleteBackup(backup._id)} className="text-red-600">
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Restore Dialog */}
      <RestoreBackupDialog backup={selectedBackup} open={showRestoreDialog} onOpenChange={setShowRestoreDialog} />
    </div>
  )
}
