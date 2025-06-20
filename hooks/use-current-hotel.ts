"use client"

import { useEffect, useState } from "react"
import { useAuth } from "./use-auth"
import { useHotels, type Hotel } from "./use-hotels"

export interface CurrentHotelData {
  hotelId: string | null
  hotel: Hotel | null
  isLoading: boolean
  error: string | null
}

export function useCurrentHotel(): CurrentHotelData {
  const { user } = useAuth()
  const { getHotelById } = useHotels()
  const [hotel, setHotel] = useState<Hotel | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const hotelId = user?.primaryHotel?.id || null

  useEffect(() => {
    const fetchHotel = async () => {
      if (!hotelId) {
        setHotel(null)
        setError("No hotel access found")
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const response = await getHotelById(hotelId)
        if (response.data) {
          setHotel(response.data)
        } else {
          setError("Hotel not found")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch hotel")
        setHotel(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchHotel()
  }, [hotelId, getHotelById])

  return {
    hotelId,
    hotel,
    isLoading,
    error,
  }
}
