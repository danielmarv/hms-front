"use client"

import Cookies from "js-cookie"

export const getAuthToken = () => {
  // Try to get from localStorage first
  if (typeof window !== "undefined") {
    const lsToken = localStorage.getItem("accessToken")
    if (lsToken) return lsToken
  }

  // Fall back to cookies
  return Cookies.get("token")
}

export const setAuthToken = (token: string) => {
  if (typeof window !== "undefined") {
    // Set in localStorage
    localStorage.setItem("accessToken", token)

    // Set in cookies
    Cookies.set("token", token, {
      expires: 7,
      path: "/",
      sameSite: "lax",
    })

    // Also set using document.cookie as a fallback
    document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`
  }
}

export const clearAuthToken = () => {
  if (typeof window !== "undefined") {
    // Clear from localStorage
    localStorage.removeItem("accessToken")

    // Clear from cookies
    Cookies.remove("token", { path: "/" })
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
  }
}

export const isAuthenticated = () => {
  return !!getAuthToken()
}
