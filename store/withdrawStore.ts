"use client";

import { create } from "zustand";
import {
  createWithdrawal,
  getWithdrawal,
  type Withdrawal,
  type WithdrawalRequest,
  WithdrawalConflictError,
  WithdrawalNetworkError,
  WithdrawalApiError,
} from "@/lib/api/withdrawals";
import { generateIdempotencyKey } from "@/lib/idempotency";
import { saveLastWithdrawalId } from "@/lib/persistence/withdrawalStorage";

export type WithdrawUiState = "idle" | "submitting" | "polling" | "success" | "error";

interface WithdrawFormState {
  amount: string;
  destination: string;
  confirm: boolean;
}

interface WithdrawStore {
  form: WithdrawFormState;
  uiState: WithdrawUiState;
  errorMessage: string | null;
  isSubmitting: boolean;
  currentWithdrawal: Withdrawal | null;
  lastWithdrawalId: string | null;
  /** Сохраняем для retry без потери данных */
  lastIdempotencyKey: string | null;

  updateField: (name: keyof WithdrawFormState, value: string | boolean) => void;
  toggleConfirm: (value: boolean) => void;
  submit: () => Promise<void>;
  retry: () => Promise<void>;
  reset: () => void;
  setCurrentWithdrawal: (w: Withdrawal | null) => void;
  restoreLastWithdrawal: () => Promise<void>;
}

const initialForm: WithdrawFormState = {
  amount: "",
  destination: "",
  confirm: false,
};

function parseAmount(value: string): number | null {
  const n = parseFloat(value);
  if (Number.isNaN(n)) return null;
  return n;
}

function isFormValid(form: WithdrawFormState): boolean {
  const amount = parseAmount(form.amount);
  if (amount === null || amount <= 0) return false;
  if (!form.destination.trim()) return false;
  if (!form.confirm) return false;
  return true;
}

export const useWithdrawStore = create<WithdrawStore>((set, get) => ({
  form: initialForm,
  uiState: "idle",
  errorMessage: null,
  isSubmitting: false,
  currentWithdrawal: null,
  lastWithdrawalId: null,
  lastIdempotencyKey: null,

  updateField(name, value) {
    set((s) => ({
      form: { ...s.form, [name]: value },
      errorMessage: s.errorMessage ? null : s.errorMessage,
    }));
  },

  toggleConfirm(value) {
    set((s) => ({
      form: { ...s.form, confirm: value },
      errorMessage: s.errorMessage ? null : s.errorMessage,
    }));
  },

  async submit() {
    const state = get();
    if (state.isSubmitting) return;

    const form = state.form;
    if (!isFormValid(form)) return;

    const amount = parseAmount(form.amount)!;
    const idempotencyKey = generateIdempotencyKey();

    set({
      isSubmitting: true,
      uiState: "submitting",
      errorMessage: null,
      lastIdempotencyKey: idempotencyKey,
    });

    const request: WithdrawalRequest = {
      amount,
      destination: form.destination.trim(),
      idempotencyKey,
    };

    try {
      const withdrawal = await createWithdrawal(request);
      saveLastWithdrawalId(withdrawal.id);
      set({
        currentWithdrawal: withdrawal,
        lastWithdrawalId: withdrawal.id,
        uiState: "success",
        isSubmitting: false,
      });
    } catch (err) {
      const message =
        err instanceof WithdrawalConflictError
          ? err.message
          : err instanceof WithdrawalNetworkError
            ? err.message
            : err instanceof WithdrawalApiError
              ? err.message
              : "Произошла ошибка. Попробуйте ещё раз.";
      set({
        uiState: "error",
        errorMessage: message,
        isSubmitting: false,
      });
    }
  },

  async retry() {
    const state = get();
    if (state.isSubmitting) return;
    const form = state.form;
    if (!isFormValid(form) || !state.lastIdempotencyKey) return;

    const amount = parseAmount(form.amount)!;
    const idempotencyKey = state.lastIdempotencyKey;

    set({
      isSubmitting: true,
      uiState: "submitting",
      errorMessage: null,
    });

    const request: WithdrawalRequest = {
      amount,
      destination: form.destination.trim(),
      idempotencyKey,
    };

    try {
      const withdrawal = await createWithdrawal(request);
      saveLastWithdrawalId(withdrawal.id);
      set({
        currentWithdrawal: withdrawal,
        lastWithdrawalId: withdrawal.id,
        uiState: "success",
        isSubmitting: false,
      });
    } catch (err) {
      const message =
        err instanceof WithdrawalConflictError
          ? err.message
          : err instanceof WithdrawalNetworkError
            ? err.message
            : err instanceof WithdrawalApiError
              ? err.message
              : "Произошла ошибка. Попробуйте ещё раз.";
      set({
        uiState: "error",
        errorMessage: message,
        isSubmitting: false,
      });
    }
  },

  reset() {
    set({
      form: initialForm,
      uiState: "idle",
      errorMessage: null,
      isSubmitting: false,
      currentWithdrawal: null,
      lastWithdrawalId: null,
      lastIdempotencyKey: null,
    });
  },

  setCurrentWithdrawal(w) {
    set({ currentWithdrawal: w });
  },

  async restoreLastWithdrawal() {
    const s = get();
    if (s.currentWithdrawal || s.uiState !== "idle") return;

    const { getLastWithdrawalRef } = await import("@/lib/persistence/withdrawalStorage");
    const ref = getLastWithdrawalRef();
    if (!ref) return;

    try {
      const withdrawal = await getWithdrawal(ref.id);
      set({
        currentWithdrawal: withdrawal,
        lastWithdrawalId: withdrawal.id,
        uiState: "success",
      });
    } catch {
      // ignore: expired or network
    }
  },
}));
