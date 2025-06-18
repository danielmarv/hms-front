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
import { ScrollArea } from "@/components/ui/scroll-area"

const reportSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  type: z.enum(["analytics", "financial", "operational", "system", "audit", "custom"]),
  format: z.enum(["json", "pdf", "excel", "csv"]).default("json"),
  parameters: z.object({
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    modules: z.array(z.string()).optional(),
    groupBy: z.string().optional(),
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
      format: "json",
      parameters: {
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        endDate: new Date().toISOString().split("T")[0],
        modules: [],
      },
    },
  })

  const onSubmit = async (data: ReportFormData) => {
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
                    <Textarea placeholder="Enter report description" className="min-h-[60px] resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date Range */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Date Range</CardTitle>
                <CardDescription className="text-sm">Select the date range for the report</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Modules to Include</CardTitle>
                  <CardDescription className="text-sm">Select which modules to include in the report</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                </CardContent>
              </Card>
            )}

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

            {/* Email Recipients */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Email Notification (Optional)</CardTitle>
                <CardDescription className="text-sm">
                  Send the report to specific email addresses when completed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <FormLabel>Email Recipients</FormLabel>
                  <Input
                    placeholder="email1@example.com, email2@example.com"
                    value={emailRecipients}
                    onChange={(e) => setEmailRecipients(e.target.value)}
                  />
                  <FormDescription className="text-xs">Enter email addresses separated by commas</FormDescription>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onSuccess}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Generating Report..." : "Generate Report"}
              </Button>
            </div>
          </form>
        </Form>
      </ScrollArea>
    </div>
  )
}
