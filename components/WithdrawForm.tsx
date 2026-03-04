"use client";

import { useWithdrawStore } from "@/store/withdrawStore";

function parseAmount(value: string): number | null {
  const n = parseFloat(value);
  if (Number.isNaN(n)) return null;
  return n;
}

function isFormValid(
  amount: string,
  destination: string,
  confirm: boolean
): boolean {
  const a = parseAmount(amount);
  if (a === null || a <= 0) return false;
  if (!destination.trim()) return false;
  if (!confirm) return false;
  return true;
}

export function WithdrawForm() {
  const form = useWithdrawStore((s) => s.form);
  const isSubmitting = useWithdrawStore((s) => s.isSubmitting);
  const updateField = useWithdrawStore((s) => s.updateField);
  const toggleConfirm = useWithdrawStore((s) => s.toggleConfirm);
  const submit = useWithdrawStore((s) => s.submit);

  const valid = isFormValid(form.amount, form.destination, form.confirm);
  const submitDisabled = !valid || isSubmitting;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (submitDisabled) return;
    void submit();
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div>
        <label htmlFor="withdraw-amount" style={{ display: "block", marginBottom: "0.25rem" }}>
          Сумма (USDT)
        </label>
        <input
          id="withdraw-amount"
          type="number"
          min={0.01}
          step={0.01}
          value={form.amount}
          onChange={(e) => updateField("amount", e.target.value)}
          disabled={isSubmitting}
          aria-invalid={form.amount !== "" && (parseAmount(form.amount) === null || parseAmount(form.amount)! <= 0)}
          style={{ width: "100%", padding: "0.5rem" }}
        />
        {form.amount !== "" && (parseAmount(form.amount) === null || parseAmount(form.amount)! <= 0) && (
          <span style={{ fontSize: "0.875rem", color: "#721c24" }}>
            Введите число больше 0
          </span>
        )}
      </div>
      <div>
        <label htmlFor="withdraw-destination" style={{ display: "block", marginBottom: "0.25rem" }}>
          Адрес назначения
        </label>
        <input
          id="withdraw-destination"
          type="text"
          value={form.destination}
          onChange={(e) => updateField("destination", e.target.value)}
          disabled={isSubmitting}
          placeholder="0x..."
          style={{ width: "100%", padding: "0.5rem" }}
        />
        {form.destination.trim() === "" && form.destination.length > 0 && (
          <span style={{ fontSize: "0.875rem", color: "#721c24" }}>
            Укажите адрес
          </span>
        )}
      </div>
      <div>
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={form.confirm}
            onChange={(e) => toggleConfirm(e.target.checked)}
            disabled={isSubmitting}
            aria-describedby="confirm-desc"
          />
          <span id="confirm-desc">Подтверждаю корректность данных и условия вывода</span>
        </label>
      </div>
      <button
        type="submit"
        disabled={submitDisabled}
        style={{
          padding: "0.5rem 1rem",
          cursor: submitDisabled ? "not-allowed" : "pointer",
          alignSelf: "flex-start",
        }}
      >
        {isSubmitting ? "Отправка…" : "Вывести"}
      </button>
    </form>
  );
}
