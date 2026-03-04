const STORAGE_KEY = "withdraw_last_withdrawal";
const TTL_MS = 5 * 60 * 1000; // 5 минут

export interface StoredWithdrawalRef {
  id: string;
  savedAt: number;
}

export function saveLastWithdrawalId(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const payload: StoredWithdrawalRef = { id, savedAt: Date.now() };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore
  }
}

export function getLastWithdrawalRef(): StoredWithdrawalRef | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as unknown;
    if (
      typeof data === "object" &&
      data !== null &&
      "id" in data &&
      "savedAt" in data &&
      typeof (data as StoredWithdrawalRef).id === "string" &&
      typeof (data as StoredWithdrawalRef).savedAt === "number"
    ) {
      const ref = data as StoredWithdrawalRef;
      if (Date.now() - ref.savedAt > TTL_MS) return null;
      return ref;
    }
    return null;
  } catch {
    return null;
  }
}

export function clearLastWithdrawalRef(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
