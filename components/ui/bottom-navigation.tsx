"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Search, TrendingUp, User, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ModeToggle } from "@/components/ui/mode-toggle"
import { Sun, Moon } from "lucide-react"

export default function BottomNavigation() {
  const pathname = usePathname()
  const isMobile = useMobile()

  if (!isMobile) return null

  const navItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Search, label: "Explore", href: "/stories" },
    {
      icon: Plus,
      label: "Share",
      href: "/share",
      isAction: true,
    },
    { icon: TrendingUp, label: "Trending", href: "/trending" },
    { icon: User, label: "Profile", href: "/profile" },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border shadow-lg">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) =>
          item.isAction ? (
            <Sheet key={item.label}>
              <SheetTrigger asChild>
                <Button
                  size="icon"
                  className="rounded-full bg-primary text-primary-foreground h-12 w-12 p-2 shadow-md relative -top-5 transition-transform hover:scale-105 active:scale-95"
                >
                  <item.icon className="h-6 w-6" />
                  <span className="sr-only">{item.label}</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[85vh] rounded-t-xl">
                <SheetHeader className="text-left pb-6">
                  <SheetTitle>Share your experience</SheetTitle>
                  <SheetDescription>Tell others about your experience with a company or organization</SheetDescription>
                </SheetHeader>
                <div className="grid gap-4">
                  <Link
                    href="/share"
                    className="flex items-center p-4 rounded-lg border hover:bg-muted transition-colors"
                  >
                    <div className="mr-4 rounded-full bg-primary/10 p-2">
                      <Plus className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">New Story</h3>
                      <p className="text-sm text-muted-foreground">Share a detailed experience</p>
                    </div>
                  </Link>

                  <div className="flex items-center p-4 rounded-lg border hover:bg-muted transition-colors">
                    <div className="mr-4 rounded-full bg-primary/10 p-2">
                      <Sun className="h-5 w-5 text-primary dark:hidden" />
                      <Moon className="h-5 w-5 text-primary hidden dark:block" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">Appearance</h3>
                      <p className="text-sm text-muted-foreground">Change the theme</p>
                    </div>
                    <ModeToggle />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full text-xs font-medium transition-colors relative",
                pathname === item.href
                  ? "text-primary after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-1/2 after:h-0.5 after:bg-primary after:rounded-full"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <item.icon
                className={cn("h-5 w-5 mb-1 transition-transform", pathname === item.href ? "scale-110" : "")}
              />
              <span>{item.label}</span>
            </Link>
          ),
        )}
      </div>
    </div>
  )
}
