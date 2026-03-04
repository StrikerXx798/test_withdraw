import type { Withdrawal } from "./withdrawals";

const withdrawalsById = new Map<string, Withdrawal>();
const withdrawalsByIdempotencyKey = new Map<string, Withdrawal>();

let idCounter = 1;

export function createWithdrawalInMock(
  amount: number,
  destination: string,
  idempotencyKey: string
): Withdrawal {
  const existing = withdrawalsByIdempotencyKey.get(idempotencyKey);
  if (existing) {
    throw { status: 409, type: "conflict" as const, existing };
  }

  const id = `wd-${idCounter++}`;
  const withdrawal: Withdrawal = {
    id,
    amount,
    destination,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  withdrawalsById.set(id, withdrawal);
  withdrawalsByIdempotencyKey.set(idempotencyKey, withdrawal);
  return withdrawal;
}

export function getWithdrawalFromMock(id: string): Withdrawal | undefined {
  return withdrawalsById.get(id);
}

export function clearMockStore(): void {
  withdrawalsById.clear();
  withdrawalsByIdempotencyKey.clear();
  idCounter = 1;
}
