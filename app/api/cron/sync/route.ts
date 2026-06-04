import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabaseClient } from '@/lib/supabase/service'
import { syncPropertyIcal } from '@/lib/ical-sync'

export const dynamic = 'force-dynamic'
export const runtime  = 'nodejs'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceSupabaseClient()

  const { data: properties, error } = await supabase
    .from('properties')
    .select('id, name, ical_url, user_id')
    .not('ical_url', 'is', null)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!properties || properties.length === 0) {
    return NextResponse.json({ message: 'Keine iCal URLs', results: [] })
  }

  const results = await Promise.all(
    properties.map(p => syncPropertyIcal({
      id:       p.id,
      name:     p.name,
      ical_url: p.ical_url!,
      user_id:  p.user_id,
    }))
  )

  const total = results.reduce((s, r) => s + r.created, 0)
  console.log(`iCal sync: ${total} neue Aufträge erstellt`)

  return NextResponse.json({ results, total_created: total })
}
