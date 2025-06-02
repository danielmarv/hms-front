"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Cloud, Sun, CloudRain, CloudSnow, CloudLightning, Wind, Droplets } from "lucide-react"

interface WeatherData {
  temperature: number
  condition: string
  humidity: number
  windSpeed: number
  location: string
  forecast: {
    day: string
    high: number
    low: number
    condition: string
  }[]
}

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate weather API call
    const fetchWeather = async () => {
      setIsLoading(true)

      // Mock weather data - in real app, this would be an API call
      setTimeout(() => {
        setWeather({
          temperature: 72,
          condition: "Partly Cloudy",
          humidity: 65,
          windSpeed: 8,
          location: "Hotel Location",
          forecast: [
            { day: "Today", high: 75, low: 62, condition: "Partly Cloudy" },
            { day: "Tomorrow", high: 78, low: 65, condition: "Sunny" },
            { day: "Wednesday", high: 73, low: 60, condition: "Rainy" },
          ],
        })
        setIsLoading(false)
      }, 1000)
    }

    fetchWeather()
  }, [])

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case "sunny":
        return <Sun className="h-8 w-8 text-yellow-500" />
      case "partly cloudy":
        return <Cloud className="h-8 w-8 text-gray-500" />
      case "rainy":
        return <CloudRain className="h-8 w-8 text-blue-500" />
      case "snowy":
        return <CloudSnow className="h-8 w-8 text-blue-300" />
      case "stormy":
        return <CloudLightning className="h-8 w-8 text-purple-500" />
      default:
        return <Cloud className="h-8 w-8 text-gray-500" />
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weather</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-[100px]" />
                <Skeleton className="h-4 w-[80px]" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!weather) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weather</CardTitle>
        <CardDescription>{weather.location}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Current Weather */}
          <div className="flex items-center gap-4">
            {getWeatherIcon(weather.condition)}
            <div>
              <div className="text-2xl font-bold">{weather.temperature}°F</div>
              <div className="text-sm text-muted-foreground">{weather.condition}</div>
            </div>
          </div>

          {/* Weather Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-blue-500" />
              <span>{weather.humidity}% Humidity</span>
            </div>
            <div className="flex items-center gap-2">
              <Wind className="h-4 w-4 text-gray-500" />
              <span>{weather.windSpeed} mph Wind</span>
            </div>
          </div>

          {/* Forecast */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">3-Day Forecast</h4>
            <div className="space-y-2">
              {weather.forecast.map((day, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{day.day}</span>
                  <div className="flex items-center gap-2">
                    {getWeatherIcon(day.condition)}
                    <span>
                      {day.high}°/{day.low}°
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
