import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createServiceSupabaseClient } from '@/lib/supabase/service'

export const dynamic = 'force-dynamic'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const serverSupabase = await createServerSupabaseClient()
  const { data: { user } } = await serverSupabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const supabase = createServiceSupabaseClient()

  // Whitelist allowed fields — prevent arbitrary column injection
  const { frequency, weekday, checkout_hour, notes, cleaner_id, active } = body
  const patch: Record<string, unknown> = {}
  if (frequency     !== undefined) patch.frequency     = frequency
  if (weekday       !== undefined) patch.weekday       = weekday
  if (checkout_hour !== undefined) patch.checkout_hour = checkout_hour
  if (notes         !== undefined) patch.notes         = notes || null
  if (active        !== undefined) patch.active        = active
  if (cleaner_id    !== undefined) {
    if (cleaner_id) {
      const { data: cleaner } = await supabase
        .from('cleaners')
        .select('id')
        .eq('id', cleaner_id)
        .eq('user_id', user.id)
        .single()
      if (!cleaner) return NextResponse.json({ error: 'Cleaner not found' }, { status: 404 })
    }
    patch.cleaner_id = cleaner_id || null
  }

  const { data, error } = await supabase
    .from('recurring_rules')
    .update(patch)
    .eq('id', id)
    .eq('user_id', user.id)
    .select('*, cleaners(id, name)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const serverSupabase = await createServerSupabaseClient()
  const { data: { user } } = await serverSupabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServiceSupabaseClient()
  const { error } = await supabase
    .from('recurring_rules')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return new NextResponse(null, { status: 204 })
}
