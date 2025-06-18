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
import { ScrollArea } from "@/components/ui/scroll-area"
import { useReports } from "@/hooks/use-reports"

const scheduleReportSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  type: z.enum(["analytics", "financial", "operational", "system", "audit", "custom"]),
  format: z.enum(["json", "pdf", "excel", "csv"]).default("json"),
  frequency: z.enum(["once", "daily", "weekly", "monthly", "quarterly", "yearly"]),
  scheduledFor: z.string().optional(),
  parameters: z.object({
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    modules: z.array(z.string()).optional(),
  }),
  schedule: z.object({
    frequency: z.enum(["hourly", "daily", "weekly", "monthly"]),
    time: z.string().min(1, "Time is required"),
    dayOfWeek: z.number().optional(),
    dayOfMonth: z.number().optional(),
    isActive: z.boolean().default(true),
  }),
  emailNotification: z.object({
    enabled: z.boolean().default(false),
    subject: z.string().optional(),
    includeAttachment: z.boolean().default(false),
  }),
})

type ScheduleReportFormData = z.infer<typeof scheduleReportSchema>

interface ScheduleReportFormProps {
  onSuccess: () => void
}

export function ScheduleReportForm({ onSuccess }: ScheduleReportFormProps) {
  const { scheduleReport, isLoading } = useReports()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [emailRecipients, setEmailRecipients] = useState<string>("")

  const form = useForm<ScheduleReportFormData>({
    resolver: zodResolver(scheduleReportSchema),
    defaultValues: {
      type: "analytics",
      format: "json",
      frequency: "weekly",
      parameters: {
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        endDate: new Date().toISOString().split("T")[0],
        modules: [],
      },
      schedule: {
        frequency: "daily",
        time: "08:00",
        isActive: true,
      },
      emailNotification: {
        enabled: false,
        includeAttachment: false,
      },
    },
  })

  const onSubmit = async (data: ScheduleReportFormData) => {
    try {
      setIsSubmitting(true)

      // Parse email recipients
      const recipients = emailRecipients
        ? emailRecipients
            .split(",")
            .map((email) => email.trim())
            .filter((email) => email.length > 0)
            .map((email) => ({ email, name: email.split("@")[0] }))
        : []

      // Prepare the data for the backend
      const reportData = {
        ...data,
        recipients,
        isScheduled: true,
        emailNotification: {
          ...data.emailNotification,
          recipients: recipients.map((r) => r.email),
        },
      }

      await scheduleReport(reportData)
      onSuccess()
    } catch (error) {
      console.error("Error scheduling report:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const availableModules = {
    analytics: ["bookings", "guests", "rooms", "revenue"],
    financial: ["revenue", "expenses", "profitLoss"],
    operational: ["maintenance", "inventory", "housekeeping"],
    system: ["users", "performance", "logs"],
    audit: ["activities", "changes", "access"],
    custom: [],
  }

  const currentModules = availableModules[form.watch("type")] || []
  const frequency = form.watch("schedule.frequency")

  return (
    <div className="max-h-[80vh] overflow-hidden">
      <ScrollArea className="h-full pr-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Report Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter report title" {...field} />
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
                    <FormLabel>Report Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select report type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="analytics">Analytics Report</SelectItem>
                        <SelectItem value="financial">Financial Report</SelectItem>
                        <SelectItem value="operational">Operational Report</SelectItem>
                        <SelectItem value="system">System Report</SelectItem>
                        <SelectItem value="audit">Audit Report</SelectItem>
                        <SelectItem value="custom">Custom Report</SelectItem>
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
                    <Textarea placeholder="Enter report description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Schedule Configuration */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Schedule Configuration</CardTitle>
                <CardDescription className="text-sm">
                  Configure when and how often the report should be generated
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            <SelectItem value="1">Monday</SelectItem>
                            <SelectItem value="2">Tuesday</SelectItem>
                            <SelectItem value="3">Wednesday</SelectItem>
                            <SelectItem value="4">Thursday</SelectItem>
                            <SelectItem value="5">Friday</SelectItem>
                            <SelectItem value="6">Saturday</SelectItem>
                            <SelectItem value="0">Sunday</SelectItem>
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
              </CardContent>
            </Card>

            {/* Date Range */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Report Parameters</CardTitle>
                <CardDescription className="text-sm">
                  Configure the default date range and modules for the report
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="parameters.startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormDescription className="text-xs">
                          This will be adjusted relative to the generation date
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="parameters.endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default End Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormDescription className="text-xs">
                          This will be adjusted relative to the generation date
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Modules Selection */}
                {currentModules && currentModules.length > 0 && (
                  <div>
                    <FormLabel className="text-sm font-medium">Modules to Include</FormLabel>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                      {currentModules.map((module) => (
                        <FormField
                          key={module}
                          control={form.control}
                          name="parameters.modules"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(module)}
                                  onCheckedChange={(checked) => {
                                    const currentModules = field.value || []
                                    if (checked) {
                                      field.onChange([...currentModules, module])
                                    } else {
                                      field.onChange(currentModules.filter((m) => m !== module))
                                    }
                                  }}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="capitalize text-sm font-normal">{module}</FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Output Format */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Output Format</CardTitle>
                <CardDescription className="text-sm">Choose the format for the generated report</CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="format"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Format</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select format" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="json">JSON</SelectItem>
                          <SelectItem value="excel">Excel (XLSX)</SelectItem>
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="csv">CSV</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Email Notification */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Email Notification</CardTitle>
                <CardDescription className="text-sm">
                  Configure email notifications for scheduled reports
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="emailNotification.enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Send Email Notification</FormLabel>
                        <FormDescription className="text-xs">
                          Send an email when the report is completed
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {form.watch("emailNotification.enabled") && (
                  <div className="space-y-4">
                    <div>
                      <FormLabel>Email Recipients</FormLabel>
                      <Input
                        placeholder="email1@example.com, email2@example.com"
                        value={emailRecipients}
                        onChange={(e) => setEmailRecipients(e.target.value)}
                      />
                      <FormDescription className="text-xs">Enter email addresses separated by commas</FormDescription>
                    </div>

                    <FormField
                      control={form.control}
                      name="emailNotification.subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Subject (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Scheduled Report Generated" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="emailNotification.includeAttachment"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Include Report as Attachment</FormLabel>
                            <FormDescription className="text-xs">Attach the report file to the email</FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onSuccess}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Scheduling Report..." : "Schedule Report"}
              </Button>
            </div>
          </form>
        </Form>
      </ScrollArea>
    </div>
  )
}
