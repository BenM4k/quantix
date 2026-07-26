import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 rounded-xl" />
          <Skeleton className="h-4 w-96 rounded-lg" />
        </div>
        <Skeleton className="h-9 w-36 rounded-xl" />
      </div>

      {/* Filter / Search Bar Skeleton */}
      <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border/40">
        <Skeleton className="h-9 w-72 rounded-xl" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-28 rounded-xl" />
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
        <div className="p-4 border-b border-border/40 bg-muted/40">
          <div className="grid grid-cols-5 gap-4">
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-4 w-32 rounded" />
            <Skeleton className="h-4 w-28 rounded" />
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="h-4 w-16 rounded ml-auto" />
          </div>
        </div>
        <div className="divide-y divide-border/30 p-4 space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="grid grid-cols-5 gap-4 items-center pt-3">
              <Skeleton className="h-5 w-28 rounded-lg" />
              <Skeleton className="h-5 w-40 rounded-lg" />
              <Skeleton className="h-5 w-24 rounded-lg" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-6 w-8 rounded-lg ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
