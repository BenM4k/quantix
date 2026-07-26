import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-pulse">
      <div className="space-y-2">
        <Skeleton className="h-8 w-60 rounded-xl" />
        <Skeleton className="h-4 w-80 rounded-lg" />
      </div>

      <div className="rounded-2xl border border-border/80 bg-card p-6 space-y-5">
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <div className="flex justify-end pt-2">
          <Skeleton className="h-9 w-32 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
