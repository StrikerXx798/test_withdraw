"use client";

import { useEffect } from "react";
import { WithdrawForm } from "@/components/WithdrawForm";
import { WithdrawSummary } from "@/components/WithdrawSummary";
import { ErrorBanner } from "@/components/ErrorBanner";
import { useWithdrawStore } from "@/store/withdrawStore";

export default function WithdrawPage() {
  const uiState = useWithdrawStore((s) => s.uiState);
  const errorMessage = useWithdrawStore((s) => s.errorMessage);
  const currentWithdrawal = useWithdrawStore((s) => s.currentWithdrawal);
  const retry = useWithdrawStore((s) => s.retry);
  const reset = useWithdrawStore((s) => s.reset);
  const restoreLastWithdrawal = useWithdrawStore((s) => s.restoreLastWithdrawal);

  useEffect(() => {
    void restoreLastWithdrawal();
  }, [restoreLastWithdrawal]);

  return (
    <main style={{ padding: "2rem", maxWidth: "480px", margin: "0 auto" }}>
      <h1>Вывод средств (USDT)</h1>

      {uiState === "error" && errorMessage && (
        <ErrorBanner message={errorMessage} onRetry={retry} />
      )}

      {(uiState === "idle" || uiState === "submitting" || uiState === "error") && (
        <WithdrawForm />
      )}

      {uiState === "success" && currentWithdrawal && (
        <>
          <WithdrawSummary withdrawal={currentWithdrawal} />
          <button
            type="button"
            onClick={reset}
            style={{ marginTop: "1rem", padding: "0.5rem 1rem" }}
          >
            Создать ещё одну заявку
          </button>
        </>
      )}

      {uiState === "submitting" && (
        <p style={{ marginTop: "0.5rem", color: "#666" }} aria-live="polite">
          Отправка заявки…
        </p>
      )}
    </main>
  );
}
