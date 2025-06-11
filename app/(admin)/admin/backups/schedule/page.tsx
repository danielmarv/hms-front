"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Badge } from "@/components/ui/badge"
import { useBackups } from "@/hooks/use-backups"
import { Calendar, Clock, Database, Files, HardDrive, Home, RefreshCw, Server } from "lucide-react"
import { toast } from "sonner"

const scheduleSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().optional(),
  type: z.enum(["full", "database", "files", "incremental", "differential"]),
  source: z.string().min(1, "Source is required"),
  destination: z.string().min(1, "Destination is required"),
  compression: z.object({
    enabled: z.boolean().default(true),
    algorithm: z.enum(["gzip", "bzip2", "lz4"]).default("gzip"),
  }),
  encryption: z.object({
    enabled: z.boolean().default(true),
    algorithm: z.enum(["AES-256", "AES-128"]).default("AES-256"),
  }),
  retention: z.object({
    policy: z.enum(["days", "weeks", "months", "count"]).default("days"),
    value: z.number().int().positive().default(30),
  }),
  schedule: z.object({
    isScheduled: z.literal(true).default(true),
    frequency: z.enum(["hourly", "daily", "weekly", "monthly"]),
    time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Time must be in HH:MM format"),
    dayOfWeek: z.number().min(0).max(6).optional(),
    dayOfMonth: z.number().min(1).max(31).optional(),
  }),
  tags: z.array(z.string()).optional(),
})

type ScheduleFormValues = z.infer<typeof scheduleSchema>

export default function ScheduleBackupPage() {
  const router = useRouter()
  const { scheduleBackup, isLoading } = useBackups()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")

  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "full",
      source: "/data",
      destination: "/backups",
      compression: {
        enabled: true,
        algorithm: "gzip",
      },
      encryption: {
        enabled: true,
        algorithm: "AES-256",
      },
      retention: {
        policy: "days",
        value: 30,
      },
      schedule: {
        isScheduled: true,
        frequency: "daily",
        time: "00:00",
      },
      tags: [],
    },
  })

  const onSubmit = async (data: ScheduleFormValues) => {
    try {
      setIsSubmitting(true)

      // Add tags to the form data
      const backupData = {
        ...data,
        tags: selectedTags,
      }

      await scheduleBackup(backupData)
      router.push("/admin/backups")
    } catch (error: any) {
      toast.error(error.message || "Failed to schedule backup")
    } finally {
      setIsSubmitting(false)
    }
  }

  const addTag = () => {
    if (newTag && !selectedTags.includes(newTag)) {
      setSelectedTags([...selectedTags, newTag])
      setNewTag("")
    }
  }

  const removeTag = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag))
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "full":
        return <HardDrive className="h-5 w-5" />
      case "database":
        return <Database className="h-5 w-5" />
      case "files":
        return <Files className="h-5 w-5" />
      case "incremental":
        return <RefreshCw className="h-5 w-5" />
      case "differential":
        return <Server className="h-5 w-5" />
      default:
        return <HardDrive className="h-5 w-5" />
    }
  }

  // Calculate next run time based on schedule
  const getNextRunPreview = () => {
    const frequency = form.watch("schedule.frequency")
    const time = form.watch("schedule.time")
    const dayOfWeek = form.watch("schedule.dayOfWeek")
    const dayOfMonth = form.watch("schedule.dayOfMonth")

    if (!time) return "Not set"

    const now = new Date()
    const [hours, minutes] = time.split(":").map(Number)
    const nextRun = new Date(now)
    nextRun.setHours(hours, minutes, 0, 0)

    if (nextRun <= now) {
      // If the time has already passed today, move to next occurrence
      switch (frequency) {
        case "hourly":
          nextRun.setHours(now.getHours() + 1)
          break
        case "daily":
          nextRun.setDate(nextRun.getDate() + 1)
          break
        case "weekly":
          if (typeof dayOfWeek === "number") {
            const daysUntilNextOccurrence = (dayOfWeek + 7 - now.getDay()) % 7
            nextRun.setDate(nextRun.getDate() + (daysUntilNextOccurrence || 7))
          } else {
            nextRun.setDate(nextRun.getDate() + 7)
          }
          break
        case "monthly":
          if (typeof dayOfMonth === "number") {
            nextRun.setDate(dayOfMonth)
            if (nextRun <= now) {
              nextRun.setMonth(nextRun.getMonth() + 1)
            }
          } else {
            nextRun.setMonth(nextRun.getMonth() + 1)
          }
          break
      }
    } else if (frequency === "weekly" && typeof dayOfWeek === "number") {
      // Adjust to the correct day of week
      const currentDay = now.getDay()
      if (currentDay !== dayOfWeek) {
        const daysUntilNextOccurrence = (dayOfWeek + 7 - currentDay) % 7
        nextRun.setDate(nextRun.getDate() + daysUntilNextOccurrence)
      }
    } else if (frequency === "monthly" && typeof dayOfMonth === "number") {
      // Adjust to the correct day of month
      nextRun.setDate(dayOfMonth)
      if (nextRun <= now) {
        nextRun.setMonth(nextRun.getMonth() + 1)
      }
    }

    return nextRun.toLocaleString()
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">
              <Home className="h-4 w-4 mr-2" />
              Admin
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/backups">Backups</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>Schedule Backup</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Schedule Backup</h1>
        <Button variant="outline" onClick={() => router.push("/admin/backups")}>
          Cancel
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Enter the basic details for your scheduled backup</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Backup Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Daily Database Backup" {...field} />
                    </FormControl>
                    <FormDescription>A descriptive name for your backup</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Daily backup of the main database" {...field} />
                    </FormControl>
                    <FormDescription>Additional details about this backup</FormDescription>
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
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select backup type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full">
                            <div className="flex items-center">
                              <HardDrive className="h-4 w-4 mr-2" />
                              Full Backup
                            </div>
                          </SelectItem>
                          <SelectItem value="database">
                            <div className="flex items-center">
                              <Database className="h-4 w-4 mr-2" />
                              Database Only
                            </div>
                          </SelectItem>
                          <SelectItem value="files">
                            <div className="flex items-center">
                              <Files className="h-4 w-4 mr-2" />
                              Files Only
                            </div>
                          </SelectItem>
                          <SelectItem value="incremental">
                            <div className="flex items-center">
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Incremental
                            </div>
                          </SelectItem>
                          <SelectItem value="differential">
                            <div className="flex items-center">
                              <Server className="h-4 w-4 mr-2" />
                              Differential
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>The type of backup to perform</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Location Settings</CardTitle>
              <CardDescription>Specify source and destination paths for the backup</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source Path</FormLabel>
                    <FormControl>
                      <Input placeholder="/data" {...field} />
                    </FormControl>
                    <FormDescription>The directory or database to backup</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="destination"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destination Path</FormLabel>
                    <FormControl>
                      <Input placeholder="/backups" {...field} />
                    </FormControl>
                    <FormDescription>Where to store the backup files</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Schedule Settings
              </CardTitle>
              <CardDescription>Configure when the backup should run</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="schedule.frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequency</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
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
                    <FormDescription>How often the backup should run</FormDescription>
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
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                    </div>
                    <FormDescription>The time when the backup should run (24-hour format)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch("schedule.frequency") === "weekly" && (
                <FormField
                  control={form.control}
                  name="schedule.dayOfWeek"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Day of Week</FormLabel>
                      <Select
                        value={field.value?.toString() || "0"}
                        onValueChange={(value) => field.onChange(Number.parseInt(value))}
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
                      <FormDescription>The day of the week when the backup should run</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {form.watch("schedule.frequency") === "monthly" && (
                <FormField
                  control={form.control}
                  name="schedule.dayOfMonth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Day of Month</FormLabel>
                      <Select
                        value={field.value?.toString() || "1"}
                        onValueChange={(value) => field.onChange(Number.parseInt(value))}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select day" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="h-[200px]">
                          {Array.from({ length: 31 }, (_, i) => (
                            <SelectItem key={i + 1} value={(i + 1).toString()}>
                              {i + 1}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>The day of the month when the backup should run</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <Card className="bg-muted/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Next Run Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    Next backup will run at: <span className="font-medium">{getNextRunPreview()}</span>
                  </p>
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Compression & Encryption</CardTitle>
              <CardDescription>Configure backup file settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="compression.enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Enable Compression</FormLabel>
                        <FormDescription>Compress backup files to save storage space</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="encryption.enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Enable Encryption</FormLabel>
                        <FormDescription>Encrypt backup files for security</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {form.watch("compression.enabled") && (
                  <FormField
                    control={form.control}
                    name="compression.algorithm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Compression Algorithm</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select algorithm" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="gzip">gzip (balanced)</SelectItem>
                            <SelectItem value="bzip2">bzip2 (better compression)</SelectItem>
                            <SelectItem value="lz4">lz4 (faster)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>Choose the compression algorithm</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {form.watch("encryption.enabled") && (
                  <FormField
                    control={form.control}
                    name="encryption.algorithm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Encryption Algorithm</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select algorithm" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="AES-256">AES-256 (recommended)</SelectItem>
                            <SelectItem value="AES-128">AES-128 (faster)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>Choose the encryption algorithm</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Retention Policy</CardTitle>
              <CardDescription>Configure how long backups will be kept</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="retention.policy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Retention Type</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select retention type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="days">Days</SelectItem>
                          <SelectItem value="weeks">Weeks</SelectItem>
                          <SelectItem value="months">Months</SelectItem>
                          <SelectItem value="count">Count</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>How to measure the retention period</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="retention.value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Retention Value</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          {...field}
                          onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 30)}
                        />
                      </FormControl>
                      <FormDescription>
                        {form.watch("retention.policy") === "count"
                          ? "Number of backups to keep"
                          : `Number of ${form.watch("retention.policy")} to keep backups`}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
              <CardDescription>Add optional tags to help organize your backups</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addTag()
                      }
                    }}
                  />
                  <Button type="button" onClick={addTag}>
                    Add
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {selectedTags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="px-3 py-1">
                      {tag}
                      <button type="button" className="ml-2 text-xs" onClick={() => removeTag(tag)}>
                        ×
                      </button>
                    </Badge>
                  ))}
                  {selectedTags.length === 0 && <div className="text-sm text-muted-foreground">No tags added</div>}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.push("/admin/backups")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Scheduling..." : "Schedule Backup"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
