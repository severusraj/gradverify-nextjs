import { cn } from "@/lib/utils";

type SubmissionStatus = "PENDING" | "APPROVED" | "REJECTED" | "NOT_SUBMITTED";

interface StatusBadgeProps {
  status: SubmissionStatus | string; // Allow string type for unexpected values
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
    NOT_SUBMITTED: {
      label: "Not Submitted",
      color: "bg-gray-100 text-gray-800 border-gray-200",
    },
  } as const;

  // Add index signature to allow accessing with string keys
  const config = statusConfig[status as keyof typeof statusConfig] || {
    label: `Unknown Status: ${status}`,
    color: "bg-gray-500 text-white border-gray-600", // Default style for unknown status
  };

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