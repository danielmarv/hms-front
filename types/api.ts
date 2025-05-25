export interface ApiResponse<T> {
  data: T | null
  error?: string
  message?: string
  success?: boolean
  count?: number
  total?: number
  pagination?: {
    page: number
    limit: number
    totalPages: number
  }
}

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
