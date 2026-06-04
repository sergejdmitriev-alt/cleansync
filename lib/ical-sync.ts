import { createServiceSupabaseClient } from '@/lib/supabase/service'

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
  const lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')

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

    for (let i = 0; i < bookings.length - 1; i++) {
      const current = bookings[i]
      const next    = bookings[i + 1]

      const checkoutTime = new Date(current.end)
      checkoutTime.setHours(11, 0, 0, 0)

      const checkinTime = new Date(next.start)
      checkinTime.setHours(15, 0, 0, 0)

      if (checkoutTime >= checkinTime) {
        skipped++
        continue
      }

      const { error } = await supabase
        .from('tasks')
        .insert({
          property_id:    property.id,
          cleaner_id:     null,
          user_id:        property.user_id,
          checkout_time:  checkoutTime.toISOString(),
          checkin_time:   checkinTime.toISOString(),
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
