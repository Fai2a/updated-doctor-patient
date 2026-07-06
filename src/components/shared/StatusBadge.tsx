import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}

const styles: Record<StatusBadgeProps['status'], { badge: string; dot: string; label: string }> = {
  PENDING: {
    badge:
      "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/25",
    dot: "bg-amber-500",
    label: "Pending",
  },
  ACCEPTED: {
    badge:
      "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/25",
    dot: "bg-emerald-500",
    label: "Accepted",
  },
  REJECTED: {
    badge:
      "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/25",
    dot: "bg-rose-500",
    label: "Declined",
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const s = styles[status] ?? styles.PENDING;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border",
        s.badge
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", s.dot, status === 'PENDING' && "animate-pulse")} />
      {s.label}
    </span>
  );
}
