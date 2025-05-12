"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft } from "lucide-react"
import BottomNavigation from "@/components/ui/bottom-navigation"
import { ModeToggle } from "@/components/ui/mode-toggle"

export default function QuickReviewPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    company: "",
    rating: 3,
    comment: "",
    agreeToTerms: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRatingChange = (value: string) => {
    setFormData((prev) => ({ ...prev, rating: Number.parseInt(value) }))
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, agreeToTerms: checked }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    setTimeout(() => {
      // In a real app, we would submit the data to a backend
      console.log("Submitting quick review:", formData)

      // Redirect to a success page or back to home
      router.push("/share/success")
    }, 1500)
  }

  return (
    <div className="container mx-auto py-4 md:py-8 px-4 max-w-md md:max-w-lg pb-20 md:pb-8">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
        <ModeToggle />
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Card>
          <CardHeader className="pb-4 md:pb-6">
            <CardTitle className="text-xl md:text-2xl">Quick Review</CardTitle>
            <CardDescription className="text-sm md:text-base">
              Share a brief review about your experience. Perfect for when you're on the go.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 md:space-y-6">
              <div className="space-y-2">
                <Label htmlFor="company" className="text-sm md:text-base">
                  Company or Organization Name
                </Label>
                <Input
                  id="company"
                  name="company"
                  placeholder="Enter the name of the company or organization"
                  value={formData.company}
                  onChange={handleChange}
                  required
                  className="text-sm md:text-base"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm md:text-base">Your Rating</Label>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Negative</span>
                  <RadioGroup
                    className="flex space-x-2"
                    value={formData.rating.toString()}
                    onValueChange={handleRatingChange}
                  >
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <RadioGroupItem
                        key={rating}
                        value={rating.toString()}
                        id={`rating-${rating}`}
                        className="peer sr-only"
                      />
                    ))}
                    <Label
                      htmlFor="rating-1"
                      className={`h-10 w-10 rounded-full flex items-center justify-center cursor-pointer border ${
                        formData.rating === 1 ? "bg-destructive text-destructive-foreground" : "hover:bg-muted"
                      }`}
                    >
                      1
                    </Label>
                    <Label
                      htmlFor="rating-2"
                      className={`h-10 w-10 rounded-full flex items-center justify-center cursor-pointer border ${
                        formData.rating === 2 ? "bg-destructive/70 text-destructive-foreground" : "hover:bg-muted"
                      }`}
                    >
                      2
                    </Label>
                    <Label
                      htmlFor="rating-3"
                      className={`h-10 w-10 rounded-full flex items-center justify-center cursor-pointer border ${
                        formData.rating === 3 ? "bg-orange-500 text-white" : "hover:bg-muted"
                      }`}
                    >
                      3
                    </Label>
                    <Label
                      htmlFor="rating-4"
                      className={`h-10 w-10 rounded-full flex items-center justify-center cursor-pointer border ${
                        formData.rating === 4 ? "bg-primary/70 text-primary-foreground" : "hover:bg-muted"
                      }`}
                    >
                      4
                    </Label>
                    <Label
                      htmlFor="rating-5"
                      className={`h-10 w-10 rounded-full flex items-center justify-center cursor-pointer border ${
                        formData.rating === 5 ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                      }`}
                    >
                      5
                    </Label>
                  </RadioGroup>
                  <span className="text-xs text-muted-foreground">Positive</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="comment" className="text-sm md:text-base">
                  Brief Comment
                </Label>
                <Textarea
                  id="comment"
                  name="comment"
                  placeholder="Share a brief comment about your experience..."
                  className="min-h-[80px] text-sm md:text-base"
                  value={formData.comment}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={handleCheckboxChange}
                  required
                  className="mt-1"
                />
                <div className="grid gap-1 leading-none">
                  <Label htmlFor="terms" className="text-xs md:text-sm font-normal">
                    I confirm that this is a truthful account of my experience and I agree to the{" "}
                    <Link href="/terms" className="underline">
                      community guidelines
                    </Link>
                  </Label>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={!formData.agreeToTerms || isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Quick Review"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>

      <BottomNavigation />
    </div>
  )
}
