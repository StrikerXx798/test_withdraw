import { NextRequest, NextResponse } from "next/server";
import { createWithdrawalInMock } from "@/lib/api/mockStore";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  const idempotencyKey =
    typeof body === "object" &&
    body !== null &&
    "idempotency_key" in body &&
    typeof (body as { idempotency_key: unknown }).idempotency_key === "string"
      ? (body as { idempotency_key: string }).idempotency_key
      : null;

  const amount =
    typeof body === "object" &&
    body !== null &&
    "amount" in body &&
    typeof (body as { amount: unknown }).amount === "number"
      ? (body as { amount: number }).amount
      : null;

  const destination =
    typeof body === "object" &&
    body !== null &&
    "destination" in body &&
    typeof (body as { destination: unknown }).destination === "string"
      ? (body as { destination: string }).destination
      : null;

  if (!idempotencyKey || amount === null || destination === null) {
    return NextResponse.json(
      { message: "Missing amount, destination or idempotency_key" },
      { status: 400 }
    );
  }

  if (amount <= 0) {
    return NextResponse.json({ message: "Amount must be greater than 0" }, { status: 400 });
  }

  try {
    const withdrawal = createWithdrawalInMock(amount, destination, idempotencyKey);
    return NextResponse.json(withdrawal, { status: 201 });
  } catch (err: unknown) {
    if (
      err &&
      typeof err === "object" &&
      "type" in err &&
      (err as { type: string }).type === "conflict" &&
      "existing" in err
    ) {
      const existing = (err as { existing: object }).existing;
      return NextResponse.json(
        {
          message: "Операция уже обрабатывается. Повторный запрос с тем же ключом не выполнен.",
          withdrawal: existing,
        },
        { status: 409 }
      );
    }
    throw err;
  }
}
