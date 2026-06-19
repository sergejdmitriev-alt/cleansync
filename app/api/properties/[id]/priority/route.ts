import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createServiceSupabaseClient } from '@/lib/supabase/service'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const auth = await createServerSupabaseClient()
  const { data: { user } } = await auth.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const service = createServiceSupabaseClient()
  const { data } = await service
    .from('property_cleaner_priority')
    .select('cleaner_id, priority, cleaners(id, name, telegram_chat_id, language)')
    .eq('property_id', id)
    .eq('user_id', user.id)
    .order('priority', { ascending: true })

  return NextResponse.json(data ?? [])
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const auth = await createServerSupabaseClient()
  const { data: { user } } = await auth.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { cleaner_ids }: { cleaner_ids: string[] } = await req.json()
  if (!Array.isArray(cleaner_ids)) {
    return NextResponse.json({ error: 'cleaner_ids required' }, { status: 400 })
  }

  const service = createServiceSupabaseClient()

  const { data: prop } = await service
    .from('properties')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!prop) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await service.from('property_cleaner_priority').delete().eq('property_id', id).eq('user_id', user.id)

  if (cleaner_ids.length > 0) {
    await service.from('property_cleaner_priority').insert(
      cleaner_ids.map((cid, idx) => ({
        user_id:     user.id,
        property_id: id,
        cleaner_id:  cid,
        priority:    idx,
      }))
    )
  }

  return NextResponse.json({ success: true })
}
