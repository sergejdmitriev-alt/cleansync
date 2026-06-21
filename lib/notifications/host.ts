import { createServiceSupabaseClient } from '@/lib/supabase/service'

const BOT = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`

export type HostNotifyType = 'accepted' | 'done' | 'reinraum_confirmed' | 'declined' | 'ical_cancelled' | 'ical_rescheduled'

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

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
    body.reply_markup = {
      inline_keyboard: [[{ text: '🔗 Auftrag öffnen', url: taskUrl }]],
    }
  }

  const res = await fetch(`${BOT}/sendMessage`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  })
  const result = await res.json()
  if (!res.ok || !result.ok) {
    console.error('[sendTelegram] ERROR status:', res.status, 'body:', JSON.stringify(result))
  } else {
    console.error('[sendTelegram] status:', res.status, 'body:', JSON.stringify(result))
  }
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

export async function notifyHost(
  taskId: string,
  type: HostNotifyType
): Promise<void> {
  console.log('[notifyHost] v2 start', taskId, type)

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

  if (!task) {
    console.error('[notifyHost] task not found:', taskId)
    return
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('telegram_chat_id')
    .eq('id', task.user_id)
    .single()

  if (!profile) {
    console.error('[notifyHost] profile not found for user_id:', task.user_id)
    return
  }

  if (!profile.telegram_chat_id) {
    console.error('[notifyHost] telegram_chat_id is empty for user_id:', task.user_id)
    return
  }

  const chatId   = Number(profile.telegram_chat_id)
  const rawName  = (task.property as { name?: string } | null)?.name ?? '—'
  const propName = escapeHtml(rawName)
  const dateStr  = fmtDate(task.checkin_time)
  const timeStr  = `${fmtTime(task.checkin_time)} – ${fmtTime(task.checkout_time)}`

  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  let taskUrl: string | undefined
  if (appUrl) {
    taskUrl = `${appUrl}/tasks/${taskId}`
  } else {
    console.error('[notifyHost] NEXT_PUBLIC_APP_URL is not set — sending without button')
  }

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

    declined:
      `❌ <b>Auftrag abgelehnt</b>\n\n` +
      `🏠 <b>Objekt:</b> ${propName}\n` +
      `📅 <b>Datum:</b> ${dateStr}\n\n` +
      `Bitte weisen Sie den Auftrag neu zu oder übergeben Sie ihn an Reinraum.`,

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

    ical_cancelled:
      `🚫 <b>Buchung storniert</b>\n\n` +
      `🏠 <b>Objekt:</b> ${propName}\n` +
      `📅 <b>Datum:</b> ${dateStr}\n\n` +
      `Die Buchung wurde im iCal-Kalender entfernt. Bitte prüfen Sie Ihren Buchungskalender.`,

    ical_rescheduled:
      `📅 <b>Buchungstermin geändert</b>\n\n` +
      `🏠 <b>Objekt:</b> ${propName}\n` +
      `📅 <b>Neues Datum:</b> ${dateStr}\n` +
      `⏰ <b>Neue Zeit:</b> ${timeStr}\n\n` +
      `Die Buchung wurde im iCal-Kalender verschoben.`,
  }

  await sendTelegram(chatId, messages[type], taskUrl)
}
