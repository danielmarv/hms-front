"use client"

import { useState, useEffect } from "react"
import Cookies from "js-cookie"

export function TokenInspector() {
  const [tokenInfo, setTokenInfo] = useState({
    token: "",
    decoded: null as any,
    isValid: false,
  })

  useEffect(() => {
    const updateTokenInfo = () => {
      const token = localStorage.getItem("accessToken") || Cookies.get("token") || ""

      try {
        // Only attempt to decode if we have a token
        if (token) {
          // Simple JWT structure check (not full validation)
          const parts = token.split(".")
          if (parts.length !== 3) {
            setTokenInfo({
              token: token.substring(0, 20) + "...",
              decoded: null,
              isValid: false,
            })
            return
          }

          // Decode the payload (middle part)
          const payload = JSON.parse(atob(parts[1]))

          setTokenInfo({
            token: token.substring(0, 20) + "...",
            decoded: payload,
            isValid: true,
          })
        } else {
          setTokenInfo({
            token: "",
            decoded: null,
            isValid: false,
          })
        }
      } catch (e) {
        console.error("Error decoding token:", e)
        setTokenInfo({
          token: token ? token.substring(0, 20) + "..." : "",
          decoded: null,
          isValid: false,
        })
      }
    }

    updateTokenInfo()
    const interval = setInterval(updateTokenInfo, 1000)
    return () => clearInterval(interval)
  }, [])

  if (process.env.NODE_ENV === "production") {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 z-50 p-4 bg-black/80 text-white text-xs font-mono max-w-md overflow-auto max-h-64">
      <h3 className="font-bold mb-2">Token Inspector</h3>
      <div>
        <p>Token: {tokenInfo.token || "None"}</p>
        <p>Valid Format: {tokenInfo.isValid ? "✅" : "❌"}</p>
        {tokenInfo.decoded && (
          <div>
            <p className="mt-2">Decoded:</p>
            <ul className="ml-4">
              {Object.entries(tokenInfo.decoded).map(([key, value]) => (
                <li key={key}>
                  {key}: {JSON.stringify(value)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
