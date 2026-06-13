import { createServiceSupabaseClient } from '@/lib/supabase/service'
import { viennaHourToUTC } from '@/lib/ical-sync'

// 0 = Monday, 6 = Sunday — matches recurring_rules.weekday convention
function viennaWeekday(utcDay: Date): number {
  const short = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Vienna', weekday: 'short',
  }).format(utcDay)
  const map: Record<string, number> = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 }
  return map[short] ?? 0
}

// Weeks since an arbitrary fixed Monday (2024-01-01 = Monday)
function weeksSinceEpoch(date: Date): number {
  const EPOCH_MONDAY = Date.UTC(2024, 0, 1)
  return Math.floor((date.getTime() - EPOCH_MONDAY) / (7 * 86400000))
}

export async function generateRecurringTasks(): Promise<{ created: number; skipped: number }> {
  const supabase = createServiceSupabaseClient()
  let created = 0, skipped = 0

  const { data: rules } = await supabase
    .from('recurring_rules')
    .select('*')
    .eq('active', true)

  if (!rules || rules.length === 0) return { created, skipped }

  const now        = new Date()
  const todayUtc   = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const checkinGap = 4 // hours after checkout_hour

  for (const rule of rules) {
    const ruleStartWeek = weeksSinceEpoch(new Date(rule.created_at))
    const checkinHour   = Math.min(rule.checkout_hour + checkinGap, 23)

    for (let offset = 0; offset < 14; offset++) {
      const day = new Date(todayUtc.getTime() + offset * 86400000)

      if (viennaWeekday(day) !== rule.weekday) continue

      // Frequency check: biweekly → every 2nd week, monthly (alle 4 Wochen) → every 4th week
      const weekDiff = weeksSinceEpoch(day) - ruleStartWeek
      if (rule.frequency === 'biweekly' && ((weekDiff % 2) + 2) % 2 !== 0) continue
      if (rule.frequency === 'monthly'  && ((weekDiff % 4) + 4) % 4 !== 0) continue

      const checkoutTime = viennaHourToUTC(day, rule.checkout_hour)
      const checkinTime  = viennaHourToUTC(day, checkinHour)

      const { error } = await supabase
        .from('tasks')
        .insert({
          user_id:           rule.user_id,
          property_id:       rule.property_id,
          cleaner_id:        rule.cleaner_id ?? null,
          checkout_time:     checkoutTime.toISOString(),
          checkin_time:      checkinTime.toISOString(),
          status:            'pending',
          notes:             rule.notes ?? null,
          send_to_agency:    false,
          recurring_rule_id: rule.id,
        })

      if (error) {
        if (error.code === '23505') skipped++ // unique index deduplicates
        else { console.error('[recurring] insert error:', error); skipped++ }
      } else {
        created++
      }
    }
  }

  return { created, skipped }
}
