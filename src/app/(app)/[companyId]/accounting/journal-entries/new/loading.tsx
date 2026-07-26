import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
      <div className="flex items-center gap-4 border-b border-border/40 pb-4">
        <Skeleton className="h-9 w-9 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-72 rounded-xl" />
          <Skeleton className="h-4 w-96 rounded-lg" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 p-5 bg-card rounded-2xl border border-border/80">
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>

      <div className="bg-card rounded-2xl border border-border/80 p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <Skeleton className="h-5 w-32 rounded-lg" />
          <Skeleton className="h-8 w-24 rounded-xl" />
        </div>
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
