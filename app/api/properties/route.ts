import { createServiceSupabaseClient } from '@/lib/supabase/service'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const serverSupabase = await createServerSupabaseClient()
  const { data: { user } } = await serverSupabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServiceSupabaseClient()
  const { data, error } = await supabase
    .from('properties')
    .select('id, name, address, default_notes')
    .eq('user_id', user.id)
    .order('name')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const serverSupabase = await createServerSupabaseClient()
  const { data: { user } } = await serverSupabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, address, default_notes } = await req.json()
  if (!name || !address) {
    return NextResponse.json({ error: 'Name und Adresse sind erforderlich' }, { status: 400 })
  }

  const supabase = createServiceSupabaseClient()
  const { data, error } = await supabase
    .from('properties')
    .insert({ name, address, default_notes: default_notes ?? null, user_id: user.id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
