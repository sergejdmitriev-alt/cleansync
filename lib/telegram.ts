import TelegramBot from 'node-telegram-bot-api'

const token = process.env.TELEGRAM_BOT_TOKEN!

// Singleton — один экземпляр бота на всё приложение
const bot = new TelegramBot(token)

export interface TaskForTelegram {
  id: string
  checkout_time: string
  checkin_time: string
  notes?: string | null
  properties: { name: string; address: string } | null
  cleaners: { name: string; telegram_chat_id: string } | null
}

function formatDate(dt: string): string {
  return new Date(dt).toLocaleString('de-AT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export async function sendTaskNotification(task: TaskForTelegram): Promise<string> {
  const chatId = task.cleaners?.telegram_chat_id
  if (!chatId) throw new Error('Kein Telegram Chat ID für diese Reinigungskraft')

  const name    = task.cleaners?.name ?? 'Team'
  const address = task.properties?.address ?? '—'
  const checkout = formatDate(task.checkout_time)
  const checkin  = formatDate(task.checkin_time)

  const text = [
    `🧹 *Neuer Reinigungsauftrag!*`,
    ``,
    `Hallo, ${name}!`,
    ``,
    `📍 *Adresse:* ${address}`,
    `🟥 *Abreise:* ${checkout}`,
    `🔑 *Nächste Anreise:* ${checkin}`,
    task.notes ? `📝 *Notizen:* ${task.notes}` : null,
  ].filter(Boolean).join('\n')

  const message = await bot.sendMessage(chatId, text, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [[
        { text: '✅ Übernehmen',  callback_data: `accept_${task.id}` },
        { text: '❌ Nicht möglich', callback_data: `decline_${task.id}` },
      ]],
    },
  })

  return String(message.message_id)
}

export async function removeKeyboard(chatId: string, messageId: string): Promise<void> {
  try {
    await bot.editMessageReplyMarkup(
      { inline_keyboard: [] },
      { chat_id: chatId, message_id: Number(messageId) }
    )
  } catch {
    // Сообщение уже изменено — игнорируем
  }
}

export async function sendMessage(chatId: string, text: string): Promise<void> {
  await bot.sendMessage(chatId, text)
}

export { bot }
