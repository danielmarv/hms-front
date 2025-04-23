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

// Debug function to check token state
const debugTokens = () => {
  if (typeof window !== "undefined") {
    console.log("LocalStorage accessToken:", localStorage.getItem("accessToken"))
    console.log("LocalStorage refreshToken:", localStorage.getItem("refreshToken"))
    console.log("Cookie token:", Cookies.get("token"))
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { request } = useApi()
  const router = useRouter()

  // Set tokens in both localStorage and cookies
  const setTokens = (accessToken: string, refreshToken: string, userData: User) => {
    console.log("Setting tokens...")

    // Set in localStorage
    localStorage.setItem("accessToken", accessToken)
    localStorage.setItem("refreshToken", refreshToken)
    localStorage.setItem("user", JSON.stringify(userData))

    // Set in cookies with explicit options
    // Use path="/" to ensure the cookie is available across the entire site
    Cookies.set("token", accessToken, {
      expires: 7, // 7 days
      path: "/",
      sameSite: "lax", // Changed from strict to lax for better compatibility
    })

    // Also set a session cookie as backup
    document.cookie = `token=${accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`

    debugTokens()
  }

  // Clear tokens from both localStorage and cookies
  const clearTokens = () => {
    console.log("Clearing tokens...")

    // Clear localStorage
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    localStorage.removeItem("user")

    // Clear cookies
    Cookies.remove("token", { path: "/" })
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"

    debugTokens()
  }

  const checkAuth = useCallback(async () => {
    console.log("Checking authentication...")
    debugTokens()

    try {
      // Check both localStorage and cookies
      const accessToken = localStorage.getItem("accessToken") || Cookies.get("token")

      if (!accessToken) {
        console.log("No token found")
        setIsLoading(false)
        return false
      }

      console.log("Token found, verifying with API...")
      const { data, error } = await request<User>("/auth/me", "GET", undefined, false)

      if (error || !data) {
        console.log("Token invalid or expired, trying to refresh...")
        // Try to refresh token
        const refreshed = await refreshAccessToken()
        if (!refreshed) {
          console.log("Refresh failed, clearing tokens")
          clearTokens()
          setIsAuthenticated(false)
          setUser(null)
          setIsLoading(false)
          return false
        }
        console.log("Token refreshed successfully")
        return true
      }

      console.log("Authentication successful")
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

  // Check auth on initial load and when window gets focus
  useEffect(() => {
    checkAuth()

    // Re-check auth when window gets focus
    const handleFocus = () => {
      console.log("Window focused, re-checking auth")
      checkAuth()
    }

    window.addEventListener("focus", handleFocus)
    return () => window.removeEventListener("focus", handleFocus)
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

      // Store tokens
      setTokens(data.accessToken, data.refreshToken, data.user)

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

      // Store tokens
      setTokens(data.accessToken, data.refreshToken, data.user)

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
      clearTokens()
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

      const { data, error } = await request<{ accessToken: string; user: User }>(
        "/auth/refresh-token",
        "POST",
        { refreshToken },
        false,
      )

      if (error || !data) {
        return false
      }

      // Update access token but keep the same refresh token
      localStorage.setItem("accessToken", data.accessToken)
      Cookies.set("token", data.accessToken, {
        expires: 7,
        path: "/",
        sameSite: "lax",
      })
      document.cookie = `token=${data.accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`

      if (data.user) {
        setUser(data.user)
        localStorage.setItem("user", JSON.stringify(data.user))
      }

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
