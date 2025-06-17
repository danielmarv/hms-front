"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ScheduleReportFormProps {
  onSubmit: (values: z.infer<typeof formSchema>) => void
  onSuccess: () => void
  isSubmitting: boolean
  currentModules: string[]
}

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Report name must be at least 2 characters.",
  }),
  type: z.string().min(1, {
    message: "Please select a report type.",
  }),
  frequency: z.string().min(1, {
    message: "Please select a frequency.",
  }),
  scheduledFor: z.string().min(1, {
    message: "Please select a start date & time.",
  }),
  dayOfWeek: z.string().optional(),
  dayOfMonth: z.string().optional(),
  parameters: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    modules: z.array(z.string()).optional(),
  }),
  emailNotification: z
    .object({
      enabled: z.boolean().optional(),
      subject: z.string().optional(),
      includeAttachment: z.boolean().optional(),
    })
    .optional(),
})

export function ScheduleReportForm({ onSubmit, onSuccess, isSubmitting, currentModules }: ScheduleReportFormProps) {
  const [emailRecipients, setEmailRecipients] = useState<string>("")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "",
      frequency: "",
      scheduledFor: "",
      parameters: {
        startDate: "",
        endDate: "",
        modules: [],
      },
      emailNotification: {
        enabled: false,
        subject: "",
        includeAttachment: false,
      },
    },
  })

  const watchFrequency = form.watch("frequency")

  useEffect(() => {
    if (watchFrequency !== "weekly") {
      form.setValue("dayOfWeek", "")
    }
    if (watchFrequency !== "monthly") {
      form.setValue("dayOfMonth", "")
    }
  }, [watchFrequency, form])

  return (
    <div className="max-h-[80vh] overflow-hidden">
      <ScrollArea className="h-full pr-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-4">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            {/* Schedule Configuration */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Schedule Configuration</CardTitle>
                <CardDescription className="text-sm">
                  Configure when and how often the report should run
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                  <FormField
                    control={form.control}
                    name="scheduledFor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date & Time</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {watchFrequency === "weekly" && (
                  <FormField
                    control={form.control}
                    name="dayOfWeek"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Day of Week</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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

                {watchFrequency === "monthly" && (
                  <FormField
                    control={form.control}
                    name="dayOfMonth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Day of Month</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" max="31" placeholder="1-31" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>

            {/* Report Parameters */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Report Parameters</CardTitle>
                <CardDescription className="text-sm">Configure the report data parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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

                {/* Modules Selection */}
                {currentModules.length > 0 && (
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
