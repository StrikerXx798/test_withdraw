import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
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

const successWithdrawal: Withdrawal = {
  id: "wd-1",
  amount: 100,
  destination: "0x123",
  status: "pending",
  createdAt: new Date().toISOString(),
};

describe("Withdraw happy path", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useWithdrawStore.getState().reset();
    mockCreateWithdrawal.mockResolvedValue(successWithdrawal);
  });

  it("submit valid form shows created withdrawal and disables submit during request", async () => {
    const user = userEvent.setup();
    render(<WithdrawPage />);

    const amountInput = screen.getByLabelText(/сумма/i);
    const destinationInput = screen.getByLabelText(/адрес/i);
    const confirmCheckbox = screen.getByRole("checkbox", {
      name: /подтверждаю/i,
    });
    const submitButton = screen.getByRole("button", { name: /вывести/i });

    await user.type(amountInput, "100");
    await user.type(destinationInput, "0x123");
    await user.click(confirmCheckbox);

    expect(submitButton).not.toBeDisabled();

    await user.click(submitButton);

    expect(mockCreateWithdrawal).toHaveBeenCalledTimes(1);
    expect(mockCreateWithdrawal).toHaveBeenCalledWith({
      amount: 100,
      destination: "0x123",
      idempotencyKey: expect.any(String),
    });

    await waitFor(() => {
      expect(screen.getByText(/заявка создана/i)).toBeInTheDocument();
    });
    expect(screen.getByText("100 USDT")).toBeInTheDocument();
    expect(screen.getByText("0x123")).toBeInTheDocument();
  });
});
