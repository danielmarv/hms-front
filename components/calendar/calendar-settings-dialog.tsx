"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import type { CalendarSettings } from "@/hooks/use-event-calendar"

interface CalendarSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  settings: CalendarSettings | null
  onUpdateSettings: (settings: Partial<CalendarSettings>) => Promise<CalendarSettings | null>
}

export function CalendarSettingsDialog({
  open,
  onOpenChange,
  settings,
  onUpdateSettings,
}: CalendarSettingsDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<Partial<CalendarSettings>>(settings || {})

  const handleSave = async () => {
    try {
      setLoading(true)
      await onUpdateSettings(formData)
      toast({
        title: "Success",
        description: "Calendar settings updated successfully",
      })
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update calendar settings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateFormData = (key: keyof CalendarSettings, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const updateEventColors = (status: string, color: string) => {
    setFormData((prev) => ({
      ...prev,
      event_colors: {
        ...prev.event_colors,
        [status]: color,
      },
    }))
  }

  const updateNotifications = (key: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value,
      },
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Calendar Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="default-view">Default View</Label>
                  <Select
                    value={formData.default_view || "month"}
                    onValueChange={(value) => updateFormData("default_view", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="month">Month</SelectItem>
                      <SelectItem value="week">Week</SelectItem>
                      <SelectItem value="day">Day</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="time-format">Time Format</Label>
                  <Select
                    value={formData.time_format || "12h"}
                    onValueChange={(value) => updateFormData("time_format", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12h">12 Hour</SelectItem>
                      <SelectItem value="24h">24 Hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start-time">Start Time</Label>
                  <Input
                    type="time"
                    value={formData.start_time || "07:00"}
                    onChange={(e) => updateFormData("start_time", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="end-time">End Time</Label>
                  <Input
                    type="time"
                    value={formData.end_time || "22:00"}
                    onChange={(e) => updateFormData("end_time", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first-day">First Day of Week</Label>
                  <Select
                    value={(formData.first_day_of_week || 0).toString()}
                    onValueChange={(value) => updateFormData("first_day_of_week", Number.parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Sunday</SelectItem>
                      <SelectItem value="1">Monday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between pt-6">
                  <Label htmlFor="show-weekends">Show Weekends</Label>
                  <Switch
                    checked={formData.show_weekends ?? true}
                    onCheckedChange={(checked) => updateFormData("show_weekends", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Event Colors */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Event Colors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="confirmed-color">Confirmed Events</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={formData.event_colors?.confirmed || "#22c55e"}
                      onChange={(e) => updateEventColors("confirmed", e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={formData.event_colors?.confirmed || "#22c55e"}
                      onChange={(e) => updateEventColors("confirmed", e.target.value)}
                      placeholder="#22c55e"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="pending-color">Pending Events</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={formData.event_colors?.pending || "#f59e0b"}
                      onChange={(e) => updateEventColors("pending", e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={formData.event_colors?.pending || "#f59e0b"}
                      onChange={(e) => updateEventColors("pending", e.target.value)}
                      placeholder="#f59e0b"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="cancelled-color">Cancelled Events</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={formData.event_colors?.cancelled || "#ef4444"}
                      onChange={(e) => updateEventColors("cancelled", e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={formData.event_colors?.cancelled || "#ef4444"}
                      onChange={(e) => updateEventColors("cancelled", e.target.value)}
                      placeholder="#ef4444"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="completed-color">Completed Events</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={formData.event_colors?.completed || "#8b5cf6"}
                      onChange={(e) => updateEventColors("completed", e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={formData.event_colors?.completed || "#8b5cf6"}
                      onChange={(e) => updateEventColors("completed", e.target.value)}
                      placeholder="#8b5cf6"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-reminders">Email Reminders</Label>
                  <p className="text-sm text-muted-foreground">Send email reminders for upcoming events</p>
                </div>
                <Switch
                  checked={formData.notifications?.email_reminders ?? false}
                  onCheckedChange={(checked) => updateNotifications("email_reminders", checked)}
                />
              </div>

              {formData.notifications?.email_reminders && (
                <div>
                  <Label htmlFor="reminder-time">Reminder Time (hours before event)</Label>
                  <Select
                    value={(formData.notifications?.reminder_time || 24).toString()}
                    onValueChange={(value) => updateNotifications("reminder_time", Number.parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 hour</SelectItem>
                      <SelectItem value="2">2 hours</SelectItem>
                      <SelectItem value="4">4 hours</SelectItem>
                      <SelectItem value="8">8 hours</SelectItem>
                      <SelectItem value="24">24 hours</SelectItem>
                      <SelectItem value="48">48 hours</SelectItem>
                      <SelectItem value="168">1 week</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Separator />

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
