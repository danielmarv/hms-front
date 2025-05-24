"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useReports } from "@/hooks/use-reports"

const reportSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["analytics", "financial", "operational", "system", "audit", "custom"]),
  parameters: z.object({
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    modules: z.array(z.string()).optional(),
  }),
  emailNotification: z.object({
    enabled: z.boolean().default(false),
    recipients: z.array(z.string()).optional(),
    subject: z.string().optional(),
    includeAttachment: z.boolean().default(false),
  }),
})

type ReportFormData = z.infer<typeof reportSchema>

interface CreateReportFormProps {
  onSuccess: () => void
}

export function CreateReportForm({ onSuccess }: CreateReportFormProps) {
  const { createReport, isLoading } = useReports()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [emailRecipients, setEmailRecipients] = useState<string>("")

  const form = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      type: "analytics",
      parameters: {
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        endDate: new Date().toISOString().split("T")[0],
        modules: [],
      },
      emailNotification: {
        enabled: false,
        includeAttachment: false,
      },
    },
  })

  const onSubmit = async (data: ReportFormData) => {
    try {
      setIsSubmitting(true)

      // Parse email recipients
      if (data.emailNotification.enabled && emailRecipients) {
        data.emailNotification.recipients = emailRecipients
          .split(",")
          .map((email) => email.trim())
          .filter((email) => email.length > 0)
      }

      await createReport(data)
      onSuccess()
    } catch (error) {
      console.error("Error creating report:", error)
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Report Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter report name" {...field} />
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

        {/* Date Range */}
        <Card>
          <CardHeader>
            <CardTitle>Date Range</CardTitle>
            <CardDescription>Select the date range for the report</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="parameters.startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="parameters.endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Modules Selection */}
        {currentModules.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Modules to Include</CardTitle>
              <CardDescription>Select which modules to include in the report</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
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
            </CardContent>
          </Card>
        )}

        {/* Email Notification */}
        <Card>
          <CardHeader>
            <CardTitle>Email Notification</CardTitle>
            <CardDescription>Configure email notifications for report completion</CardDescription>
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
                    <FormDescription>Send an email when the report is completed</FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {form.watch("emailNotification.enabled") && (
              <>
                <div>
                  <FormLabel>Email Recipients</FormLabel>
                  <Input
                    placeholder="email1@example.com, email2@example.com"
                    value={emailRecipients}
                    onChange={(e) => setEmailRecipients(e.target.value)}
                  />
                  <FormDescription>Enter email addresses separated by commas</FormDescription>
                </div>

                <FormField
                  control={form.control}
                  name="emailNotification.subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Subject (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Report Generated" {...field} />
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
                        <FormDescription>Attach the report file to the email</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Generating Report..." : "Generate Report"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
