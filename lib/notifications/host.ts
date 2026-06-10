import { createServiceSupabaseClient } from '@/lib/supabase/service'

const BOT = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`

export type HostNotifyType = 'accepted' | 'done' | 'reinraum_confirmed'

// ── Отправка сообщения через Bot API ────────────────────────
async function sendTelegram(
  chatId: number,
  text: string,
  taskUrl?: string
) {
  const body: Record<string, unknown> = {
    chat_id:    chatId,
    text,
    parse_mode: 'HTML',
  }

  if (taskUrl) {
    body.reply_markup = JSON.stringify({
      inline_keyboard: [[{ text: '🔗 Auftrag öffnen', url: taskUrl }]],
    })
  }

  await fetch(`${BOT}/sendMessage`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  })
}

// ── Главная функция — вызывай из любого места ────────────────
export async function notifyHost(
  taskId: string,
  type: HostNotifyType
): Promise<void> {
  const supabase = createServiceSupabaseClient()

  // Задание + объект
  const { data: task } = await supabase
    .from('tasks')
    .select(`
      id,
      host_id,
      cleaning_date,
      start_time,
      end_time,
      property:properties(name)
    `)
    .eq('id', taskId)
    .single()

  if (!task) return

  // Telegram ID хоста
  const { data: profile } = await supabase
    .from('profiles')
    .select('telegram_chat_id')
    .eq('id', task.host_id)
    .single()

  if (!profile?.telegram_chat_id) return

  const chatId   = Number(profile.telegram_chat_id)
  const propName = (task.property as { name?: string } | null)?.name ?? '—'
  const timeStr  = task.end_time
    ? `${task.start_time} – ${task.end_time}`
    : (task.start_time ?? '—')
  const taskUrl  = `${process.env.NEXT_PUBLIC_APP_URL}/tasks/${taskId}`

  // Кол-во фото (только для done)
  let photoCount = 0
  if (type === 'done') {
    const { count } = await supabase
      .from('task_photos')
      .select('*', { count: 'exact', head: true })
      .eq('task_id', taskId)
    photoCount = count ?? 0
  }

  // ── Тексты на немецком ───────────────────────────────────
  const messages: Record<HostNotifyType, string> = {
    accepted:
      `✅ <b>Auftrag angenommen</b>\n\n` +
      `🏠 <b>Objekt:</b> ${propName}\n` +
      `📅 <b>Datum:</b> ${task.cleaning_date}\n` +
      `⏰ <b>Zeit:</b> ${timeStr}`,

    done:
      `🏁 <b>Reinigung abgeschlossen</b>\n\n` +
      `🏠 <b>Objekt:</b> ${propName}\n` +
      `📅 <b>Datum:</b> ${task.cleaning_date}\n` +
      `⏰ <b>Abgeschlossen:</b> ${timeStr}` +
      (photoCount > 0 ? `\n📸 <b>Fotos:</b> ${photoCount} beigefügt` : ''),

    reinraum_confirmed:
      `🏢 <b>Reinraum: Auftrag bestätigt</b>\n\n` +
      `🏠 <b>Objekt:</b> ${propName}\n` +
      `📅 <b>Datum:</b> ${task.cleaning_date}\n` +
      `⏰ <b>Zeit:</b> ${timeStr}`,
  }

  await sendTelegram(chatId, messages[type], taskUrl)
}
