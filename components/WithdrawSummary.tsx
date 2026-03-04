"use client";

import type { Withdrawal } from "@/lib/api/withdrawals";
import { StatusBadge } from "./StatusBadge";

interface WithdrawSummaryProps {
  withdrawal: Withdrawal;
}

export function WithdrawSummary({ withdrawal }: WithdrawSummaryProps) {
  const createdAt = new Date(withdrawal.createdAt).toLocaleString("ru");

  return (
    <section
      style={{
        marginTop: "1.5rem",
        padding: "1rem",
        border: "1px solid #dee2e6",
        borderRadius: "8px",
        background: "#f8f9fa",
      }}
      aria-label="Созданная заявка"
    >
      <h2 style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>Заявка создана</h2>
      <dl style={{ margin: 0, display: "grid", gap: "0.5rem" }}>
        <div>
          <dt style={{ fontWeight: 600, fontSize: "0.875rem" }}>ID</dt>
          <dd style={{ margin: 0, fontFamily: "monospace" }}>{withdrawal.id}</dd>
        </div>
        <div>
          <dt style={{ fontWeight: 600, fontSize: "0.875rem" }}>Сумма</dt>
          <dd style={{ margin: 0 }}>{withdrawal.amount} USDT</dd>
        </div>
        <div>
          <dt style={{ fontWeight: 600, fontSize: "0.875rem" }}>Адрес</dt>
          <dd style={{ margin: 0, wordBreak: "break-all" }}>{withdrawal.destination}</dd>
        </div>
        <div>
          <dt style={{ fontWeight: 600, fontSize: "0.875rem" }}>Статус</dt>
          <dd style={{ margin: 0 }}>
            <StatusBadge status={withdrawal.status} />
          </dd>
        </div>
        <div>
          <dt style={{ fontWeight: 600, fontSize: "0.875rem" }}>Создано</dt>
          <dd style={{ margin: 0 }}>{createdAt}</dd>
        </div>
      </dl>
    </section>
  );
}
