import SupabaseStatus from "@/components/debug/supabase-status"
import CookieStatus from "@/components/debug/cookie-status"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function DebugPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href="/" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>

      <h1 className="text-3xl font-bold mb-8 text-center">Debug Tools</h1>

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-4">Supabase Connection</h2>
          <SupabaseStatus />
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Anonymous ID Cookie</h2>
          <CookieStatus />
        </section>
      </div>
    </div>
  )
}
