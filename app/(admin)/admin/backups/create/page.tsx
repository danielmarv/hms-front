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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Badge } from "@/components/ui/badge"
import { useBackups } from "@/hooks/use-backups"
import { Database, Files, HardDrive, Home, RefreshCw, Server } from "lucide-react"
import { toast } from "sonner"

const backupSchema = z.object({
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
  tags: z.array(z.string()).optional(),
})

type BackupFormValues = z.infer<typeof backupSchema>

export default function CreateBackupPage() {
  const router = useRouter()
  const { createBackup, isLoading } = useBackups()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")

  const form = useForm<BackupFormValues>({
    resolver: zodResolver(backupSchema),
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
      tags: [],
    },
  })

  const onSubmit = async (data: BackupFormValues) => {
    try {
      setIsSubmitting(true)

      // Add tags to the form data
      const backupData = {
        ...data,
        tags: selectedTags,
      }

      await createBackup(backupData)
      router.push("/admin/backups")
    } catch (error: any) {
      toast.error(error.message || "Failed to create backup")
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
            <BreadcrumbLink>Create Backup</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Create New Backup</h1>
        <Button variant="outline" onClick={() => router.push("/admin/backups")}>
          Cancel
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Enter the basic details for your backup</CardDescription>
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

          <Tabs defaultValue="compression">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="compression">Compression</TabsTrigger>
              <TabsTrigger value="encryption">Encryption</TabsTrigger>
              <TabsTrigger value="retention">Retention</TabsTrigger>
            </TabsList>

            <TabsContent value="compression">
              <Card>
                <CardHeader>
                  <CardTitle>Compression Settings</CardTitle>
                  <CardDescription>Configure how the backup will be compressed</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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
                          <FormDescription>Choose the compression algorithm based on your needs</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="encryption">
              <Card>
                <CardHeader>
                  <CardTitle>Encryption Settings</CardTitle>
                  <CardDescription>Configure how the backup will be encrypted</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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
                          <FormDescription>
                            Choose the encryption algorithm based on your security needs
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="retention">
              <Card>
                <CardHeader>
                  <CardTitle>Retention Policy</CardTitle>
                  <CardDescription>Configure how long backups will be kept</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

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
              {isSubmitting ? "Creating..." : "Create Backup"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
