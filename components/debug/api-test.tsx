"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useApi } from "@/hooks/use-api"

export function ApiTest() {
  const [testResult, setTestResult] = useState<string>("")
  const { request, isLoading } = useApi()

  const testConnection = async () => {
    setTestResult("Testing API connection...")

    try {
      // Test basic API connection
      const result = await request("/users")

      if (result.error) {
        setTestResult(`❌ API Error: ${result.error}`)
      } else {
        setTestResult(`✅ API Connected Successfully! Response: ${JSON.stringify(result.data, null, 2)}`)
      }
    } catch (error) {
      setTestResult(`❌ Connection Error: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  const testAuth = async () => {
    setTestResult("Testing authentication...")

    // Check if token exists
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

    if (!token) {
      setTestResult("❌ No authentication token found. Please log in first.")
      return
    }

    try {
      const result = await request("/auth/me")

      if (result.error) {
        setTestResult(`❌ Auth Error: ${result.error}`)
      } else {
        setTestResult(`✅ Authentication Valid! User: ${JSON.stringify(result.data, null, 2)}`)
      }
    } catch (error) {
      setTestResult(`❌ Auth Test Error: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>API Connection Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={testConnection} disabled={isLoading}>
            Test API Connection
          </Button>
          <Button onClick={testAuth} disabled={isLoading} variant="outline">
            Test Authentication
          </Button>
        </div>

        {testResult && (
          <div className="p-4 bg-gray-50 rounded-md">
            <pre className="whitespace-pre-wrap text-sm">{testResult}</pre>
          </div>
        )}

        <div className="text-sm text-gray-600">
          <p>
            <strong>API Base URL:</strong> {process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}
          </p>
          <p>
            <strong>Token:</strong>{" "}
            {typeof window !== "undefined" && localStorage.getItem("token") ? "Present" : "Missing"}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
