"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd"
import { Settings, Eye, EyeOff, GripVertical, Palette, Layout, Save, RotateCcw } from "lucide-react"

interface DashboardSection {
  id: string
  title: string
  description: string
  enabled: boolean
  order: number
}

interface CustomizationPanelProps {
  onSave?: (config: DashboardConfig) => void
}

interface DashboardConfig {
  sections: DashboardSection[]
  theme: string
  layout: string
  refreshInterval: number
}

export function CustomizationPanel({ onSave }: CustomizationPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [config, setConfig] = useState<DashboardConfig>({
    sections: [
      {
        id: "overview",
        title: "KPI Overview",
        description: "Key performance indicators and metrics",
        enabled: true,
        order: 0,
      },
      {
        id: "departments",
        title: "Department Dashboards",
        description: "Quick access to department-specific dashboards",
        enabled: true,
        order: 1,
      },
      {
        id: "activity",
        title: "Recent Activity",
        description: "Latest updates and activities",
        enabled: true,
        order: 2,
      },
      {
        id: "quick-actions",
        title: "Quick Actions",
        description: "Frequently used functions and shortcuts",
        enabled: true,
        order: 3,
      },
      {
        id: "system-status",
        title: "System Status",
        description: "System health and performance indicators",
        enabled: true,
        order: 4,
      },
      {
        id: "weather",
        title: "Weather Widget",
        description: "Local weather information",
        enabled: false,
        order: 5,
      },
      {
        id: "news",
        title: "Industry News",
        description: "Latest hospitality industry news",
        enabled: false,
        order: 6,
      },
    ],
    theme: "default",
    layout: "grid",
    refreshInterval: 30,
  })

  const handleSectionToggle = (sectionId: string, enabled: boolean) => {
    setConfig((prev) => ({
      ...prev,
      sections: prev.sections.map((section) => (section.id === sectionId ? { ...section, enabled } : section)),
    }))
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const items = Array.from(config.sections)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // Update order values
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index,
    }))

    setConfig((prev) => ({
      ...prev,
      sections: updatedItems,
    }))
  }

  const handleSave = () => {
    onSave?.(config)
    setIsOpen(false)
  }

  const handleReset = () => {
    // Reset to default configuration
    setConfig({
      sections: config.sections.map((section, index) => ({
        ...section,
        enabled: index < 5, // Enable first 5 sections by default
        order: index,
      })),
      theme: "default",
      layout: "grid",
      refreshInterval: 30,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="mr-2 h-4 w-4" />
          Customize Dashboard
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customize Dashboard</DialogTitle>
          <DialogDescription>
            Personalize your dashboard layout, sections, and appearance to match your workflow.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Layout Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Layout className="h-4 w-4" />
                Layout Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select
                    value={config.theme}
                    onValueChange={(value) => setConfig((prev) => ({ ...prev, theme: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="compact">Compact</SelectItem>
                      <SelectItem value="spacious">Spacious</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="layout">Layout Style</Label>
                  <Select
                    value={config.layout}
                    onValueChange={(value) => setConfig((prev) => ({ ...prev, layout: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grid">Grid Layout</SelectItem>
                      <SelectItem value="list">List Layout</SelectItem>
                      <SelectItem value="masonry">Masonry Layout</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="refresh">Auto-refresh Interval (seconds)</Label>
                <Select
                  value={config.refreshInterval.toString()}
                  onValueChange={(value) => setConfig((prev) => ({ ...prev, refreshInterval: Number.parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 seconds</SelectItem>
                    <SelectItem value="30">30 seconds</SelectItem>
                    <SelectItem value="60">1 minute</SelectItem>
                    <SelectItem value="300">5 minutes</SelectItem>
                    <SelectItem value="0">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Section Management */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Dashboard Sections
              </CardTitle>
              <CardDescription>Enable, disable, and reorder dashboard sections. Drag to reorder.</CardDescription>
            </CardHeader>
            <CardContent>
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="sections">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                      {config.sections
                        .sort((a, b) => a.order - b.order)
                        .map((section, index) => (
                          <Draggable key={section.id} draggableId={section.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`flex items-center justify-between p-3 border rounded-lg ${
                                  snapshot.isDragging ? "bg-muted" : "bg-background"
                                }`}
                              >
                                <div className="flex items-center space-x-3">
                                  <div {...provided.dragHandleProps}>
                                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">{section.title}</span>
                                      {section.enabled ? (
                                        <Badge variant="default" className="text-xs">
                                          Enabled
                                        </Badge>
                                      ) : (
                                        <Badge variant="secondary" className="text-xs">
                                          Disabled
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-sm text-muted-foreground">{section.description}</p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    checked={section.enabled}
                                    onCheckedChange={(checked) => handleSectionToggle(section.id, checked)}
                                  />
                                  {section.enabled ? (
                                    <Eye className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Preview</CardTitle>
              <CardDescription>This is how your dashboard will look with the current settings.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 bg-muted/50">
                <div className="space-y-2">
                  {config.sections
                    .filter((section) => section.enabled)
                    .sort((a, b) => a.order - b.order)
                    .map((section) => (
                      <div
                        key={section.id}
                        className="flex items-center justify-between p-2 bg-background rounded border"
                      >
                        <span className="text-sm font-medium">{section.title}</span>
                        <Badge variant="outline" className="text-xs">
                          Section {section.order + 1}
                        </Badge>
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset to Default
          </Button>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
