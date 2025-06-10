"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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

interface CreateBackupFormProps {
  onSuccess: () => void
}

export function CreateBackupForm({ onSuccess }: CreateBackupFormProps) {
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
      onSuccess()
    } catch (error) {
      console.error("Error creating backup:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Backup Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter backup name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Backup Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select backup type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="full">Full Backup</SelectItem>
                    <SelectItem value="database">Database Only</SelectItem>
                    <SelectItem value="files">Files Only</SelectItem>
                    <SelectItem value="incremental">Incremental</SelectItem>
                    <SelectItem value="differential">Differential</SelectItem>
                  </SelectContent>
                </Select>
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
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter backup description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Includes Section */}
        <Card>
          <CardHeader>
            <CardTitle>What to Include</CardTitle>
            <CardDescription>Select what data to include in the backup</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="includes.database"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Database</FormLabel>
                    <FormDescription>Include all database collections and documents</FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="includes.userUploads"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>User Uploads</FormLabel>
                    <FormDescription>Include uploaded files and media</FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="includes.configuration"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Configuration Files</FormLabel>
                    <FormDescription>Include system configuration and settings</FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Compression Section */}
        <Card>
          <CardHeader>
            <CardTitle>Compression</CardTitle>
            <CardDescription>Configure backup compression settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
                    <FormDescription>Compress backup files to save storage space</FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {form.watch("compression.enabled") && (
              <FormField
                control={form.control}
                name="compression.level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Compression Level (1-9)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="9"
                        {...field}
                        onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 6)}
                      />
                    </FormControl>
                    <FormDescription>Higher levels provide better compression but take longer</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
        </Card>

        {/* Encryption Section */}
        <Card>
          <CardHeader>
            <CardTitle>Encryption</CardTitle>
            <CardDescription>Configure backup encryption settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
                    <FormDescription>Encrypt backup files for security</FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {form.watch("encryption.enabled") && (
              <FormField
                control={form.control}
                name="encryption.algorithm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Encryption Algorithm</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select algorithm" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="aes-256">AES-256</SelectItem>
                        <SelectItem value="aes-128">AES-128</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
        </Card>

        {/* Retention Section */}
        <Card>
          <CardHeader>
            <CardTitle>Retention Policy</CardTitle>
            <CardDescription>Configure how long to keep backups</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
                    <FormDescription>Automatically delete old backups</FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {form.watch("retention.enabled") && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="retention.maxCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Backups to Keep</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="10"
                          {...field}
                          onChange={(e) => field.onChange(Number.parseInt(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="retention.maxAge"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Age (days)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="30"
                          {...field}
                          onChange={(e) => field.onChange(Number.parseInt(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating Backup..." : "Create Backup"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
