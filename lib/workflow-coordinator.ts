import { EventEmitter } from "events"

export interface PendingWorkflowStep {
  key: string
  workflow: string
  step: string
  context: any
  timestamp: string
  priority: "low" | "medium" | "high"
}

export interface WorkflowEvent {
  type: string
  module: string
  data: any
  timestamp: string
}

class WorkflowCoordinator extends EventEmitter {
  private pendingSteps: Map<string, PendingWorkflowStep> = new Map()
  private workflows: Map<string, any> = new Map()

  constructor() {
    super()
    this.initializeWorkflows()
  }

  private initializeWorkflows() {
    // Initialize predefined workflows
    this.workflows.set("checkin", {
      steps: [
        "validate_booking",
        "assign_room",
        "generate_keys",
        "update_room_status",
        "send_welcome_message",
        "notify_housekeeping",
      ],
    })

    this.workflows.set("restaurant_order", {
      steps: ["validate_order", "check_inventory", "send_to_kitchen", "update_table_status", "notify_server"],
    })
  }

  async triggerWorkflow(workflowName: string, context: any) {
    const workflow = this.workflows.get(workflowName)
    if (!workflow) {
      throw new Error(`Workflow ${workflowName} not found`)
    }

    this.emit("workflow.started", {
      type: "workflow.started",
      module: workflowName,
      data: context,
      timestamp: new Date().toISOString(),
    })

    try {
      for (const step of workflow.steps) {
        await this.executeStep(workflowName, step, context)
      }

      this.emit("workflow.completed", {
        type: "workflow.completed",
        module: workflowName,
        data: context,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      this.emit("workflow.failed", {
        type: "workflow.failed",
        module: workflowName,
        data: { context, error: error.message },
        timestamp: new Date().toISOString(),
      })
    }
  }

  private async executeStep(workflow: string, step: string, context: any) {
    // Check if step requires manual intervention
    if (this.requiresManualIntervention(workflow, step)) {
      const stepKey = `${workflow}_${step}_${Date.now()}`
      this.pendingSteps.set(stepKey, {
        key: stepKey,
        workflow,
        step,
        context,
        timestamp: new Date().toISOString(),
        priority: "medium",
      })

      this.emit("step.pending", {
        type: "step.pending",
        module: workflow,
        data: { step, context },
        timestamp: new Date().toISOString(),
      })
      return
    }

    // Execute automated step
    await this.executeAutomatedStep(workflow, step, context)
  }

  private requiresManualIntervention(workflow: string, step: string): boolean {
    // Define which steps require manual intervention
    const manualSteps = {
      checkin: ["validate_booking", "assign_room"],
      restaurant_order: ["validate_order"],
    }

    return manualSteps[workflow]?.includes(step) || false
  }

  private async executeAutomatedStep(workflow: string, step: string, context: any) {
    // Simulate automated step execution
    await new Promise((resolve) => setTimeout(resolve, 100))

    this.emit("step.completed", {
      type: "step.completed",
      module: workflow,
      data: { step, context },
      timestamp: new Date().toISOString(),
    })
  }

  getPendingSteps(): PendingWorkflowStep[] {
    return Array.from(this.pendingSteps.values())
  }

  async executePendingStep(stepKey: string): Promise<void> {
    const step = this.pendingSteps.get(stepKey)
    if (!step) {
      throw new Error(`Pending step ${stepKey} not found`)
    }

    try {
      await this.executeAutomatedStep(step.workflow, step.step, step.context)
      this.pendingSteps.delete(stepKey)

      this.emit("step.executed", {
        type: "step.executed",
        module: step.workflow,
        data: { step: step.step, context: step.context },
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      this.emit("step.failed", {
        type: "step.failed",
        module: step.workflow,
        data: { step: step.step, context: step.context, error: error.message },
        timestamp: new Date().toISOString(),
      })
    }
  }

  addEventListener(event: string, listener: (data: any) => void) {
    this.on(event === "*" ? "newListener" : event, listener)
  }

  removeEventListener(event: string, listener: (data: any) => void) {
    this.off(event === "*" ? "newListener" : event, listener)
  }
}

export const workflowCoordinator = new WorkflowCoordinator()

// Convenience functions
export const triggerCheckIn = (context: any) => workflowCoordinator.triggerWorkflow("checkin", context)

export const triggerRestaurantOrder = (context: any) => workflowCoordinator.triggerWorkflow("restaurant_order", context)
