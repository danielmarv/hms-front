import type * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Clock, CheckCircle, XCircle, AlertTriangle, Users, Eye, EyeOff, Star } from "lucide-react"

const statusBadgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        // Order statuses
        pending: "bg-blue-50 text-blue-700 border border-blue-200",
        preparing: "bg-yellow-50 text-yellow-700 border border-yellow-200",
        ready: "bg-green-50 text-green-700 border border-green-200",
        served: "bg-purple-50 text-purple-700 border border-purple-200",
        completed: "bg-gray-50 text-gray-700 border border-gray-200",
        cancelled: "bg-red-50 text-red-700 border border-red-200",

        // Table statuses
        available: "bg-green-50 text-green-700 border border-green-200",
        occupied: "bg-red-50 text-red-700 border border-red-200",
        reserved: "bg-blue-50 text-blue-700 border border-blue-200",
        cleaning: "bg-yellow-50 text-yellow-700 border border-yellow-200",
        maintenance: "bg-gray-50 text-gray-700 border border-gray-200",

        // Priority levels
        high: "bg-red-50 text-red-700 border border-red-200",
        medium: "bg-yellow-50 text-yellow-700 border border-yellow-200",
        low: "bg-green-50 text-green-700 border border-green-200",

        // General statuses
        active: "bg-green-50 text-green-700 border border-green-200",
        inactive: "bg-gray-50 text-gray-700 border border-gray-200",
        featured: "bg-amber-50 text-amber-700 border border-amber-200",
      },
    },
    defaultVariants: {
      variant: "pending",
    },
  },
)

const statusIcons = {
  // Order statuses
  pending: Clock,
  preparing: Clock,
  ready: CheckCircle,
  served: CheckCircle,
  completed: CheckCircle,
  cancelled: XCircle,

  // Table statuses
  available: CheckCircle,
  occupied: Users,
  reserved: Clock,
  cleaning: AlertTriangle,
  maintenance: XCircle,

  // Priority levels
  high: AlertTriangle,
  medium: Clock,
  low: CheckCircle,

  // General statuses
  active: Eye,
  inactive: EyeOff,
  featured: Star,
}

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusBadgeVariants> {
  status: string
  showIcon?: boolean
}

function StatusBadge({ className, variant, status, showIcon = true, ...props }: StatusBadgeProps) {
  const badgeVariant = variant || (status as any)
  const Icon = statusIcons[status as keyof typeof statusIcons] || Clock

  return (
    <div className={cn(statusBadgeVariants({ variant: badgeVariant }), className)} {...props}>
      {showIcon && <Icon className="w-3 h-3 mr-1" />}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </div>
  )
}

export { StatusBadge, statusBadgeVariants }
