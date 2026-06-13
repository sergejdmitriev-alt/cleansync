# CleanSync — Handoff v8
_Сгенерирован 2026-06-13. Факты проверены по реальному коду._

---

## 1. Проект

**CleanSync** — SaaS для управления уборками в краткосрочной аренде (Airbnb, Booking.com). Хост создаёт объект, добавляет уборщиков, приложение автоматически берёт задания из iCal-фидов и отправляет их уборщикам через Telegram-бота.

- **Рынок:** Вена, Австрия. Язык UI: немецкий (de-AT). Уборщики — мигранты: DE/RU/UK/RO/PL.
- **Владелец/разработчик:** Serhii (sergej.dmitriev@icloud.com)
- **Реинраум (Reinraum)** — партнёрское агентство-подстраховка: хост может вручную или автоматически передать задание агентству, если уборщик не реагирует
- **Домен:** `cleansync.at`
- **GitHub:** `https://github.com/sergejdmitriev-alt/cleansync.git` (ветка `main`)
- **Supabase project:** URL в `NEXT_PUBLIC_SUPABASE_URL` (env-переменная, значение не хранится в коде)
- **Telegram-бот:** `@cleansync_bot`

---

## 2. Стек

| Пакет | Версия |
|---|---|
| next | 16.2.7 |
| react / react-dom | 19.2.4 |
| @supabase/ssr | ^0.10.3 |
| @supabase/supabase-js | ^2.107.0 |
| framer-motion | ^12.40.0 |
| @react-pdf/renderer | ^4.5.1 |
| @marsidev/react-turnstile | ^1.5.2 |
| date-fns | ^4.4.0 |
| googleapis | ^173.0.0 |
| node-telegram-bot-api | ^0.67.0 |
| resend | ^6.12.4 |
| tailwindcss | ^4 (dev) |
| typescript | ^5 (dev) |

### Ключевые паттерны

- **async params** — Next.js 16: `params` — это `Promise<{ id: string }>`, всегда `await params`
- **Tailwind v4** — не конфиг-файл, только `@import "tailwindcss"` в globals.css
- **Supabase клиенты — два разных:**
  - `createServerSupabaseClient()` (`lib/supabase/server.ts`) — SSR, ANON_KEY + cookie forwarding, подчиняется RLS
  - `createServiceSupabaseClient()` (`lib/supabase/service.ts`) — SERVICE_ROLE_KEY, обходит RLS. Используется для cron, webhook, admin-операций
- **Middleware (`proxy.ts`, не `middleware.ts`)** — аутентификация. Matcher исключает: `_next/static`, `_next/image`, `favicon.ico`, `api/telegram`, `api/test`, `api/cron`, `lead`, `api/lead`
- **Framer-motion** — только в client components (`'use client'`). В server component → отдельный мелкий wrapper
- **`serverExternalPackages`**: `['googleapis', 'google-auth-library']` — в `next.config.ts`

---

## 3. Маршруты

### UI-страницы

| Страница | Путь | Описание |
|---|---|---|
| Главная (дашборд) | `/` | Статистика, виджеты сегодня/ближайшие/активность/месяц, список заданий с фильтром |
| Детальная задания | `/tasks/[id]` | Инфо о задании, фото (completion + problem), кнопка PDF-протокола |
| Новое задание | `/tasks/new` | Форма создания задания вручную |
| Архив | `/archive` | Архивные задания |
| Настройки | `/settings` | Объекты, уборщики, recurring-правила, резервный план (Reinraum), iCal-синхронизация |
| Статистика | `/statistik` | Расширенная аналитика |
| Календарь | `/kalender` | Месячный/недельный вид заданий |
| Подключить Telegram | `/connect-telegram` | Хост: генерация deeplink для подключения своего TG-аккаунта |
| Помощь | `/hilfe` | FAQ, replay онбординга |
| Лид-страница | `/lead` | Публичная (не защищена middleware), dark-glass, форма, Telegram-демо, калькулятор |
| Логин | `/login` | Email + пароль, cookie-сессия |

**КРИТИЧНО:** Объекты (`properties`) и уборщики (`cleaners`) управляются **секциями внутри `/settings`**. Отдельных страниц `/properties` и `/cleaners` НЕТ. Прошлые сессии ошибочно генерировали ссылки на несуществующие роуты.

### API-роуты

| Метод | Путь | Назначение |
|---|---|---|
| POST | `/api/auth/login` | Email/password логин |
| GET/POST | `/api/cleaners` | CRUD уборщиков |
| GET/PATCH/DELETE | `/api/cleaners/[id]` | Один уборщик |
| POST | `/api/cleaners/[id]/invite` | Генерация invite_token (72h TTL) |
| GET | `/api/cron/sync` | iCal-синк + recurring-генерация (daily 06:00 UTC) |
| GET | `/api/cron/escalation` | Эскалация незакрытых заданий (hourly) |
| GET | `/api/cron/reminders` | Вечерние/утренние напоминания уборщикам (hourly) |
| GET | `/api/export/pdf` | Месячный PDF-отчёт (`?month=2026-06`) |
| POST | `/api/lead` | Лид-форма → Resend email |
| POST | `/api/profile/onboarding` | Пометить онбординг как завершённый |
| GET/POST | `/api/properties` | CRUD объектов |
| GET/PATCH/DELETE | `/api/properties/[id]` | Один объект |
| GET/POST | `/api/recurring` | CRUD recurring-правил |
| PATCH/DELETE | `/api/recurring/[id]` | Одно правило |
| GET | `/api/search` | Поиск по tasks/properties/cleaners (для Cmd+K палитры) |
| GET/PATCH | `/api/settings/backup` | auto_backup_enabled, escalation_hours |
| GET/PATCH | `/api/settings/telegram` | Статус Telegram-подключения хоста |
| POST | `/api/sync/ical` | Ручной запуск iCal-синка |
| GET/PATCH/DELETE | `/api/tasks/[id]` | Одно задание |
| GET | `/api/tasks/[id]/protocol` | PDF-протокол уборки (фото + инфо) |
| POST | `/api/tasks/[id]/send` | Отправить задание уборщику в Telegram |
| GET/POST | `/api/tasks` | Список/создание заданий |
| POST | `/api/telegram/generate-token` | Генерация host connect token (10 мин TTL) |
| GET | `/api/telegram/status` | Статус TG-подключения хоста |
| POST | `/api/telegram/webhook` | Telegram Bot API webhook |
| GET | `/api/test/ical` | Отладка iCal-парсинга |

---

## 4. База данных

_Схема восстановлена из реальных запросов в коде. RLS-политики требуют проверки в Supabase Dashboard._

### Таблицы и колонки

**`profiles`** (одна запись на пользователя, id = auth.users.id)
- `id` uuid PK
- `telegram_chat_id` bigint — TG chat_id хоста
- `connect_token` text — временный токен для подключения TG (10 мин)
- `connect_token_exp` timestamptz
- `onboarding_done` boolean — флаг завершения онбординга (НЕ localStorage)
- `auto_backup_enabled` boolean — автоэскалация в Reinraum при таймауте
- `escalation_hours` integer — через сколько часов эскалировать (default 4)

**`properties`**
- `id` uuid PK
- `user_id` uuid FK → auth.users
- `name` text
- `address` text
- `ical_url` text nullable
- `default_notes` text nullable

**`cleaners`**
- `id` uuid PK
- `user_id` uuid FK → auth.users
- `name` text
- `telegram_chat_id` bigint nullable
- `language` text — 'de'/'ru'/'uk'/'ro'/'pl'
- `invite_token` text nullable — deeplink-токен (72h)
- `invite_token_exp` timestamptz nullable

**`tasks`**
- `id` uuid PK
- `user_id` uuid FK → auth.users
- `property_id` uuid FK → properties
- `cleaner_id` uuid nullable FK → cleaners
- `status` text — pending | sent | accepted | declined | done | reinraum_pending | reinraum_confirmed | reinraum_declined
- `checkout_time` timestamptz
- `checkin_time` timestamptz
- `notes` text nullable
- `archived` boolean default false
- `ical_uid` text nullable — UID из iCal-фида (уникальный в паре с property_id)
- `send_to_agency` boolean
- `done_at` timestamptz nullable
- `sent_at` timestamptz nullable
- `accepted_at` timestamptz nullable
- `escalated_at` timestamptz nullable — время автоэскалации
- `escalation_notified_at` timestamptz nullable — отправлено предупреждение хосту
- `cancel_notified_at` timestamptz nullable — уведомление об отмене брони отправлено
- `reminder_evening_sent_at` timestamptz nullable — вечернее напоминание уборщику
- `reminder_morning_sent_at` timestamptz nullable — утреннее напоминание уборщику
- `recurring_rule_id` uuid nullable FK → recurring_rules
- `updated_at` timestamptz (используется в ActivityWidget)

**`task_photos`**
- `id` uuid PK
- `task_id` uuid FK → tasks
- `storage_path` text — путь в Supabase Storage (bucket: `task-photos`)
- `photo_type` text — 'completion' | 'problem'
- `caption` text nullable
- `created_at` timestamptz

**`bot_sessions`** — временное состояние загрузки фото через бота
- `chat_id` bigint PK
- `task_id` uuid
- `mode` text — 'completion_photos' | 'problem'
- `photo_count` integer

**`recurring_rules`**
- `id` uuid PK
- `user_id` uuid FK → auth.users
- `property_id` uuid FK → properties
- `cleaner_id` uuid nullable FK → cleaners
- `frequency` text — 'weekly' | 'biweekly' | 'monthly' (monthly = каждые 4 недели)
- `weekday` integer — 0=Пн, 6=Вс
- `checkout_hour` integer — час выезда по Вене (0-23)
- `notes` text nullable
- `active` boolean
- `created_at` timestamptz

### Индексы

- `tasks`: composite unique на `(ical_uid, property_id)` — dedup при iCal-синке, код полагается на error code `23505`
- `tasks`: composite unique на `(recurring_rule_id, checkout_time)` — dedup recurring, тот же код 23505

### RLS

- `/api` использует service role key (обходит RLS), но сам делает `user_id` ownership check
- `createServerSupabaseClient()` (ANON_KEY) подчиняется RLS — используется для auth
- Точный список pg_policies — проверять в Supabase Dashboard (`pg_policies`)

---

## 5. Реализованные фичи

### Telegram

- **Подключение хоста:** `/connect-telegram` → `POST /api/telegram/generate-token` → deeplink `t.me/cleansync_bot?start=TOKEN` (10 мин TTL) → webhook: `/start TOKEN` → запись `telegram_chat_id` в `profiles`
- **Подключение уборщика:** `/settings` → `POST /api/cleaners/[id]/invite` → deeplink `t.me/cleansync_bot?start=TOKEN` (72h TTL) → webhook: `/start TOKEN` → запись в `cleaners` → выбор языка (inline keyboard: RU/UK/RO/PL)
- **Флоу задания:** хост отправляет → уборщик получает сообщение с кнопками accept/decline → если принял: кнопка "Завершить" → после завершения: режим загрузки фото (до 10 шт, `/fertig` или inline кнопка)
- **Problem-фото:** отдельный режим (callback `problem_TASKID`), одно фото → форвард хосту с подписью
- **Эскалация:** ручная (callback `escalate_TASKID` от хоста) или автоматическая (cron, `auto_backup_enabled`)
- **Reinraum flow:** cron отправляет `reinraum_pending` → агентство получает сообщение с кнопками `rr_confirm` / `rr_decline`
- **notifyHost:** `lib/notifications/host.ts` — события: `accepted`, `declined`, `done`, `reinraum_confirmed`, `ical_cancelled`, `ical_rescheduled`
- **Напоминания (cron/reminders):** вечернее (18-22 Vienna, "завтра уборка") и утреннее (07-11 Vienna, "сегодня уборка"). Идемпотентны через `reminder_*_sent_at` маркеры

### Навигация

- **Desktop sidebar** (`app/components/Sidebar.tsx`) — layoutId-подсветка активного пункта через framer-motion
- **Mobile bottom nav + FAB** (`app/components/BottomNav.tsx`) — только mobile, FAB = плавающая кнопка "+"
- **Desktop кнопка "Neuer Auftrag"** — только на главной странице `/`, `hidden lg:flex` (1024px+), рядом с приветствием
- **Cmd+K палитра** (`app/components/CommandPalette.tsx`) — только desktop, поиск по своим данным через `/api/search`

### Онбординг

- 5 шагов (`components/onboarding/OnboardingOverlay.tsx`), показывается при `!onboarding_done` в `profiles`
- Флаг `onboarding_done` — в Supabase `profiles`, НЕ localStorage
- Завершение: `POST /api/profile/onboarding` → `profiles.onboarding_done = true`
- Replay: кнопка в `/hilfe` → CustomEvent `cs:onboarding-replay`

### iCal-синхронизация

- **Парсер** (`lib/ical-sync.ts`): RFC 5545 line unfolding (пробел/таб в начале строки → склейка с предыдущей)
- **`parseIcalDate`**: `YYYYMMDD` (date-only) и `YYYYMMDDTHHmmssZ` (datetime with/without Z)
- **`viennaHourToUTC(dateOnly, hour)`**: DST-aware через `tzOffsetMs()` — Intl trick: парсит компоненты даты в Europe/Vienna и вычитает смещение. Используется для checkout=11:00, checkin=15:00 Vienna
- **Логика пар:** booking[i].end = дата выезда → checkout 11:00; booking[i+1].start = дата заезда следующего → checkin 15:00. Только если checkout < checkin.
- **Обнаружение отмен:** UID есть в DB, нет в фиде → archived. Если задание активное (accepted/reinraum) → не архивируется, `cancel_notified_at` + уведомление
- **Обнаружение переносов:** UID есть в обоих, даты изменились (tolerance 5 мин) → UPDATE + notifyHost('ical_rescheduled')
- **Защита от пустого фида:** если фид вернул 0 событий при наличии активных DB-заданий → отмены не обрабатываются (возможный outage)
- **Cron:** ежедневно в 06:00 UTC (vercel.json)

### Recurring-задания

- `recurring_rules`: weekday (0=Пн), checkout_hour, frequency (weekly/biweekly/monthly)
- Lookahead: 14 дней. biweekly/monthly — счёт недель с anchor 2024-01-01 (понедельник)
- Dedup через unique index + 23505
- Генерируется вместе с iCal-синком в `cron/sync`

### PDF-документы

- **Протокол уборки** (`/api/tasks/[id]/protocol`): фото embedded как base64 data URI, `@react-pdf/renderer`, filename: `protokoll-{объект}-{дата}.pdf`. Только для `status = 'done'`
- **Месячный отчёт** (`/api/export/pdf?month=2026-06`): все done-задания за месяц

### Визуальные фичи (Sprint 7)

1. **Skeleton-загрузка** — `components/motion/Skeleton.tsx`, `cs-skeleton` CSS class, shimmer-анимация
2. **FadeInItem/FadeInList** — `components/motion/`, scroll-triggered stagger через framer-motion `useInView`
3. **Breathing badge dots** — CSS только, `::before` pseudo-element, `@keyframes cs-dot-*`
4. **EmptyState** — `components/EmptyState.tsx`, CSS fade+float (`animation-fill-mode: both`, не `forwards`)
5. **CompletionBurst** — `components/motion/CompletionBurst.tsx`, 8 частиц + ring + checkmark pathLength, один раз за сессию (sessionStorage флаг), `useReducedMotion`
6. **PullToRefresh** — `components/PullToRefresh.tsx`, touch-only, resistance 0.40, threshold 56px, `router.refresh()`
7. **TimeOfDayTheme** — `components/TimeOfDayTheme.tsx`, устанавливает `--cs-hue-shift` на `:root` при маунте, Vienna TZ

### Виджет "Heute"

На главной: задания на сегодня по Vienna TZ, счётчик done/open, следующий checkin. `DashboardWidgets.tsx`.

### Лид-страница

`/lead` — публичная (исключена из middleware). Dark glass design, форма с Turnstile-защитой, Telegram-демо, ценовой калькулятор. Resend для отправки лида на email.

---

## 6. Ключевые gotchas

### Роуты
**Не выдумывать роуты.** Перед любой ссылкой — проверить `find app -name "page.tsx"`. Объекты и уборщики — **только секции в `/settings`**, отдельных `/properties` и `/cleaners` страниц НЕТ.

### Венское время
Везде Vienna через `Intl` с `timeZone: 'Europe/Vienna'`. Три контекста:
1. Отображение дат/времени: `toLocaleString/DateTimeFormat` с `timeZone: 'Europe/Vienna'`
2. Определение "сегодня" в Vienna: `en-CA` формат (YYYY-MM-DD) с `timeZone: 'Europe/Vienna'`
3. UTC из Vienna-даты+час: `viennaHourToUTC(dateOnly, hour)` из `lib/ical-sync.ts` — DST-aware

Не изобретать четвёртый способ.

### Server components и event handlers
**Файлы без `'use client'` не могут содержать `onClick`/`onMouseOver`/etc.** RSC не сериализует функции — runtime crash при рендере. Проверено: все файлы с обработчиками в проекте имеют `'use client'`. Для hover-эффектов в server component — CSS классы (`.cs-photo-thumb:hover`).

### `animation-fill-mode: both` вместо `forwards`
При CSS fade-in с delay: `both` применяет `from`-кейфрейм ДО начала анимации, поэтому не нужен базовый `opacity: 0`. Если анимация отключена — элемент виден (natural fallback). `forwards` без базового `opacity: 0` не скрывает элемент до старта.

### NEXT_PUBLIC_APP_URL
Обязателен в Vercel env. Используется в `lib/notifications/host.ts` для кнопок "Auftrag öffnen" в Telegram. Если не задан — кнопки не отправляются (silent fail с console.error).

### Vercel и кешированные деплои
Vercel может деплоить закешированный коммит. Маркеры версии в логах (`console.log('[notifyHost] v2 start', ...)`) позволяют убедиться, что новый код применён.

### Supabase async params
`params` в route handlers — `Promise<{ id: string }>`. Всегда `const { id } = await params`.

### Уборщики — языки
DE (default), RU, UK, RO, PL. Все уведомления уборщикам мультиязычные. `getResponseMessages(lang)` и `getPhotoMessages(lang)` из `lib/telegram.ts`.

### `bot_sessions` — orphans
Нет TTL. Если уборщик бросил загрузку, сессия остаётся в БД. Влияет только на этого уборщика (следующий `/fertig` или `done_*` чистит сессию). Minor, в бэклоге.

---

## 7. Открытый бэклог

| # | Задача | Приоритет |
|---|---|---|
| 1 | Stripe-интеграция (оплата подписки) | High |
| 2 | Multi-tenancy онбординг: сейчас новый хост создаётся вручную через Supabase | High |
| 3 | Booking.com TZID edge-case: `DTSTART;TZID=Europe/Vienna:YYYYMMDDTHHMMSS` парсится без учёта timezone в `parseIcalDate`. Если datetime >22:00 Vienna → следующий UTC день → неправильная дата пары | Medium |
| 4 | N+1 в iCal-синке: свойства обрабатываются последовательно в `Promise.all`, но каждое свойство делает несколько DB-запросов | Minor |
| 5 | `bot_sessions` без TTL: orphan-записи при незавершённой загрузке фото | Minor |
| 6 | Тексты "Airbnb" → обобщить на "Buchungsplattform" в UI: проверить `/lead`, онбординг step 2, `/hilfe`, форму объекта | Low |
| 7 | Google Sheets интеграция (`lib/google-sheets.ts`) — есть, но неясно где используется | Low |
| 8 | `/api/test/ical` — отладочный роут открыт, возможно стоит закрыть в prod | Low |

---

## 8. Env-переменные и сервисы

### Env-ключи (значения — только в Vercel Dashboard / .env.local)

```
NEXT_PUBLIC_SUPABASE_URL          # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY     # Supabase anon (public) key
SUPABASE_SERVICE_ROLE_KEY         # Supabase service role key (обходит RLS)
TELEGRAM_BOT_TOKEN                # Bot API token (@cleansync_bot)
TELEGRAM_WEBHOOK_SECRET           # HMAC-секрет для верификации webhook
CRON_SECRET                       # Bearer-токен для cron-запросов Vercel
RESEND_API_KEY                    # Resend API для лид-форм (from: noreply@cleansync.at)
NEXT_PUBLIC_APP_URL               # https://cleansync.at — ОБЯЗАТЕЛЕН для TG-кнопок
GOOGLE_SERVICE_ACCOUNT_EMAIL      # Google service account для Sheets
GOOGLE_PRIVATE_KEY                # Google private key
GOOGLE_SPREADSHEET_ID             # ID Google Sheets
HOST_TELEGRAM_CHAT_ID             # Fallback chat_id для уведомлений (хардкод в коде)
NEXT_PUBLIC_TURNSTILE_SITE_KEY    # Cloudflare Turnstile (публичный, для лид-формы)
TURNSTILE_SECRET_KEY              # Cloudflare Turnstile (серверный)
```

### Внешние сервисы

| Сервис | Использование |
|---|---|
| Supabase | DB + Auth + Storage (bucket `task-photos`) |
| Telegram Bot API (`@cleansync_bot`) | Основной канал коммуникации |
| Resend | Email лид-формы (from `noreply@cleansync.at`) |
| Cloudflare Turnstile | Anti-spam на `/lead` |
| Google Sheets | Интеграция (lib/google-sheets.ts, детали в коде) |
| Vercel | Хостинг, cron-jobs |
| INWX | DNS / домен `cleansync.at` |

---

## 9. Стартовый промпт для новой сессии

```
Продолжаем разработку CleanSync — SaaS для управления уборками Airbnb/Booking.com,
Вена, Австрия. Контекст: cleansync-handoff-v8.md в корне репо.

Стек: Next.js 16.2.7, React 19, Supabase, framer-motion, Telegram Bot.

ВАЖНЫЕ gotchas перед началом работы:
1. Роуты — только из `find app -name "page.tsx"`. Объекты и уборщики — секции
   в /settings, отдельных страниц НЕТ.
2. Params в route handlers — всегда await: `const { id } = await params`
3. Server components (без 'use client') — НЕТ event handlers (onClick и пр.),
   только CSS hover через классы.
4. Венское время — через Intl + Europe/Vienna везде. viennaHourToUTC() из
   lib/ical-sync.ts для конвертации Vienna-час → UTC.
5. Два Supabase клиента: server (SSR, RLS) и service (обходит RLS).
   Не перепутать.
6. NEXT_PUBLIC_APP_URL обязателен в Vercel для работы Telegram-кнопок.

Рабочий язык: русский. Технические термины — как есть.
```
