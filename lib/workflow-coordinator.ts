"use client"

import { toast } from "sonner"

export type WorkflowEvent = {
  type: string
  module: string
  data: any
  timestamp: Date
  userId?: string
}

export type WorkflowStep = {
  id: string
  name: string
  module: string
  action: string
  dependencies?: string[]
  autoExecute?: boolean
  condition?: (data: any) => boolean
}

export type Workflow = {
  id: string
  name: string
  description: string
  steps: WorkflowStep[]
  triggers: string[]
  active: boolean
}

class WorkflowCoordinator {
  private workflows: Map<string, Workflow> = new Map()
  private eventListeners: Map<string, Function[]> = new Map()
  private pendingSteps: Map<string, any> = new Map()

  constructor() {
    this.initializeDefaultWorkflows()
  }

  private initializeDefaultWorkflows() {
    // Guest Check-in Workflow
    this.registerWorkflow({
      id: "guest-checkin",
      name: "Guest Check-in Process",
      description: "Complete guest check-in with room assignment and payment",
      triggers: ["booking.confirmed", "guest.arrived"],
      active: true,
      steps: [
        {
          id: "verify-booking",
          name: "Verify Booking",
          module: "bookings",
          action: "verify",
          autoExecute: true,
        },
        {
          id: "assign-room",
          name: "Assign Room",
          module: "rooms",
          action: "assign",
          dependencies: ["verify-booking"],
          autoExecute: true,
        },
        {
          id: "create-keycard",
          name: "Create Key Card",
          module: "access",
          action: "create_keycard",
          dependencies: ["assign-room"],
          autoExecute: false,
        },
        {
          id: "process-payment",
          name: "Process Payment",
          module: "payments",
          action: "process",
          dependencies: ["verify-booking"],
          autoExecute: false,
        },
        {
          id: "update-housekeeping",
          name: "Update Housekeeping",
          module: "housekeeping",
          action: "room_occupied",
          dependencies: ["assign-room"],
          autoExecute: true,
        },
      ],
    })

    // Restaurant Order Workflow
    this.registerWorkflow({
      id: "restaurant-order",
      name: "Restaurant Order Process",
      description: "Process restaurant orders from creation to completion",
      triggers: ["order.created"],
      active: true,
      steps: [
        {
          id: "validate-order",
          name: "Validate Order",
          module: "orders",
          action: "validate",
          autoExecute: true,
        },
        {
          id: "send-to-kitchen",
          name: "Send to Kitchen",
          module: "kitchen",
          action: "receive_order",
          dependencies: ["validate-order"],
          autoExecute: true,
        },
        {
          id: "prepare-order",
          name: "Prepare Order",
          module: "kitchen",
          action: "prepare",
          dependencies: ["send-to-kitchen"],
          autoExecute: false,
        },
        {
          id: "notify-service",
          name: "Notify Service Staff",
          module: "notifications",
          action: "notify_staff",
          dependencies: ["prepare-order"],
          autoExecute: true,
        },
        {
          id: "serve-order",
          name: "Serve Order",
          module: "service",
          action: "serve",
          dependencies: ["notify-service"],
          autoExecute: false,
        },
        {
          id: "process-payment",
          name: "Process Payment",
          module: "payments",
          action: "process",
          dependencies: ["serve-order"],
          autoExecute: false,
        },
      ],
    })

    // Guest Check-out Workflow
    this.registerWorkflow({
      id: "guest-checkout",
      name: "Guest Check-out Process",
      description: "Complete guest check-out with billing and room cleaning",
      triggers: ["checkout.initiated"],
      active: true,
      steps: [
        {
          id: "generate-bill",
          name: "Generate Final Bill",
          module: "billing",
          action: "generate_final_bill",
          autoExecute: true,
        },
        {
          id: "process-payment",
          name: "Process Final Payment",
          module: "payments",
          action: "process_final",
          dependencies: ["generate-bill"],
          autoExecute: false,
        },
        {
          id: "deactivate-keycard",
          name: "Deactivate Key Card",
          module: "access",
          action: "deactivate_keycard",
          dependencies: ["process-payment"],
          autoExecute: true,
        },
        {
          id: "schedule-cleaning",
          name: "Schedule Room Cleaning",
          module: "housekeeping",
          action: "schedule_checkout_cleaning",
          dependencies: ["deactivate-keycard"],
          autoExecute: true,
        },
        {
          id: "update-room-status",
          name: "Update Room Status",
          module: "rooms",
          action: "set_dirty",
          dependencies: ["schedule-cleaning"],
          autoExecute: true,
        },
      ],
    })

    // Maintenance Request Workflow
    this.registerWorkflow({
      id: "maintenance-request",
      name: "Maintenance Request Process",
      description: "Handle maintenance requests from creation to completion",
      triggers: ["maintenance.requested"],
      active: true,
      steps: [
        {
          id: "assess-priority",
          name: "Assess Priority",
          module: "maintenance",
          action: "assess_priority",
          autoExecute: true,
        },
        {
          id: "assign-technician",
          name: "Assign Technician",
          module: "maintenance",
          action: "assign_technician",
          dependencies: ["assess-priority"],
          autoExecute: true,
        },
        {
          id: "notify-guest",
          name: "Notify Guest",
          module: "notifications",
          action: "notify_guest",
          dependencies: ["assign-technician"],
          autoExecute: true,
          condition: (data) => data.roomOccupied,
        },
        {
          id: "complete-work",
          name: "Complete Work",
          module: "maintenance",
          action: "complete",
          dependencies: ["assign-technician"],
          autoExecute: false,
        },
        {
          id: "update-room-status",
          name: "Update Room Status",
          module: "rooms",
          action: "maintenance_complete",
          dependencies: ["complete-work"],
          autoExecute: true,
        },
      ],
    })
  }

  registerWorkflow(workflow: Workflow) {
    this.workflows.set(workflow.id, workflow)
  }

  addEventListener(eventType: string, callback: Function) {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, [])
    }
    this.eventListeners.get(eventType)!.push(callback)
  }

  removeEventListener(eventType: string, callback: Function) {
    const listeners = this.eventListeners.get(eventType)
    if (listeners) {
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  async triggerEvent(event: WorkflowEvent) {
    console.log(`Workflow event triggered: ${event.type}`, event)

    // Notify event listeners
    const listeners = this.eventListeners.get(event.type) || []
    listeners.forEach((callback) => {
      try {
        callback(event)
      } catch (error) {
        console.error("Error in event listener:", error)
      }
    })

    // Find workflows that should be triggered
    for (const workflow of this.workflows.values()) {
      if (workflow.active && workflow.triggers.includes(event.type)) {
        await this.executeWorkflow(workflow.id, event.data)
      }
    }
  }

  async executeWorkflow(workflowId: string, data: any) {
    const workflow = this.workflows.get(workflowId)
    if (!workflow) {
      console.error(`Workflow not found: ${workflowId}`)
      return
    }

    console.log(`Executing workflow: ${workflow.name}`)

    const executedSteps = new Set<string>()
    const context = { ...data, workflowId, startTime: new Date() }

    // Execute steps in dependency order
    while (executedSteps.size < workflow.steps.length) {
      let progressMade = false

      for (const step of workflow.steps) {
        if (executedSteps.has(step.id)) continue

        // Check if dependencies are met
        const dependenciesMet = !step.dependencies || step.dependencies.every((dep) => executedSteps.has(dep))

        if (!dependenciesMet) continue

        // Check condition if present
        if (step.condition && !step.condition(context)) {
          executedSteps.add(step.id)
          progressMade = true
          continue
        }

        try {
          if (step.autoExecute) {
            await this.executeStep(step, context)
            executedSteps.add(step.id)
            progressMade = true
          } else {
            // Store step for manual execution
            this.pendingSteps.set(`${workflowId}-${step.id}`, {
              workflow,
              step,
              context,
            })

            // Notify that manual step is required
            toast.info(`Manual step required: ${step.name}`)
            executedSteps.add(step.id)
            progressMade = true
          }
        } catch (error) {
          console.error(`Error executing step ${step.id}:`, error)
          toast.error(`Failed to execute: ${step.name}`)
          break
        }
      }

      if (!progressMade) {
        console.error("Workflow execution stuck - no progress made")
        break
      }
    }
  }

  async executeStep(step: WorkflowStep, context: any) {
    console.log(`Executing step: ${step.name}`)

    // Simulate step execution based on module and action
    switch (step.module) {
      case "bookings":
        await this.executeBookingAction(step.action, context)
        break
      case "rooms":
        await this.executeRoomAction(step.action, context)
        break
      case "payments":
        await this.executePaymentAction(step.action, context)
        break
      case "kitchen":
        await this.executeKitchenAction(step.action, context)
        break
      case "housekeeping":
        await this.executeHousekeepingAction(step.action, context)
        break
      case "maintenance":
        await this.executeMaintenanceAction(step.action, context)
        break
      case "notifications":
        await this.executeNotificationAction(step.action, context)
        break
      default:
        console.warn(`Unknown module: ${step.module}`)
    }
  }

  async executePendingStep(stepKey: string) {
    const pendingStep = this.pendingSteps.get(stepKey)
    if (!pendingStep) {
      console.error(`Pending step not found: ${stepKey}`)
      return
    }

    try {
      await this.executeStep(pendingStep.step, pendingStep.context)
      this.pendingSteps.delete(stepKey)
      toast.success(`Completed: ${pendingStep.step.name}`)
    } catch (error) {
      console.error(`Error executing pending step:`, error)
      toast.error(`Failed to complete: ${pendingStep.step.name}`)
    }
  }

  getPendingSteps(): Array<{ key: string; workflow: string; step: string; context: any }> {
    const pending = []
    for (const [key, value] of this.pendingSteps.entries()) {
      pending.push({
        key,
        workflow: value.workflow.name,
        step: value.step.name,
        context: value.context,
      })
    }
    return pending
  }

  // Module-specific action executors
  private async executeBookingAction(action: string, context: any) {
    switch (action) {
      case "verify":
        // Verify booking exists and is valid
        console.log("Verifying booking:", context.bookingId)
        break
      default:
        console.warn(`Unknown booking action: ${action}`)
    }
  }

  private async executeRoomAction(action: string, context: any) {
    switch (action) {
      case "assign":
        console.log("Assigning room:", context.roomId)
        break
      case "set_dirty":
        console.log("Setting room as dirty:", context.roomId)
        break
      case "maintenance_complete":
        console.log("Maintenance completed for room:", context.roomId)
        break
      default:
        console.warn(`Unknown room action: ${action}`)
    }
  }

  private async executePaymentAction(action: string, context: any) {
    switch (action) {
      case "process":
        console.log("Processing payment:", context.amount)
        break
      case "process_final":
        console.log("Processing final payment:", context.amount)
        break
      default:
        console.warn(`Unknown payment action: ${action}`)
    }
  }

  private async executeKitchenAction(action: string, context: any) {
    switch (action) {
      case "receive_order":
        console.log("Kitchen received order:", context.orderId)
        break
      case "prepare":
        console.log("Preparing order:", context.orderId)
        break
      default:
        console.warn(`Unknown kitchen action: ${action}`)
    }
  }

  private async executeHousekeepingAction(action: string, context: any) {
    switch (action) {
      case "room_occupied":
        console.log("Room marked as occupied:", context.roomId)
        break
      case "schedule_checkout_cleaning":
        console.log("Scheduled checkout cleaning:", context.roomId)
        break
      default:
        console.warn(`Unknown housekeeping action: ${action}`)
    }
  }

  private async executeMaintenanceAction(action: string, context: any) {
    switch (action) {
      case "assess_priority":
        console.log("Assessing maintenance priority:", context.requestId)
        break
      case "assign_technician":
        console.log("Assigning technician:", context.requestId)
        break
      case "complete":
        console.log("Completing maintenance:", context.requestId)
        break
      default:
        console.warn(`Unknown maintenance action: ${action}`)
    }
  }

  private async executeNotificationAction(action: string, context: any) {
    switch (action) {
      case "notify_staff":
        console.log("Notifying staff:", context.message)
        toast.info("Staff notified: Order ready for service")
        break
      case "notify_guest":
        console.log("Notifying guest:", context.message)
        toast.info("Guest notified about maintenance")
        break
      default:
        console.warn(`Unknown notification action: ${action}`)
    }
  }
}

// Global workflow coordinator instance
export const workflowCoordinator = new WorkflowCoordinator()

// Helper functions for common workflows
export const triggerCheckin = (bookingData: any) => {
  workflowCoordinator.triggerEvent({
    type: "booking.confirmed",
    module: "bookings",
    data: bookingData,
    timestamp: new Date(),
  })
}

export const triggerRestaurantOrder = (orderData: any) => {
  workflowCoordinator.triggerEvent({
    type: "order.created",
    module: "orders",
    data: orderData,
    timestamp: new Date(),
  })
}

export const triggerCheckout = (checkoutData: any) => {
  workflowCoordinator.triggerEvent({
    type: "checkout.initiated",
    module: "bookings",
    data: checkoutData,
    timestamp: new Date(),
  })
}

export const triggerMaintenanceRequest = (maintenanceData: any) => {
  workflowCoordinator.triggerEvent({
    type: "maintenance.requested",
    module: "maintenance",
    data: maintenanceData,
    timestamp: new Date(),
  })
}
