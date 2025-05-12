import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

export default function StorySkeleton() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2 space-y-2">
        <div className="flex justify-between items-start">
          <div className="space-y-2 w-3/4">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-5 w-16" />
        </div>
      </CardHeader>
      <CardContent className="flex-grow py-2">
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-3 pt-2">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-7 w-12" />
            <Skeleton className="h-7 w-12" />
            <Skeleton className="h-7 w-12" />
          </div>
          <Skeleton className="h-7 w-7" />
        </div>
      </CardFooter>
    </Card>
  )
}
