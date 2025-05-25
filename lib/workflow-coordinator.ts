"use client"

type WorkflowStep = {
  id: string
  name: string
  description: string
  status: "pending" | "in-progress" | "completed" | "failed" | "skipped"
  automated: boolean
  dependencies?: string[]
  data?: any
  error?: string
  completedAt?: Date
}

type Workflow = {
  id: string
  name: string
  description: string
  status: "pending" | "in-progress" | "completed" | "failed"
  steps: WorkflowStep[]
  createdAt: Date
  completedAt?: Date
  context: any
}

class WorkflowCoordinator {
  private workflows: Map<string, Workflow> = new Map()
  private eventListeners: Map<string, Function[]> = new Map()

  // Event system
  addEventListener(event: string, callback: Function) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)!.push(callback)
  }

  removeEventListener(event: string, callback: Function) {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  private emit(event: string, data: any) {
    // Emit to specific event listeners
    const listeners = this.eventListeners.get(event) || []
    listeners.forEach((callback) => callback(data))

    // Emit to wildcard listeners
    const wildcardListeners = this.eventListeners.get("*") || []
    wildcardListeners.forEach((callback) => callback({ type: event, ...data }))
  }

  // Workflow management
  createWorkflow(name: string, description: string, steps: Omit<WorkflowStep, "status">[], context: any = {}): string {
    const workflowId = `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const workflow: Workflow = {
      id: workflowId,
      name,
      description,
      status: "pending",
      steps: steps.map((step) => ({ ...step, status: "pending" })),
      createdAt: new Date(),
      context,
    }

    this.workflows.set(workflowId, workflow)
    this.emit("workflow.created", { workflowId, workflow })

    // Auto-start the workflow
    this.executeWorkflow(workflowId)

    return workflowId
  }

  async executeWorkflow(workflowId: string) {
    const workflow = this.workflows.get(workflowId)
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`)
    }

    workflow.status = "in-progress"
    this.emit("workflow.started", { workflowId, workflow })

    try {
      for (const step of workflow.steps) {
        await this.executeStep(workflowId, step.id)
      }

      workflow.status = "completed"
      workflow.completedAt = new Date()
      this.emit("workflow.completed", { workflowId, workflow })
    } catch (error) {
      workflow.status = "failed"
      this.emit("workflow.failed", { workflowId, workflow, error })
    }
  }

  async executeStep(workflowId: string, stepId: string) {
    const workflow = this.workflows.get(workflowId)
    if (!workflow) return

    const step = workflow.steps.find((s) => s.id === stepId)
    if (!step) return

    // Check dependencies
    if (step.dependencies) {
      const dependenciesMet = step.dependencies.every((depId) => {
        const depStep = workflow.steps.find((s) => s.id === depId)
        return depStep?.status === "completed"
      })

      if (!dependenciesMet) {
        step.status = "pending"
        return
      }
    }

    step.status = "in-progress"
    this.emit("step.started", { workflowId, stepId, step })

    try {
      if (step.automated) {
        await this.executeAutomatedStep(workflow, step)
      } else {
        // Manual step - emit event for UI to handle
        this.emit("step.manual", { workflowId, stepId, step })
        return // Don't complete automatically
      }

      step.status = "completed"
      step.completedAt = new Date()
      this.emit("step.completed", { workflowId, stepId, step })
    } catch (error) {
      step.status = "failed"
      step.error = error instanceof Error ? error.message : String(error)
      this.emit("step.failed", { workflowId, stepId, step, error })
      throw error
    }
  }

  private async executeAutomatedStep(workflow: Workflow, step: WorkflowStep) {
    // Simulate API calls and automated processes
    switch (step.id) {
      case "validate_guest_info":
        // Validate guest information
        await this.delay(1000)
        break

      case "check_room_availability":
        // Check room availability
        await this.delay(1500)
        break

      case "assign_room":
        // Assign room to guest
        await this.delay(1000)
        break

      case "process_payment":
        // Process payment
        await this.delay(2000)
        break

      case "update_room_status":
        // Update room status
        await this.delay(500)
        break

      case "notify_housekeeping":
        // Notify housekeeping
        await this.delay(500)
        this.emit("housekeeping.notification", {
          room: workflow.context.room,
          type: "checkout_cleaning",
          priority: "normal",
        })
        break

      case "generate_invoice":
        // Generate invoice
        await this.delay(1500)
        break

      case "send_kitchen_order":
        // Send order to kitchen
        await this.delay(800)
        this.emit("kitchen.order", {
          orderId: workflow.context.orderId,
          items: workflow.context.items,
        })
        break

      case "update_inventory":
        // Update inventory
        await this.delay(1000)
        break

      default:
        // Generic automated step
        await this.delay(1000)
    }
  }

  completeManualStep(workflowId: string, stepId: string, data?: any) {
    const workflow = this.workflows.get(workflowId)
    if (!workflow) return

    const step = workflow.steps.find((s) => s.id === stepId)
    if (!step) return

    step.status = "completed"
    step.completedAt = new Date()
    step.data = data

    this.emit("step.completed", { workflowId, stepId, step })

    // Continue with next steps
    this.continueWorkflow(workflowId)
  }

  private async continueWorkflow(workflowId: string) {
    const workflow = this.workflows.get(workflowId)
    if (!workflow) return

    // Find next pending steps that have their dependencies met
    const pendingSteps = workflow.steps.filter((step) => step.status === "pending")

    for (const step of pendingSteps) {
      const dependenciesMet =
        !step.dependencies ||
        step.dependencies.every((depId) => {
          const depStep = workflow.steps.find((s) => s.id === depId)
          return depStep?.status === "completed"
        })

      if (dependenciesMet) {
        await this.executeStep(workflowId, step.id)
      }
    }

    // Check if workflow is complete
    const allCompleted = workflow.steps.every((step) => step.status === "completed" || step.status === "skipped")

    if (allCompleted) {
      workflow.status = "completed"
      workflow.completedAt = new Date()
      this.emit("workflow.completed", { workflowId, workflow })
    }
  }

  getWorkflow(workflowId: string): Workflow | undefined {
    return this.workflows.get(workflowId)
  }

  getAllWorkflows(): Workflow[] {
    return Array.from(this.workflows.values())
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  // Predefined workflow templates
  createCheckInWorkflow(guestData: any, roomData: any) {
    return this.createWorkflow(
      "Guest Check-In",
      "Complete guest check-in process",
      [
        {
          id: "validate_guest_info",
          name: "Validate Guest Information",
          description: "Verify guest details and identification",
          automated: true,
        },
        {
          id: "check_room_availability",
          name: "Check Room Availability",
          description: "Confirm room is available and ready",
          automated: true,
          dependencies: ["validate_guest_info"],
        },
        {
          id: "assign_room",
          name: "Assign Room",
          description: "Assign room to guest",
          automated: true,
          dependencies: ["check_room_availability"],
        },
        {
          id: "process_payment",
          name: "Process Payment",
          description: "Process payment or deposit",
          automated: false,
          dependencies: ["assign_room"],
        },
        {
          id: "update_room_status",
          name: "Update Room Status",
          description: "Mark room as occupied",
          automated: true,
          dependencies: ["process_payment"],
        },
        {
          id: "provide_room_keys",
          name: "Provide Room Keys",
          description: "Give keys and welcome packet to guest",
          automated: false,
          dependencies: ["update_room_status"],
        },
      ],
      { guest: guestData, room: roomData },
    )
  }

  createCheckOutWorkflow(guestData: any, roomData: any) {
    return this.createWorkflow(
      "Guest Check-Out",
      "Complete guest check-out process",
      [
        {
          id: "generate_invoice",
          name: "Generate Final Invoice",
          description: "Create final bill with all charges",
          automated: true,
        },
        {
          id: "process_payment",
          name: "Process Final Payment",
          description: "Collect any outstanding payments",
          automated: false,
          dependencies: ["generate_invoice"],
        },
        {
          id: "collect_room_keys",
          name: "Collect Room Keys",
          description: "Retrieve room keys from guest",
          automated: false,
          dependencies: ["process_payment"],
        },
        {
          id: "update_room_status",
          name: "Update Room Status",
          description: "Mark room as vacant/dirty",
          automated: true,
          dependencies: ["collect_room_keys"],
        },
        {
          id: "notify_housekeeping",
          name: "Notify Housekeeping",
          description: "Alert housekeeping for room cleaning",
          automated: true,
          dependencies: ["update_room_status"],
        },
      ],
      { guest: guestData, room: roomData },
    )
  }

  createRestaurantOrderWorkflow(orderData: any) {
    return this.createWorkflow(
      "Restaurant Order",
      "Process restaurant order from creation to completion",
      [
        {
          id: "validate_order",
          name: "Validate Order",
          description: "Check menu items and availability",
          automated: true,
        },
        {
          id: "calculate_total",
          name: "Calculate Total",
          description: "Calculate order total with taxes",
          automated: true,
          dependencies: ["validate_order"],
        },
        {
          id: "send_kitchen_order",
          name: "Send to Kitchen",
          description: "Forward order to kitchen for preparation",
          automated: true,
          dependencies: ["calculate_total"],
        },
        {
          id: "update_inventory",
          name: "Update Inventory",
          description: "Deduct ingredients from inventory",
          automated: true,
          dependencies: ["send_kitchen_order"],
        },
        {
          id: "prepare_order",
          name: "Prepare Order",
          description: "Kitchen prepares the order",
          automated: false,
          dependencies: ["update_inventory"],
        },
        {
          id: "serve_order",
          name: "Serve Order",
          description: "Deliver order to customer",
          automated: false,
          dependencies: ["prepare_order"],
        },
      ],
      { order: orderData },
    )
  }

  createMaintenanceWorkflow(maintenanceData: any) {
    return this.createWorkflow(
      "Maintenance Request",
      "Handle maintenance request from report to completion",
      [
        {
          id: "assess_priority",
          name: "Assess Priority",
          description: "Determine urgency and priority level",
          automated: true,
        },
        {
          id: "assign_technician",
          name: "Assign Technician",
          description: "Assign appropriate maintenance staff",
          automated: false,
          dependencies: ["assess_priority"],
        },
        {
          id: "update_room_status",
          name: "Update Room Status",
          description: "Mark room as under maintenance if needed",
          automated: true,
          dependencies: ["assign_technician"],
        },
        {
          id: "perform_maintenance",
          name: "Perform Maintenance",
          description: "Complete the maintenance work",
          automated: false,
          dependencies: ["update_room_status"],
        },
        {
          id: "verify_completion",
          name: "Verify Completion",
          description: "Inspect and verify work completion",
          automated: false,
          dependencies: ["perform_maintenance"],
        },
        {
          id: "restore_room_status",
          name: "Restore Room Status",
          description: "Return room to available status",
          automated: true,
          dependencies: ["verify_completion"],
        },
      ],
      { maintenance: maintenanceData },
    )
  }
}

// Create singleton instance
export const workflowCoordinator = new WorkflowCoordinator()

// Helper functions for common workflows
export const triggerCheckIn = (guestData: any, roomData: any) => {
  return workflowCoordinator.createCheckInWorkflow(guestData, roomData)
}

export const triggerCheckOut = (guestData: any, roomData: any) => {
  return workflowCoordinator.createCheckOutWorkflow(guestData, roomData)
}

export const triggerRestaurantOrder = (orderData: any) => {
  return workflowCoordinator.createRestaurantOrderWorkflow(orderData)
}

export const triggerMaintenanceRequest = (maintenanceData: any) => {
  return workflowCoordinator.createMaintenanceWorkflow(maintenanceData)
}
