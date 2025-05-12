"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Home, PenLine } from "lucide-react"
import BottomNavigation from "@/components/ui/bottom-navigation"

export default function SuccessPage() {
  return (
    <div className="container mx-auto py-8 md:py-16 px-4 max-w-xs md:max-w-md text-center pb-20 md:pb-8">
      <motion.div
        className="flex flex-col items-center space-y-4 md:space-y-6"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="rounded-full bg-green-100 p-2 md:p-3"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <CheckCircle2 className="h-8 w-8 md:h-12 md:w-12 text-green-600" />
        </motion.div>

        <motion.h1
          className="text-xl md:text-2xl font-bold"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          Thank You for Sharing!
        </motion.h1>

        <motion.p
          className="text-sm md:text-base text-muted-foreground"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          Your story has been submitted successfully and will be reviewed shortly. Your experience will help others make
          informed decisions on Shotti Kotha.
        </motion.p>

        <motion.div
          className="flex flex-col space-y-3 md:space-y-4 w-full pt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          <Button asChild className="flex items-center">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Return to Home
            </Link>
          </Button>
          <Button variant="outline" asChild className="flex items-center">
            <Link href="/share">
              <PenLine className="mr-2 h-4 w-4" />
              Share Another Story
            </Link>
          </Button>
        </motion.div>
      </motion.div>

      <BottomNavigation />
    </div>
  )
}
