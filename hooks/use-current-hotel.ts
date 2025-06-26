"use client"

import { useEffect, useState } from "react"
import { useAuth } from "./use-auth"
import { useHotels, type Hotel } from "./use-hotels"
import { useApi } from "./use-api"

export interface CurrentHotelData {
  hotelId: string | null
  hotel: Hotel | null
  configuration: any | null
  effectiveConfig: any | null
  isLoading: boolean
  error: string | null
}

export function useCurrentHotel(): CurrentHotelData {
  const { user } = useAuth()
  const { getHotelById } = useHotels()
  const { get } = useApi()
  const [hotel, setHotel] = useState<Hotel | null>(null)
  const [configuration, setConfiguration] = useState<any | null>(null)
  const [effectiveConfig, setEffectiveConfig] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const hotelId = user?.primaryHotel?.id || null

  useEffect(() => {
    const fetchHotel = async () => {
      if (!hotelId) {
        setHotel(null)
        setConfiguration(null)
        setEffectiveConfig(null)
        setError("No hotel access found")
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        // Fetch basic hotel data
        const hotelResponse = await getHotelById(hotelId)
        if (!hotelResponse.data) {
          setError("Hotel not found")
          return
        }

        setHotel(hotelResponse.data)

        // Fetch hotel configuration
        try {
          const configResponse = await get(`/hotels/${hotelId}/document-data`)
          if (configResponse.success && configResponse.data) {
            setConfiguration(configResponse.data)
          }
        } catch (configError) {
          console.warn("Failed to fetch hotel configuration:", configError)
          // Don't set error here, just log warning as configuration might not exist yet
        }

        // Fetch effective configuration
        try {
          const effectiveResponse = await get(`/hotels/${hotelId}/effective-config`)
          if (effectiveResponse.success && effectiveResponse.data) {
            setEffectiveConfig(effectiveResponse.data)
          }
        } catch (effectiveError) {
          console.warn("Failed to fetch effective configuration:", effectiveError)
          // Don't set error here, just log warning as effective config might not exist yet
        }
      } catch (err) {
        console.error("Failed to fetch hotel data:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch hotel")
        setHotel(null)
        setConfiguration(null)
        setEffectiveConfig(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchHotel()
  }, [hotelId, getHotelById, get])

  return {
    hotelId,
    hotel,
    configuration,
    effectiveConfig,
    isLoading,
    error,
  }
}
