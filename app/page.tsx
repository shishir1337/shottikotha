"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { TrendingUp, Bug } from "lucide-react"
import RecentStories from "@/components/features/recent-stories"
import HeroSection from "@/components/layout/hero-section"
import TrendingStories from "@/components/features/trending-stories"
import AnnouncementSection from "@/components/features/announcement-section"
import BottomNavigation from "@/components/ui/bottom-navigation"
import ScrollToTop from "@/components/ui/scroll-to-top"
import { ANNOUNCEMENT_CONTENT } from "@/constants/content"
import { ModeToggle } from "@/components/ui/mode-toggle"
import { PullToRefresh } from "@/components/ui/pull-to-refresh"
import SearchForm from "@/components/features/search-form"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="container mx-auto py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl font-bold">
              Shotti Kotha
            </Link>
            <div className="hidden md:block relative w-full max-w-sm mx-4">
              <SearchForm className="w-full" />
            </div>
            <div className="flex items-center gap-2">
              <ModeToggle />
              <Button size="sm" asChild>
                <Link href="/share">Share Story</Link>
              </Button>
            </div>
          </div>
          <div className="mt-3 md:hidden relative w-full">
            <SearchForm className="w-full" />
          </div>
        </div>
      </header>

      <PullToRefresh
        onRefresh={async () => {
          // This is a client component, so we can't use await directly
          // In a real app, you would dispatch an action to refresh all data
          await new Promise((resolve) => setTimeout(resolve, 1000))
          window.location.reload()
        }}
      >
        <main className="container mx-auto py-4 md:py-6 space-y-8 md:space-y-12 px-4 md:px-6 pb-20 md:pb-8">
          <HeroSection />

          <AnnouncementSection title="Community Guidelines" content={ANNOUNCEMENT_CONTENT} showDismiss={true} />

          <section className="space-y-3 md:space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                <h2 className="text-xl md:text-2xl font-bold">Trending Now</h2>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/trending">View all</Link>
              </Button>
            </div>
            <TrendingStories />
          </section>

          <section className="space-y-3 md:space-y-4">
            <RecentStories />
          </section>
        </main>
      </PullToRefresh>

      <footer className="border-t bg-muted/40">
        <div className="container mx-auto py-6 md:py-8 px-4 md:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            <div>
              <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">About Shotti Kotha</h3>
              <p className="text-sm md:text-base text-muted-foreground">
                A platform where people share their real experiences with companies and organizations, anonymously and
                freely.
              </p>
            </div>
            <div>
              <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="text-sm md:text-base text-muted-foreground hover:text-foreground">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/guidelines" className="text-sm md:text-base text-muted-foreground hover:text-foreground">
                    Community Guidelines
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-sm md:text-base text-muted-foreground hover:text-foreground">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/debug"
                    className="text-sm md:text-base text-muted-foreground hover:text-foreground flex items-center gap-1"
                  >
                    <Bug className="h-3 w-3" />
                    <span>Debug Tools</span>
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Contact</h3>
              <p className="text-sm md:text-base text-muted-foreground">
                Have questions or feedback?{" "}
                <Link href="/contact" className="underline">
                  Contact us
                </Link>
              </p>
            </div>
          </div>
          <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t text-center text-xs md:text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Shotti Kotha. All rights reserved.
          </div>
        </div>
      </footer>

      <ScrollToTop />
      <BottomNavigation />
    </div>
  )
}
