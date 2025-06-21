import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function EventCalendarLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Calendar */}
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-10 w-16" />
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-8 w-48" />
            </div>
            <div className="flex space-x-1">
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-16" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Month view skeleton */}
          <div className="grid grid-cols-7 gap-1">
            {/* Day headers */}
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="p-2 text-center">
                <Skeleton className="h-4 w-8 mx-auto" />
              </div>
            ))}

            {/* Calendar days */}
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="min-h-[100px] border p-1">
                <div className="text-right p-1">
                  <Skeleton className="h-4 w-4 ml-auto" />
                </div>
                <div className="space-y-1">
                  {Math.random() > 0.7 && (
                    <>
                      <Skeleton className="h-6 w-full" />
                      {Math.random() > 0.5 && <Skeleton className="h-6 w-3/4" />}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
