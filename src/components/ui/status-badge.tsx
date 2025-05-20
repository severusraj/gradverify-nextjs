import { cn } from "@/lib/utils";

type SubmissionStatus = "PENDING" | "APPROVED" | "REJECTED";

interface StatusBadgeProps {
  status: SubmissionStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusConfig = {
    PENDING: {
      label: "Pending Review",
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    },
    APPROVED: {
      label: "Approved",
      color: "bg-green-100 text-green-800 border-green-200",
    },
    REJECTED: {
      label: "Rejected",
      color: "bg-red-100 text-red-800 border-red-200",
    },
  } as const;

  const config = statusConfig[status];

  return (
    <div
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        config.color,
        className
      )}
    >
      {config.label}
    </div>
  );
} 