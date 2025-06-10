"use client"
import { format } from "date-fns"
import { CalendarIcon, Clock } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DateTimePickerProps {
  date: Date
  setDate: (date: Date) => void
  className?: string
}

export function DateTimePicker({ date, setDate, className }: DateTimePickerProps) {
  const minuteOptions = Array.from({ length: 60 }, (_, i) => i)
  const hourOptions = Array.from({ length: 24 }, (_, i) => i)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground", className)}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP p") : <span>Pick a date and time</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar mode="single" selected={date} onSelect={(newDate) => newDate && setDate(newDate)} initialFocus />
        <div className="border-t p-3 flex items-end gap-2">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Time</span>
            </div>
            <div className="flex gap-2">
              <Select
                value={date ? date.getHours().toString() : "0"}
                onValueChange={(value) => {
                  const newDate = new Date(date)
                  newDate.setHours(Number.parseInt(value))
                  setDate(newDate)
                }}
              >
                <SelectTrigger className="w-[70px]">
                  <SelectValue placeholder="Hour" />
                </SelectTrigger>
                <SelectContent position="popper">
                  {hourOptions.map((hour) => (
                    <SelectItem key={hour} value={hour.toString()}>
                      {hour.toString().padStart(2, "0")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-sm self-center">:</span>
              <Select
                value={date ? date.getMinutes().toString() : "0"}
                onValueChange={(value) => {
                  const newDate = new Date(date)
                  newDate.setMinutes(Number.parseInt(value))
                  setDate(newDate)
                }}
              >
                <SelectTrigger className="w-[70px]">
                  <SelectValue placeholder="Minute" />
                </SelectTrigger>
                <SelectContent position="popper">
                  {minuteOptions.map((minute) => (
                    <SelectItem key={minute} value={minute.toString()}>
                      {minute.toString().padStart(2, "0")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => {
              const now = new Date()
              const newDate = new Date(date)
              newDate.setHours(now.getHours())
              newDate.setMinutes(now.getMinutes())
              setDate(newDate)
            }}
          >
            Now
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
