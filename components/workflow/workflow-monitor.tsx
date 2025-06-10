"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { workflowCoordinator } from "@/lib/workflow-coordinator"
import { CheckCircle, Clock, AlertTriangle, Play, Pause, RotateCcw } from "lucide-react"

export function WorkflowMonitor() {
  const [pendingSteps, setPendingSteps] = useState<any[]>([])
  const [recentEvents, setRecentEvents] = useState<any[]>([])

  useEffect(() => {
    // Load pending steps
    const loadPendingSteps = () => {
      const pending = workflowCoordinator.getPendingSteps()
      setPendingSteps(pending)
    }

    // Listen for workflow events
    const handleWorkflowEvent = (event: any) => {
      setRecentEvents((prev) => [event, ...prev.slice(0, 9)]) // Keep last 10 events
    }

    loadPendingSteps()
    workflowCoordinator.addEventListener("*", handleWorkflowEvent)

    // Refresh pending steps every 30 seconds
    const interval = setInterval(loadPendingSteps, 30000)

    return () => {
      workflowCoordinator.removeEventListener("*", handleWorkflowEvent)
      clearInterval(interval)
    }
  }, [])

  const handleExecutePendingStep = async (stepKey: string) => {
    await workflowCoordinator.executePendingStep(stepKey)
    // Refresh pending steps
    const pending = workflowCoordinator.getPendingSteps()
    setPendingSteps(pending)
  }

  const getEventIcon = (type: string) => {
    if (type.includes("completed")) return <CheckCircle className="h-4 w-4 text-green-600" />
    if (type.includes("failed")) return <AlertTriangle className="h-4 w-4 text-red-600" />
    return <Clock className="h-4 w-4 text-blue-600" />
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <RotateCcw className="mr-2 h-4 w-4" />
          Workflows
          {pendingSteps.length > 0 && <Badge className="ml-2 bg-red-500">{pendingSteps.length}</Badge>}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Workflow Monitor</DialogTitle>
          <DialogDescription>Monitor and manage automated workflows across the system</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pending">Pending Actions ({pendingSteps.length})</TabsTrigger>
            <TabsTrigger value="events">Recent Events ({recentEvents.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Manual Steps Required</CardTitle>
                <CardDescription>These workflow steps require manual intervention</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  {pendingSteps.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                      <p>No pending manual steps</p>
                      <p className="text-sm">All workflows are running smoothly</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingSteps.map((step) => (
                        <div key={step.key} className="p-4 border rounded-lg space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium">{step.step}</h4>
                              <p className="text-sm text-muted-foreground">Workflow: {step.workflow}</p>
                            </div>
                            <Badge variant="outline">Manual</Badge>
                          </div>

                          <div className="text-xs text-muted-foreground">
                            <p>Context: {JSON.stringify(step.context, null, 2).slice(0, 100)}...</p>
                          </div>

                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleExecutePendingStep(step.key)}>
                              <Play className="mr-2 h-3 w-3" />
                              Execute
                            </Button>
                            <Button size="sm" variant="outline">
                              <Pause className="mr-2 h-3 w-3" />
                              Skip
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Workflow Events</CardTitle>
                <CardDescription>Latest workflow activities and status updates</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  {recentEvents.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="h-12 w-12 mx-auto mb-4" />
                      <p>No recent events</p>
                      <p className="text-sm">Workflow events will appear here</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentEvents.map((event, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                          {getEventIcon(event.type)}
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium">{event.type}</p>
                            <p className="text-xs text-muted-foreground">Module: {event.module}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(event.timestamp).toLocaleString()}
                            </p>
                            {event.data && (
                              <details className="text-xs">
                                <summary className="cursor-pointer text-muted-foreground">View Data</summary>
                                <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                                  {JSON.stringify(event.data, null, 2)}
                                </pre>
                              </details>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
