import ical from 'node-ical'
import { createServiceSupabaseClient } from '@/lib/supabase/service'

export interface SyncResult {
  property_id:   string
  property_name: string
  created:       number
  skipped:       number
  error?:        string
}

export async function syncPropertyIcal(property: {
  id:        string
  name:      string
  ical_url:  string
  user_id:   string
  cleaner_id?: string | null
}): Promise<SyncResult> {
  const supabase = createServiceSupabaseClient()
  let created = 0
  let skipped = 0

  try {
    const events = await ical.async.fromURL(property.ical_url)

    const now      = new Date()
    const bookings = Object.values(events)
      .filter((e: any) => e.type === 'VEVENT' && e.start && e.end)
      .map((e: any) => ({
        uid:   String(e.uid),
        start: new Date(e.start),
        end:   new Date(e.end),
      }))
      .filter(b => b.end > now)
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

      const icalUid = `${current.uid}`

      const { error } = await supabase
        .from('tasks')
        .insert({
          property_id:    property.id,
          cleaner_id:     null,
          user_id:        property.user_id,
          checkout_time:  checkoutTime.toISOString(),
          checkin_time:   checkinTime.toISOString(),
          status:         'pending',
          ical_uid:       icalUid,
          send_to_agency: false,
        })

      if (error) {
        if (error.code === '23505') {
          skipped++
        } else {
          console.error('Insert error:', error)
          skipped++
        }
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
