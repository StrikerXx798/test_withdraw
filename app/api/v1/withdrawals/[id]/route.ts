import { NextRequest, NextResponse } from "next/server";
import { getWithdrawalFromMock } from "@/lib/api/mockStore";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const withdrawal = getWithdrawalFromMock(id);
  if (!withdrawal) {
    return NextResponse.json({ message: "Withdrawal not found" }, { status: 404 });
  }
  return NextResponse.json(withdrawal);
}
