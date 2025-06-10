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

const scheduleBackupSchema = z.object({
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
  schedule: z.object({
    isScheduled: z.boolean().default(true),
    frequency: z.enum(["hourly", "daily", "weekly", "monthly"]),
    time: z.string().min(1, "Time is required"),
    dayOfWeek: z.number().optional(),
    dayOfMonth: z.number().optional(),
    timezone: z.string().default("UTC"),
  }),
})

type ScheduleBackupFormData = z.infer<typeof scheduleBackupSchema>

interface ScheduleBackupFormProps {
  onSuccess: () => void
}

export function ScheduleBackupForm({ onSuccess }: ScheduleBackupFormProps) {
  const { scheduleBackup, isLoading } = useBackups()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ScheduleBackupFormData>({
    resolver: zodResolver(scheduleBackupSchema),
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
      schedule: {
        isScheduled: true,
        frequency: "daily",
        time: "02:00",
        timezone: "UTC",
      },
    },
  })

  const onSubmit = async (data: ScheduleBackupFormData) => {
    try {
      setIsSubmitting(true)
      await scheduleBackup(data)
      onSuccess()
    } catch (error) {
      console.error("Error scheduling backup:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const frequency = form.watch("schedule.frequency")

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

        {/* Schedule Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Schedule Configuration</CardTitle>
            <CardDescription>Configure when and how often the backup should run</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="schedule.frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="schedule.time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {frequency === "weekly" && (
              <FormField
                control={form.control}
                name="schedule.dayOfWeek"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Day of Week</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number.parseInt(value))}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select day" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="0">Sunday</SelectItem>
                        <SelectItem value="1">Monday</SelectItem>
                        <SelectItem value="2">Tuesday</SelectItem>
                        <SelectItem value="3">Wednesday</SelectItem>
                        <SelectItem value="4">Thursday</SelectItem>
                        <SelectItem value="5">Friday</SelectItem>
                        <SelectItem value="6">Saturday</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {frequency === "monthly" && (
              <FormField
                control={form.control}
                name="schedule.dayOfMonth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Day of Month</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="31"
                        placeholder="1-31"
                        {...field}
                        onChange={(e) => field.onChange(Number.parseInt(e.target.value) || undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="schedule.timezone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Timezone</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="Europe/London">London</SelectItem>
                      <SelectItem value="Europe/Paris">Paris</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

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
            {isSubmitting ? "Scheduling Backup..." : "Schedule Backup"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
