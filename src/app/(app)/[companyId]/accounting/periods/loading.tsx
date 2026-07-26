import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64 rounded-xl" />
        <Skeleton className="h-4 w-96 rounded-lg" />
      </div>

      <div className="rounded-2xl border border-border/80 bg-card overflow-hidden">
        <div className="p-4 border-b border-border/40 bg-muted/40">
          <div className="grid grid-cols-5 gap-4">
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-4 w-16 rounded" />
            <Skeleton className="h-4 w-20 rounded ml-auto" />
          </div>
        </div>
        <div className="divide-y divide-border/30 p-4 space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="grid grid-cols-5 gap-4 items-center pt-3">
              <Skeleton className="h-5 w-20 rounded-lg" />
              <Skeleton className="h-5 w-24 rounded-lg" />
              <Skeleton className="h-5 w-24 rounded-lg" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-xl ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
