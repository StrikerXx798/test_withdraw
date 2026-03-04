/**
 * Генерирует уникальный ключ идемпотентности для запроса вывода.
 * В продакшене можно использовать uuid или комбинацию userId + timestamp + nonce.
 */
export function generateIdempotencyKey(): string {
  return `wd-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}
