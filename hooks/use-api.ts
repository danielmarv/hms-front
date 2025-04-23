"use client"

import { useState, useCallback } from "react"
import { toast } from "sonner"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export type ApiResponse<T> = {
  data: T | null
  error: string | null
  isLoading: boolean
}

export type ApiMethods = "GET" | "POST" | "PUT" | "DELETE" | "PATCH"

export function useApi() {
  const [isLoading, setIsLoading] = useState(false)

  const getToken = useCallback(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("accessToken")
    }
    return null
  }, [])

  const request = useCallback(
    async <T>(
      endpoint: string,
      method: ApiMethods = "GET",
      data?: any,
      showToast: boolean = true
    ): Promise<ApiResponse<T>> => {
      setIsLoading(true)
  const url = `${API_URL}${endpoint}`
  const token = getToken()

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const options: RequestInit = {
    method,
    headers,
  }

  if (data && method !== "GET") {
    options.body = JSON.stringify(data)
  }

  try {
    const response = await fetch(url, options)
    const responseData = await response.json()

    if (!response.ok) {
      const errorMessage = responseData.message || "An error occurred"
      if (showToast) {
        toast.error(errorMessage)
      }
      return { data: null, error: errorMessage, isLoading: false }
    }

    setIsLoading(false)
    return { data: responseData.data || responseData, error: null, isLoading: false }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An error occurred"
    if (showToast) {
      toast.error(errorMessage)
    }
    setIsLoading(false)
    return { data: null, error: errorMessage, isLoading: false }
  }
}
,
    [getToken]
  )

return {
    request,
    isLoading,
  }
}
