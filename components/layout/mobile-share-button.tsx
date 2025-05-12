"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"

export default function MobileShareButton() {
  const isMobile = useMobile()
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      // Hide button when scrolling down, show when scrolling up
      const currentScrollY = window.scrollY
      if (currentScrollY > lastScrollY) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }
      setLastScrollY(currentScrollY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY])

  if (!isMobile) return null

  return (
    <div
      className={`fixed bottom-6 right-6 transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "translate-y-24"
      }`}
    >
      <Button size="lg" className="rounded-full h-14 w-14 shadow-lg" asChild>
        <Link href="/share">
          <Plus className="h-6 w-6" />
          <span className="sr-only">Share your story</span>
        </Link>
      </Button>
    </div>
  )
}
