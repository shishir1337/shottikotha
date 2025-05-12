"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface SearchFormProps {
  className?: string
  defaultValue?: string
  placeholder?: string
}

export default function SearchForm({
  className = "",
  defaultValue = "",
  placeholder = "Search companies or topics...",
}: SearchFormProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState(defaultValue)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      router.push(`/stories?search=${encodeURIComponent(searchTerm.trim())}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder={placeholder}
          className="pl-9 rounded-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </form>
  )
}
