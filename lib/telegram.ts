import TelegramBot from 'node-telegram-bot-api'

const token = process.env.TELEGRAM_BOT_TOKEN!
const bot = new TelegramBot(token)

export interface TaskForTelegram {
  id: string
  checkout_time: string
  checkin_time: string
  notes?: string | null
  properties: { name: string; address: string } | null
  cleaners: { name: string; telegram_chat_id: string; language?: string | null } | null
}

function formatDate(dt: string): string {
  return new Date(dt).toLocaleString('de-AT', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const MESSAGES: Record<string, {
  title: string
  hello: string
  address: string
  checkout: string
  checkin: string
  notes: string
  accept: string
  decline: string
}> = {
  ru: {
    title:    '🧹 *Новое задание на уборку!*',
    hello:    'Привет,',
    address:  '📍 *Адрес:*',
    checkout: '🟥 *Выезд гостей:*',
    checkin:  '🔑 *Заезд следующих:*',
    notes:    '📝 *Заметки:*',
    accept:   '✅ Принять',
    decline:  '❌ Не могу',
  },
  uk: {
    title:    '🧹 *Нове завдання на прибирання!*',
    hello:    'Привіт,',
    address:  '📍 *Адреса:*',
    checkout: '🟥 *Виїзд гостей:*',
    checkin:  '🔑 *Заїзд наступних:*',
    notes:    '📝 *Нотатки:*',
    accept:   '✅ Прийняти',
    decline:  '❌ Не можу',
  },
  ro: {
    title:    '🧹 *Sarcină nouă de curățenie!*',
    hello:    'Salut,',
    address:  '📍 *Adresă:*',
    checkout: '🟥 *Plecare oaspeți:*',
    checkin:  '🔑 *Sosire următori:*',
    notes:    '📝 *Notițe:*',
    accept:   '✅ Accept',
    decline:  '❌ Nu pot',
  },
  pl: {
    title:    '🧹 *Nowe zlecenie sprzątania!*',
    hello:    'Cześć,',
    address:  '📍 *Adres:*',
    checkout: '🟥 *Wyjazd gości:*',
    checkin:  '🔑 *Przyjazd kolejnych:*',
    notes:    '📝 *Notatki:*',
    accept:   '✅ Przyjmuję',
    decline:  '❌ Nie mogę',
  },
  de: {
    title:    '🧹 *Neuer Reinigungsauftrag!*',
    hello:    'Hallo,',
    address:  '📍 *Adresse:*',
    checkout: '🟥 *Abreise:*',
    checkin:  '🔑 *Nächste Anreise:*',
    notes:    '📝 *Notizen:*',
    accept:   '✅ Übernehmen',
    decline:  '❌ Nicht möglich',
  },
}

const DONE_MESSAGES: Record<string, { prompt: string; button: string }> = {
  ru: { prompt: '🧹 Уборка начата. Нажми когда завершишь:', button: '✅ Готово' },
  uk: { prompt: '🧹 Прибирання розпочато. Натисни коли завершиш:', button: '✅ Готово' },
  ro: { prompt: '🧹 Curățenia a început. Apasă când termini:', button: '✅ Gata' },
  pl: { prompt: '🧹 Sprzątanie rozpoczęte. Naciśnij gdy skończysz:', button: '✅ Gotowe' },
  de: { prompt: '🧹 Reinigung gestartet. Bitte bestätige wenn fertig:', button: '✅ Erledigt' },
}

const RESPONSE_MESSAGES: Record<string, { accepted: string; declined: string; done: string }> = {
  ru: {
    accepted: '✅ Задание принято! Удачи с уборкой! 🧹',
    declined: '👌 Понял. Заказчик уведомлён.',
    done:     '🎉 Отлично! Уборка завершена. Спасибо!',
  },
  uk: {
    accepted: '✅ Завдання прийнято! Успіхів з прибиранням! 🧹',
    declined: '👌 Зрозумів. Замовника повідомлено.',
    done:     '🎉 Чудово! Прибирання завершено. Дякую!',
  },
  ro: {
    accepted: '✅ Sarcină acceptată! Succes la curățenie! 🧹',
    declined: '👌 Înțeles. Clientul a fost notificat.',
    done:     '🎉 Super! Curățenia finalizată. Mulțumesc!',
  },
  pl: {
    accepted: '✅ Zlecenie przyjęte! Powodzenia ze sprzątaniem! 🧹',
    declined: '👌 Rozumiem. Zleceniodawca został powiadomiony.',
    done:     '🎉 Super! Sprzątanie zakończone. Dziękuję!',
  },
  de: {
    accepted: '✅ Auftrag angenommen! Viel Erfolg bei der Reinigung! 🧹',
    declined: '👌 Verstanden. Der Auftraggeber wurde benachrichtigt.',
    done:     '🎉 Super! Reinigung abgeschlossen. Danke!',
  },
}

export function getResponseMessages(lang?: string | null) {
  return RESPONSE_MESSAGES[lang ?? 'de'] ?? RESPONSE_MESSAGES.de
}

export async function sendTaskNotification(task: TaskForTelegram): Promise<string> {
  const chatId = task.cleaners?.telegram_chat_id
  if (!chatId) throw new Error('Kein Telegram Chat ID für diese Reinigungskraft')

  const lang = task.cleaners?.language ?? 'de'
  const m = MESSAGES[lang] ?? MESSAGES.de

  const name     = task.cleaners?.name ?? 'Team'
  const address  = task.properties?.address ?? '—'
  const checkout = formatDate(task.checkout_time)
  const checkin  = formatDate(task.checkin_time)

  const text = [
    m.title,
    ``,
    `${m.hello} ${name}!`,
    ``,
    `${m.address} ${address}`,
    `${m.checkout} ${checkout}`,
    `${m.checkin} ${checkin}`,
    task.notes ? `${m.notes} ${task.notes}` : null,
  ].filter(Boolean).join('\n')

  const message = await bot.sendMessage(chatId, text, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [[
        { text: m.accept,  callback_data: `accept_${task.id}` },
        { text: m.decline, callback_data: `decline_${task.id}` },
      ]],
    },
  })
  return String(message.message_id)
}

export async function sendErledigtButton(chatId: string, taskId: string, lang?: string | null): Promise<void> {
  const d = DONE_MESSAGES[lang ?? 'de'] ?? DONE_MESSAGES.de
  await bot.sendMessage(chatId, d.prompt, {
    reply_markup: {
      inline_keyboard: [[
        { text: d.button, callback_data: `done_${taskId}` },
      ]],
    },
  })
}

export async function removeKeyboard(chatId: string, messageId: string): Promise<void> {
  try {
    await bot.editMessageReplyMarkup(
      { inline_keyboard: [] },
      { chat_id: chatId, message_id: Number(messageId) }
    )
  } catch {}
}

export async function sendMessage(chatId: string, text: string): Promise<void> {
  await bot.sendMessage(chatId, text)
}

const HOST_CHAT_ID = '451676731' // Telegram chat ID хоста

export async function sendHostNotification(text: string): Promise<void> {
  await bot.sendMessage(HOST_CHAT_ID, text)
}

export async function sendAgencyNotification(task: TaskForTelegram): Promise<void> {
  const address  = task.properties?.address ?? '—'
  const checkout = formatDate(task.checkout_time)
  const checkin  = formatDate(task.checkin_time)
  const notes    = task.notes ? `\n📝 *Notizen:* ${task.notes}` : ''

  const text = [
    '🏢 *Neuer Auftrag für CleanSync Cleaning!*',
    '',
    `📍 *Adresse:* ${address}`,
    `🟥 *Abreise:* ${checkout}`,
    `🔑 *Anreise:* ${checkin}`,
    notes,
  ].filter(s => s !== undefined).join('\n')

  await bot.sendMessage(HOST_CHAT_ID, text, { parse_mode: 'Markdown' })
}

export { bot }
