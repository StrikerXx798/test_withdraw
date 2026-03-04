import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Withdrawal } from "@/lib/api/withdrawals";
import { createWithdrawal } from "@/lib/api/withdrawals";
import { useWithdrawStore } from "@/store/withdrawStore";
import WithdrawPage from "@/app/withdraw/page";

vi.mock("@/lib/api/withdrawals", () => ({
  createWithdrawal: vi.fn(),
  getWithdrawal: vi.fn(),
}));

const mockCreateWithdrawal = vi.mocked(createWithdrawal);

describe("Withdraw double submit protection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useWithdrawStore.getState().reset();
    mockCreateWithdrawal.mockReturnValue(
      new Promise<Withdrawal>(() => {
        /* never resolve to keep isSubmitting true */
      })
    );
  });

  it("calls createWithdrawal only once when submit is clicked twice", async () => {
    const user = userEvent.setup();
    render(<WithdrawPage />);

    await user.type(screen.getByLabelText(/сумма/i), "100");
    await user.type(screen.getByLabelText(/адрес/i), "0x123");
    await user.click(screen.getByRole("checkbox", { name: /подтверждаю/i }));

    const submitButton = screen.getByRole("button", { name: /вывести/i });
    await user.click(submitButton);
    await user.click(submitButton);

    expect(mockCreateWithdrawal).toHaveBeenCalledTimes(1);
  });
});
