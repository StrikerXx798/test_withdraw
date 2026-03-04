# Withdraw — страница вывода средств (USDT)

Тестовое приложение: страница Withdraw с интеграцией API вывода средств, устойчивым UI и базовыми тестами.

## Как запустить

```bash
npm install
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) и перейдите по ссылке «Перейти к выводу средств» или откройте [http://localhost:3000/withdraw](http://localhost:3000/withdraw).

Сборка и запуск продакшена:

```bash
npm run build
npm start
```

Тесты:

```bash
npm run test        # watch-режим
npm run test:run    # один прогон
```

## Ключевые решения

### Стек

- **Next.js 14** (App Router) + TypeScript
- **Zustand** — глобальное состояние формы и UI (idle / submitting / success / error). Состояние формы и последний `idempotency_key` хранятся в сторе, что даёт retry без потери введённых данных.
- **Мок API** — route handlers в `app/api/v1/withdrawals/` (POST и GET) с in-memory хранилищем и поддержкой `idempotency_key`; при повторном ключе возвращается **409** с понятным текстом.

### Идемпотентность и retry

- При отправке формы генерируется `idempotency_key` и передаётся в `POST /v1/withdrawals`.
- При сетевой ошибке пользователь видит сообщение и кнопку «Попробовать снова»; `retry()` повторяет запрос с тем же ключом и теми же данными из стора, без дублирования заявки.

### Устойчивость UI

- **Двойной submit**: в сторе при `submit()` сразу проверяется `isSubmitting`; кнопка «Вывести» дизейблится на время запроса. Второй клик не приводит к повторному вызову API.
- Состояния: `idle` → `submitting` → `success` или `error`; при 409 и других ошибках показывается текст из API или захардкоженные безопасные сообщения.

### Восстановление последней заявки (опционально)

- После успешного создания заявки в `localStorage` сохраняются `id` и время (TTL 5 минут).
- При загрузке страницы `/withdraw` вызывается `restoreLastWithdrawal()`: если есть свежая запись, выполняется `GET /v1/withdrawals/{id}` и отображается последняя заявка.

### Безопасность

- **Рендер**: не используется `dangerouslySetInnerHTML`; сообщения об ошибках формируются из кодов/типов ошибок или статических строк.
- **Токены**: в текущей реализации auth моковая, запросы к API анонимные. Для продакшена рекомендуется:
  - хранить **access token в httpOnly cookie** (не в `localStorage`), чтобы исключить доступ из JS и снизить риск XSS;
  - проверять токен в Next.js middleware или в API route handlers и при необходимости рефрешить через отдельный endpoint;
  - использовать CSRF-токены для мутирующих запросов, если cookie используются для идентификации сессии.

## Ограничения / упрощения

- Один пользователь, одна валюта (USDT).
- Нет полноценной auth-системы; backend моковый (in-memory).
- Web3-интеграция не реализована (достаточно mock).

## Структура

- `app/withdraw/page.tsx` — страница Withdraw (client component).
- `components/` — WithdrawForm, WithdrawSummary, StatusBadge, ErrorBanner.
- `store/withdrawStore.ts` — Zustand store (форма, UI-состояние, submit/retry/reset, restore).
- `lib/api/withdrawals.ts` — типы и клиент API (createWithdrawal, getWithdrawal), классы ошибок (409, сеть, прочие).
- `lib/idempotency.ts` — генерация `idempotency_key`.
- `lib/persistence/withdrawalStorage.ts` — сохранение/чтение последней заявки в `localStorage` (TTL 5 мин).
- `app/api/v1/withdrawals/` — мок API (POST, GET по id).

## Тесты

- **Happy path** — отправка валидной формы, мок возвращает заявку; проверяется один вызов API и отображение созданной заявки.
- **Ошибка API** — мок возвращает 409; проверяется сообщение об ошибке и сохранение введённых данных.
- **Двойной submit** — мок не резолвится; два клика по «Вывести» приводят к одному вызову `createWithdrawal`.

Тесты: Vitest + React Testing Library + мок `@/lib/api/withdrawals`.
