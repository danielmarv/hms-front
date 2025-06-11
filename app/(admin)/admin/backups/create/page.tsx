"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { ArrowLeft, Database, HardDrive, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useBackups } from "@/hooks/use-backups"

const backupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  type: z.enum(["full", "database", "files", "incremental", "differential"]),
  includes: z.object({
    database: z.boolean().default(true),
    files: z.array(z.string()).optional(),
    userUploads: z.boolean().default(false),
    configuration: z.boolean().default(false),
  }),
  compression: z.object({
    enabled: z.boolean().default(true),
    level: z.number().min(1).max(9).default(6),
  }),
  encryption: z.object({
    enabled: z.boolean().default(false),
    algorithm: z.string().optional(),
  }),
  retention: z.object({
    enabled: z.boolean().default(false),
    maxCount: z.number().optional(),
    maxAge: z.number().optional(),
  }),
})

type BackupFormData = z.infer<typeof backupSchema>

export default function CreateBackupPage() {
  const router = useRouter()
  const { createBackup, isLoading } = useBackups()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<BackupFormData>({
    resolver: zodResolver(backupSchema),
    defaultValues: {
      type: "full",
      includes: {
        database: true,
        userUploads: false,
        configuration: false,
      },
      compression: {
        enabled: true,
        level: 6,
      },
      encryption: {
        enabled: false,
      },
      retention: {
        enabled: false,
      },
    },
  })

  const onSubmit = async (data: BackupFormData) => {
    try {
      setIsSubmitting(true)
      await createBackup(data)
      router.push("/admin/backups")
    } catch (error) {
      console.error("Error creating backup:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push("/admin/backups")
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "database":
        return <Database className="h-5 w-5" />
      case "files":
        return <HardDrive className="h-5 w-5" />
      default:
        return <Shield className="h-5 w-5" />
    }
  }

  const selectedType = form.watch("type")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={handleCancel}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Backups
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create New Backup</h1>
          <p className="text-muted-foreground">Configure and create a new system backup</p>
        </div>
      </div>

      <div className="max-w-4xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getTypeIcon(selectedType)}
                  Basic Information
                </CardTitle>
                <CardDescription>Configure the basic settings for your backup</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Backup Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter backup name" {...field} />
                        </FormControl>
                        <FormDescription>A descriptive name for this backup</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Backup Type *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select backup type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="full">
                              <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4" />
                                Full Backup
                              </div>
                            </SelectItem>
                            <SelectItem value="database">
                              <div className="flex items-center gap-2">
                                <Database className="h-4 w-4" />
                                Database Only
                              </div>
                            </SelectItem>
                            <SelectItem value="files">
                              <div className="flex items-center gap-2">
                                <HardDrive className="h-4 w-4" />
                                Files Only
                              </div>
                            </SelectItem>
                            <SelectItem value="incremental">Incremental</SelectItem>
                            <SelectItem value="differential">Differential</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>Choose the type of backup to create</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter backup description (optional)"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Optional description for this backup</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* What to Include */}
            <Card>
              <CardHeader>
                <CardTitle>What to Include</CardTitle>
                <CardDescription>Select what data to include in the backup</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="includes.database"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="flex items-center gap-2">
                            <Database className="h-4 w-4" />
                            Database
                          </FormLabel>
                          <FormDescription>Include all database collections and documents</FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="includes.userUploads"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="flex items-center gap-2">
                            <HardDrive className="h-4 w-4" />
                            User Uploads
                          </FormLabel>
                          <FormDescription>Include uploaded files and media</FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="includes.configuration"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Configuration Files
                          </FormLabel>
                          <FormDescription>Include system configuration and settings</FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                {selectedType === "full" && (
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      Full backup will include all selected components above. This provides the most comprehensive
                      backup but may take longer to complete.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Compression Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Compression Settings</CardTitle>
                <CardDescription>Configure backup compression to save storage space</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="compression.enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Enable Compression</FormLabel>
                        <FormDescription>Compress backup files to save storage space (recommended)</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {form.watch("compression.enabled") && (
                  <div className="ml-6 space-y-4">
                    <FormField
                      control={form.control}
                      name="compression.level"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Compression Level (1-9)</FormLabel>
                          <FormControl>
                            <div className="flex items-center space-x-4">
                              <Input
                                type="number"
                                min="1"
                                max="9"
                                className="w-20"
                                {...field}
                                onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 6)}
                              />
                              <div className="flex-1">
                                <div className="text-sm text-muted-foreground">
                                  Level {field.value}:{" "}
                                  {field.value <= 3
                                    ? "Fast compression"
                                    : field.value <= 6
                                      ? "Balanced"
                                      : "Maximum compression"}
                                </div>
                              </div>
                            </div>
                          </FormControl>
                          <FormDescription>
                            Higher levels provide better compression but take longer to process
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Encryption Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Encryption Settings</CardTitle>
                <CardDescription>Secure your backup with encryption</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="encryption.enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Enable Encryption</FormLabel>
                        <FormDescription>Encrypt backup files for additional security</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {form.watch("encryption.enabled") && (
                  <div className="ml-6">
                    <FormField
                      control={form.control}
                      name="encryption.algorithm"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Encryption Algorithm</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="w-48">
                                <SelectValue placeholder="Select algorithm" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="aes-256">AES-256 (Recommended)</SelectItem>
                              <SelectItem value="aes-128">AES-128</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>Choose the encryption algorithm for your backup</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Retention Policy */}
            <Card>
              <CardHeader>
                <CardTitle>Retention Policy</CardTitle>
                <CardDescription>Configure automatic cleanup of old backups</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="retention.enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Enable Retention Policy</FormLabel>
                        <FormDescription>Automatically delete old backups based on rules below</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {form.watch("retention.enabled") && (
                  <div className="ml-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="retention.maxCount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Backups to Keep</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="e.g., 10"
                              {...field}
                              onChange={(e) => field.onChange(Number.parseInt(e.target.value) || undefined)}
                            />
                          </FormControl>
                          <FormDescription>Keep only the most recent N backups</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="retention.maxAge"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Age (days)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="e.g., 30"
                              {...field}
                              onChange={(e) => field.onChange(Number.parseInt(e.target.value) || undefined)}
                            />
                          </FormControl>
                          <FormDescription>Delete backups older than N days</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-6 border-t">
              <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating Backup..." : "Create Backup"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
