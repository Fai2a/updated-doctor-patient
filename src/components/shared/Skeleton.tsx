import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton', className)} />;
}

/** A generic card-shaped placeholder used while lists load. */
export function CardSkeleton() {
  return (
    <div className="card-surface p-6">
      <div className="flex items-center gap-4">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>
    </div>
  );
}
