"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Database, HardDrive } from "lucide-react"
import { useBackups, type Backup } from "@/hooks/use-backups"

const restoreSchema = z.object({
  targetLocation: z.string().optional(),
  options: z.object({
    dropExisting: z.boolean().default(false),
    overwriteFiles: z.boolean().default(false),
    validateBeforeRestore: z.boolean().default(true),
    createBackupBeforeRestore: z.boolean().default(true),
  }),
  confirmRestore: z.boolean().refine((val) => val === true, {
    message: "You must confirm the restore operation",
  }),
})

type RestoreFormData = z.infer<typeof restoreSchema>

interface RestoreBackupDialogProps {
  backup: Backup | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RestoreBackupDialog({ backup, open, onOpenChange }: RestoreBackupDialogProps) {
  const { restoreBackup, isLoading } = useBackups()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<RestoreFormData>({
    resolver: zodResolver(restoreSchema),
    defaultValues: {
      options: {
        dropExisting: false,
        overwriteFiles: false,
        validateBeforeRestore: true,
        createBackupBeforeRestore: true,
      },
      confirmRestore: false,
    },
  })

  const onSubmit = async (data: RestoreFormData) => {
    if (!backup) return

    try {
      setIsSubmitting(true)
      await restoreBackup(backup._id, {
        targetLocation: data.targetLocation,
        options: data.options,
      })
      onOpenChange(false)
      form.reset()
    } catch (error) {
      console.error("Error restoring backup:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    form.reset()
  }

  if (!backup) return null

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[70vh] overflow-y-auto flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Restore Backup</DialogTitle>
          <DialogDescription>
            Restore data from the selected backup. This operation will replace existing data.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Backup Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {backup.type === "database" ? <Database className="h-5 w-5" /> : <HardDrive className="h-5 w-5" />}
                    Backup Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Name:</span> {backup.name}
                    </div>
                    <div>
                      <span className="font-medium">Type:</span> {backup.type}
                    </div>
                    <div>
                      <span className="font-medium">Size:</span> {formatFileSize(backup.size || 0)}
                    </div>
                    <div>
                      <span className="font-medium">Created:</span> {new Date(backup.createdAt).toLocaleString()}
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium">Description:</span> {backup.description || "No description"}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Warning Alert */}
              <Alert className="border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  <strong>Warning:</strong> This operation will replace existing data with the backup data. Make sure
                  you understand the implications before proceeding.
                </AlertDescription>
              </Alert>

              {/* Target Location */}
              <FormField
                control={form.control}
                name="targetLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Location (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Leave empty to restore to original location" {...field} />
                    </FormControl>
                    <FormDescription>
                      Specify a custom location to restore the backup. Leave empty to restore to the original location.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Restore Options */}
              <Card>
                <CardHeader>
                  <CardTitle>Restore Options</CardTitle>
                  <CardDescription>Configure how the restore operation should be performed</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="options.validateBeforeRestore"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Validate Backup Before Restore</FormLabel>
                          <FormDescription>Verify backup integrity before starting the restore process</FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="options.createBackupBeforeRestore"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Create Backup Before Restore</FormLabel>
                          <FormDescription>Create a backup of current data before restoring</FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  {backup.type === "database" && (
                    <FormField
                      control={form.control}
                      name="options.dropExisting"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Drop Existing Collections</FormLabel>
                            <FormDescription>
                              Remove existing database collections before restoring (recommended for clean restore)
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  )}

                  {(backup.type === "files" || backup.type === "full") && (
                    <FormField
                      control={form.control}
                      name="options.overwriteFiles"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Overwrite Existing Files</FormLabel>
                            <FormDescription>Replace existing files with backup files</FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  )}
                </CardContent>
              </Card>

              {/* Confirmation */}
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="text-red-700">Confirmation Required</CardTitle>
                  <CardDescription>Please confirm that you understand the risks of this operation</CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="confirmRestore"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-red-700">
                            I understand that this operation will replace existing data and cannot be undone
                          </FormLabel>
                          <FormDescription>
                            By checking this box, you confirm that you have read and understood the implications of this
                            restore operation.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormMessage />
                </CardContent>
              </Card>
            </form>
          </Form>
        </div>

        <div className="flex-shrink-0 flex justify-end gap-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !form.watch("confirmRestore")}
            variant="destructive"
            onClick={form.handleSubmit(onSubmit)}
          >
            {isSubmitting ? "Restoring..." : "Start Restore"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
