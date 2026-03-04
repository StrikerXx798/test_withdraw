"use client";

import type { WithdrawalStatus } from "@/lib/api/withdrawals";

const labels: Record<WithdrawalStatus, string> = {
  pending: "Ожидает",
  processing: "В обработке",
  completed: "Выполнено",
  failed: "Ошибка",
};

interface StatusBadgeProps {
  status: WithdrawalStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      data-status={status}
      style={{
        display: "inline-block",
        padding: "0.25rem 0.5rem",
        borderRadius: "4px",
        fontSize: "0.875rem",
        fontWeight: 500,
        ...(status === "completed" && { background: "#d4edda", color: "#155724" }),
        ...(status === "failed" && { background: "#f8d7da", color: "#721c24" }),
        ...(status === "processing" && { background: "#fff3cd", color: "#856404" }),
        ...(status === "pending" && { background: "#e2e3e5", color: "#383d41" }),
      }}
    >
      {labels[status]}
    </span>
  );
}
