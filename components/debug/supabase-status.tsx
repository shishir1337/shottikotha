"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, AlertTriangle } from "lucide-react"

export default function SupabaseStatus() {
  const [status, setStatus] = useState<"loading" | "connected" | "error">("loading")
  const [message, setMessage] = useState("")
  const [isChecking, setIsChecking] = useState(false)

  const checkConnection = async () => {
    setIsChecking(true)
    try {
      const response = await fetch("/api/check-supabase")
      const data = await response.json()

      setStatus(data.status === "connected" ? "connected" : "error")
      setMessage(data.message)
    } catch (error) {
      setStatus("error")
      setMessage(error instanceof Error ? error.message : "Unknown error")
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    checkConnection()
  }, [])

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Supabase Connection Status
          <Badge variant={status === "connected" ? "default" : status === "loading" ? "outline" : "destructive"}>
            {status === "connected" ? "Connected" : status === "loading" ? "Checking..." : "Error"}
          </Badge>
        </CardTitle>
        <CardDescription>Check if your application can connect to Supabase</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm">
          <p className="font-medium">Status Message:</p>
          <p className="text-muted-foreground">{message || "Checking connection..."}</p>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md p-3 text-sm">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500 mr-2 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-400">Development Mode</p>
              <p className="text-amber-700 dark:text-amber-500 mt-1">
                Using hardcoded Supabase credentials. For production, use environment variables.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={checkConnection} disabled={isChecking} className="w-full">
          {isChecking ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Check Connection
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
