import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WithdrawalConflictError } from "@/lib/api/withdrawals";
import { createWithdrawal } from "@/lib/api/withdrawals";
import { useWithdrawStore } from "@/store/withdrawStore";
import WithdrawPage from "@/app/withdraw/page";

vi.mock("@/lib/api/withdrawals", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api/withdrawals")>();
  return {
    ...actual,
    createWithdrawal: vi.fn(),
  };
});

const mockCreateWithdrawal = vi.mocked(createWithdrawal);

describe("Withdraw API error", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useWithdrawStore.getState().reset();
    mockCreateWithdrawal.mockRejectedValue(
      new WithdrawalConflictError("Операция уже обрабатывается.")
    );
  });

  it("shows human-readable error and preserves form data", async () => {
    const user = userEvent.setup();
    render(<WithdrawPage />);

    const amountInput = screen.getByLabelText(/сумма/i);
    const destinationInput = screen.getByLabelText(/адрес/i);
    const confirmCheckbox = screen.getByRole("checkbox", {
      name: /подтверждаю/i,
    });
    const submitButton = screen.getByRole("button", { name: /вывести/i });

    await user.type(amountInput, "50");
    await user.type(destinationInput, "0xabc");
    await user.click(confirmCheckbox);
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/уже обрабатывается/i);
    });

    expect(amountInput).toHaveValue(50);
    expect(destinationInput).toHaveValue("0xabc");
    expect(confirmCheckbox).toBeChecked();
  });
});
