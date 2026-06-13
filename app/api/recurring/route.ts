import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createServiceSupabaseClient } from '@/lib/supabase/service'

export const dynamic = 'force-dynamic'

export async function GET() {
  const serverSupabase = await createServerSupabaseClient()
  const { data: { user } } = await serverSupabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServiceSupabaseClient()
  const { data, error } = await supabase
    .from('recurring_rules')
    .select('*, cleaners(id, name)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(req: NextRequest) {
  const serverSupabase = await createServerSupabaseClient()
  const { data: { user } } = await serverSupabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { property_id, cleaner_id, frequency, weekday, checkout_hour, notes } = body

  if (!property_id || !frequency || weekday == null || checkout_hour == null) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const supabase = createServiceSupabaseClient()
  const { data, error } = await supabase
    .from('recurring_rules')
    .insert({
      user_id:       user.id,
      property_id,
      cleaner_id:    cleaner_id || null,
      frequency,
      weekday,
      checkout_hour,
      notes:         notes || null,
      active:        true,
    })
    .select('*, cleaners(id, name)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
