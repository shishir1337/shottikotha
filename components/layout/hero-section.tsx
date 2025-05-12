import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HeroSection() {
  return (
    <section className="py-8 md:py-12 lg:py-24 bg-gradient-to-b from-background to-muted/30 rounded-2xl md:rounded-3xl">
      <div className="container px-4 md:px-6 flex flex-col items-center text-center space-y-6 md:space-y-8">
        <div className="space-y-3 md:space-y-4 max-w-3xl">
          <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold tracking-tighter">
            Real Experiences. Real Stories.
          </h1>
          <p className="text-base md:text-xl text-muted-foreground max-w-[700px] mx-auto">
            Shotti Kotha: A platform where people share their authentic experiences with companies and organizations,
            completely anonymously.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 w-full sm:w-auto">
          <Button size="lg" className="w-full sm:w-auto" asChild>
            <Link href="/share">Share Your Story</Link>
          </Button>
          <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
            <Link href="/stories">Browse Stories</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
