"use client"

import { useEffect, useState } from "react"
import Cookies from "js-cookie"

export function AuthDebugger() {
  const [tokens, setTokens] = useState({
    localStorage: {
      accessToken: "",
      refreshToken: "",
      user: "",
    },
    cookies: {
      token: "",
    },
  })

  useEffect(() => {
    const updateTokens = () => {
      setTokens({
        localStorage: {
          accessToken: localStorage.getItem("accessToken") || "",
          refreshToken: localStorage.getItem("refreshToken") || "",
          user: localStorage.getItem("user") || "",
        },
        cookies: {
          token: Cookies.get("token") || "",
        },
      })
    }

    updateTokens()
    const interval = setInterval(updateTokens, 1000)
    return () => clearInterval(interval)
  }, [])

  if (process.env.NODE_ENV === "production") {
    return null
  }

  return (
    <div className="fixed bottom-0 right-0 z-50 p-4 bg-black/80 text-white text-xs font-mono max-w-md overflow-auto max-h-64">
      <h3 className="font-bold mb-2">Auth Debug</h3>
      <div>
        <p>LocalStorage:</p>
        <ul className="ml-4">
          <li>accessToken: {tokens.localStorage.accessToken ? "✅" : "❌"}</li>
          <li>refreshToken: {tokens.localStorage.refreshToken ? "✅" : "❌"}</li>
          <li>user: {tokens.localStorage.user ? "✅" : "❌"}</li>
        </ul>
        <p className="mt-2">Cookies:</p>
        <ul className="ml-4">
          <li>token: {tokens.cookies.token ? "✅" : "❌"}</li>
        </ul>
      </div>
    </div>
  )
}
