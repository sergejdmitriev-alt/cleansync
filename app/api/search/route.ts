import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createServiceSupabaseClient } from '@/lib/supabase/service'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const serverSupabase = await createServerSupabaseClient()
  const { data: { user } } = await serverSupabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const q = req.nextUrl.searchParams.get('q')?.trim() ?? ''
  if (!q) return NextResponse.json({ tasks: [], properties: [], cleaners: [] })

  const supabase = createServiceSupabaseClient()
  const pattern = `%${q}%`

  const [tasksRes, propertiesRes, cleanersRes] = await Promise.all([
    supabase
      .from('tasks')
      .select('id, notes, checkout_time, properties(name)')
      .eq('user_id', user.id)
      .eq('archived', false)
      .ilike('notes', pattern)
      .limit(5),
    supabase
      .from('properties')
      .select('id, name, address')
      .eq('user_id', user.id)
      .ilike('name', pattern)
      .limit(5),
    supabase
      .from('cleaners')
      .select('id, name')
      .eq('user_id', user.id)
      .ilike('name', pattern)
      .limit(5),
  ])

  return NextResponse.json({
    tasks:      tasksRes.data      ?? [],
    properties: propertiesRes.data ?? [],
    cleaners:   cleanersRes.data   ?? [],
  })
}
