import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56 rounded-xl" />
          <Skeleton className="h-4 w-80 rounded-lg" />
        </div>
        <Skeleton className="h-9 w-36 rounded-xl" />
      </div>

      <div className="rounded-2xl border border-border/80 bg-card p-6 space-y-4">
        <Skeleton className="h-6 w-40 rounded-lg" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      </div>

      <div className="rounded-2xl border border-border/80 bg-card p-6 space-y-4">
        <Skeleton className="h-6 w-48 rounded-lg" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-border/30">
            <Skeleton className="h-5 w-40 rounded-lg" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
