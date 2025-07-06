import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: string
  variant?: string
}

export function StatusBadge({ status, variant }: StatusBadgeProps) {
  const getStatusColor = (status: string, variant?: string) => {
    const statusLower = status.toLowerCase()

    // Order statuses
    if (statusLower === "pending" || statusLower === "new") {
      return "bg-blue-100 text-blue-800"
    }
    if (statusLower === "preparing" || statusLower === "in_progress" || statusLower === "cooking") {
      return "bg-yellow-100 text-yellow-800"
    }
    if (statusLower === "ready" || statusLower === "completed") {
      return "bg-green-100 text-green-800"
    }
    if (statusLower === "served") {
      return "bg-purple-100 text-purple-800"
    }
    if (statusLower === "cancelled") {
      return "bg-red-100 text-red-800"
    }

    // Table statuses
    if (statusLower === "available") {
      return "bg-green-100 text-green-800"
    }
    if (statusLower === "occupied") {
      return "bg-red-100 text-red-800"
    }
    if (statusLower === "reserved") {
      return "bg-blue-100 text-blue-800"
    }
    if (statusLower === "cleaning") {
      return "bg-yellow-100 text-yellow-800"
    }
    if (statusLower === "maintenance") {
      return "bg-orange-100 text-orange-800"
    }

    // Priority levels
    if (variant === "high" || statusLower === "high") {
      return "bg-red-100 text-red-800"
    }
    if (variant === "medium" || statusLower === "medium") {
      return "bg-yellow-100 text-yellow-800"
    }
    if (variant === "low" || statusLower === "low") {
      return "bg-gray-100 text-gray-800"
    }

    return "bg-gray-100 text-gray-800"
  }

  return <Badge className={cn("text-xs", getStatusColor(status, variant))}>{status}</Badge>
}
