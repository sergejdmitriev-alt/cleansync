import { createServiceSupabaseClient } from '@/lib/supabase/service'
import { bot, getCancelMessage, getRescheduleMessage } from '@/lib/telegram'
import { notifyHost } from '@/lib/notifications/host'

function tzOffsetMs(ts: number, tz: string): number {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  })
  const p: Record<string, string> = {}
  dtf.formatToParts(new Date(ts)).forEach(x => { p[x.type] = x.value })
  return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute, +p.second) - ts
}

export function viennaHourToUTC(dateOnly: Date, hour: number): Date {
  const guess = Date.UTC(dateOnly.getUTCFullYear(), dateOnly.getUTCMonth(), dateOnly.getUTCDate(), hour)
  return new Date(guess - tzOffsetMs(guess, 'Europe/Vienna'))
}

export interface SyncResult {
  property_id:   string
  property_name: string
  created:       number
  skipped:       number
  error?:        string
}

interface ICalEvent {
  uid:   string
  start: Date
  end:   Date
}

function parseIcal(content: string): ICalEvent[] {
  const events: ICalEvent[] = []

  // RFC 5545 §3.1: unfold continuation lines (space/tab prefix → append to previous)
  const rawLines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')
  const lines: string[] = []
  for (const raw of rawLines) {
    if ((raw.startsWith(' ') || raw.startsWith('\t')) && lines.length > 0) {
      lines[lines.length - 1] += raw.slice(1)
    } else {
      lines.push(raw)
    }
  }

  let inEvent  = false
  let current: Partial<ICalEvent> = {}

  for (const raw of lines) {
    const line = raw.trim()

    if (line === 'BEGIN:VEVENT') {
      inEvent = true
      current = {}
      continue
    }

    if (line === 'END:VEVENT') {
      if (current.uid && current.start && current.end) {
        events.push(current as ICalEvent)
      }
      inEvent = false
      continue
    }

    if (!inEvent) continue

    if (line.startsWith('UID:')) {
      current.uid = line.slice(4).trim()
    } else if (line.startsWith('DTSTART')) {
      const val = line.split(':').slice(1).join(':').trim()
      if (val) current.start = parseIcalDate(val)
    } else if (line.startsWith('DTEND')) {
      const val = line.split(':').slice(1).join(':').trim()
      if (val) current.end = parseIcalDate(val)
    }
  }

  return events
}

function parseIcalDate(value: string): Date {
  if (value.includes('T')) {
    const iso = value.replace(
      /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z?)$/,
      '$1-$2-$3T$4:$5:$6$7'
    )
    return new Date(iso)
  }
  const iso = value.replace(/^(\d{4})(\d{2})(\d{2})$/, '$1-$2-$3')
  return new Date(iso)
}

const ACTIVE_STATUSES = ['accepted', 'reinraum_confirmed', 'reinraum_declined']
const TOLERANCE_MS    = 5 * 60 * 1000

export async function syncPropertyIcal(property: {
  id:       string
  name:     string
  ical_url: string
  user_id:  string
}): Promise<SyncResult> {
  const supabase = createServiceSupabaseClient()
  let created = 0
  let skipped = 0

  try {
    const res = await fetch(property.ical_url, {
      headers: { 'User-Agent': 'CleanSync/1.0' },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const content = await res.text()

    const events = parseIcal(content)
    const now    = new Date()

    const bookings = events
      .filter(e => e.end > now)
      .sort((a, b) => a.start.getTime() - b.start.getTime())

    // Pre-compute valid pairs: checkout uid → computed UTC times
    const feedPairDates = new Map<string, { checkoutTime: Date; checkinTime: Date }>()
    for (let i = 0; i < bookings.length - 1; i++) {
      const current      = bookings[i]
      const next         = bookings[i + 1]
      const checkoutTime = viennaHourToUTC(new Date(current.end), 11)
      const checkinTime  = viennaHourToUTC(new Date(next.start), 15)
      if (checkoutTime < checkinTime) {
        feedPairDates.set(current.uid, { checkoutTime, checkinTime })
      }
    }

    // Fetch active DB tasks with ical_uid for this property
    const { data: dbTasks } = await supabase
      .from('tasks')
      .select('id, ical_uid, status, checkout_time, checkin_time, cancel_notified_at, cleaners(telegram_chat_id, language)')
      .eq('property_id', property.id)
      .not('ical_uid', 'is', null)
      .eq('archived', false)
      .neq('status', 'done')
      .gt('checkout_time', now.toISOString())

    // Guard: completely empty feed + existing active tasks → possible feed outage, skip cancellations
    const skipCancellations = bookings.length === 0 && (dbTasks?.length ?? 0) > 0
    if (skipCancellations) {
      console.warn('[ical-sync] Empty feed with active tasks — skipping cancellation processing for property', property.id)
    }

    if (!skipCancellations && dbTasks) {
      for (const task of dbTasks) {
        if (!task.ical_uid) continue

        if (!feedPairDates.has(task.ical_uid)) {
          // Booking no longer in feed → cancelled
          if (!ACTIVE_STATUSES.includes(task.status)) {
            // Archive passive tasks (pending/open/sent/declined)
            await supabase.from('tasks').update({ archived: true }).eq('id', task.id)
            await notifyHost(task.id, 'ical_cancelled').catch(e =>
              console.error('[ical-sync] notifyHost ical_cancelled failed:', e)
            )
          } else if (!task.cancel_notified_at) {
            // Accepted/Reinraum task — don't archive, notify once
            await supabase.from('tasks')
              .update({ cancel_notified_at: new Date().toISOString() })
              .eq('id', task.id)
            await notifyHost(task.id, 'ical_cancelled').catch(e =>
              console.error('[ical-sync] notifyHost ical_cancelled (active) failed:', e)
            )
            const cleaner = (task.cleaners as { telegram_chat_id?: string; language?: string } | null)
            if (cleaner?.telegram_chat_id) {
              await bot.sendMessage(cleaner.telegram_chat_id, getCancelMessage(cleaner.language)).catch(e =>
                console.error('[ical-sync] cleaner cancel notify failed:', e)
              )
            }
          }
        } else {
          // Booking still in feed — check if dates changed
          const feedDates    = feedPairDates.get(task.ical_uid)!
          const checkoutDiff = Math.abs(new Date(task.checkout_time).getTime() - feedDates.checkoutTime.getTime())
          const checkinDiff  = Math.abs(new Date(task.checkin_time).getTime() - feedDates.checkinTime.getTime())

          if (checkoutDiff > TOLERANCE_MS || checkinDiff > TOLERANCE_MS) {
            await supabase.from('tasks').update({
              checkout_time: feedDates.checkoutTime.toISOString(),
              checkin_time:  feedDates.checkinTime.toISOString(),
            }).eq('id', task.id)

            if (task.status === 'accepted') {
              // notifyHost reads updated times from DB — called after UPDATE
              await notifyHost(task.id, 'ical_rescheduled').catch(e =>
                console.error('[ical-sync] notifyHost ical_rescheduled failed:', e)
              )
              const cleaner = (task.cleaners as { telegram_chat_id?: string; language?: string } | null)
              if (cleaner?.telegram_chat_id) {
                await bot.sendMessage(cleaner.telegram_chat_id, getRescheduleMessage(cleaner.language)).catch(e =>
                  console.error('[ical-sync] cleaner reschedule notify failed:', e)
                )
              }
            }
          }
        }
      }
    }

    // INSERT new task pairs (uses pre-computed feedPairDates, 23505 = duplicate UID guard)
    for (let i = 0; i < bookings.length - 1; i++) {
      const current   = bookings[i]
      const feedDates = feedPairDates.get(current.uid)
      if (!feedDates) { skipped++; continue }

      const { error } = await supabase
        .from('tasks')
        .insert({
          property_id:    property.id,
          cleaner_id:     null,
          user_id:        property.user_id,
          checkout_time:  feedDates.checkoutTime.toISOString(),
          checkin_time:   feedDates.checkinTime.toISOString(),
          status:         'pending',
          ical_uid:       current.uid,
          send_to_agency: false,
        })

      if (error) {
        if (error.code === '23505') skipped++
        else { console.error('Insert error:', error); skipped++ }
      } else {
        created++
      }
    }

    return { property_id: property.id, property_name: property.name, created, skipped }

  } catch (err) {
    return {
      property_id:   property.id,
      property_name: property.name,
      created:       0,
      skipped:       0,
      error:         String(err),
    }
  }
}
