"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Share2 } from "lucide-react"

export default function ExternalSharePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [title, setTitle] = useState("")
  const [text, setText] = useState("")
  const [url, setUrl] = useState("")
  const [company, setCompany] = useState("")

  useEffect(() => {
    // Get shared data from URL parameters
    const sharedTitle = searchParams.get("title") || ""
    const sharedText = searchParams.get("text") || ""
    const sharedUrl = searchParams.get("url") || ""

    setTitle(sharedTitle)
    setText(sharedText)
    setUrl(sharedUrl)

    // Try to extract company name from title or text
    const extractedCompany = extractCompanyName(sharedTitle || sharedText)
    if (extractedCompany) {
      setCompany(extractedCompany)
    }
  }, [searchParams])

  const extractCompanyName = (content: string): string => {
    // Simple extraction - look for common patterns like "at [Company]" or "with [Company]"
    const atMatch = content.match(/\bat\s+([A-Z][A-Za-z0-9\s&]+)/)
    const withMatch = content.match(/\bwith\s+([A-Z][A-Za-z0-9\s&]+)/)

    if (atMatch && atMatch[1]) return atMatch[1].trim()
    if (withMatch && withMatch[1]) return withMatch[1].trim()

    return ""
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Redirect to the regular share page with pre-filled data
    router.push(
      `/share?title=${encodeURIComponent(title)}&company=${encodeURIComponent(company)}&content=${encodeURIComponent(text)}`,
    )
  }

  return (
    <div className="container mx-auto max-w-md p-4">
      <Card>
        <CardHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary">
            <Share2 className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-center text-xl">Share Your Experience</CardTitle>
          <CardDescription className="text-center">
            We've received content from another app. Edit it below to share your experience.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your experience a title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Which company is this about?"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Your Experience</Label>
              <Textarea
                id="content"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Share your experience..."
                rows={6}
              />
            </div>

            {url && (
              <div className="rounded-md bg-muted p-3">
                <p className="text-xs font-medium">Shared URL:</p>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary underline break-all"
                >
                  {url}
                </a>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              Continue to Share
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
