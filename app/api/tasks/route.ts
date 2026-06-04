import { createServiceSupabaseClient } from '@/lib/supabase/service'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET /api/tasks — список задач с JOIN
export async function GET() {
  const serverSupabase = await createServerSupabaseClient()
  const { data: { user } } = await serverSupabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServiceSupabaseClient()
  const { data, error } = await supabase
    .from('tasks')
    .select('*, properties(*), cleaners(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase = createServiceSupabaseClient()
  const body = await req.json()
  const { property_id, cleaner_id, checkout_time, checkin_time, notes, send_to_agency } = body

  if (!property_id || !checkout_time || !checkin_time) {
    return NextResponse.json({ error: 'Alle Felder sind erforderlich' }, { status: 400 })
  }
  if (!send_to_agency && !cleaner_id) {
    return NextResponse.json({ error: 'Bitte eine Reinigungskraft auswählen.' }, { status: 400 })
  }

  const serverSupabase = await createServerSupabaseClient()
  const { data: { user } } = await serverSupabase.auth.getUser()

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      property_id,
      cleaner_id:     send_to_agency ? null : cleaner_id,
      checkout_time,
      checkin_time,
      notes,
      send_to_agency: send_to_agency ?? false,
      status:         'pending',
      user_id:        user!.id,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
