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

function fmtDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('de-AT', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

function fmtTime(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('de-AT', {
    hour: '2-digit', minute: '2-digit',
  })
}

// ── Главная функция — вызывай из любого места ────────────────
export async function notifyHost(
  taskId: string,
  type: HostNotifyType
): Promise<void> {
  const supabase = createServiceSupabaseClient()

  const { data: task } = await supabase
    .from('tasks')
    .select(`
      id,
      user_id,
      checkin_time,
      checkout_time,
      property:properties(name)
    `)
    .eq('id', taskId)
    .single()

  if (!task) return

  const { data: profile } = await supabase
    .from('profiles')
    .select('telegram_chat_id')
    .eq('id', task.user_id)
    .single()

  if (!profile?.telegram_chat_id) return

  const chatId   = Number(profile.telegram_chat_id)
  const propName = (task.property as { name?: string } | null)?.name ?? '—'
  const dateStr  = fmtDate(task.checkin_time)
  const timeStr  = `${fmtTime(task.checkin_time)} – ${fmtTime(task.checkout_time)}`
  const taskUrl  = `${process.env.NEXT_PUBLIC_APP_URL}/tasks/${taskId}`

  let photoCount = 0
  if (type === 'done') {
    const { count } = await supabase
      .from('task_photos')
      .select('*', { count: 'exact', head: true })
      .eq('task_id', taskId)
    photoCount = count ?? 0
  }

  const messages: Record<HostNotifyType, string> = {
    accepted:
      `✅ <b>Auftrag angenommen</b>\n\n` +
      `🏠 <b>Objekt:</b> ${propName}\n` +
      `📅 <b>Datum:</b> ${dateStr}\n` +
      `⏰ <b>Zeit:</b> ${timeStr}`,

    done:
      `🏁 <b>Reinigung abgeschlossen</b>\n\n` +
      `🏠 <b>Objekt:</b> ${propName}\n` +
      `📅 <b>Datum:</b> ${dateStr}\n` +
      `⏰ <b>Abgeschlossen:</b> ${timeStr}` +
      (photoCount > 0 ? `\n📸 <b>Fotos:</b> ${photoCount} beigefügt` : ''),

    reinraum_confirmed:
      `🏢 <b>Reinraum: Auftrag bestätigt</b>\n\n` +
      `🏠 <b>Objekt:</b> ${propName}\n` +
      `📅 <b>Datum:</b> ${dateStr}\n` +
      `⏰ <b>Zeit:</b> ${timeStr}`,
  }

  await sendTelegram(chatId, messages[type], taskUrl)
}
