import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabaseClient } from '@/lib/supabase/service'
import { sendMessage } from '@/lib/telegram'

export const dynamic = 'force-dynamic'
export const runtime  = 'nodejs'

function getViennaHour(): number {
  return parseInt(
    new Intl.DateTimeFormat('de', {
      timeZone: 'Europe/Vienna',
      hour: 'numeric',
      hour12: false,
    }).format(new Date()),
    10
  )
}

function viennaDateStr(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Vienna',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(date)
}

const EVENING: Record<string, string> = {
  de: '🔔 Morgen Reinigung:\n🏠 {obj}\n📅 {date}, Abreise {time}',
  ru: '🔔 Завтра уборка:\n🏠 {obj}\n📅 {date}, выезд {time}',
  uk: '🔔 Завтра прибирання:\n🏠 {obj}\n📅 {date}, виїзд {time}',
  ro: '🔔 Mâine curățenie:\n🏠 {obj}\n📅 {date}, plecare {time}',
  pl: '🔔 Jutro sprzątanie:\n🏠 {obj}\n📅 {date}, wyjazd {time}',
}

const MORNING: Record<string, string> = {
  de: '🔔 Heute Reinigung:\n🏠 {obj}\n📅 {date}, Abreise {time}',
  ru: '🔔 Сегодня уборка:\n🏠 {obj}\n📅 {date}, выезд {time}',
  uk: '🔔 Сьогодні прибирання:\n🏠 {obj}\n📅 {date}, виїзд {time}',
  ro: '🔔 Astăzi curățenie:\n🏠 {obj}\n📅 {date}, plecare {time}',
  pl: '🔔 Dziś sprzątanie:\n🏠 {obj}\n📅 {date}, wyjazd {time}',
}

function buildMessage(tmpl: string, obj: string, isoStr: string): string {
  const d = new Date(isoStr)
  const date = new Intl.DateTimeFormat('de-AT', {
    timeZone: 'Europe/Vienna', day: '2-digit', month: '2-digit',
  }).format(d)
  const time = new Intl.DateTimeFormat('de-AT', {
    timeZone: 'Europe/Vienna', hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(d)
  return tmpl.replace('{obj}', obj).replace('{date}', date).replace('{time}', time)
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now        = new Date()
  const viennaHour = getViennaHour()
  // 4-hour windows: handles delayed/missed Vercel cron ticks without duplicates
  // (reminder_*_sent_at marker guarantees single send per window)
  const isEvening  = viennaHour >= 18 && viennaHour < 22
  const isMorning  = viennaHour >= 7  && viennaHour < 11

  if (!isEvening && !isMorning) {
    return NextResponse.json({ skipped: true, viennaHour })
  }

  const supabase = createServiceSupabaseClient()

  // Broad UTC window covers both today and tomorrow in any Vienna offset (+1/+2)
  const rangeStart = new Date(now.getTime() - 26 * 3600 * 1000)
  const rangeEnd   = new Date(now.getTime() + 50 * 3600 * 1000)

  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('id, checkout_time, reminder_evening_sent_at, reminder_morning_sent_at, properties(name), cleaners(telegram_chat_id, language)')
    .eq('status', 'accepted')
    .eq('archived', false)
    .not('cleaner_id', 'is', null)
    .gte('checkout_time', rangeStart.toISOString())
    .lte('checkout_time', rangeEnd.toISOString())

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const today      = viennaDateStr(now)
  const tomorrow   = viennaDateStr(new Date(now.getTime() + 86400000))
  const targetDate = isEvening ? tomorrow : today
  const templates  = isEvening ? EVENING : MORNING

  let sent = 0, skipped = 0, errors = 0

  for (const task of tasks ?? []) {
    const cleaner = task.cleaners as any
    // Skip if no Telegram chat ID
    if (!cleaner?.telegram_chat_id) { skipped++; continue }
    // Idempotency: skip if marker already set
    if (isEvening && task.reminder_evening_sent_at)  { skipped++; continue }
    if (isMorning  && task.reminder_morning_sent_at) { skipped++; continue }
    // Precise Vienna date check
    if (viennaDateStr(new Date(task.checkout_time)) !== targetDate) { skipped++; continue }

    const lang         = (cleaner.language as string) ?? 'de'
    const tmpl         = templates[lang] ?? templates.de
    const propertyName = (task.properties as any)?.name ?? 'Objekt'
    const text         = buildMessage(tmpl, propertyName, task.checkout_time)
    const markerField  = isEvening ? 'reminder_evening_sent_at' : 'reminder_morning_sent_at'

    try {
      await sendMessage(String(cleaner.telegram_chat_id), text)
      await supabase
        .from('tasks')
        .update({ [markerField]: now.toISOString() })
        .eq('id', task.id)
      sent++
    } catch (e) {
      // Per-task error doesn't abort the loop
      console.error(`[reminders] task ${task.id}:`, e)
      errors++
    }
  }

  return NextResponse.json({ viennaHour, targetDate, sent, skipped, errors })
}
