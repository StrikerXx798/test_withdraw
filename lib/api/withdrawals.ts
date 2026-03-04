export type WithdrawalStatus = "pending" | "processing" | "completed" | "failed";

export interface WithdrawalRequest {
  amount: number;
  destination: string;
  idempotencyKey: string;
}

export interface Withdrawal {
  id: string;
  amount: number;
  destination: string;
  status: WithdrawalStatus;
  createdAt: string;
}

/** Ошибка конфликта 409 — операция уже обрабатывается с этим idempotency key */
export class WithdrawalConflictError extends Error {
  readonly code = "WITHDRAWAL_CONFLICT";
  constructor(
    message = "Операция уже обрабатывается. Повторный запрос с тем же ключом не выполнен."
  ) {
    super(message);
    this.name = "WithdrawalConflictError";
  }
}

/** Сетевая или серверная ошибка (retry возможен) */
export class WithdrawalNetworkError extends Error {
  readonly code = "WITHDRAWAL_NETWORK_ERROR";
  constructor(message = "Проблемы с соединением. Попробуйте ещё раз.") {
    super(message);
    this.name = "WithdrawalNetworkError";
  }
}

/** Другая ошибка API (4xx кроме 409) */
export class WithdrawalApiError extends Error {
  readonly code = "WITHDRAWAL_API_ERROR";
  readonly status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "WithdrawalApiError";
    this.status = status;
  }
}

function getBaseUrl(): string {
  if (typeof window !== "undefined") return "";
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

async function handleResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  let json: unknown = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    // ignore
  }

  if (res.ok) {
    return json as T;
  }

  if (res.status === 409) {
    const message =
      json &&
      typeof json === "object" &&
      "message" in json &&
      typeof (json as { message: unknown }).message === "string"
        ? (json as { message: string }).message
        : "Операция уже обрабатывается. Повторный запрос не выполнен.";
    throw new WithdrawalConflictError(message);
  }

  const fallbackMessage = `Ошибка запроса (${res.status}). Попробуйте позже.`;
  const message =
    json &&
    typeof json === "object" &&
    "message" in json &&
    typeof (json as { message: unknown }).message === "string"
      ? (json as { message: string }).message
      : fallbackMessage;

  if (res.status >= 500) {
    throw new WithdrawalNetworkError(message);
  }

  throw new WithdrawalApiError(message, res.status);
}

/**
 * Создаёт заявку на вывод. Передаёт idempotency_key в теле запроса.
 */
export async function createWithdrawal(request: WithdrawalRequest): Promise<Withdrawal> {
  const base = getBaseUrl();
  try {
    const res = await fetch(`${base}/api/v1/withdrawals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: request.amount,
        destination: request.destination,
        idempotency_key: request.idempotencyKey,
      }),
    });
    return handleResponse<Withdrawal>(res);
  } catch (err) {
    if (err instanceof WithdrawalConflictError || err instanceof WithdrawalApiError) {
      throw err;
    }
    throw new WithdrawalNetworkError(
      err instanceof Error ? err.message : "Проблемы с соединением. Попробуйте ещё раз."
    );
  }
}

/**
 * Получает заявку по id.
 */
export async function getWithdrawal(id: string): Promise<Withdrawal> {
  const base = getBaseUrl();
  try {
    const res = await fetch(`${base}/api/v1/withdrawals/${encodeURIComponent(id)}`);
    return handleResponse<Withdrawal>(res);
  } catch (err) {
    if (err instanceof WithdrawalConflictError || err instanceof WithdrawalApiError) {
      throw err;
    }
    throw new WithdrawalNetworkError(
      err instanceof Error ? err.message : "Проблемы с соединением. Попробуйте ещё раз."
    );
  }
}
