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
  recipients: z
    .array(
      z.object({
        email: z.string().email(),
        name: z.string(),
      }),
    )
    .optional(),
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
    },
  })

  const onSubmit = async (data: ScheduleReportFormData) => {
    try {
      setIsSubmitting(true)

      // Parse email recipients
      if (emailRecipients) {
        data.recipients = emailRecipients
          .split(",")
          .map((email) => email.trim())
          .filter((email) => email.length > 0)
          .map((email) => ({ email, name: email.split("@")[0] }))
      }

      await scheduleReport(data)
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
  }

  const currentModules = availableModules[form.watch("type") as keyof typeof availableModules] || []
  const frequency = form.watch("frequency")

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
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
          <CardHeader>
            <CardTitle>Schedule Configuration</CardTitle>
            <CardDescription>Configure when and how often the report should be generated</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="frequency"
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
                        <SelectItem value="once">Once</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {frequency === "once" && (
                <FormField
                  control={form.control}
                  name="scheduledFor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Scheduled For</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Date Range */}
        <Card>
          <CardHeader>
            <CardTitle>Report Parameters</CardTitle>
            <CardDescription>Configure the default date range and modules for the report</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="parameters.startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormDescription>This will be adjusted relative to the generation date</FormDescription>
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
                    <FormDescription>This will be adjusted relative to the generation date</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Modules Selection */}
            {currentModules.length > 0 && (
              <div>
                <FormLabel>Modules to Include</FormLabel>
                <div className="grid grid-cols-2 gap-4 mt-2">
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
                            <FormLabel className="capitalize">{module}</FormLabel>
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
          <CardHeader>
            <CardTitle>Output Format</CardTitle>
            <CardDescription>Choose the format for the generated report</CardDescription>
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

        {/* Email Recipients */}
        <Card>
          <CardHeader>
            <CardTitle>Email Notification (Optional)</CardTitle>
            <CardDescription>Send the report to specific email addresses when completed</CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <FormLabel>Email Recipients</FormLabel>
              <Input
                placeholder="email1@example.com, email2@example.com"
                value={emailRecipients}
                onChange={(e) => setEmailRecipients(e.target.value)}
              />
              <FormDescription>Enter email addresses separated by commas</FormDescription>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Scheduling Report..." : "Schedule Report"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
