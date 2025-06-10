"use client"

import Cookies from "js-cookie"

export const getAuthToken = () => {
  if (typeof window !== "undefined") {
    const lsToken = localStorage.getItem("accessToken")
    if (lsToken) return lsToken
  }

  return Cookies.get("token")
}

export const setAuthToken = (token: string) => {
  if (typeof window !== "undefined") {

    localStorage.setItem("accessToken", token)

    Cookies.set("token", token, {
      expires: 7,
      path: "/",
      sameSite: "lax",
    })

    document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`
  }
}

export const clearAuthToken = () => {
  if (typeof window !== "undefined") {

    localStorage.removeItem("accessToken")

    Cookies.remove("token", { path: "/" })
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
  }
}

export const isAuthenticated = () => {
  return !!getAuthToken()
}
