import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createServiceSupabaseClient } from '@/lib/supabase/service'
import { syncPropertyIcal } from '@/lib/ical-sync'

export const dynamic = 'force-dynamic'
export const runtime  = 'nodejs'

export async function POST(req: NextRequest) {
  const serverSupabase = await createServerSupabaseClient()
  const { data: { user } } = await serverSupabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { property_id } = await req.json()

  const supabase = createServiceSupabaseClient()

  let query = supabase
    .from('properties')
    .select('id, name, ical_url, user_id')
    .eq('user_id', user.id)
    .not('ical_url', 'is', null)

  if (property_id) {
    query = query.eq('id', property_id)
  }

  const { data: properties, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!properties || properties.length === 0) {
    return NextResponse.json({ results: [], message: 'Keine iCal URLs gefunden' })
  }

  const results = await Promise.all(
    properties.map(p => syncPropertyIcal({
      id:       p.id,
      name:     p.name,
      ical_url: p.ical_url!,
      user_id:  p.user_id,
    }))
  )

  return NextResponse.json({ results })
}
