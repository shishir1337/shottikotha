import { Skeleton } from "@/components/ui/skeleton"

export default function CommentSkeleton() {
  return (
    <div className="flex items-start space-x-3 md:space-x-4">
      <Skeleton className="h-6 w-6 md:h-8 md:w-8 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-1.5 md:space-y-2">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="flex items-center space-x-2 pt-1">
          <Skeleton className="h-7 w-12" />
          <Skeleton className="h-7 w-12" />
        </div>
      </div>
    </div>
  )
}
