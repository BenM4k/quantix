import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 rounded-xl" />
          <Skeleton className="h-4 w-72 rounded-lg" />
        </div>
        <Skeleton className="h-9 w-36 rounded-xl" />
      </div>

      <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border/40">
        <Skeleton className="h-9 w-72 rounded-xl" />
      </div>

      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
        <div className="p-4 border-b border-border/40 bg-muted/40">
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-4 w-32 rounded" />
            <Skeleton className="h-4 w-28 rounded" />
            <Skeleton className="h-4 w-24 rounded ml-auto" />
          </div>
        </div>
        <div className="divide-y divide-border/30 p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="grid grid-cols-3 gap-4 items-center pt-3">
              <Skeleton className="h-5 w-36 rounded-lg" />
              <Skeleton className="h-5 w-28 rounded-lg" />
              <Skeleton className="h-5 w-24 rounded-full ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
