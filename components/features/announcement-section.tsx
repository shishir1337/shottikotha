"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Megaphone, X } from "lucide-react"
import type { AnnouncementProps } from "@/types"

export default function AnnouncementSection({
  title = "Announcement",
  content,
  showDismiss = true,
}: AnnouncementProps) {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <Card className="bg-primary/10 border-primary/20">
      <CardContent className="p-4 md:p-6">
        <div className="flex items-start gap-3 md:gap-4">
          <Megaphone className="h-5 w-5 md:h-6 md:w-6 text-primary flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-base md:text-lg">{title}</h3>
              {showDismiss && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 rounded-full -mt-1 -mr-1"
                  onClick={() => setIsVisible(false)}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Dismiss</span>
                </Button>
              )}
            </div>
            <div className="mt-1 text-sm md:text-base" dangerouslySetInnerHTML={{ __html: content }} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
