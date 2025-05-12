"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Info } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import BottomNavigation from "@/components/ui/bottom-navigation"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Script from "next/script"
import { storyService } from "@/services/story-service"
import type { ShareStoryFormData } from "@/types"
import { QUILL_MODULES, QUILL_FORMATS } from "@/constants/content"
import { ModeToggle } from "@/components/ui/mode-toggle"

export default function ShareStory() {
  const router = useRouter()
  const { toast } = useToast()
  const [formData, setFormData] = useState<ShareStoryFormData>({
    company: "",
    designation: "",
    title: "",
    content: "",
    category: "mixed",
    agreeToTerms: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [quillLoaded, setQuillLoaded] = useState(false)
  const [quillInitialized, setQuillInitialized] = useState(false)
  const editorRef = useRef<any>(null)

  // Initialize Quill when the script is loaded
  const initializeQuill = () => {
    if (typeof window !== "undefined" && window.Quill && !quillInitialized) {
      // Make sure we only initialize once
      if (editorRef.current) return

      const quillInstance = new window.Quill("#editor", {
        theme: "snow",
        placeholder: "Share the details of your experience...",
        modules: QUILL_MODULES,
        formats: QUILL_FORMATS,
      })

      // Set initial content if available
      if (formData.content) {
        quillInstance.root.innerHTML = formData.content
      }

      // Update form data when editor content changes
      quillInstance.on("text-change", () => {
        setFormData((prev) => ({ ...prev, content: quillInstance.root.innerHTML }))
      })

      editorRef.current = quillInstance
      setQuillInitialized(true)
    }
  }

  // Try to initialize Quill when the component mounts and when quillLoaded changes
  useEffect(() => {
    if (quillLoaded) {
      initializeQuill()
    }
  }, [quillLoaded])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRadioChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }))
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, agreeToTerms: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate content
    if (!formData.content || formData.content === "<p><br></p>" || formData.content === "") {
      toast({
        title: "Content required",
        description: "Please share your experience before submitting",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Submit the story
      const result = await storyService.submitStory(formData)

      if (result.success) {
        // Redirect to success page
        router.push("/share/success")
      } else {
        throw new Error("Failed to submit story")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem submitting your story. Please try again.",
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-4 md:py-8 px-4 max-w-md md:max-w-2xl pb-20 md:pb-8">
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
            <CardTitle className="text-xl md:text-2xl">Share Your Experience</CardTitle>
            <CardDescription className="text-sm md:text-base">
              Tell others about your experience with a company or organization. All submissions are anonymous.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 md:space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="company" className="text-sm md:text-base">
                    Company or Organization Name
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>
                          We suggest avoiding directly naming companies or individuals to maintain a respectful
                          environment.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
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
                <Label htmlFor="designation" className="text-sm md:text-base">
                  Designation or Position in the Company
                </Label>
                <Input
                  id="designation"
                  name="designation"
                  placeholder="Your role or position in the company"
                  value={formData.designation}
                  onChange={handleChange}
                  required
                  className="text-sm md:text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm md:text-base">
                  Title of Your Experience
                </Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Summarize your experience in a few words"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="text-sm md:text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content" className="text-sm md:text-base">
                  Your Experience
                </Label>
                <div className="min-h-[200px]">
                  {/* Load Quill script */}
                  <Script
                    src="https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.js"
                    strategy="afterInteractive"
                    onLoad={() => setQuillLoaded(true)}
                  />
                  {/* Load Quill CSS */}
                  <link href="https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.snow.css" rel="stylesheet" />

                  {/* Editor container */}
                  <div id="editor" className="h-[200px] border rounded-md"></div>

                  <p className="text-xs text-muted-foreground mt-2">
                    Please provide detailed information about your experience to help others understand the context.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm md:text-base">How would you categorize this experience?</Label>
                <RadioGroup
                  defaultValue="mixed"
                  value={formData.category}
                  onValueChange={handleRadioChange}
                  className="space-y-1.5 md:space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="positive" id="positive" />
                    <Label htmlFor="positive" className="text-sm md:text-base">
                      Positive
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="negative" id="negative" />
                    <Label htmlFor="negative" className="text-sm md:text-base">
                      Negative
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mixed" id="mixed" />
                    <Label htmlFor="mixed" className="text-sm md:text-base">
                      Mixed
                    </Label>
                  </div>
                </RadioGroup>
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
                {isSubmitting ? "Submitting..." : "Submit Your Story"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>

      <BottomNavigation />
    </div>
  )
}
