import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabaseClient } from '@/lib/supabase/service'
import { bot, sendAgencyNotification } from '@/lib/telegram'

export const dynamic = 'force-dynamic'
export const runtime  = 'nodejs'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceSupabaseClient()
  const now   = new Date()
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000)

  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('id, status, user_id, sent_at, checkout_time, checkin_time, escalation_notified_at, properties(name, address), cleaners(name, telegram_chat_id, language)')
    .in('status', ['open', 'sent', 'declined'])
    .eq('archived', false)
    .is('escalated_at', null)

  if (error) {
    console.error('[escalation] query error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  if (!tasks || tasks.length === 0) {
    return NextResponse.json({ escalated: 0, notified: 0 })
  }

  let escalated = 0
  let notified  = 0

  for (const task of tasks) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('telegram_chat_id, auto_backup_enabled, escalation_hours')
      .eq('id', task.user_id)
      .single()

    if (!profile?.telegram_chat_id) continue

    const escalationMs = (profile.escalation_hours ?? 4) * 60 * 60 * 1000
    const sentAt       = task.sent_at ? new Date(task.sent_at) : null
    const isOverdue    = sentAt && (now.getTime() - sentAt.getTime()) > escalationMs
    const isUrgent     = new Date(task.checkout_time) <= in24h

    if (!isOverdue && !isUrgent) continue

    const propName = (task.properties as any)?.name ?? 'Wohnung'
    const dateStr  = new Date(task.checkout_time).toLocaleDateString('de-AT', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    })

    if (profile.auto_backup_enabled) {
      const { data: updated } = await supabase
        .from('tasks')
        .update({ status: 'reinraum_pending', send_to_agency: true, escalated_at: now.toISOString() })
        .in('status', ['open', 'sent', 'declined'])
        .eq('id', task.id)
        .select('id')

      if (!updated || updated.length === 0) continue

      // Send to Reinraum (reuse existing flow, no host message here — sent separately below)
      await sendAgencyNotification(task, undefined).catch(e =>
        console.error('[escalation] sendAgencyNotification failed:', e)
      )
      await bot.sendMessage(
        String(profile.telegram_chat_id),
        `🛡️ <b>Backup aktiviert</b>\n\n` +
        `🏠 <b>Objekt:</b> ${propName}\n` +
        `📅 <b>Datum:</b> ${dateStr}\n\n` +
        `Ihre Reinigungskraft hat nicht reagiert. Der Auftrag wurde automatisch an Reinraum übergeben.`,
        { parse_mode: 'HTML' }
      ).catch(e => console.error('[escalation] host notify failed:', e))

      escalated++
    } else {
      if (task.escalation_notified_at) continue

      const appUrl = process.env.NEXT_PUBLIC_APP_URL
      const inlineKeyboard: any[][] = [
        [{ text: '🛡️ An Reinraum übergeben', callback_data: `escalate_${task.id}` }],
        ...(appUrl ? [[{ text: '🔗 Auftrag öffnen', url: `${appUrl}/tasks/${task.id}` }]] : []),
      ]

      await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id:      profile.telegram_chat_id,
          text:         `⚠️ <b>Keine Reaktion der Reinigungskraft</b>\n\n` +
                        `🏠 <b>Objekt:</b> ${propName}\n` +
                        `📅 <b>Datum:</b> ${dateStr}\n\n` +
                        `Bitte übergeben Sie den Auftrag an Reinraum oder nehmen Sie Kontakt mit Ihrer Reinigungskraft auf.`,
          parse_mode:   'HTML',
          reply_markup: { inline_keyboard: inlineKeyboard },
        }),
      }).catch(e => console.error('[escalation] warning send failed:', e))

      await supabase
        .from('tasks')
        .update({ escalation_notified_at: now.toISOString() })
        .eq('id', task.id)

      notified++
    }
  }

  console.log(`[escalation] escalated=${escalated} notified=${notified}`)
  return NextResponse.json({ escalated, notified })
}
