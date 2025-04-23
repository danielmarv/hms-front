"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useApi } from "./use-api"
import Cookies from "js-cookie"

export type User = {
  id: string
  full_name: string
  email: string
  role?: string
  permissions?: string[]
}

export type RegisterData = {
  full_name: string
  email: string
  password: string
  phone?: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { request } = useApi()
  const router = useRouter()

  const checkAuth = useCallback(async () => {
    try {
      // Check both localStorage and cookies
      const accessToken = localStorage.getItem("accessToken") || Cookies.get("token")

      if (!accessToken) {
        setIsLoading(false)
        return false
      }

      const { data, error } = await request<User>("/auth/me", "GET", undefined, false)

      if (error || !data) {
        // Try to refresh token
        const refreshed = await refreshAccessToken()
        if (!refreshed) {
          // If refresh failed, clear storage
          localStorage.removeItem("accessToken")
          localStorage.removeItem("refreshToken")
          Cookies.remove("token")
          setIsAuthenticated(false)
          setUser(null)
          setIsLoading(false)
          return false
        }
        return true
      }

      setUser(data)
      setIsAuthenticated(true)
      setIsLoading(false)
      return true
    } catch (error) {
      console.error("Auth check failed:", error)
      setIsLoading(false)
      return false
    }
  }, [request])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const { data, error } = await request<{
        accessToken: string
        refreshToken: string
        user: User
      }>("/auth/login", "POST", { email, password })

      if (error || !data) {
        throw new Error(error || "Login failed")
      }

      // Store tokens in both localStorage and cookies
      localStorage.setItem("accessToken", data.accessToken)
      localStorage.setItem("refreshToken", data.refreshToken)
      localStorage.setItem("user", JSON.stringify(data.user))

      // Set cookie for middleware authentication
      // Set secure and httpOnly in production
      Cookies.set("token", data.accessToken, {
        expires: 7, // 7 days
        path: "/",
        sameSite: "strict",
      })

      // Set user data
      setUser(data.user)
      setIsAuthenticated(true)
      setIsLoading(false)

      toast.success("Login successful")
      return true
    } catch (error) {
      setIsLoading(false)
      throw error
    }
  }

  const register = async (userData: RegisterData) => {
    setIsLoading(true)
    try {
      const { data, error } = await request<{
        accessToken: string
        refreshToken: string
        user: User
      }>("/auth/register", "POST", userData)

      if (error || !data) {
        throw new Error(error || "Registration failed")
      }

      // Store tokens in both localStorage and cookies
      localStorage.setItem("accessToken", data.accessToken)
      localStorage.setItem("refreshToken", data.refreshToken)
      localStorage.setItem("user", JSON.stringify(data.user))

      // Set cookie for middleware authentication
      Cookies.set("token", data.accessToken, {
        expires: 7,
        path: "/",
        sameSite: "strict",
      })

      // Set user data
      setUser(data.user)
      setIsAuthenticated(true)
      setIsLoading(false)

      toast.success("Registration successful. Please verify your email.")
      return true
    } catch (error) {
      setIsLoading(false)
      throw error
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      const accessToken = localStorage.getItem("accessToken")

      if (accessToken) {
        await request("/auth/logout", "POST", undefined, false)
      }
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      // Clear storage and state regardless of API response
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
      localStorage.removeItem("user")
      Cookies.remove("token")

      setUser(null)
      setIsAuthenticated(false)
      setIsLoading(false)
      router.push("/auth/login")
      toast.success("Logged out successfully")
    }
  }

  const forgotPassword = async (email: string) => {
    setIsLoading(true)
    try {
      const { error } = await request("/auth/forgot-password", "POST", { email })

      if (error) {
        throw new Error(error)
      }

      setIsLoading(false)
      toast.success("Password reset email sent")
      return true
    } catch (error) {
      setIsLoading(false)
      throw error
    }
  }

  const resetPassword = async (token: string, password: string) => {
    setIsLoading(true)
    try {
      const { error } = await request(`/auth/reset-password/${token}`, "POST", { password })

      if (error) {
        throw new Error(error)
      }

      setIsLoading(false)
      toast.success("Password reset successful")
      return true
    } catch (error) {
      setIsLoading(false)
      throw error
    }
  }

  const changePassword = async (currentPassword: string, newPassword: string) => {
    setIsLoading(true)
    try {
      const { error } = await request("/auth/change-password", "POST", { currentPassword, newPassword })

      if (error) {
        throw new Error(error)
      }

      setIsLoading(false)
      toast.success("Password changed successfully")
      return true
    } catch (error) {
      setIsLoading(false)
      throw error
    }
  }

  const refreshAccessToken = async (): Promise<boolean> => {
    try {
      const refreshToken = localStorage.getItem("refreshToken")

      if (!refreshToken) {
        return false
      }

      const { data, error } = await request<{ accessToken: string }>(
        "/auth/refresh-token",
        "POST",
        { refreshToken },
        false,
      )

      if (error || !data) {
        return false
      }

      localStorage.setItem("accessToken", data.accessToken)
      Cookies.set("token", data.accessToken, {
        expires: 7,
        path: "/",
        sameSite: "strict",
      })

      // Fetch user data with new token
      const userResponse = await request<User>("/auth/me", "GET", undefined, false)

      if (userResponse.error || !userResponse.data) {
        return false
      }

      setUser(userResponse.data)
      setIsAuthenticated(true)
      return true
    } catch (error) {
      console.error("Token refresh failed:", error)
      return false
    }
  }

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    changePassword,
    refreshAccessToken,
    checkAuth,
  }
}
